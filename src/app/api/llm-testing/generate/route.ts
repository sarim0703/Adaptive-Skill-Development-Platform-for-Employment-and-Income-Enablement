import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { NextResponse } from "next/server";

const model = openai("gpt-5.4");

// Path generation schema
const pathSchema = z.object({
  paths: z.array(z.object({
    title: z.string(),
    summary: z.string(),
    incomeMin: z.number(),
    incomeMax: z.number(),
    weeks: z.number(),
    matchReason: z.string(),
  })).min(3).max(4),
});

// Roadmap generation schema
const subtopicSchema = z.object({
  subtopic_id: z.string(),
  title: z.string(),
  key_learning_notes: z.string(),
  practical_task: z.string(),
  task_type: z.enum(["install", "create", "apply", "practice", "submit", "call"]),
  youtube_search_query: z.string(),
  complexity_branch: z.enum(["beginner", "standard", "advanced"]),
});

const moduleSchema = z.object({
  module_id: z.number(),
  module_title: z.string(),
  subtopics: z.array(subtopicSchema).min(3).max(5),
});

const roadmapSchema = z.object({
  total_duration_weeks: z.number().optional(),
  modules: z.array(moduleSchema).min(3).max(5),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { location, ageGroup, gender, educationLevel, workInterest, experienceLevel, targetIncomeExact, deviceType, languagePreference, confidenceLevel, selectedPathIndex } = body;

    const profileContext = JSON.stringify({
      location,
      ageGroup,
      gender,
      educationLevel,
      workInterest,
      experienceLevel,
      targetIncomeExact: targetIncomeExact || 15000,
      deviceType,
      languagePreference,
      confidenceLevel: confidenceLevel || 5,
    }, null, 2);

    // Step 1: Generate career path options
    const { object: pathResult } = await generateObject({
      model,
      schema: pathSchema,
      system: `You are an expert career counselor for India's diverse workforce — covering skilled trades, services, tech, creative, and professional roles.

CRITICAL RULE: The user has stated their WORK INTEREST in the "workInterest" field. You MUST generate paths that are DIRECTLY CONNECTED to that stated interest. Do NOT default to delivery/logistics unless the user specifically asked for it.

Examples of interest-to-path mapping:
- Interest: "sales" → Retail Sales Executive, Insurance Agent, Real Estate Associate
- Interest: "electrical wiring" → Home Electrician, Industrial Wireman, Solar Panel Installer
- Interest: "cooking" → Restaurant Line Cook, Cloud Kitchen Operator, Catering Business
- Interest: "bikes" → Two-Wheeler Mechanic, Bike Courier, EV Servicing Technician

Constraints:
1. ALL 3-4 paths MUST relate to the user's stated interest. Never ignore it.
2. Paths must be realistic for someone in the user's location with their education level.
3. VERY IMPORTANT: Factor in the user's Age Group and Gender. If they are older, suggest paths with less physical strain. Ensure suggestions are culturally and practically safe/appropriate for their gender in their specific location.
4. Income estimates must be realistic monthly INR figures for that location.
5. Each path must be DISTINCT — do not generate similar-sounding paths.
6. Generate the response in the language specified in the user's profile context.`,
      prompt: `User Profile Context:\n${profileContext}`,
    });

    // Step 2: If a path is selected, generate the roadmap for it
    let roadmapResult = null;
    const pathIndex = selectedPathIndex ?? 0;
    const selectedPath = pathResult.paths[pathIndex];

    if (selectedPath) {
      const pathContext = JSON.stringify({
        pathTitle: selectedPath.title,
        estimatedWeeks: selectedPath.weeks,
        estimatedIncomeMin: selectedPath.incomeMin,
        estimatedIncomeMax: selectedPath.incomeMax,
      });

      const { object: roadmap } = await generateObject({
        model,
        schema: roadmapSchema,
        system: `You are an expert curriculum designer focused entirely on practical, actionable skill acquisition.
Based on the user's chosen path and profile, generate a complete roadmap.

**CORE PRINCIPLES (Non-Negotiable)**
- Focus on real skill mastery through deliberate practice, not checklists.
- Prioritise safety, local market demand, self-employment and gig opportunities.
- Make every roadmap feel like a genuine mini-course that builds confidence and income potential.
- All content must be in the user's exact preferred language.
- Every practical task must be 100% possible on the declared Device Type.

**ROADMAP STRUCTURE**
- Generate 3 to 5 modules total (choose based on trade complexity + user profile).
- Progression should feel natural: Basics → Core Skills → Hands-on Application → Troubleshooting & Safety → Real-World Application & Earning.
- Each module: 3–5 subtopics maximum.
- Total realistic duration: show at the top (2–12 weeks depending on the skill).

**For EVERY Subtopic You MUST Include:**
- Subtopic Title
- Key Learning Notes (2–4 clear sentences or bullets): explain the concept simply, why it matters, safety tips, common mistakes.
- Practical Task (device-appropriate, verifiable, repeatable for deliberate practice).
- Provide a relevant YouTube search query for each subtopic to help them learn if they get stuck.
- Complexity should match their current profile.`,
        prompt: `Generate the complete roadmap (3 to 5 modules) for the following path:\n${pathContext}\n\nUser Profile Context:\n${profileContext}`,
      });

      roadmapResult = roadmap;
    }

    return NextResponse.json({
      paths: pathResult.paths,
      selectedPathIndex: pathIndex,
      roadmap: roadmapResult,
      profile: JSON.parse(profileContext),
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error("LLM Testing error:", error);
    return NextResponse.json({ error: "Generation failed: " + (error as Error).message }, { status: 500 });
  }
}
