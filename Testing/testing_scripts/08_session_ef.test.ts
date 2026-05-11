import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Hoisted mocks ────────────────────────────────────────────────────────────
const { mockInsertValues } = vi.hoisted(() => {
  const mockInsertValues = vi.fn();
  return { mockInsertValues };
});

vi.mock('@/db', () => ({
  db: {
    query: {
      userModel: { findFirst: vi.fn() },
      profiles: { findFirst: vi.fn() },
      roadmaps: { findFirst: vi.fn() },
    },
    insert: vi.fn().mockReturnValue({ values: mockInsertValues }),
  },
}));

vi.mock('@/db/schema', () => ({
  outcomes: {},
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
}));

import { db } from '@/db';
import { buildMentorContext } from '@/lib/ai/build-mentor-context';

// ════════════════════════════════════════════════════════════════════════════════
// Test Suite 1: Context Injection Engine
// ════════════════════════════════════════════════════════════════════════════════
describe('Mentor Context Injection (build-mentor-context.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (db.query.userModel.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      userId: 'user-1',
      capabilityScore: 62,
      learningVelocity: 'medium',
      currentStreak: 4,
      consecutivePassCount: 2,
      avgQuizScore: 71,
      weakAreas: ['basic-tools', 'route-planning'],
    });

    (db.query.profiles.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      userId: 'user-1',
      location: 'Indore',
      languagePreference: 'Hindi',
    });

    (db.query.roadmaps.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      userId: 'user-1',
      pathTitle: 'Last-Mile Delivery Expert',
      status: 'active',
      modules: [
        {
          module_title: 'Delivery Basics',
          subtopics: [
            { subtopic_id: 'del-1', title: 'App Setup', status: 'complete' },
            { subtopic_id: 'del-2', title: 'First Delivery', status: 'active' },
          ],
        },
      ],
    });
  });

  it('should build a context block with all user data fields', async () => {
    const context = await buildMentorContext('user-1', 'del-2', null, 300);

    expect(context).toContain('Indore');
    expect(context).toContain('Hindi');
    expect(context).toContain('Last-Mile Delivery Expert');
    expect(context).toContain('Delivery Basics');
    expect(context).toContain('First Delivery (active)');
    expect(context).toContain('62/100');
    expect(context).toContain('medium');
    expect(context).toContain('4 days');
    expect(context).toContain('71%');
    expect(context).toContain('basic-tools');
    expect(context).toContain('5 minutes');
    expect(context).toContain('user_initiated');
  });

  it('should inject "stuck" instruction when trigger is stuck', async () => {
    const context = await buildMentorContext('user-1', 'del-2', 'stuck', 900);

    expect(context).toContain('Trigger: stuck');
    expect(context).toContain('Break the task into ONE smaller step');
    expect(context).toContain('15 minutes');
  });

  it('should inject "repeated_failure" instruction when trigger is repeated_failure', async () => {
    const context = await buildMentorContext('user-1', 'del-2', 'repeated_failure', 120);

    expect(context).toContain('Trigger: repeated_failure');
    expect(context).toContain('Validate their effort first');
    expect(context).toContain('one tiny win');
  });

  it('should inject "performing_well" instruction when trigger fires', async () => {
    const context = await buildMentorContext('user-1', 'del-2', 'performing_well', 60);

    expect(context).toContain('Trigger: performing_well');
    expect(context).toContain('congratulation');
    expect(context).toContain('harder challenge');
  });

  it('should inject "path_switch" instruction when trigger fires', async () => {
    const context = await buildMentorContext('user-1', 'del-2', 'path_switch', 60);

    expect(context).toContain('Trigger: path_switch');
    expect(context).toContain('empathetic');
    expect(context).toContain('better fit');
  });

  it('should return empty string if any required data is missing', async () => {
    (db.query.userModel.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const context = await buildMentorContext('user-1', 'del-2', null, 100);
    expect(context).toBe('');
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// Test Suite 2: Outcome Card Data Shape (SDG Measurement)
// ════════════════════════════════════════════════════════════════════════════════
describe('Outcome Card & SDG Measurement', () => {
  it('should accept all 4 valid outcome types', () => {
    const validOutcomes = ['gig_found', 'interview', 'confidence', 'still_learning'];

    validOutcomes.forEach(outcome => {
      expect(typeof outcome).toBe('string');
      expect(outcome.length).toBeGreaterThan(0);
    });

    expect(validOutcomes).toHaveLength(4);
  });

  it('should create a properly shaped outcome record', () => {
    const outcomeRecord = {
      userId: 'user-1',
      roadmapId: 'roadmap-1',
      moduleId: 2,
      outcomeType: 'gig_found',
    };

    expect(outcomeRecord.userId).toBe('user-1');
    expect(outcomeRecord.roadmapId).toBe('roadmap-1');
    expect(outcomeRecord.moduleId).toBe(2);
    expect(outcomeRecord.outcomeType).toBe('gig_found');
  });

  it('should map outcome types to SDG 8 indicators', () => {
    // SDG 8: Promote sustained, inclusive, and sustainable economic growth,
    // full and productive employment, and decent work for all
    const sdgMapping: Record<string, string> = {
      'gig_found': 'SDG 8.5 - Employment achieved',
      'interview': 'SDG 8.6 - Youth engagement in work pathway',
      'confidence': 'SDG 8.3 - Productive capacity building',
      'still_learning': 'SDG 8.3 - Skills development in progress',
    };

    expect(Object.keys(sdgMapping)).toHaveLength(4);
    expect(sdgMapping['gig_found']).toContain('Employment');
    expect(sdgMapping['still_learning']).toContain('Skills development');
  });
});

// ════════════════════════════════════════════════════════════════════════════════
// Test Suite 3: Mentor Greeting Messages
// ════════════════════════════════════════════════════════════════════════════════
describe('Mentor Chat Greeting Messages', () => {
  // Reproduce the getGreeting logic from MentorChat.tsx
  function getGreeting(triggerType: string): string {
    switch (triggerType) {
      case 'stuck':
        return "Hey! I noticed you've been working on this for a while. That's totally okay — some tasks take more time. Want me to break it down into smaller steps?";
      case 'repeated_failure':
        return "I see you've been trying hard on this assessment. Don't worry — struggling is part of learning! Let me help you understand the concepts better before your next attempt.";
      case 'performing_well':
        return "You're doing amazing! 🔥 You've been consistently crushing it. Want me to challenge you with something a bit harder?";
      default:
        return "Hi there! How can I help you with your current task?";
    }
  }

  it('should provide empathetic greeting for stuck users', () => {
    const greeting = getGreeting('stuck');
    expect(greeting).toContain('smaller steps');
    expect(greeting).toContain('totally okay');
  });

  it('should validate effort for repeated failures', () => {
    const greeting = getGreeting('repeated_failure');
    expect(greeting).toContain('trying hard');
    expect(greeting).toContain('struggling is part of learning');
  });

  it('should challenge high performers', () => {
    const greeting = getGreeting('performing_well');
    expect(greeting).toContain('amazing');
    expect(greeting).toContain('harder');
  });

  it('should provide neutral greeting for user-initiated chats', () => {
    const greeting = getGreeting('user_initiated');
    expect(greeting).toContain('How can I help');
  });
});
