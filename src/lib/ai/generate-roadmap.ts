import { z } from "zod";
import { generateObject } from "ai";
import { getGPT5ReasoningModel, GPT5_ROADMAP_PROMPT } from "./models";

const subtopicSchema = z.object({
  subtopic_id: z.string().describe("A unique string ID for this subtopic (e.g. m1_s1)"),
  title: z.string().describe("Title of the subtopic"),
  key_learning_notes: z.string().describe("Key Learning Notes (2-4 clear sentences or bullets): concept, why it matters, safety, common mistakes"),
  practical_task: z.string().describe("A specific, actionable task to complete for deliberate practice"),
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
  total_duration_weeks: z.number().describe("Realistic total duration in weeks (2-12) based on the skill"),
  modules: z.array(moduleSchema).min(3).max(5).describe("Generate 3 to 5 modules total based on trade complexity"),
});

export async function generateInitialRoadmapAI(pathContext: string, profileContext: string) {
  const model = getGPT5ReasoningModel();

  const { object } = await generateObject({
    model,
    schema: roadmapSchema,
    system: GPT5_ROADMAP_PROMPT,
    prompt: `Generate the complete roadmap (3 to 5 modules) for the following path:\n${pathContext}\n\nUser Profile Context:\n${profileContext}`,
  });

  return object.modules;
}
