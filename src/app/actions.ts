"use server";

import { db } from "@/db";
import { users, authCredentials, profiles, pathOptions, roadmaps, userModel, quizAttempts, outcomes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generatePathOptionsAI } from "@/lib/ai/generate-paths";
import { generateInitialRoadmapAI } from "@/lib/ai/generate-roadmap";
import { recalibrateAndGenerateNextModule } from "@/lib/ai/recalibrate-module";
import { updateUserModel } from "@/lib/adaptive/update-user-model";
import { checkProactiveTriggers as checkTriggers } from "@/lib/adaptive/triggers";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function registerUser(formData: FormData) {
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password || !name) {
    throw new Error("Missing fields");
  }

  // Check if user exists
  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [newUser] = await db.insert(users).values({
    name,
    email,
  }).returning();

  await db.insert(authCredentials).values({
    userId: newUser.id,
    passwordHash,
  });

  return { success: true };
}

export async function saveOnboardingProfile(answers: Record<number, string>) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await db.insert(profiles).values({
    userId: session.user.id,
    location: answers[1] || "",
    educationLevel: answers[2] || "",
    timeAvailability: answers[3] || "",
    rawSkillsInput: answers[4] || "",
    workHistory: answers[5] || "",
    targetIncomeExact: answers[6] ? parseInt(answers[6]) : null,
    languagePreference: answers[7] || "",
    confidenceLevel: answers[8] ? parseInt(answers[8]) : null,
  });

  redirect("/path-selection");
}

export async function getPathOptions() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

  return db.query.pathOptions.findMany({
    where: (paths, { eq }) => eq(paths.userId, userId as string),
    orderBy: (paths, { asc }) => [asc(paths.displayOrder)],
  });
}

export async function generateAndSavePathOptions() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  // Fetch profile to generate context
  const profile = await db.query.profiles.findFirst({
    where: (p, { eq }) => eq(p.userId, userId),
  });

  if (!profile) throw new Error("Profile not found");

  const profileString = JSON.stringify(profile, null, 2);
  const paths = await generatePathOptionsAI(profileString);

  // Clear existing options first to allow regeneration
  await db.delete(pathOptions).where(eq(pathOptions.userId, userId));

  // Save to DB using bulk insert
  await db.insert(pathOptions).values(
    paths.map((p, index) => ({
      userId,
      pathTitle: p.title,
      practicalSummary: p.summary,
      estimatedIncomeMin: p.incomeMin,
      estimatedIncomeMax: p.incomeMax,
      estimatedWeeks: p.weeks,
      matchReason: p.matchReason,
      previewWeeks: p.previewWeeks,
      displayOrder: index + 1,
    }))
  );
  
  return getPathOptions();
}

export async function selectPath(pathId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const userId = session.user.id;

  // Verify path belongs to user
  const path = await db.query.pathOptions.findFirst({
    where: (p, { eq, and }) => and(eq(p.id, pathId), eq(p.userId, userId)),
  });

  if (!path) throw new Error("Path not found");

  const profile = await db.query.profiles.findFirst({
    where: (p, { eq }) => eq(p.userId, userId),
  });

  // Mark path as selected
  await db.update(pathOptions).set({ isSelected: true }).where(eq(pathOptions.id, pathId));

  // Generate initial roadmap
  await createInitialRoadmap(path, profile!);

  redirect("/learn");
}

type GeneratedSubtopic = {
  subtopic_id: string;
  title: string;
  practical_task: string;
  task_type: string;
  youtube_search_query: string;
  complexity_branch?: string;
};

type GeneratedModule = {
  module_id: number;
  module_title: string;
  subtopics: GeneratedSubtopic[];
};

export async function createInitialRoadmap(selectedPath: { id: string; userId: string; pathTitle: string; estimatedWeeks: number | null; estimatedIncomeMin: number | null; estimatedIncomeMax: number | null }, profile: Record<string, unknown>) {
  const userId = selectedPath.userId;
  const pathContext = JSON.stringify(selectedPath);
  const profileContext = JSON.stringify(profile);

  const generatedModules = await generateInitialRoadmapAI(pathContext, profileContext);

  // Map generated modules to include DB state fields
  const formattedModules = (generatedModules as GeneratedModule[]).map((mod, index) => ({
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

  // Add 3 placeholder modules
  const placeholderModules = [3, 4, 5].map((id) => ({
    module_id: id,
    module_title: null,
    status: 'PENDING_CALIBRATION',
    generated_at: null,
    unlocks_after_module_id: id - 1,
    subtopics: [],
  }));

  const allModules = [...formattedModules, ...placeholderModules];

  // Archive any existing active roadmaps
  await db.update(roadmaps)
    .set({ status: 'archived', archivedAt: new Date(), archiveReason: 'manual_restart' })
    .where(eq(roadmaps.userId, userId));

  // Insert new roadmap
  await db.insert(roadmaps).values({
    userId,
    selectedPathId: selectedPath.id,
    pathTitle: selectedPath.pathTitle,
    estimatedWeeks: selectedPath.estimatedWeeks || 4,
    estimatedIncomeMin: selectedPath.estimatedIncomeMin || 0,
    estimatedIncomeMax: selectedPath.estimatedIncomeMax || 0,
    modules: allModules,
  });

  // Check if user model exists, if not create default
  const existingModel = await db.query.userModel.findFirst({
    where: (um, { eq }) => eq(um.userId, userId),
  });

  if (!existingModel) {
    await db.insert(userModel).values({
      userId,
    });
  }
}

export async function getUserRoadmap() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  return db.query.roadmaps.findFirst({
    where: (r, { eq, and }) => and(eq(r.userId, userId as string), eq(r.status, 'active')),
  });
}

export async function getUserModel() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  return db.query.userModel.findFirst({
    where: (um, { eq }) => eq(um.userId, userId as string),
  });
}

export async function getUserProfile() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const profile = await db.query.profiles.findFirst({
    where: (p, { eq }) => eq(p.userId, userId as string),
  });

  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId as string),
  });

  return { name: user?.name ?? null, location: profile?.location ?? null };
}

export async function submitQuizResult(params: {
  roadmapId: string;
  moduleId: number;
  subtopicId: string;
  score: number;
  passed: boolean;
  attemptNumber: number;
  timeSpent: number;
  questions: unknown[];
  userAnswers: number[];
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const userId = session.user.id;

  // 1. Record the quiz attempt
  await db.insert(quizAttempts).values({
    userId,
    roadmapId: params.roadmapId,
    moduleId: params.moduleId,
    subtopicId: params.subtopicId,
    questions: params.questions,
    userAnswers: params.userAnswers,
    score: params.score,
    passed: params.passed,
    attemptNumber: params.attemptNumber,
  });

  // 2. Fetch current roadmap to update subtopic state
  const roadmap = await db.query.roadmaps.findFirst({
    where: (r, { eq, and }) => and(eq(r.id, params.roadmapId), eq(r.userId, userId)),
  });

  if (!roadmap) throw new Error("Roadmap not found");

  let isFirstTimeComplete = false;

  const updatedModules = (roadmap.modules as unknown[]).map((mod: unknown) => {
    const typedMod = mod as { module_id: number; subtopics: unknown[] };
    if (typedMod.module_id !== params.moduleId) return mod;

    return {
      ...typedMod,
      subtopics: typedMod.subtopics.map((st: unknown, idx: number, arr: unknown[]) => {
        const typedSt = st as { subtopic_id: string; status: string; attempt_count?: number; time_spent_seconds?: number };
        // Update current subtopic
        if (typedSt.subtopic_id === params.subtopicId) {
          if (params.passed && typedSt.status !== 'complete') {
            isFirstTimeComplete = true;
          }
          return {
            ...typedSt,
            status: params.passed ? 'complete' : 'needs_review',
            quiz_score: params.score,
            attempt_count: (typedSt.attempt_count || 0) + 1,
            time_spent_seconds: (typedSt.time_spent_seconds || 0) + params.timeSpent,
          };
        }

        // Unlock next subtopic if current passed
        if (params.passed && idx > 0 && (arr[idx - 1] as { subtopic_id: string }).subtopic_id === params.subtopicId && typedSt.status === 'locked') {
          return { ...typedSt, status: 'active' };
        }

        return typedSt;
      }),
    };
  });

  // Update roadmap JSONB
  await db.update(roadmaps).set({ modules: updatedModules }).where(eq(roadmaps.id, params.roadmapId));

  // 3. Recalculate User Model
  const modelUpdate = await updateUserModel(userId, {
    subtopicId: params.subtopicId,
    moduleId: params.moduleId,
    score: params.score,
    passed: params.passed,
    attemptNumber: params.attemptNumber,
    timeSpentSeconds: params.timeSpent,
    difficultyRating: null,
    isFirstTimeComplete,
  });

  return {
    nextAction: params.passed ? 'continue' : 'needs_review',
    pathSwitchSuggested: modelUpdate.pathSwitchSuggested,
  };
}

export async function checkProactiveTriggers(subtopicId: string, timeSpentSeconds: number) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return checkTriggers(session.user.id, subtopicId, timeSpentSeconds);
}

export async function recalibrateModuleAction(roadmapId: string, moduleId: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return recalibrateAndGenerateNextModule(session.user.id, roadmapId, moduleId);
}

export async function switchPath(newPathId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  // 1. Find new path
  const newPath = await db.query.pathOptions.findFirst({
    where: (p, { eq, and }) => and(eq(p.id, newPathId), eq(p.userId, userId)),
  });

  if (!newPath) throw new Error("New path not found");

  const profile = await db.query.profiles.findFirst({
    where: (p, { eq }) => eq(p.userId, userId),
  });

  if (!profile) throw new Error("Profile not found");

  // 2. Mark old path(s) as unselected and archive old active roadmaps
  await db.update(pathOptions).set({ isSelected: false }).where(eq(pathOptions.userId, userId));
  
  // createInitialRoadmap handles archiving the active roadmap automatically, 
  // but let's explicitly archive it with the reason 'path_switch' first.
  await db.update(roadmaps)
    .set({ status: 'archived', archivedAt: new Date(), archiveReason: 'path_switch' })
    .where(eq(roadmaps.userId, userId));

  // 3. Set new path as selected
  await db.update(pathOptions).set({ isSelected: true }).where(eq(pathOptions.id, newPathId));

  // 4. Create new roadmap
  await createInitialRoadmap(newPath, profile);

  redirect("/learn");
}

export async function saveOutcome(roadmapId: string, moduleId: number, outcomeType: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.insert(outcomes).values({
    userId: session.user.id,
    roadmapId,
    moduleId,
    outcomeType,
  });

  return { success: true };
}
