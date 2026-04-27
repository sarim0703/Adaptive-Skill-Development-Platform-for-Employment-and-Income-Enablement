import { getGPT5InstantModel } from "@/lib/ai/models";
import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";

export const runtime = 'edge';

const resourceSchema = z.object({
  resources: z.array(
    z.object({
      title: z.string().describe("Name of the free learning resource"),
      url: z.string().describe("Direct URL to the resource"),
      type: z.enum(["article", "tutorial", "course", "documentation", "tool"]).describe("Type of resource"),
      description: z.string().describe("One-line description of what the learner will find"),
    })
  ).min(4).max(6).describe("4-6 free, high-quality learning resources"),
});

export async function POST(req: Request) {
  try {
    const { subtopicTitle, practicalTask } = await req.json();

    const model = getGPT5InstantModel();
    const { object } = await generateObject({
      model,
      schema: resourceSchema,
      system: `You are a learning resource curator. Recommend 4-6 FREE, high-quality learning resources for the given topic. 
Rules:
- Only recommend genuinely free resources (no paywalled content)
- Prioritize: official documentation, MDN, W3Schools, freeCodeCamp, Khan Academy, GeeksforGeeks, Coursera (free courses), YouTube channels, open-source tools
- Every URL must be a real, working URL to a specific page (not a generic homepage unless it's directly relevant)
- Mix resource types: articles, tutorials, interactive courses, documentation, tools
- Keep descriptions concise (under 15 words)`,
      prompt: `Topic: ${subtopicTitle}\nPractical Task: ${practicalTask}`,
    });

    return NextResponse.json(object);
  } catch (error: any) {
    console.error("Resources API error:", error);
    return NextResponse.json({ resources: [] }, { status: 500 });
  }
}
