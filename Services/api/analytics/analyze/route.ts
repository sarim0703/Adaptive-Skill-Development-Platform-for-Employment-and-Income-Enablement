import { getGPT5InstantModel } from "@/lib/ai/models";
import { streamText } from "ai";
import { auth } from "@/auth";
import { db } from "@/db";
import { userModel, learningEvents, roadmaps } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
    const userId = session.user.id;

    // Fetch the User Model (BKT state)
    const model = await db.query.userModel.findFirst({
      where: (um, { eq }) => eq(um.userId, userId),
    });

    // Fetch the Pre-test Learning Event (Raw Diagnostic Data)
    const preTestEvent = await db.query.learningEvents.findFirst({
      where: (le, { eq, and }) => and(eq(le.userId, userId), eq(le.eventType, 'pre_test')),
      orderBy: [desc(learningEvents.occurredAt)],
    });

    // Fetch Active Roadmap
    const roadmap = await db.query.roadmaps.findFirst({
      where: (r, { eq, and }) => and(eq(r.userId, userId), eq(r.status, 'active')),
    });

    if (!model || !preTestEvent || !roadmap) {
      return NextResponse.json({ error: "Missing required diagnostic data" }, { status: 404 });
    }

    const preTestData = preTestEvent.data as any;
    const knowledgeState = model.knowledgeState as any;
    
    const prompt = `You are the Lead Cognitive Scientist at CareerOrbit. Your job is to analyze a learner's diagnostic data and provide a "Deep Cognitive Breakdown".

LEARNER PROFILE:
- Career Path: ${roadmap.pathTitle}
- Current Capability Score: ${model.capabilityScore}/100

SUBTOPIC GLOSSARY (Mapping IDs to Titles):
${JSON.stringify((roadmap.modules as any[]).flatMap(m => m.subtopics || []).reduce((acc, st) => ({ ...acc, [st.subtopic_id]: st.title }), {}), null, 2)}

DIAGNOSTIC DATA (Pre-Test):
- Overall Score: ${preTestData.score}/100
- Raw Question/Answer Patterns:
${JSON.stringify(preTestData.questionResults, null, 2)}

BKT KNOWLEDGE STATE (Latent mastery probabilities):
${JSON.stringify(knowledgeState, null, 2)}

YOUR TASK:
1. Provide a "Mastery Overview" - Summarize their strongest and weakest skill areas based on the BKT probabilities.
2. Provide a "Pattern Analysis" - Analyze their mistakes in the pre-test. Were they conceptual errors, or misreading scenarios?
3. Provide "Personalized Guidance" - What specifically should they focus on in their current path?
4. Mention the career path "${roadmap.pathTitle}" specifically.
5. Use professional, encouraging, but data-driven tone. Use markdown formatting.

CRITICAL: Do not be generic. Reference specific topics like ${Object.keys(knowledgeState).join(", ")}.`;

    const result = streamText({
      model: getGPT5InstantModel(),
      system: "You are a professional educational data scientist specializing in Bayesian Knowledge Tracing and Adaptive Learning.",
      prompt: prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI Analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
