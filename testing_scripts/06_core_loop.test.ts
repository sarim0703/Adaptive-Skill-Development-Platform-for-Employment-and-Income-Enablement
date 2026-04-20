import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateUserModel } from '@/lib/adaptive/update-user-model';
import { checkProactiveTriggers } from '@/lib/adaptive/triggers';

// Mock the database queries to test the mathematical logic in isolation
vi.mock('@/db', () => {
  return {
    db: {
      query: {
        userModel: {
          findFirst: vi.fn(),
        },
        roadmaps: {
          findFirst: vi.fn(),
        },
        systemEvents: {
          findFirst: vi.fn(),
        }
      },
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(),
        }))
      })),
      insert: vi.fn(() => ({
        values: vi.fn(),
      }))
    }
  };
});

import { db } from '@/db';

describe('Adaptive Core Loop - User Model Updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default active roadmap mock
    (db.query.roadmaps.findFirst as any).mockResolvedValue({
      id: 'roadmap-1',
      userId: 'user-1',
      status: 'active',
      currentModuleIndex: 0
    });
  });

  it('should increase capability score and calculate averages on pass', async () => {
    (db.query.userModel.findFirst as any).mockResolvedValue({
      userId: 'user-1',
      capabilityScore: 50,
      totalQuizzesTaken: 2,
      avgQuizScore: 70,
      completedSubtopicsCount: 5,
      avgTimePerSubtopic: 300,
      consecutivePassCount: 1,
      consecutiveFailCount: 0,
    });

    await updateUserModel('user-1', {
      subtopicId: 'sub-1',
      moduleId: 1,
      score: 80, // Score delta: (80-50)*0.4 = +12
      passed: true, // passAdjustment: +3
      attemptNumber: 1, // attemptPenalty: 0
      timeSpentSeconds: 600, // new avgTime: ((300*5) + 600) / 6 = 350
      difficultyRating: null,
      isFirstTimeComplete: true,
    });

    expect(db.update).toHaveBeenCalled();
    const updateCallArg = (db.update as any).mock.results[0].value.set.mock.calls[0][0];

    // Expect capability score: 50 + 12 + 3 = 65
    expect(updateCallArg.capabilityScore).toBe(65);
    // Avg quiz score: ((70 * 2) + 80) / 3 = 73
    expect(updateCallArg.avgQuizScore).toBe(73);
    // Avg time: 350
    expect(updateCallArg.avgTimePerSubtopic).toBe(350);
    // Pass count increments
    expect(updateCallArg.consecutivePassCount).toBe(2);
    // Fail count resets
    expect(updateCallArg.consecutiveFailCount).toBe(0);
  });

  it('should decrease capability score on fail and apply attempt penalty', async () => {
    (db.query.userModel.findFirst as any).mockResolvedValue({
      userId: 'user-1',
      capabilityScore: 65,
      totalQuizzesTaken: 3,
      avgQuizScore: 73,
    });

    await updateUserModel('user-1', {
      subtopicId: 'sub-1',
      moduleId: 1,
      score: 30, // Score delta: (30-50)*0.4 = -8
      passed: false, // passAdjustment: -3
      attemptNumber: 2, // attemptPenalty: (2-1)*5 = 5
      timeSpentSeconds: 200,
      difficultyRating: null,
      isFirstTimeComplete: false,
    });

    const updateCallArg = (db.update as any).mock.results[0].value.set.mock.calls[0][0];

    // Expect capability score: 65 - 8 - 5 - 3 = 49
    expect(updateCallArg.capabilityScore).toBe(49);
    // Pass count resets
    expect(updateCallArg.consecutivePassCount).toBe(0);
    // Fail count increments
    expect(updateCallArg.consecutiveFailCount).toBe(1);
  });

  it('should clamp capability score between 0 and 100', async () => {
    (db.query.userModel.findFirst as any).mockResolvedValue({
      userId: 'user-1',
      capabilityScore: 98,
    });

    await updateUserModel('user-1', {
      subtopicId: 'sub-1',
      moduleId: 1,
      score: 100, // delta: +20
      passed: true, // pass: +3
      attemptNumber: 1,
      timeSpentSeconds: 100,
      difficultyRating: null,
      isFirstTimeComplete: true,
    });

    const updateCallArg = (db.update as any).mock.results[0].value.set.mock.calls[0][0];

    // 98 + 20 + 3 = 121 -> Clamped to 100
    expect(updateCallArg.capabilityScore).toBe(100);
  });
});

describe('Adaptive Core Loop - Proactive Triggers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should trigger "repeated_failure" if user fails 2 or more times consecutively', async () => {
    (db.query.userModel.findFirst as any).mockResolvedValue({
      userId: 'user-1',
      consecutiveFailCount: 2,
    });
    
    // Mock no recent event exists
    (db.query.systemEvents.findFirst as any).mockResolvedValue(null);

    const trigger = await checkProactiveTriggers('user-1', 'sub-1', 100);
    expect(trigger).toBe('repeated_failure');
  });

  it('should trigger "stuck" if user spends > 3x average time', async () => {
    (db.query.userModel.findFirst as any).mockResolvedValue({
      userId: 'user-1',
      avgTimePerSubtopic: 120, // 2 mins
    });
    (db.query.systemEvents.findFirst as any).mockResolvedValue(null);

    // 400 seconds > 360 (120 * 3)
    const trigger = await checkProactiveTriggers('user-1', 'sub-1', 400);
    expect(trigger).toBe('stuck');
  });

  it('should trigger "performing_well" if user passes 3 times consecutively', async () => {
    (db.query.userModel.findFirst as any).mockResolvedValue({
      userId: 'user-1',
      consecutivePassCount: 3,
    });
    (db.query.systemEvents.findFirst as any).mockResolvedValue(null);

    const trigger = await checkProactiveTriggers('user-1', 'sub-1', 100);
    expect(trigger).toBe('performing_well');
  });

  it('should return null if no conditions are met', async () => {
    (db.query.userModel.findFirst as any).mockResolvedValue({
      userId: 'user-1',
      consecutivePassCount: 1,
      consecutiveFailCount: 0,
      avgTimePerSubtopic: 300,
    });
    
    const trigger = await checkProactiveTriggers('user-1', 'sub-1', 100);
    expect(trigger).toBeNull();
  });
});
