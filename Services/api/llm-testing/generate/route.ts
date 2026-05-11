import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { GPT5_ROADMAP_PROMPT } from "@/lib/ai/models";

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
    nsqf_level: z.string().describe("E.g., '3.0', '3.5', '4.0'. Based on complexity."),
    notional_hours: z.number().describe("Total estimated learning hours (e.g., 30, 60, 120)"),
    ncrf_credits: z.number().describe("Calculated as Notional Hours / 30"),
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
  nsqf_domain: z.enum([
    "Professional Theoretical Knowledge",
    "Professional and Technical Skills/Expertise",
    "Aptitude, Mind-set, Soft Skills, Employment Readiness & Entrepreneurship Skills",
    "Broad Learning Outcomes",
    "Level of Responsibility"
  ]).describe("Must map exactly to one of the 5 official NSQF 2023 domains."),
  nos_code: z.string().describe("Realistic National Occupational Standard code (e.g., ELE/N0102)"),
});

const moduleSchema = z.object({
  module_id: z.number(),
  module_title: z.string(),
  portfolio_evidence_task: z.string().describe("A specific, verifiable task to prove competence for this module (Proof of Work)."),
  subtopics: z.array(subtopicSchema).min(3).max(5),
});

const roadmapSchema = z.object({
  total_duration_weeks: z.number().describe("Total estimated weeks (e.g., 4)"),
  total_notional_hours: z.number().describe("Total notional hours for the entire roadmap"),
  modules: z.array(moduleSchema).min(3).max(5),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { location, ageGroup, gender, educationLevel, workInterest, experienceLevel, targetIncomeExact, deviceType, languagePreference, confidenceLevel, selectedPathIndex, bktBaseline } = body;

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
      system: `You are an expert career counselor and NCVET Sector Skill Council planner for India's workforce.

CRITICAL RULE: The user has stated their WORK INTEREST in the "workInterest" field. You MUST generate paths that are DIRECTLY CONNECTED to that stated interest. Do NOT default to delivery/logistics unless the user specifically asked for it.

Examples of interest-to-path mapping:
- Interest: "sales" → Retail Sales Executive, Insurance Agent, Real Estate Associate
- Interest: "electrical wiring" → Home Electrician, Industrial Wireman, Solar Panel Installer
- Interest: "cooking" → Restaurant Line Cook, Cloud Kitchen Operator, Catering Business

NSQF & NCrF COMPLIANCE (CRITICAL):
1. For each path, determine the appropriate NSQF Level based on the complexity of the role and the user's education. Use half-levels (e.g., 2.5, 3.0, 3.5, 4.0, 4.5).
   - No formal education / Primary: Levels 1.0 to 2.5 (Routine tasks, supervised)
   - High School: Levels 3.0 to 4.5 (Skilled worker, independent)
   - Graduate+: Levels 5.0+ (Specialized, supervisory)
2. Assign 'notional_hours'. Short micro-credentials should be 30-60 hours. Full certifications can be 120-240 hours.
3. Calculate 'ncrf_credits' strictly as: (notional_hours / 30).

Constraints:
1. ALL paths MUST relate to the user's stated interest. Never ignore it.
2. Paths must be realistic for someone in the user's location with their education level.
3. VERY IMPORTANT: Factor in the user's Age Group and Gender for cultural and physical safety.
4. Income estimates must be realistic monthly INR figures for that location.
5. Generate the response in the language specified in the user's profile context.`,
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

      const bktContext = JSON.stringify(bktBaseline || {});

      const { object: roadmap } = await generateObject({
        model,
        schema: roadmapSchema,
        system: GPT5_ROADMAP_PROMPT,
        prompt: `Generate the complete roadmap (3 to 5 modules) for the following path:\n${pathContext}\n\nUser Profile Context:\n${profileContext}\n\nBKT Baseline Context (Diagnostic Results):\n${bktContext}`,
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
