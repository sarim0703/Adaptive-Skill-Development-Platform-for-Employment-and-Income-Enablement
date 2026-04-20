import { z } from "zod";
import { generateObject } from "ai";
import { getGemma3Model, GEMMA3_ROADMAP_PROMPT } from "./models";

const subtopicSchema = z.object({
  subtopic_id: z.string().describe("A unique string ID for this subtopic (e.g. m1_s1)"),
  title: z.string().describe("Title of the subtopic"),
  practical_task: z.string().describe("A specific, actionable task to complete"),
  task_type: z.enum(["install", "create", "apply", "practice", "submit", "call"]),
  youtube_search_query: z.string().describe("Query to search on YouTube for help"),
  complexity_branch: z.enum(["beginner", "standard", "advanced"]).describe("The complexity level of this subtopic"),
});

const moduleSchema = z.object({
  module_id: z.number(),
  module_title: z.string(),
  subtopics: z.array(subtopicSchema).min(3).max(5).describe("Generate 3 to 5 highly practical subtopics"),
});

export const roadmapSchema = z.object({
  modules: z.array(moduleSchema).length(2).describe("Generate exactly TWO modules (Module 1 and Module 2)"),
});

export async function generateInitialRoadmapAI(pathContext: string, profileContext: string) {
  const model = getGemma3Model();

  const { object } = await generateObject({
    model,
    schema: roadmapSchema,
    system: GEMMA3_ROADMAP_PROMPT,
    prompt: `Generate the first 2 modules for the following path:\n${pathContext}\n\nUser Profile Context:\n${profileContext}`,
  });

  return object.modules;
}
