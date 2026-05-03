import { streamObject } from "ai";
import { getGPT5ReasoningModel, GPT5_RECALIBRATE_MODULE_PROMPT } from "@/lib/ai/models";
import { z } from "zod";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { roadmaps, profiles, userModel, learningEvents } from "@/db/schema";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { moduleSchema } from "@/lib/ai/schemas";
import { buildBKTRecalibrationSummary, type KnowledgeState } from "@/lib/adaptive/bkt-engine";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
    const userId = session.user.id;

    const { roadmapId, targetModuleId } = await req.json();

    const [roadmap, profile, model] = await Promise.all([
      db.query.roadmaps.findFirst({
        where: (r, { eq, and }) => and(eq(r.id, roadmapId), eq(r.userId, userId)),
      }),
      db.query.profiles.findFirst({
        where: (p, { eq }) => eq(p.userId, userId),
      }),
      db.query.userModel.findFirst({
        where: (um, { eq }) => eq(um.userId, userId),
      }),
    ]);

    if (!roadmap || !profile || !model) return new Response("Missing context", { status: 404 });

    // Build structured BKT analysis with subtopic title resolution
    const knowledgeState = (model.knowledgeState as KnowledgeState) || {};
    const modules = roadmap.modules as { subtopics?: { subtopic_id: string; title: string }[] }[];
    const subtopicTitles: Record<string, string> = {};
    modules.forEach(mod => {
      mod.subtopics?.forEach(st => {
        if (st.subtopic_id && st.title) subtopicTitles[st.subtopic_id] = st.title;
      });
    });
    const bktSummary = buildBKTRecalibrationSummary(knowledgeState, subtopicTitles);

    const capabilityScore = model.capabilityScore ?? 50;
    const pathContext = JSON.stringify({
      pathTitle: roadmap.pathTitle,
      estimatedWeeks: roadmap.estimatedWeeks,
      targetModuleId,
    });
    const profileContext = JSON.stringify(profile);

    const gpt5 = getGPT5ReasoningModel();

    const result = await streamObject({
      model: gpt5,
      schema: moduleSchema,
      system: GPT5_RECALIBRATE_MODULE_PROMPT,
      prompt: `
Target Module ID to Generate: ${targetModuleId}
User Capability Score: ${capabilityScore}/100

${bktSummary}

Path Details: ${pathContext}
User Profile: ${profileContext}
`,
      onFinish: async ({ object }) => {
        if (!object) {
          console.error("[Recalibrate] AI returned null object — skipping persistence");
          return;
        }

        try {
          // SAFETY: Re-fetch roadmap to get the latest state and prevent stale overwrites
          const freshRoadmap = await db.query.roadmaps.findFirst({
            where: (r, { eq, and }) => and(eq(r.id, roadmapId), eq(r.userId, userId)),
          });

          if (!freshRoadmap) {
            console.error("[Recalibrate] Roadmap not found during persistence — aborting");
            return;
          }

          // SAFETY: Force the module_id to match targetModuleId regardless of what the AI generated
          const formattedModule = {
            module_id: targetModuleId,
            module_title: object.module_title,
            status: 'generated',
            generated_at: new Date().toISOString(),
            unlocks_after_module_id: targetModuleId - 1,
            subtopics: object.subtopics.map((st, idx) => ({
              ...st,
              status: idx === 0 ? 'active' : 'locked',
              quiz_score: null,
              attempt_count: 0,
              time_spent_seconds: 0,
              difficulty_rating: null,
            })),
          };

          // SAFETY: Replace or append the target module in the fresh roadmap data
          const currentModules = freshRoadmap.modules as any[];
          const moduleExists = currentModules.some((mod: any) => mod.module_id === targetModuleId);

          const updatedModules = moduleExists
            ? currentModules.map((mod: any) => mod.module_id === targetModuleId ? formattedModule : mod)
            : [...currentModules, formattedModule];

          await db.update(roadmaps)
            .set({ modules: updatedModules })
            .where(and(eq(roadmaps.id, roadmapId), eq(roadmaps.userId, userId)));

          // ANALYTICS: Log the recalibration event for research data export
          await db.insert(learningEvents).values({
            userId,
            eventType: 'module_recalibrated',
            data: {
              roadmapId,
              targetModuleId,
              moduleTitle: formattedModule.module_title,
              subtopicCount: formattedModule.subtopics.length,
              capabilityScoreAtTime: capabilityScore,
              generatedAt: formattedModule.generated_at,
            },
          });
        } catch (persistError) {
          console.error("[Recalibrate] Failed to persist adapted module:", persistError);
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[Recalibrate API Error]", error);
    return NextResponse.json({ error: "Recalibration failed" }, { status: 500 });
  }
}
