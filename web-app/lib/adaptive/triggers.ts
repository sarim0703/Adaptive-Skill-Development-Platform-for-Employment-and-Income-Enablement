import { db } from "@/db";
import { systemEvents } from "@/db/schema";

export type TriggerType = 'stuck' | 'repeated_failure' | 'performing_well' | null;

export async function checkProactiveTriggers(userId: string, currentSubtopicId: string, currentTimeSpentSeconds: number): Promise<TriggerType> {
  const model = await db.query.userModel.findFirst({
    where: (um, { eq }) => eq(um.userId, userId),
  });

  if (!model) return null;

  let triggerFired: TriggerType = null;
  let conditionStr = "";

  // 1. Repeated Failure Trigger
  if ((model.consecutiveFailCount ?? 0) >= 2) {
    triggerFired = 'repeated_failure';
    conditionStr = `consecutiveFailCount = ${model.consecutiveFailCount}`;
  } 
  // 2. Stuck Trigger (Time based)
  else if (currentTimeSpentSeconds > 900 || (model.avgTimePerSubtopic && currentTimeSpentSeconds > model.avgTimePerSubtopic * 3)) {
    triggerFired = 'stuck';
    conditionStr = `time_spent = ${currentTimeSpentSeconds}s, avg_time = ${model.avgTimePerSubtopic}s`;
  }
  // 3. Performing Well Trigger
  else if ((model.consecutivePassCount ?? 0) >= 3) {
    triggerFired = 'performing_well';
    conditionStr = `consecutivePassCount = ${model.consecutivePassCount}`;
  }

  // If a trigger fired, log it (with simple deduplication: don't log the exact same trigger+subtopic within the last hour)
  if (triggerFired) {
    const recentEvent = await db.query.systemEvents.findFirst({
      where: (se, { eq, and, gt }) => and(
        eq(se.userId, userId),
        eq(se.eventType, triggerFired as string),
        eq(se.subtopicId, currentSubtopicId),
        gt(se.occurredAt, new Date(Date.now() - 60 * 60 * 1000))
      )
    });

    if (!recentEvent) {
      await db.insert(systemEvents).values({
        userId,
        eventType: triggerFired,
        triggerCondition: conditionStr,
        subtopicId: currentSubtopicId,
        actionTaken: `pulsed chatbot button for ${triggerFired}`
      });
      return triggerFired;
    }
  }

  return null;
}
