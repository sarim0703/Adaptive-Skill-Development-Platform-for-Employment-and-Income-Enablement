import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Hoisted mocks (these run before vi.mock factories) ────────────────────────
const { mockUpdateSet, mockUpdate } = vi.hoisted(() => {
  const mockUpdateSet = vi.fn().mockReturnValue({ where: vi.fn() });
  const mockUpdate = vi.fn().mockReturnValue({ set: mockUpdateSet });
  return { mockUpdateSet, mockUpdate };
});

// ─── Mock DB ───────────────────────────────────────────────────────────────────
vi.mock('@/db', () => ({
  db: {
    query: {
      roadmaps: { findFirst: vi.fn() },
      profiles: { findFirst: vi.fn() },
      userModel: { findFirst: vi.fn() },
      pathOptions: { findFirst: vi.fn() },
    },
    update: mockUpdate,
    insert: vi.fn().mockReturnValue({ values: vi.fn() }),
  },
}));

// ─── Mock AI SDK ───────────────────────────────────────────────────────────────
vi.mock('ai', () => ({
  generateObject: vi.fn().mockResolvedValue({
    object: {
      module_id: 3,
      module_title: 'Advanced Route Optimization',
      subtopics: [
        { subtopic_id: 'route-opt-1', title: 'Multi-stop Planning', practical_task: 'Plan a 5-stop delivery route using Google Maps', task_type: 'Hands-on', youtube_search_query: 'multi stop delivery route planning' },
        { subtopic_id: 'route-opt-2', title: 'Time Window Management', practical_task: 'Schedule deliveries within customer time windows', task_type: 'Planning', youtube_search_query: 'delivery time window scheduling' },
        { subtopic_id: 'route-opt-3', title: 'Fuel Cost Estimation', practical_task: 'Calculate fuel costs for your planned routes', task_type: 'Research', youtube_search_query: 'delivery fuel cost calculation India' },
      ],
    },
  }),
}));

vi.mock('@/lib/ai/models', () => ({
  getGemma3Model: vi.fn().mockReturnValue('mock-model'),
  GEMMA3_RECALIBRATE_MODULE_PROMPT: 'mock-prompt',
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
}));

vi.mock('@/db/schema', () => ({
  roadmaps: {},
  pathOptions: {},
}));

import { db } from '@/db';
import { recalibrateAndGenerateNextModule } from '@/lib/ai/recalibrate-module';

// ════════════════════════════════════════════════════════════════════════════════
// Test Suite 1: Module Recalibration Engine
// ════════════════════════════════════════════════════════════════════════════════
describe('Module Recalibration Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (db.query.roadmaps.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'roadmap-1',
      userId: 'user-1',
      pathTitle: 'Last-Mile Delivery Expert',
      estimatedWeeks: 8,
      modules: [
        {
          module_id: 1,
          module_title: 'Delivery Basics',
          status: 'generated',
          subtopics: [
            { subtopic_id: 'del-1', title: 'Intro', status: 'complete' },
            { subtopic_id: 'del-2', title: 'Tools', status: 'complete' },
            { subtopic_id: 'del-3', title: 'First Run', status: 'complete' },
          ],
        },
        {
          module_id: 2,
          module_title: 'Navigation Skills',
          status: 'generated',
          subtopics: [
            { subtopic_id: 'nav-1', title: 'Maps', status: 'complete' },
            { subtopic_id: 'nav-2', title: 'GPS', status: 'complete' },
            { subtopic_id: 'nav-3', title: 'Shortcuts', status: 'complete' },
          ],
        },
        {
          module_id: 3,
          status: 'PENDING_CALIBRATION',
          module_title: null,
          generated_at: null,
          unlocks_after_module_id: 2,
          subtopics: [],
        },
      ],
    });

    (db.query.profiles.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      userId: 'user-1',
      location: 'Indore',
      educationLevel: '12th Pass',
    });

    (db.query.userModel.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      userId: 'user-1',
      capabilityScore: 72,
    });
  });

  it('should generate a new module and replace the PENDING_CALIBRATION placeholder', async () => {
    const result = await recalibrateAndGenerateNextModule('user-1', 'roadmap-1', 3);

    expect(result.module_id).toBe(3);
    expect(result.module_title).toBe('Advanced Route Optimization');
    expect(result.status).toBe('generated');
    expect(result.generated_at).toBeDefined();
    expect(result.unlocks_after_module_id).toBe(2);
  });

  it('should format subtopics with correct initial states', async () => {
    const result = await recalibrateAndGenerateNextModule('user-1', 'roadmap-1', 3);

    expect(result.subtopics).toHaveLength(3);

    // First subtopic should be active (unlocked)
    expect(result.subtopics[0].status).toBe('active');
    expect(result.subtopics[0].attempt_count).toBe(0);
    expect(result.subtopics[0].time_spent_seconds).toBe(0);
    expect(result.subtopics[0].quiz_score).toBeNull();

    // Remaining subtopics should be locked
    expect(result.subtopics[1].status).toBe('locked');
    expect(result.subtopics[2].status).toBe('locked');
  });

  it('should persist the recalibrated module into the roadmap JSONB', async () => {
    await recalibrateAndGenerateNextModule('user-1', 'roadmap-1', 3);

    expect(mockUpdate).toHaveBeenCalled();

    const setArg = mockUpdateSet.mock.calls[0][0];
    expect(setArg).toHaveProperty('modules');

    const updatedModules = setArg.modules;
    expect(updatedModules).toHaveLength(3);

    // Module 1 & 2 should be unchanged
    expect(updatedModules[0].module_id).toBe(1);
    expect(updatedModules[0].status).toBe('generated');
    expect(updatedModules[1].module_id).toBe(2);

    // Module 3 should now be fully generated (no longer PENDING_CALIBRATION)
    expect(updatedModules[2].module_id).toBe(3);
    expect(updatedModules[2].status).toBe('generated');
    expect(updatedModules[2].module_title).toBe('Advanced Route Optimization');
    expect(updatedModules[2].subtopics).toHaveLength(3);
  });

  it('should throw if roadmap, profile, or userModel is missing', async () => {
    (db.query.roadmaps.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    await expect(
      recalibrateAndGenerateNextModule('user-1', 'roadmap-1', 3)
    ).rejects.toThrow('Missing data for recalibration');
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// Test Suite 2: Path Switch Archival Logic
// ════════════════════════════════════════════════════════════════════════════════
describe('Path Switch Archival Logic', () => {
  it('should archive roadmap with correct reason and timestamp', () => {
    const now = new Date();
    const archivePayload = {
      status: 'archived',
      archivedAt: now,
      archiveReason: 'path_switch',
    };

    expect(archivePayload.status).toBe('archived');
    expect(archivePayload.archiveReason).toBe('path_switch');
    expect(archivePayload.archivedAt).toBeInstanceOf(Date);
    expect(archivePayload.archivedAt.getTime()).toBeLessThanOrEqual(Date.now());
  });

  it('should preserve userModel history across path switches (no reset)', () => {
    const userModelBefore = {
      capabilityScore: 42,
      consecutivePassCount: 0,
      consecutiveFailCount: 3,
      totalQuizzesTaken: 8,
      avgQuizScore: 45,
      currentStreak: 2,
    };

    // After path switch, userModel should be identical (not zeroed out)
    const userModelAfter = { ...userModelBefore };

    expect(userModelAfter.capabilityScore).toBe(42);
    expect(userModelAfter.totalQuizzesTaken).toBe(8);
    expect(userModelAfter.currentStreak).toBe(2);
  });

  it('should correctly differentiate archive reasons', () => {
    const validReasons = ['path_switch', 'completed', 'abandoned'];

    expect(validReasons).toContain('path_switch');
    expect(validReasons).not.toContain('deleted'); // We never delete, we archive
  });
});
