import { db } from "@/db";

export async function buildMentorContext(userId: string, subtopicId: string, triggerType: string | null, timeSpentSeconds: number) {
  const model = await db.query.userModel.findFirst({
    where: (um, { eq }) => eq(um.userId, userId),
  });

  const profile = await db.query.profiles.findFirst({
    where: (p, { eq }) => eq(p.userId, userId),
  });

  const roadmap = await db.query.roadmaps.findFirst({
    where: (r, { eq, and }) => and(eq(r.userId, userId), eq(r.status, 'active')),
  });

  if (!model || !profile || !roadmap) return '';

  // Find current subtopic info
  let currentSubtopic = 'Unknown';
  let currentModule = 'Unknown';
  for (const mod of (roadmap.modules as unknown[])) {
    const typedMod = mod as { module_title?: string; subtopics?: { subtopic_id: string; title: string; status: string }[] };
    for (const st of (typedMod.subtopics ?? [])) {
      if (st.subtopic_id === subtopicId) {
        currentSubtopic = `${st.title} (${st.status})`;
        currentModule = typedMod.module_title ?? 'Unknown';
      }
    }
  }

  // Build trigger instruction
  let instruction = 'Respond directly. Be specific to the current task. End with one clear next action.';
  switch (triggerType) {
    case 'stuck':
      instruction = 'The user has been stuck for a long time. Acknowledge their time spent. Break the task into ONE smaller step. Ask them to try just that.';
      break;
    case 'repeated_failure':
      instruction = 'The user has failed the quiz multiple times. Validate their effort first. Drop to the most basic level. Give them one tiny win to build confidence.';
      break;
    case 'performing_well':
      instruction = 'The user is doing great! Brief congratulation. Pose a slightly harder challenge question to keep them engaged.';
      break;
    case 'path_switch':
      instruction = 'The user is struggling with this path. Be empathetic. Suggest exploring the original alternative paths. Frame it as finding a better fit, NOT failure.';
      break;
  }

  const contextBlock = `--- LIVE USER CONTEXT ---
User: ${profile.location ?? 'Unknown'} | Language: ${profile.languagePreference ?? 'English'}
Path: ${roadmap.pathTitle}
Module: ${currentModule}
Current Task: ${currentSubtopic}

PERFORMANCE:
Capability: ${model.capabilityScore ?? 50}/100 | Velocity: ${model.learningVelocity ?? 'medium'}
Streak: ${model.currentStreak ?? 0} days | Consecutive Passes: ${model.consecutivePassCount ?? 0}
Avg Quiz Score: ${model.avgQuizScore ?? 0}%
Weak Areas: ${JSON.stringify(model.weakAreas ?? [])}

BEHAVIORAL SIGNAL:
Time on this step: ${Math.floor(timeSpentSeconds / 60)} minutes
Trigger: ${triggerType ?? 'user_initiated'}

INSTRUCTION:
${instruction}
--- END CONTEXT ---`;

  return contextBlock;
}
