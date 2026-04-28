"use server";

import { db } from "@/db";
import { users, authCredentials, profiles, pathOptions, roadmaps, userModel, quizAttempts, outcomes, learningEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generatePathOptionsAI } from "@/lib/ai/generate-paths";
import { generateInitialRoadmapAI } from "@/lib/ai/generate-roadmap";
import { recalibrateAndGenerateNextModule } from "@/lib/ai/recalibrate-module";
import { updateUserModel } from "@/lib/adaptive/update-user-model";
import { checkProactiveTriggers as checkTriggers } from "@/lib/adaptive/triggers";
import { batchUpdateFromQuiz, computeCapabilityFromBKT, initializeKC, getKnowledgeStateSummary, computeNormalizedLearningGain, getZPDStatus, type KnowledgeState } from "@/lib/adaptive/bkt-engine";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

  // Generate initial roadmap
  await createInitialRoadmap(path, profile!);

  redirect("/pre-test");
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

  return db.query.userModel.findFirst({
    where: (um, { eq }) => eq(um.userId, userId as string),
  });
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
    const currentKS = (currentModel.knowledgeState as KnowledgeState) || {};
    const questions = params.questions as { correct_index: number }[];
    const userAnswers = params.userAnswers as number[];

    // Map each quiz question to a BKT observation
    const answers = questions.map((q, i) => ({
      isCorrect: userAnswers[i] === q.correct_index,
    }));

    // Run BKT update
    const { updatedState, deltas } = batchUpdateFromQuiz(
      currentKS,
      params.subtopicId,
      answers
    );

    // Recompute capability score from BKT mastery probabilities
    const newCapability = computeCapabilityFromBKT(updatedState);

    // Persist updated knowledge state and BKT-derived capability
    await db.update(userModel)
      .set({
        knowledgeState: updatedState,
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
        bktBefore: deltas.before,
        bktAfter: deltas.after,
        bktDelta: Math.round((deltas.after - deltas.before) * 1000) / 1000,
        answers: deltas.answers,
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

// Step 3.3: Submit pre-test results and initialize BKT knowledge state
export async function submitPreTestResults(params: {
  score: number;
  questionResults: { topic_area: string; isCorrect: boolean; difficulty: string }[];
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  // Initialize BKT knowledge state from pre-test answers
  // Correct answers get higher initial mastery (informed prior)
  const topicMasteries: Record<string, number[]> = {};
  
  for (const result of params.questionResults) {
    const topicId = result.topic_area;
    let initialMastery = 0.05; // default very low
    
    if (result.isCorrect) {
      switch (result.difficulty) {
        case 'easy': initialMastery = 0.20; break;
        case 'medium': initialMastery = 0.35; break;
        case 'hard': initialMastery = 0.50; break;
      }
    } else {
      switch (result.difficulty) {
        case 'easy': initialMastery = 0.03; break;
        case 'medium': initialMastery = 0.05; break;
        case 'hard': initialMastery = 0.08; break;
      }
    }
    
    if (!topicMasteries[topicId]) topicMasteries[topicId] = [];
    topicMasteries[topicId].push(initialMastery);
  }

  const knowledgeState: KnowledgeState = {};
  for (const [topicId, masteries] of Object.entries(topicMasteries)) {
    const avgMastery = masteries.reduce((a, b) => a + b, 0) / masteries.length;
    knowledgeState[topicId] = initializeKC(topicId, avgMastery);
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

  // Normalized Learning Gain
  const preTestScore = model.preTestScore ?? null;
  const currentAvg = quizzes.length > 0
    ? Math.round(quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length)
    : null;
  const nlg = preTestScore !== null && currentAvg !== null
    ? computeNormalizedLearningGain(preTestScore, currentAvg)
    : null;

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
