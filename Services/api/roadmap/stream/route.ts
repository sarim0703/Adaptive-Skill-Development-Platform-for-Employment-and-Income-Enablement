import { streamObject } from "ai";
import { getGPT5ReasoningModel, GPT5_ROADMAP_PROMPT } from "@/lib/ai/models";
import { roadmapSchema } from "@/lib/ai/schemas";
import { db } from "@/db";
import { pathOptions, profiles, roadmaps, userModel } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const maxDuration = 60; // Extend duration for deep reasoning models

/**
 * STREAMING ROADMAP GENERATION ROUTE
 * 
 * This route provides a real-time stream of the roadmap as it's being generated.
 * It also handles the database persistence once the generation is complete.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
    const userId = session.user.id;

    const { pathId } = await req.json();

    // 1. Fetch Context
    const [path, profile, user] = await Promise.all([
      db.query.pathOptions.findFirst({
        where: (p, { eq, and }) => and(eq(p.id, pathId), eq(p.userId, userId)),
      }),
      db.query.profiles.findFirst({
        where: (p, { eq }) => eq(p.userId, userId),
      }),
      db.query.userModel.findFirst({
        where: (u, { eq }) => eq(u.userId, userId),
      }),
    ]);

    if (!path || !profile) return new Response("Missing context", { status: 404 });

    // 2. IMMEDIATE STATE STABILIZATION
    // Mark path as selected and archive old roadmaps BEFORE the stream starts.
    // This ensures that if the user refreshes mid-stream, they don't see a stale state.
    await Promise.all([
      db.update(pathOptions).set({ isSelected: true }).where(and(eq(pathOptions.id, pathId), eq(pathOptions.userId, userId))),
      db.update(roadmaps)
        .set({ status: 'archived', archivedAt: new Date(), archiveReason: 'path_switch' })
        .where(eq(roadmaps.userId, userId))
    ]);

    const pathContext = JSON.stringify(path);
    const profileContext = JSON.stringify(profile);
    const bktContext = JSON.stringify(user?.knowledgeState || {});

    const model = getGPT5ReasoningModel();

    // 2. Stream the Object
    const result = await streamObject({
      model,
      schema: roadmapSchema,
      system: GPT5_ROADMAP_PROMPT,
      prompt: `Generate the complete roadmap (3 to 5 modules) for the following path:\n${pathContext}\n\nUser Profile Context:\n${profileContext}\n\nBKT Baseline Context (Diagnostic Results):\n${bktContext}`,
      onFinish: async ({ object }) => {
        // 3. PERSISTENCE LOGIC (Runs after stream finishes)
        if (!object) return;

        try {
          const modules = object.modules || [];
          
          // Format modules with runtime states
          const formattedModules = modules.map((mod, index) => ({
            module_id: mod.module_id,
            module_title: mod.module_title,
            status: 'generated',
            generated_at: new Date().toISOString(),
            subtopics: mod.subtopics.map((st, stIndex) => ({
              ...st,
              status: index === 0 && stIndex === 0 ? 'active' : 'locked',
              quiz_score: null,
              attempt_count: 0,
              time_spent_seconds: 0,
              difficulty_rating: null,
            })),
          }));

          // Save new roadmap
          await db.insert(roadmaps).values({
            userId,
            selectedPathId: pathId,
            pathTitle: path.pathTitle,
            estimatedWeeks: object.total_duration_weeks || 4,
            estimatedIncomeMin: path.estimatedIncomeMin || 0,
            estimatedIncomeMax: path.estimatedIncomeMax || 0,
            modules: formattedModules,
            status: 'active', // Explicitly set active
          });

          console.log(`[StreamRoadmap] SUCCESS: Roadmap persisted for user ${userId}`);

          // Ensure user model is in a valid state
          const existingModel = await db.query.userModel.findFirst({
            where: (um, { eq }) => eq(um.userId, userId),
          });
          if (!existingModel) {
            await db.insert(userModel).values({ userId });
            console.log(`[StreamRoadmap] Initialized user model for ${userId}`);
          }

          // Force cache revalidation for learning pages
          revalidatePath('/learn');
          revalidatePath('/path-selection');
          revalidatePath('/');
        } catch (err) {
          console.error("[StreamRoadmap onFinish Error] Persistence failed:", err);
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[StreamRoadmap API Error]", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
