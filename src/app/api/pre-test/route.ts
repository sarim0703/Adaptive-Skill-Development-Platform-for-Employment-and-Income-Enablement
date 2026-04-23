import { getPhi4Model } from "@/lib/ai/models";
import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";

const preTestSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe("A practical multiple-choice question"),
      options: z.array(z.string()).length(4).describe("Exactly 4 options"),
      correct_index: z.number().min(0).max(3).describe("The index (0-3) of the correct option"),
      topic_area: z.string().describe("The skill/knowledge area this question tests (e.g., 'navigation', 'customer_service', 'basic_tools')"),
      difficulty: z.enum(["easy", "medium", "hard"]).describe("Difficulty level of this question"),
    })
  ).length(8).describe("Generate exactly 8 diagnostic questions"),
});

export async function POST(req: Request) {
  try {
    const { pathTitle, profileSummary, language } = await req.json();
    const lang = language || 'english';

    const model = getPhi4Model();

    const { object } = await generateObject({
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
8. The pre-test is NOT pass/fail — it's purely diagnostic. Frame questions neutrally.`,
      prompt: `Career Path: ${pathTitle}\nLearner Background: ${profileSummary}`,
    });

    return NextResponse.json({ questions: object.questions });
  } catch (error) {
    console.error("Pre-test generation error:", error);
    return NextResponse.json({ error: "Failed to generate diagnostic assessment" }, { status: 500 });
  }
}
