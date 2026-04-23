import { db } from "@/db";
import { auth } from "@/auth";
import { userModel, quizAttempts, outcomes, learningEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { initializeKC, type KnowledgeState } from "@/lib/adaptive/bkt-engine";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json().catch(() => ({}));

    // Fetch roadmap to align seed data with actual subtopics
    const roadmap = await db.query.roadmaps.findFirst({
      where: (r, { eq, and }) => and(eq(r.userId, userId), eq(r.status, 'active')),
    });

    if (!roadmap) {
      return new NextResponse("No active roadmap found to seed data against.", { status: 400 });
    }

    const modules = roadmap.modules as any[];
    if (!modules || modules.length === 0) {
      return new NextResponse("Roadmap has no modules.", { status: 400 });
    }

    // Clear existing data for a clean slate if requested
    if (body.clear) {
      await db.delete(quizAttempts).where(eq(quizAttempts.userId, userId));
      await db.delete(outcomes).where(eq(outcomes.userId, userId));
      await db.delete(learningEvents).where(eq(learningEvents.userId, userId));
    }

    // We will generate a realistic learning progression
    // 1. Pre-Test Baseline
    const preTestScore = 35;
    
    // Create a realistic KnowledgeState trajectory
    const subtopicIds = modules.flatMap(m => m.subtopics?.map((s: any) => s.subtopic_id) || []);
    
    let currentCapability = preTestScore;
    let currentKS: KnowledgeState = {};
    
    // Initialize KS
    subtopicIds.forEach((id, idx) => {
      // Give them a low starting mastery
      currentKS[id] = initializeKC(id, 0.15 + (Math.random() * 0.15)); 
    });

    // 2. Pre-Test Event
    await db.insert(learningEvents).values({
      userId,
      eventType: 'pre_test',
      data: {
        score: preTestScore,
        questionResults: [],
        initialKnowledgeState: { ...currentKS },
      },
      occurredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    });

    // 3. Simulate Quiz Attempts (Learning Curve)
    const attemptsToGenerate = Math.min(10, subtopicIds.length * 2);
    
    for (let i = 0; i < attemptsToGenerate; i++) {
      const isPass = Math.random() > 0.3; // 70% pass rate
      const quizScore = isPass ? Math.floor(Math.random() * 25) + 75 : Math.floor(Math.random() * 40) + 30;
      
      const stId = subtopicIds[i % subtopicIds.length];
      const modId = modules.find(m => m.subtopics?.some((s: any) => s.subtopic_id === stId))?.module_id || 1;

      // Update BKT (simulate the math loosely for demo purposes)
      const kc = currentKS[stId];
      const bktBefore = kc.pMastery;
      const bktAfter = isPass ? Math.min(0.95, bktBefore + 0.25) : Math.max(0.1, bktBefore - 0.05);
      
      currentKS[stId] = {
        pMastery: bktAfter,
        attempts: kc.attempts + 1,
        correctCount: kc.correctCount + (isPass ? 4 : 1),
        lastUpdated: new Date(Date.now() - (7 - i) * 24 * 60 * 60 * 1000).toISOString(),
      };

      currentCapability = Math.min(95, currentCapability + (isPass ? 5 : -2));

      await db.insert(quizAttempts).values({
        userId,
        roadmapId: roadmap.id,
        moduleId: modId,
        subtopicId: stId,
        questions: [{ q: 'Mock' }],
        userAnswers: [0],
        score: quizScore,
        passed: isPass,
        attemptNumber: kc.attempts + 1,
        completedAt: new Date(Date.now() - (7 - i) * 24 * 60 * 60 * 1000),
      });

      await db.insert(learningEvents).values({
        userId,
        eventType: 'bkt_update',
        subtopicId: stId,
        data: {
          moduleId: modId,
          quizScore,
          passed: isPass,
          attemptNumber: kc.attempts + 1,
          bktBefore,
          bktAfter,
          capabilityScore: currentCapability,
        },
        occurredAt: new Date(Date.now() - (7 - i) * 24 * 60 * 60 * 1000),
      });
    }

    // 4. Update User Model
    await db.update(userModel).set({
      preTestScore,
      preTestCompletedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      knowledgeState: currentKS,
      capabilityScore: currentCapability,
      currentStreak: 5,
      longestStreak: 7,
      totalQuizzesTaken: attemptsToGenerate,
      avgQuizScore: 78,
    }).where(eq(userModel.userId, userId));

    // 5. Seed an Outcome
    await db.insert(outcomes).values({
      userId,
      roadmapId: roadmap.id,
      moduleId: modules[0].module_id,
      outcomeType: 'confidence',
      notes: 'Demo generated outcome',
      reportedAt: new Date(),
    });

    return NextResponse.json({ success: true, message: "Seed data injected successfully!" });

  } catch (error) {
    console.error("Seed demo error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
