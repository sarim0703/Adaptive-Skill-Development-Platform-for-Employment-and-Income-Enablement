import { getGemma3Model, GEMMA3_RECALIBRATE_MODULE_PROMPT } from "./models";
import { generateObject } from "ai";
import { z } from "zod";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { roadmaps } from "@/db/schema";

const moduleSchema = z.object({
  module_id: z.number().describe("The ID of the module being generated"),
  module_title: z.string().describe("A descriptive title for this specific module"),
  subtopics: z.array(
    z.object({
      subtopic_id: z.string().describe("A unique slug for the subtopic, e.g., 'ac-repair-tools'"),
      title: z.string().describe("The name of the subtopic"),
      practical_task: z.string().describe("A highly specific, actionable task. What exactly must they DO?"),
      task_type: z.string().describe("The type of task (e.g., 'Research', 'Hands-on', 'Setup')"),
      youtube_search_query: z.string().describe("A specific YouTube search query that yields tutorials for this task"),
    })
  ).length(3).describe("Generate exactly 3 subtopics for this module"),
});

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

  // 2. Prepare Context
  const capabilityScore = model.capabilityScore ?? 50;
  const pathContext = JSON.stringify({
    pathTitle: roadmap.pathTitle,
    estimatedWeeks: roadmap.estimatedWeeks,
    targetModuleId,
  });
  const profileContext = JSON.stringify(profile);

  // 3. Generate the module
  const gemma = getGemma3Model();
  const { object } = await generateObject({
    model: gemma,
    schema: moduleSchema,
    system: GEMMA3_RECALIBRATE_MODULE_PROMPT,
    prompt: `
Target Module ID to Generate: ${targetModuleId}
User Capability Score: ${capabilityScore}/100

Path Details:
${pathContext}

User Profile:
${profileContext}
`,
  });

  // 4. Format the generated module
  const formattedModule = {
    module_id: object.module_id,
    module_title: object.module_title,
    status: 'generated',
    generated_at: new Date().toISOString(),
    unlocks_after_module_id: targetModuleId - 1,
    subtopics: object.subtopics.map((st, idx) => ({
      ...st,
      status: idx === 0 ? 'active' : 'locked', // First subtopic unlocks
      quiz_score: null,
      attempt_count: 0,
      time_spent_seconds: 0,
      difficulty_rating: null,
    })),
  };

  // 5. Replace in Roadmap
  const updatedModules = (roadmap.modules as unknown[]).map((modUnknown: unknown) => {
    const mod = modUnknown as { module_id: number };
    if (mod.module_id === targetModuleId) {
      return formattedModule;
    }
    return mod;
  });

  await db.update(roadmaps)
    .set({ modules: updatedModules })
    .where(eq(roadmaps.id, roadmapId));

  return formattedModule;
}
