import { z } from "zod";
import { generateObject } from "ai";
import { getGPT5ReasoningModel, GPT5_PATH_OPTIONS_PROMPT } from "./models";
import { pathOptionSchema } from "./schemas";

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
