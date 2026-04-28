import { streamObject } from "ai";
import { getGPT5ReasoningModel, GPT5_RECALIBRATE_MODULE_PROMPT } from "@/lib/ai/models";
import { z } from "zod";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { roadmaps, profiles, userModel } from "@/db/schema";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { moduleSchema } from "@/lib/ai/schemas";

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
Path Details: ${pathContext}
User Profile: ${profileContext}
`,
      onFinish: async ({ object }) => {
        if (!object) return;

        // Persist the new module to the roadmap JSONB
        const formattedModule = {
          module_id: object.module_id,
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

        const currentModules = roadmap.modules as any[];
        const updatedModules = currentModules.map((mod: any) => {
          if (mod.module_id === targetModuleId) return formattedModule;
          return mod;
        });

        await db.update(roadmaps)
          .set({ modules: updatedModules })
          .where(and(eq(roadmaps.id, roadmapId), eq(roadmaps.userId, userId)));
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[Recalibrate API Error]", error);
    return NextResponse.json({ error: "Recalibration failed" }, { status: 500 });
  }
}
