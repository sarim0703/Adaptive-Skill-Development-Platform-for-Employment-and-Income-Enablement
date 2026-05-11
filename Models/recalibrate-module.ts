import { getGPT5ReasoningModel, GPT5_RECALIBRATE_MODULE_PROMPT } from "./models";
import { generateObject } from "ai";
import { z } from "zod";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { roadmaps, learningEvents } from "@/db/schema";
import { moduleSchema } from "./schemas";
import { buildBKTRecalibrationSummary, type KnowledgeState } from "@/lib/adaptive/bkt-engine";

export async function recalibrateAndGenerateNextModule(userId: string, roadmapId: string, targetModuleId: number) {
  // 1. Fetch necessary context
  const roadmap = await db.query.roadmaps.findFirst({
    where: (r, { eq, and }) => and(eq(r.id, roadmapId), eq(r.userId, userId)),
  });

  const profile = await db.query.profiles.findFirst({
    where: (p, { eq }) => eq(p.userId, userId),
  });

  const model = await db.query.userModel.findFirst({
    where: (um, { eq }) => eq(um.userId, userId),
  });

  if (!roadmap || !profile || !model) throw new Error("Missing data for recalibration");

  // 2. Prepare Context — structured BKT analysis with subtopic title resolution
  const knowledgeState = (model.knowledgeState as KnowledgeState) || {};
  const modules = roadmap.modules as { subtopics?: { subtopic_id: string; title: string }[] }[];
  const subtopicTitles: Record<string, string> = {};
  modules.forEach(mod => {
    mod.subtopics?.forEach(st => {
      if (st.subtopic_id && st.title) subtopicTitles[st.subtopic_id] = st.title;
    });
  });
  const bktSummary = buildBKTRecalibrationSummary(knowledgeState, subtopicTitles);

  const capabilityScore = model.capabilityScore ?? 50;
  const pathContext = JSON.stringify({
    pathTitle: roadmap.pathTitle,
    estimatedWeeks: roadmap.estimatedWeeks,
    targetModuleId,
  });
  const profileContext = JSON.stringify(profile);

  // 3. Generate the module
  const gpt5 = getGPT5ReasoningModel();
  const { object } = await generateObject({
    model: gpt5,
    schema: moduleSchema,
    system: GPT5_RECALIBRATE_MODULE_PROMPT,
    prompt: `
Target Module ID to Generate: ${targetModuleId}
User Capability Score: ${capabilityScore}/100

${bktSummary}

Path Details:
${pathContext}

User Profile:
${profileContext}
`,
  });

  // 4. Format the generated module
  // SAFETY: Force module_id to match targetModuleId regardless of what the AI generated
  const formattedModule = {
    module_id: targetModuleId,
    module_title: object.module_title,
    status: 'generated',
    generated_at: new Date().toISOString(),
    unlocks_after_module_id: targetModuleId - 1,
    subtopics: object.subtopics.map((st, idx) => ({
      ...st,
      status: idx === 0 ? 'active' : 'locked',
      quiz_score: null,
      attempt_count: 0,
      time_spent_seconds: 0,
      difficulty_rating: null,
    })),
  };

  // 5. SAFETY: Re-fetch roadmap for latest state before writing
  const freshRoadmap = await db.query.roadmaps.findFirst({
    where: (r, { eq, and }) => and(eq(r.id, roadmapId), eq(r.userId, userId)),
  });

  if (!freshRoadmap) throw new Error("Roadmap not found during persistence");

  const currentModules = freshRoadmap.modules as any[];
  const moduleExists = currentModules.some((mod: any) => mod.module_id === targetModuleId);

  const updatedModules = moduleExists
    ? currentModules.map((mod: any) => mod.module_id === targetModuleId ? formattedModule : mod)
    : [...currentModules, formattedModule];

  // SAFETY: User-scoped write to prevent cross-user corruption
  await db.update(roadmaps)
    .set({ modules: updatedModules })
    .where(and(eq(roadmaps.id, roadmapId), eq(roadmaps.userId, userId)));

  // 6. ANALYTICS: Log the recalibration event
  await db.insert(learningEvents).values({
    userId,
    eventType: 'module_recalibrated',
    data: {
      roadmapId,
      targetModuleId,
      moduleTitle: formattedModule.module_title,
      subtopicCount: formattedModule.subtopics.length,
      capabilityScoreAtTime: capabilityScore,
      generatedAt: formattedModule.generated_at,
    },
  });

  return formattedModule;
}
