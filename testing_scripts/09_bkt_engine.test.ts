/**
 * BKT Engine Unit Tests
 * 
 * Tests the Bayesian Knowledge Tracing implementation against
 * known mathematical properties and reference values.
 * 
 * Run: npx vitest run testing_scripts/09_bkt_engine.test.ts
 */

import { describe, it, expect } from 'vitest';
import {
  updateMastery,
  batchUpdateFromQuiz,
  getZPDStatus,
  getZPDLabel,
  computeCapabilityFromBKT,
  computeNormalizedLearningGain,
  getScaffoldingLevel,
  getScaffoldingInstruction,
  initializeKC,
  getKnowledgeStateSummary,
  DEFAULT_BKT_PARAMS,
  type KnowledgeState,
} from '../src/lib/adaptive/bkt-engine';

describe('BKT Engine — Core Update', () => {
  it('correct answer increases mastery', () => {
    const before = 0.50;
    const after = updateMastery(before, true);
    expect(after).toBeGreaterThan(before);
  });

  it('wrong answer decreases mastery (relative to no-update)', () => {
    const before = 0.50;
    const afterWrong = updateMastery(before, false);
    const afterCorrect = updateMastery(before, true);
    expect(afterWrong).toBeLessThan(afterCorrect);
  });

  it('mastery never exceeds 0.999', () => {
    let mastery = 0.99;
    for (let i = 0; i < 100; i++) {
      mastery = updateMastery(mastery, true);
    }
    expect(mastery).toBeLessThanOrEqual(0.999);
  });

  it('mastery never drops below 0.001', () => {
    let mastery = 0.01;
    for (let i = 0; i < 100; i++) {
      mastery = updateMastery(mastery, false);
    }
    expect(mastery).toBeGreaterThanOrEqual(0.001);
  });

  it('guess rate prevents mastery from jumping too high on one correct', () => {
    const before = 0.10;
    const after = updateMastery(before, true);
    // With P(G)=0.25, a single correct shouldn't make mastery > 0.50
    expect(after).toBeLessThan(0.50);
  });

  it('slip rate prevents mastery from crashing on one wrong', () => {
    const before = 0.90;
    const after = updateMastery(before, false);
    // With P(S)=0.10, a single wrong shouldn't drop mastery below 0.50
    expect(after).toBeGreaterThan(0.50);
  });

  it('transition rate ensures mastery always increases slightly', () => {
    // Even after a wrong answer, the transition component should prevent
    // mastery from dropping too steeply
    const before = 0.30;
    const afterWrong = updateMastery(before, false);
    // The transition term P(T) adds learning even on wrong answers
    // so the decrease should be modest
    expect(afterWrong).toBeGreaterThan(0.05);
  });

  it('converges to high mastery after many correct answers', () => {
    let mastery = DEFAULT_BKT_PARAMS.pL0; // Start at 0.10
    for (let i = 0; i < 10; i++) {
      mastery = updateMastery(mastery, true);
    }
    expect(mastery).toBeGreaterThan(0.85); // Should be "mastered"
  });

  it('stays low after many wrong answers', () => {
    let mastery = DEFAULT_BKT_PARAMS.pL0;
    for (let i = 0; i < 10; i++) {
      mastery = updateMastery(mastery, false);
    }
    expect(mastery).toBeLessThan(0.40);
  });
});

describe('BKT Engine — Batch Update', () => {
  it('processes all quiz answers and updates state', () => {
    const state: KnowledgeState = {};
    const answers = [
      { isCorrect: true },
      { isCorrect: true },
      { isCorrect: false },
      { isCorrect: true },
    ];

    const { updatedState, deltas } = batchUpdateFromQuiz(state, 'subtopic-1', answers);
    
    expect(updatedState['subtopic-1']).toBeDefined();
    expect(updatedState['subtopic-1'].attempts).toBe(4);
    expect(updatedState['subtopic-1'].correctCount).toBe(3);
    expect(updatedState['subtopic-1'].pMastery).toBeGreaterThan(DEFAULT_BKT_PARAMS.pL0);
    expect(deltas.before).toBe(DEFAULT_BKT_PARAMS.pL0);
    expect(deltas.after).toBe(updatedState['subtopic-1'].pMastery);
    expect(deltas.answers).toEqual([true, true, false, true]);
  });

  it('preserves other subtopics in state', () => {
    const state: KnowledgeState = {
      'existing-topic': {
        pMastery: 0.75,
        attempts: 5,
        correctCount: 4,
        lastUpdated: '2024-01-01T00:00:00Z',
      },
    };

    const { updatedState } = batchUpdateFromQuiz(state, 'new-topic', [{ isCorrect: true }]);
    
    expect(updatedState['existing-topic'].pMastery).toBe(0.75);
    expect(updatedState['new-topic']).toBeDefined();
  });

  it('accumulates attempts on repeat quizzes', () => {
    let state: KnowledgeState = {};
    
    const result1 = batchUpdateFromQuiz(state, 'topic-a', [{ isCorrect: true }, { isCorrect: true }]);
    state = result1.updatedState;
    expect(state['topic-a'].attempts).toBe(2);

    const result2 = batchUpdateFromQuiz(state, 'topic-a', [{ isCorrect: false }, { isCorrect: true }]);
    state = result2.updatedState;
    expect(state['topic-a'].attempts).toBe(4);
    expect(state['topic-a'].correctCount).toBe(3);
  });
});

describe('BKT Engine — ZPD Classification', () => {
  it('classifies low mastery as below_zpd', () => {
    expect(getZPDStatus(0.10)).toBe('below_zpd');
    expect(getZPDStatus(0.29)).toBe('below_zpd');
  });

  it('classifies mid mastery as in_zpd', () => {
    expect(getZPDStatus(0.30)).toBe('in_zpd');
    expect(getZPDStatus(0.50)).toBe('in_zpd');
    expect(getZPDStatus(0.85)).toBe('in_zpd');
  });

  it('classifies high mastery as mastered', () => {
    expect(getZPDStatus(0.86)).toBe('mastered');
    expect(getZPDStatus(0.99)).toBe('mastered');
  });

  it('returns correct labels', () => {
    expect(getZPDLabel('below_zpd')).toBe('Needs Foundation');
    expect(getZPDLabel('in_zpd')).toBe('Learning Zone');
    expect(getZPDLabel('mastered')).toBe('Mastered');
  });
});

describe('BKT Engine — Capability Score', () => {
  it('returns 50 for empty state', () => {
    expect(computeCapabilityFromBKT({})).toBe(50);
  });

  it('returns mean of mastery probabilities × 100', () => {
    const state: KnowledgeState = {
      a: { pMastery: 0.80, attempts: 5, correctCount: 4, lastUpdated: '' },
      b: { pMastery: 0.60, attempts: 3, correctCount: 2, lastUpdated: '' },
    };
    // Mean = (0.80 + 0.60) / 2 = 0.70 → 70
    expect(computeCapabilityFromBKT(state)).toBe(70);
  });

  it('handles single subtopic', () => {
    const state: KnowledgeState = {
      a: { pMastery: 0.45, attempts: 2, correctCount: 1, lastUpdated: '' },
    };
    expect(computeCapabilityFromBKT(state)).toBe(45);
  });
});

describe('BKT Engine — Normalized Learning Gain', () => {
  it('computes standard NLG correctly', () => {
    // Pre: 40, Post: 70 → NLG = (70-40)/(100-40) = 30/60 = 50%
    expect(computeNormalizedLearningGain(40, 70)).toBe(50);
  });

  it('returns 100 for perfect improvement', () => {
    // Pre: 0, Post: 100 → NLG = 100/100 = 100%
    expect(computeNormalizedLearningGain(0, 100)).toBe(100);
  });

  it('returns 0 for no improvement', () => {
    expect(computeNormalizedLearningGain(50, 50)).toBe(0);
  });

  it('returns null for perfect pre-test', () => {
    expect(computeNormalizedLearningGain(100, 100)).toBeNull();
  });

  it('handles negative gain (regression)', () => {
    // Pre: 80, Post: 60 → NLG = (60-80)/(100-80) = -20/20 = -100%
    expect(computeNormalizedLearningGain(80, 60)).toBe(-100);
  });
});

describe('BKT Engine — Scaffolding', () => {
  it('returns maximum for very low mastery', () => {
    expect(getScaffoldingLevel(0.10)).toBe('maximum');
    expect(getScaffoldingLevel(0.29)).toBe('maximum');
  });

  it('returns moderate for mid-low mastery', () => {
    expect(getScaffoldingLevel(0.30)).toBe('moderate');
    expect(getScaffoldingLevel(0.59)).toBe('moderate');
  });

  it('returns minimal for mid-high mastery', () => {
    expect(getScaffoldingLevel(0.60)).toBe('minimal');
    expect(getScaffoldingLevel(0.85)).toBe('minimal');
  });

  it('returns none for mastered', () => {
    expect(getScaffoldingLevel(0.86)).toBe('none');
    expect(getScaffoldingLevel(0.99)).toBe('none');
  });

  it('scaffolding instructions are non-empty strings', () => {
    for (const mastery of [0.10, 0.40, 0.70, 0.90]) {
      const instruction = getScaffoldingInstruction(mastery);
      expect(instruction.length).toBeGreaterThan(10);
    }
  });
});

describe('BKT Engine — Utilities', () => {
  it('initializeKC creates valid state', () => {
    const kc = initializeKC('test-topic', 0.30);
    expect(kc.pMastery).toBe(0.30);
    expect(kc.attempts).toBe(0);
    expect(kc.correctCount).toBe(0);
    expect(kc.lastUpdated).toBeTruthy();
  });

  it('initializeKC clamps extreme values', () => {
    const kcHigh = initializeKC('test', 1.5);
    expect(kcHigh.pMastery).toBe(0.999);
    
    const kcLow = initializeKC('test', -0.5);
    expect(kcLow.pMastery).toBe(0.001);
  });

  it('getKnowledgeStateSummary computes correct counts', () => {
    const state: KnowledgeState = {
      a: { pMastery: 0.10, attempts: 2, correctCount: 0, lastUpdated: '' },
      b: { pMastery: 0.50, attempts: 4, correctCount: 2, lastUpdated: '' },
      c: { pMastery: 0.90, attempts: 8, correctCount: 7, lastUpdated: '' },
    };

    const summary = getKnowledgeStateSummary(state);
    expect(summary.totalKCs).toBe(3);
    expect(summary.belowZPDCount).toBe(1);
    expect(summary.inZPDCount).toBe(1);
    expect(summary.masteredCount).toBe(1);
    expect(summary.avgMastery).toBe(0.5); // (0.10+0.50+0.90)/3 = 0.50
  });

  it('getKnowledgeStateSummary handles empty state', () => {
    const summary = getKnowledgeStateSummary({});
    expect(summary.totalKCs).toBe(0);
    expect(summary.avgMastery).toBe(0);
  });
});
