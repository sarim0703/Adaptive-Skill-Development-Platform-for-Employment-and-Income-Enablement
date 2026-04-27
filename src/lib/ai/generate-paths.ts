import { z } from "zod";
import { generateObject } from "ai";
import { getGPT5ReasoningModel, GPT5_PATH_OPTIONS_PROMPT } from "./models";

export const pathOptionSchema = z.object({
  paths: z.array(
    z.object({
      title: z.string().describe("The name of the career or gig path"),
      summary: z.string().describe("A practical summary of what this path entails"),
      incomeMin: z.number().describe("Minimum estimated monthly income in INR"),
      incomeMax: z.number().describe("Maximum estimated monthly income in INR"),
      weeks: z.number().describe("Estimated total weeks to complete this path"),
      matchReason: z.string().describe("Why this is a good match based on the user's profile"),
      previewWeeks: z.array(
        z.object({
          week: z.number(),
          focus: z.string().describe("Actionable focus for this week"),
        })
      ).max(3).describe("A maximum 3-week preview of the curriculum"),
    })
  ).min(3).max(4).describe("Generate exactly 3 or 4 path options"),
});

export async function generatePathOptionsAI(profileString: string) {
  const model = getGPT5ReasoningModel();

  const { object } = await generateObject({
    model,
    schema: pathOptionSchema,
    system: GPT5_PATH_OPTIONS_PROMPT,
    prompt: `Generate paths for the following user profile:\n${profileString}`,
  });

  return object.paths;
}
