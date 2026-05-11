"use server";

import { db } from "@/db";
import { users, authCredentials, profiles, pathOptions, roadmaps, userModel, quizAttempts, outcomes, learningEvents } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generatePathOptionsAI } from "@/lib/ai/generate-paths";
import { generateInitialRoadmapAI } from "@/lib/ai/generate-roadmap";
import { recalibrateAndGenerateNextModule } from "@/lib/ai/recalibrate-module";
import { updateUserModel } from "@/lib/adaptive/update-user-model";
import { checkProactiveTriggers as checkTriggers } from "@/lib/adaptive/triggers";
import { batchUpdateFromQuiz, computeCapabilityFromBKT, initializeKC, getKnowledgeStateSummary, computeNormalizedLearningGain, computeBKTLearningGain, getZPDStatus, type KnowledgeState } from "@/lib/adaptive/bkt-engine";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { fetchSpecificVideo } from "@/lib/youtube/fetch-video";

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

// Step 1.1: Determine correct redirect for returning users
export async function checkUserState(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    console.log("[StateCheck] No session, redirecting to /auth");
    return '/auth';
  }

  const userId = session.user.id;
  console.log(`[StateCheck] Checking state for user: ${userId}`);
  
  // Parallel fetch for profile, active roadmap, and path options
  const [profile, roadmap, paths] = await Promise.all([
    db.query.profiles.findFirst({
      where: (p, { eq }) => eq(p.userId, userId),
    }),
    db.query.roadmaps.findFirst({
      where: (r, { eq, and }) => and(eq(r.userId, userId), eq(r.status, 'active')),
    }),
    db.query.pathOptions.findMany({
      where: (p, { eq }) => eq(p.userId, userId),
    }),
  ]);

  if (!profile) {
    console.log("[StateCheck] No profile found, redirecting to /onboarding");
    return '/onboarding';
  }

  if (roadmap) {
    console.log(`[StateCheck] Active roadmap found: ${roadmap.id}`);
    const model = await db.query.userModel.findFirst({
      where: (um, { eq }) => eq(um.userId, userId),
    });
    
    if (!model || model.preTestScore === null || model.preTestScore === undefined) {
      console.log("[StateCheck] Pre-test pending, redirecting to /pre-test");
      return '/pre-test';
    }
    
    console.log("[StateCheck] Roadmap and Pre-test complete, redirecting to /learn");
    return '/learn';
  }

  if (paths.length > 0) {
    console.log(`[StateCheck] ${paths.length} path options found, redirecting to /path-selection`);
    return '/path-selection';
  }

  console.log("[StateCheck] No roadmap or paths, redirecting to /path-selection (initial)");
  return '/path-selection';
}

// Step 1.2: Upsert profile to prevent crash on re-onboarding
export async function saveOnboardingProfile(answers: Record<number, string>) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const profileData = {
    location: answers[1] || "",
    ageGroup: answers[2] || "",
    gender: answers[3] || "",
    educationLevel: answers[4] || "",
    workInterest: answers[5] || "",
    rawSkillsInput: answers[5] || "", // legacy alias
    experienceLevel: answers[6] || "",
    workHistory: answers[6] || "", // legacy alias
    targetIncomeExact: answers[7] && !isNaN(parseInt(answers[7])) ? parseInt(answers[7]) : null,
    deviceType: answers[8] || "",
    languagePreference: answers[9] || "",
    confidenceLevel: answers[10] && !isNaN(parseInt(answers[10])) ? parseInt(answers[10]) : null,
  };

  // Check if profile already exists for this user
  const existing = await db.query.profiles.findFirst({
    where: (p, { eq }) => eq(p.userId, userId),
  });

  if (existing) {
    // Update existing profile
    await db.update(profiles).set(profileData).where(eq(profiles.id, existing.id));
  } else {
    // Insert new profile
    await db.insert(profiles).values({ userId, ...profileData });
  }

  // Force cache revalidation
  revalidatePath('/path-selection');
  revalidatePath('/onboarding');
  revalidatePath('/learn');
  revalidatePath('/');

  const destination = await checkUserState();
  return { success: true, destination };
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

  // Sanitize the profile context to remove DB metadata and legacy aliases
  const { id, userId: _, createdAt, rawSkillsInput, workHistory, timeAvailability, ...cleanProfile } = profile;
  const profileString = JSON.stringify(cleanProfile, null, 2);
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

  if (!path) {
    console.error(`[selectPath Error] Could not find path. Received pathId: '${pathId}', Session userId: '${userId}'`);
    throw new Error("Path not found");
  }

  const profile = await db.query.profiles.findFirst({
    where: (p, { eq }) => eq(p.userId, userId),
  });

  // Mark path as selected
  await db.update(pathOptions).set({ isSelected: true }).where(eq(pathOptions.id, pathId));

  // Archive any existing active roadmaps so they don't block the new pre-test flow
  await db.update(roadmaps)
    .set({ status: 'archived', archivedAt: new Date(), archiveReason: 'path_switch' })
    .where(and(eq(roadmaps.userId, userId), eq(roadmaps.status, 'active')));

  // PHASE 0: BKT-First Architecture
  // Roadmap generation is deferred until AFTER the pre-test is completed.
  // await createInitialRoadmap(path, profile!);

  return { success: true };
}

type GeneratedSubtopic = {
  subtopic_id: string;
  title: string;
  key_learning_notes: string;
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
  const { id, userId: _, createdAt, ...cleanPathContext } = selectedPath as any;
  const pathContext = JSON.stringify(cleanPathContext);

  // Sanitize profile context
  const { id: profileId, userId: profileUserId, createdAt: profileCreatedAt, rawSkillsInput, workHistory, timeAvailability, ...cleanProfile } = profile as any;
  const profileContext = JSON.stringify(cleanProfile);

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

  const allModules = [...formattedModules];

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

  let model = await db.query.userModel.findFirst({
    where: (um, { eq }) => eq(um.userId, userId as string),
  });

  // Lazy initialization for legacy users who started before the BKT architecture
  if (!model) {
    const [newModel] = await db.insert(userModel).values({
      userId: userId as string,
      capabilityScore: 50,
      knowledgeState: {},
    }).returning();
    model = newModel;
  } else if (!model.knowledgeState) {
    // Migrate existing row without breaking their old data
    await db.update(userModel)
      .set({ knowledgeState: {} })
      .where(eq(userModel.userId, userId as string));
    model.knowledgeState = {};
  }

  return model;
}

export async function getUserProfile() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const [profile, user] = await Promise.all([
    db.query.profiles.findFirst({
      where: (p, { eq }) => eq(p.userId, userId as string),
    }),
    db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, userId as string),
    })
  ]);

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

  const updatedModules = (roadmap.modules as unknown[]).map((mod: unknown, mIdx: number, mArr: unknown[]) => {
    const typedMod = mod as { module_id: number; subtopics: unknown[] };
    
    // 1. Handle current module updates
    if (typedMod.module_id === params.moduleId) {
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

          // Unlock next subtopic in SAME module
          if (params.passed && idx > 0 && (arr[idx - 1] as { subtopic_id: string }).subtopic_id === params.subtopicId && typedSt.status === 'locked') {
            return { ...typedSt, status: 'active' };
          }

          return typedSt;
        }),
      };
    }

    // 2. Handle NEXT module first subtopic unlocking
    // If the current module (params.moduleId) is the one BEFORE this one (typedMod.module_id)
    const prevMod = mArr[mIdx - 1] as { module_id: number; subtopics: unknown[] } | undefined;
    if (params.passed && prevMod && prevMod.module_id === params.moduleId) {
      // Check if the current subtopic was the LAST one in the previous module
      const lastStInPrev = prevMod.subtopics[prevMod.subtopics.length - 1] as { subtopic_id: string };
      if (lastStInPrev.subtopic_id === params.subtopicId) {
        // Unlock first subtopic of this module
        return {
          ...typedMod,
          subtopics: typedMod.subtopics.map((st: unknown, idx: number) => {
            const typedSt = st as { subtopic_id: string; status: string };
            if (idx === 0 && typedSt.status === 'locked') {
              return { ...typedSt, status: 'active' };
            }
            return typedSt;
          }),
        };
      }
    }

    return mod;
  });

  // Update roadmap JSONB
  await db.update(roadmaps).set({ modules: updatedModules }).where(eq(roadmaps.id, params.roadmapId));

  // 3. Recalculate User Model (legacy)
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

  // 4. BKT Knowledge Tracing Update
  const currentModel = await db.query.userModel.findFirst({
    where: (um, { eq }) => eq(um.userId, userId),
  });

  if (currentModel) {
    let currentKS = (currentModel.knowledgeState as KnowledgeState) || {};
    const questions = params.questions as { correct_index: number; difficulty: string; topic_area?: string }[];
    const userAnswers = params.userAnswers as number[];

    // Group answers by topic_area to update each KC independently
    const topicResults: Record<string, { isCorrect: boolean; difficulty: 'easy' | 'medium' | 'hard' }[]> = {};
    
    questions.forEach((q, i) => {
      // Fallback to subtopicId if AI failed to generate topic_area
      const topicId = q.topic_area || params.subtopicId; 
      if (!topicResults[topicId]) topicResults[topicId] = [];
      topicResults[topicId].push({
        isCorrect: userAnswers[i] === q.correct_index,
        difficulty: (q.difficulty || 'medium') as 'easy' | 'medium' | 'hard',
      });
    });

    let totalBktBefore = 0;
    let totalBktAfter = 0;
    let allAnswers: boolean[] = [];
    const numTopics = Object.keys(topicResults).length;

    for (const [topicId, topicAnswers] of Object.entries(topicResults)) {
      const { updatedState, deltas } = batchUpdateFromQuiz(
        currentKS,
        topicId,
        topicAnswers
      );
      currentKS = updatedState;
      totalBktBefore += deltas.before;
      totalBktAfter += deltas.after;
      allAnswers.push(...deltas.answers);
    }

    // Recompute capability score from BKT mastery probabilities
    const newCapability = computeCapabilityFromBKT(currentKS);

    // SAFETY: Verify knowledge state before persistence
    const { verifyKnowledgeState } = await import('@/lib/adaptive/bkt-engine');
    const safeKS = verifyKnowledgeState(currentKS);

    // Persist updated knowledge state and BKT-derived capability
    await db.update(userModel)
      .set({
        knowledgeState: safeKS,
        capabilityScore: newCapability,
      })
      .where(eq(userModel.userId, userId));

    // 5. Log granular learning event for analytics
    await db.insert(learningEvents).values({
      userId,
      eventType: 'bkt_update',
      subtopicId: params.subtopicId,
      data: {
        moduleId: params.moduleId,
        quizScore: params.score,
        passed: params.passed,
        attemptNumber: params.attemptNumber,
        bktBefore: totalBktBefore / (numTopics || 1),
        bktAfter: totalBktAfter / (numTopics || 1),
        bktDelta: Math.round(((totalBktAfter - totalBktBefore) / (numTopics || 1)) * 1000) / 1000,
        answers: allAnswers,
        capabilityScore: newCapability,
      },
    });
  }

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

  // 4. Redirect to diagnostic pre-test (BKT Initialization)
  // We no longer call createInitialRoadmap here. The roadmap is now generated 
  // via the /api/roadmap/stream route AFTER the pre-test is completed.
  redirect("/pre-test");
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

export async function checkRoadmapStatus() {
  const session = await auth();
  if (!session?.user?.id) return { ready: false };
  const roadmap = await db.query.roadmaps.findFirst({
    where: (r, { eq, and }) => and(eq(r.userId, session.user.id), eq(r.status, 'active')),
  });
  return { ready: !!roadmap };
}

// Step 3.3: Submit pre-test results and initialize BKT knowledge state
export async function submitPreTestResults(params: {
  score: number;
  questionResults: { topic_area: string; isCorrect: boolean; difficulty: string }[];
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  // Initialize BKT knowledge state from pre-test answers using rigorous Bayesian updates
  // We start from the default pL0 (e.g. 0.10) and perform sequential updates for each question
  const topicResults: Record<string, { isCorrect: boolean; difficulty: 'easy' | 'medium' | 'hard' }[]> = {};
  
  for (const result of params.questionResults) {
    const topicId = result.topic_area;
    if (!topicResults[topicId]) topicResults[topicId] = [];
    topicResults[topicId].push({
      isCorrect: result.isCorrect,
      difficulty: (result.difficulty as 'easy' | 'medium' | 'hard') || 'medium'
    });
  }

  const knowledgeState: KnowledgeState = {};
  for (const [topicId, answers] of Object.entries(topicResults)) {
    // We use the batchUpdateFromQuiz logic to get the final baseline pMastery
    // Since this is the baseline, we pass an empty state and let it initialize with pL0
    const { updatedState } = batchUpdateFromQuiz(
      {},
      topicId,
      answers
    );
    
    knowledgeState[topicId] = updatedState[topicId];
  }

  // Ensure user model exists
  const existingModel = await db.query.userModel.findFirst({
    where: (um, { eq }) => eq(um.userId, userId),
  });
  if (!existingModel) {
    await db.insert(userModel).values({ userId });
  }

  // Save pre-test score and initialized knowledge state
  await db.update(userModel)
    .set({
      preTestScore: params.score,
      preTestCompletedAt: new Date(),
      knowledgeState,
      capabilityScore: computeCapabilityFromBKT(knowledgeState), // Initial capability derived from BKT
    })
    .where(eq(userModel.userId, userId));

  // Log pre-test event
  await db.insert(learningEvents).values({
    userId,
    eventType: 'pre_test',
    data: {
      score: params.score,
      questionResults: params.questionResults,
      initialKnowledgeState: knowledgeState,
    },
  });

  revalidatePath('/learn');
  revalidatePath('/');

  return { success: true };
}

// Phase 4: Analytics Dashboard Data
export async function getAnalyticsData() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  // Fetch all required data in parallel
  const [model, roadmap, quizzes, outcomeRecords, events, profile, user] = await Promise.all([
    db.query.userModel.findFirst({ where: (um, { eq }) => eq(um.userId, userId) }),
    db.query.roadmaps.findFirst({ where: (r, { eq, and }) => and(eq(r.userId, userId), eq(r.status, 'active')) }),
    db.query.quizAttempts.findMany({ where: (q, { eq }) => eq(q.userId, userId) }),
    db.query.outcomes.findMany({ where: (o, { eq }) => eq(o.userId, userId) }),
    db.query.learningEvents.findMany({ where: (e, { eq }) => eq(e.userId, userId) }),
    db.query.profiles.findFirst({ where: (p, { eq }) => eq(p.userId, userId) }),
    db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, userId) }),
  ]);

  if (!model || !roadmap) return null;

  const knowledgeState = (model.knowledgeState as KnowledgeState) || {};
  const ksSummary = getKnowledgeStateSummary(knowledgeState);

  // Compute quiz performance over time for the learning curve
  const bktEvents = events
    .filter(e => e.eventType === 'bkt_update')
    .sort((a, b) => new Date(a.occurredAt!).getTime() - new Date(b.occurredAt!).getTime());

  const learningCurve = bktEvents.map((e, i) => {
    const data = e.data as { bktAfter?: number; quizScore?: number; capabilityScore?: number };
    return {
      attempt: i + 1,
      mastery: Math.round((data.bktAfter ?? 0) * 100),
      quizScore: data.quizScore ?? 0,
      capability: data.capabilityScore ?? 50,
    };
  });

  // Module progress from roadmap
  const modules = roadmap.modules as { module_id: number; module_title: string; subtopics: { status: string; subtopic_id: string; title: string }[] }[];
  
  const subtopicTitles: Record<string, string> = {};
  modules.forEach(mod => {
    mod.subtopics?.forEach(st => {
      if (st.subtopic_id && st.title) {
        subtopicTitles[st.subtopic_id] = st.title;
      }
    });
  });

  const prettifySlug = (slug: string) => {
    return slug
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // BKT mastery per subtopic
  const masteryGrid = Object.entries(knowledgeState).map(([subtopicId, kc]) => ({
    subtopicId: subtopicTitles[subtopicId] || prettifySlug(subtopicId),
    mastery: Math.round(kc.pMastery * 100),
    attempts: kc.attempts,
    correct: kc.correctCount,
    zpd: getZPDStatus(kc.pMastery),
  }));

  // Normalized Learning Gain — prefer BKT-native computation over naive quiz scores
  const preTestEvent = events.find(e => e.eventType === 'pre_test');
  const baselineKS = (preTestEvent?.data as { initialKnowledgeState?: KnowledgeState })?.initialKnowledgeState;
  const preTestScore = model.preTestScore ?? null;
  const currentAvg = quizzes.length > 0
    ? Math.round(quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length)
    : null;
  
  let nlg: number | null = null;
  if (baselineKS && Object.keys(baselineKS).length > 0) {
    // BKT-native: compare baseline pMastery probabilities to current pMastery
    nlg = computeBKTLearningGain(baselineKS, knowledgeState);
  } else if (preTestScore !== null && currentAvg !== null) {
    // Fallback for legacy users without a BKT pre-test baseline
    nlg = computeNormalizedLearningGain(preTestScore, currentAvg);
  }

  // Outcome distribution
  const outcomeDistribution = outcomeRecords.reduce((acc, o) => {
    acc[o.outcomeType] = (acc[o.outcomeType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const moduleProgress = modules.map(mod => {
    const total = mod.subtopics?.length || 0;
    const completed = mod.subtopics?.filter(s => s.status === 'complete').length || 0;
    return {
      moduleId: mod.module_id,
      title: mod.module_title,
      total,
      completed,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });

  return {
    // User info
    userName: user?.name ?? 'Student',
    pathTitle: roadmap.pathTitle,

    // BKT Summary
    capabilityScore: computeCapabilityFromBKT(knowledgeState),
    knowledgeSummary: ksSummary,
    masteryGrid,

    // Learning Metrics
    preTestScore,
    currentAvgScore: currentAvg,
    normalizedLearningGain: nlg,
    learningCurve,

    // Activity
    totalQuizzes: quizzes.length,
    currentStreak: model.currentStreak ?? 0,
    longestStreak: model.longestStreak ?? 0,
    consistencyScore: model.consistencyScore ?? 50,

    // Module Progress
    moduleProgress,

    // Outcomes (SDG 8)
    outcomeDistribution,
    totalOutcomes: outcomeRecords.length,
  };
}

export async function getDashboardData() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // getAnalyticsData already fetches everything we need, but we'll expand it
  // to include specific profile fields for the "Professional Identity" section.
  const data = await getAnalyticsData();
  if (!data) return null;

  const userId = session.user.id;
  const [profile, user] = await Promise.all([
    db.query.profiles.findFirst({ where: (p, { eq }) => eq(p.userId, userId) }),
    db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, userId) }),
  ]);

  return {
    ...data,
    // Expanded Profile Identity fields
    userEmail: user?.email ?? '',
    location: profile?.location ?? 'Local Hub',
    educationLevel: profile?.educationLevel ?? 'General',
    workInterest: profile?.workInterest ?? 'Active Exploration',
    confidenceLevel: profile?.confidenceLevel ?? 50,
    memberSince: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Recently',
  };
}

export async function getYouTubeVideo(query: string) {
  return fetchSpecificVideo(query);
}
