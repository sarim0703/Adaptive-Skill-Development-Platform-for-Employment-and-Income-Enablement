import { db } from "@/db";
import { userModel } from "@/db/schema";
import { eq } from "drizzle-orm";

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

function addUnique(item: string, array: unknown[]) {
  const arr = Array.isArray(array) ? array : [];
  if (!arr.includes(item)) {
    return [...arr, item];
  }
  return arr;
}

export async function updateUserModel(userId: string, params: {
  subtopicId: string;
  moduleId: number;
  score: number;
  passed: boolean;
  attemptNumber: number;
  timeSpentSeconds: number;
  difficultyRating: number | null;
  isFirstTimeComplete: boolean;
}) {
  const model = await db.query.userModel.findFirst({
    where: (um, { eq }) => eq(um.userId, userId),
  });

  if (!model) throw new Error("UserModel not found");

  // 1. Quizzes
  const totalQuizzesTaken = (model.totalQuizzesTaken ?? 0) + 1;
  const prevAvgQuizScore = model.avgQuizScore ?? 0;
  const avgQuizScore = Math.round(((prevAvgQuizScore * (totalQuizzesTaken - 1)) + params.score) / totalQuizzesTaken);

  // 2. Capability Score
  const scoreDelta = Math.round((params.score - 50) * 0.4);
  const attemptPenalty = Math.max(0, params.attemptNumber - 1) * 5;
  const passAdjustment = params.passed ? 3 : -3;
  const capabilityScore = clamp((model.capabilityScore ?? 50) + scoreDelta - attemptPenalty + passAdjustment, 0, 100);

  // 3. Pass/Fail Streaks
  let consecutivePassCount = model.consecutivePassCount ?? 0;
  let consecutiveFailCount = model.consecutiveFailCount ?? 0;

  if (params.passed) {
    consecutivePassCount += 1;
    consecutiveFailCount = 0;
  } else {
    consecutivePassCount = 0;
    consecutiveFailCount += 1;
  }

  // 4. Strong/Weak Areas
  let weakAreas = Array.isArray(model.weakAreas) ? [...model.weakAreas] : [];
  let strongAreas = Array.isArray(model.strongAreas) ? [...model.strongAreas] : [];

  if (params.score < 50) {
    weakAreas = addUnique(params.subtopicId, weakAreas).slice(-10);
  }
  if (params.score >= 85 && params.attemptNumber === 1) {
    strongAreas = addUnique(params.subtopicId, strongAreas).slice(-10);
  }

  // 5. Confidence Index
  let confidenceDelta = -4;
  if (params.passed && params.attemptNumber === 1) confidenceDelta = 6;
  else if (params.passed && params.attemptNumber === 2) confidenceDelta = 2;
  else if (params.passed) confidenceDelta = 0;

  let difficultyAdjustment = 0;
  if (params.difficultyRating !== null) {
    if (params.difficultyRating <= 2) difficultyAdjustment = 1;
    else if (params.difficultyRating >= 4) difficultyAdjustment = -1;
  }

  const confidenceIndex = clamp((model.confidenceIndex ?? 50) + confidenceDelta + difficultyAdjustment, 0, 100);

  // 6. Completed Subtopics and Avg Time
  let completedSubtopicsCount = model.completedSubtopicsCount ?? 0;
  let avgTimePerSubtopic = model.avgTimePerSubtopic ?? 0;

  if (params.passed && params.isFirstTimeComplete) {
    const prevCompletedCount = completedSubtopicsCount;
    completedSubtopicsCount += 1;
    avgTimePerSubtopic = Math.round(((avgTimePerSubtopic * prevCompletedCount) + params.timeSpentSeconds) / completedSubtopicsCount);
  }

  // 7. Learning Velocity
  let learningVelocity = 'medium';
  if (avgTimePerSubtopic <= 480) learningVelocity = 'fast';
  else if (avgTimePerSubtopic > 1200) learningVelocity = 'slow';

  // 8. Streaks
  let currentStreak = model.currentStreak ?? 0;
  let longestStreak = model.longestStreak ?? 0;
  const now = new Date();
  
  // Set to midnight UTC for day comparisons
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const lastActive = model.lastActiveDate ? new Date(Date.UTC(model.lastActiveDate.getUTCFullYear(), model.lastActiveDate.getUTCMonth(), model.lastActiveDate.getUTCDate())) : null;

  let daysSinceLastActive = 0;

  if (!lastActive) {
    currentStreak = 1;
  } else {
    const diffTime = Math.abs(today.getTime() - lastActive.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    daysSinceLastActive = diffDays;

    if (diffDays === 1) {
      currentStreak += 1;
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
    // if diffDays === 0, streak remains the same
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  // 9. Consistency
  const consistencyScore = clamp(
    40 + (Math.min(currentStreak, 7) * 5) - (Math.min(Math.max(daysSinceLastActive - 1, 0), 5) * 10),
    0,
    100
  );

  // 10. Path Switch Flag
  const activeRoadmap = await db.query.roadmaps.findFirst({
    where: (r, { eq, and }) => and(eq(r.userId, userId), eq(r.status, 'active')),
  });

  const completedModuleIndex = activeRoadmap?.currentModuleIndex ?? 0;
  const pathSwitchSuggested = (
    (completedModuleIndex >= 1 && capabilityScore < 35) ||
    consecutiveFailCount >= 3
  );

  await db.update(userModel).set({
    totalQuizzesTaken,
    avgQuizScore,
    capabilityScore,
    consecutivePassCount,
    consecutiveFailCount,
    weakAreas,
    strongAreas,
    confidenceIndex,
    completedSubtopicsCount,
    avgTimePerSubtopic,
    learningVelocity,
    currentStreak,
    longestStreak,
    lastActiveDate: now,
    consistencyScore,
    pathSwitchSuggested,
    updatedAt: now,
  }).where(eq(userModel.userId, userId));

  return { pathSwitchSuggested };
}
