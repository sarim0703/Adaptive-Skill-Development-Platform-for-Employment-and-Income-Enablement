"use server";

import { db } from "@/db";
import { auth } from "@/auth";
import { users, profiles, roadmaps, quizAttempts } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function getUserBadgesData() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const userId = session.user.id;

  // 1. Get profile and name
  const profile = await db.query.profiles.findFirst({
    where: (p, { eq }) => eq(p.userId, userId),
  });

  const userRec = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId),
  });

  // 2. Compute stats
  const allQuizzes = await db.query.quizAttempts.findMany({
    where: (q, { eq }) => eq(q.userId, userId),
  });

  const passedQuizzes = allQuizzes.filter(q => q.passed);
  const uniqueModulesCompleted = new Set(passedQuizzes.map(q => `${q.roadmapId}-${q.moduleId}`)).size;
  
  const allRoadmaps = await db.query.roadmaps.findMany({
    where: (r, { eq }) => eq(r.userId, userId),
  });

  const completedRoadmaps = allRoadmaps.filter(r => r.status === 'completed').length;
  
  let halfRoadmapDone = false;
  const activeRoadmap = allRoadmaps.find(r => r.status === 'active');
  if (activeRoadmap) {
    const modules = activeRoadmap.modules as any[];
    if (modules && modules.length > 0) {
      if (activeRoadmap.currentModuleIndex >= modules.length / 2) {
        halfRoadmapDone = true;
      }
    }
  }

  // 3. Evaluate Badges
  const badges = [
    {
      id: "ignition",
      name: "Orbital Ignition",
      description: "Successfully passed your very first module quiz.",
      icon: "Rocket",
      color: "from-blue-500 to-cyan-400",
      isUnlocked: uniqueModulesCompleted >= 1,
    },
    {
      id: "flawless",
      name: "Flawless Execution",
      description: "Achieved a perfect 100% score on a module assessment.",
      icon: "Target",
      color: "from-rose-500 to-pink-500",
      isUnlocked: passedQuizzes.some(q => q.score === 100),
    },
    {
      id: "momentum",
      name: "Momentum Builder",
      description: "Successfully mastered 3 different learning modules.",
      icon: "Zap",
      color: "from-amber-400 to-orange-500",
      isUnlocked: uniqueModulesCompleted >= 3,
    },
    {
      id: "architect",
      name: "Knowledge Architect",
      description: "Reached the 50% completion milestone on a career roadmap.",
      icon: "BrainCircuit",
      color: "from-violet-500 to-purple-500",
      isUnlocked: halfRoadmapDone || completedRoadmaps > 0,
    },
    {
      id: "master",
      name: "Master of Orbit",
      description: "Successfully completed an entire career learning roadmap.",
      icon: "Trophy",
      color: "from-emerald-400 to-teal-500",
      isUnlocked: completedRoadmaps > 0,
    },
    {
      id: "streak",
      name: "Streak Pioneer",
      description: "Maintained a 7-day active learning streak. (Coming soon)",
      icon: "Flame",
      color: "from-orange-500 to-red-600",
      isUnlocked: false, // Feature not tracked yet, keep locked as teaser
    }
  ];

  return {
    user: {
      name: userRec?.name || "Space Explorer",
      email: userRec?.email,
      path: activeRoadmap?.pathTitle || "Exploring Options",
      modulesCompleted: uniqueModulesCompleted,
      roadmapsCompleted: completedRoadmaps,
    },
    badges
  };
}
