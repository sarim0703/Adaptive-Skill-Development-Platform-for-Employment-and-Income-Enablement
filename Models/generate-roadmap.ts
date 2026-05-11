import { z } from "zod";
import { generateObject } from "ai";
import { getGPT5ReasoningModel, GPT5_ROADMAP_PROMPT } from "./models";
import { roadmapSchema } from "./schemas";

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
