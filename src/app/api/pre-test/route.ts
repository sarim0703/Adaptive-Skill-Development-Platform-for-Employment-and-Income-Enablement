import { getGPT5InstantModel } from "@/lib/ai/models";
import { streamObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { preTestSchema } from "@/lib/ai/schemas";

export async function POST(req: Request) {
  try {
    const { pathTitle, profileSummary, language } = await req.json();
    const lang = language || 'english';

    const model = getGPT5InstantModel();

    const result = await streamObject({
      model,
      schema: preTestSchema,
      system: `You are an expert diagnostic assessor for India's workforce skill development programs.
Your job is to create a diagnostic pre-test that measures a learner's BASELINE knowledge before they start learning.

IMPORTANT RULES:
1. Generate 8 questions spanning the FULL BREADTH of the career path topic.
2. Mix difficulty: 3 easy, 3 medium, 2 hard questions.
3. Questions must be PRACTICAL, not academic. Test real-world knowledge.
4. Each question must have a "topic_area" tag that maps to a specific skill area within the path.
5. Use topic_area slugs like: "basic-tools", "customer-service", "route-planning", "safety", "digital-skills", "pricing", "quality-check", "communication" etc.
6. Never use jargon. Questions should be accessible to someone with minimal formal education.
7. CRITICAL: Generate ALL questions and options in ${lang}.
8. The pre-test is NOT pass/fail — it's purely diagnostic. Frame questions neutrally.
9. Ensure variety: Do not always place the correct answer at the same index across questions.`,
      prompt: `Career Path: ${pathTitle}\nLearner Background: ${profileSummary}\nGeneration Seed: ${Date.now()}`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Pre-test generation error:", error);
    return NextResponse.json({ error: "Failed to generate diagnostic assessment" }, { status: 500 });
  }
}
