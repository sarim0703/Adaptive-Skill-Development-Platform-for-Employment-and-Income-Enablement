import { getPhi4Model } from "@/lib/ai/models";
import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";

const quizSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe("A practical multiple-choice question"),
      options: z.array(z.string()).length(4).describe("Exactly 4 options"),
      correct_index: z.number().min(0).max(3).describe("The index (0-3) of the correct option"),
    })
  ).length(2).describe("Generate exactly 2 questions"),
});

export async function POST(req: Request) {
  try {
    const { subtopicTitle, practicalTask, capabilityScore, language } = await req.json();
    const lang = language || 'english';

    const model = getPhi4Model();

    const { object } = await generateObject({
      model,
      schema: quizSchema,
      system: `You are an expert assessor generating practical multiple-choice questions for gig workers in India.
Your questions should focus on the specific practical task provided.
Adjust the difficulty based on the user's capability score (0-100).
Current capability score: ${capabilityScore}. (If < 40, make it very basic. If > 70, make it tricky).
Never use academic jargon. Be practical.
CRITICAL: You MUST generate all questions and options in ${lang}.`,
      prompt: `Subtopic: ${subtopicTitle}\nTask: ${practicalTask}`,
    });

    return NextResponse.json({ questions: object.questions });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
  }
}
