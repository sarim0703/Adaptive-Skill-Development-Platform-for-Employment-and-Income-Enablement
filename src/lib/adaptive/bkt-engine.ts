/**
 * Bayesian Knowledge Tracing (BKT) Engine
 * 
 * Based on: Corbett, A.T. & Anderson, J.R. (1994). "Knowledge Tracing: 
 * Modeling the Acquisition of Procedural Knowledge." User Modeling and 
 * User-Adapted Interaction, 4, 253-278.
 * 
 * BKT is a Hidden Markov Model that tracks the probability of a learner
 * having mastered a specific knowledge component (KC) based on their 
 * observed performance (correct/incorrect responses).
 * 
 * Four parameters per KC:
 *   P(L₀) — Initial probability of mastery before any interaction
 *   P(T)  — Probability of transitioning from unlearned to learned
 *   P(G)  — Probability of a correct guess despite not knowing
 *   P(S)  — Probability of a slip (error despite knowing)
 */

// ─── Types ─────────────────────────────────────────────────────

export interface BKTParams {
  pL0: number;  // Initial mastery probability (default: 0.10)
  pT: number;   // Learn/transition rate      (default: 0.20)
  pG: number;   // Guess rate                 (default: 0.25)
  pS: number;   // Slip rate                  (default: 0.10)
}

export interface KnowledgeComponentState {
  pMastery: number;       // Current mastery probability [0, 1]
  attempts: number;       // Total observation count
  correctCount: number;   // Total correct observations
  lastUpdated: string;    // ISO timestamp of last update
}

export interface KnowledgeState {
  [subtopicId: string]: KnowledgeComponentState;
}

export type ZPDStatus = 'below_zpd' | 'in_zpd' | 'mastered';

// ─── Default Parameters ────────────────────────────────────────

/** 
 * Conservative defaults tuned for practical skill assessment:
 * - Low initial mastery (most users are new to these skills)
 * - Moderate learning rate (practical tasks yield real learning)
 * - Standard guess rate for 4-option MCQ (1/4 = 0.25)
 * - Low slip rate (practical knowledge is sticky)
 */
export const DEFAULT_BKT_PARAMS: BKTParams = {
  pL0: 0.10,
  pT: 0.20,
  pG: 0.25,
  pS: 0.10,
};

// ─── Core BKT Update ──────────────────────────────────────────

/**
 * Performs a single Bayesian Knowledge Tracing update step.
 * 
 * Given the current mastery probability and an observation (correct/incorrect),
 * returns the updated mastery probability using Bayes' theorem followed
 * by the learning transition.
 * 
 * @param currentMastery  Current P(L) for this knowledge component
 * @param isCorrect       Whether the learner answered correctly
 * @param params          BKT parameters for this KC
 * @returns               Updated P(L) after observation + transition
 */
export function updateMastery(
  currentMastery: number,
  isCorrect: boolean,
  params: BKTParams = DEFAULT_BKT_PARAMS
): number {
  const { pS, pG, pT } = params;

  // Step 1: Compute P(observation)
  // P(correct) = P(L) × (1 - P(S)) + (1 - P(L)) × P(G)
  // P(wrong)   = P(L) × P(S)       + (1 - P(L)) × (1 - P(G))
  const pObserved = isCorrect
    ? currentMastery * (1 - pS) + (1 - currentMastery) * pG
    : currentMastery * pS + (1 - currentMastery) * (1 - pG);

  // Guard against division by zero
  if (pObserved === 0) return currentMastery;

  // Step 2: Bayesian posterior — P(L | observation)
  const pMasteryGivenObs = isCorrect
    ? (currentMastery * (1 - pS)) / pObserved
    : (currentMastery * pS) / pObserved;

  // Step 3: Learning transition — account for possible learning during attempt
  // P(L_new) = P(L|obs) + (1 - P(L|obs)) × P(T)
  const pNew = pMasteryGivenObs + (1 - pMasteryGivenObs) * pT;

  // Clamp to valid probability range
  return clamp(pNew, 0.001, 0.999);
}

// ─── Batch Update ──────────────────────────────────────────────

/**
 * Updates knowledge state for a subtopic based on all quiz answers.
 * Each answer is treated as an independent observation for the same KC.
 * 
 * @param state       Current knowledge state object
 * @param subtopicId  The knowledge component being assessed
 * @param answers     Array of { isCorrect } for each question in the quiz
 * @param params      BKT parameters
 * @returns           Updated knowledge state (new object, immutable)
 */
export function batchUpdateFromQuiz(
  state: KnowledgeState,
  subtopicId: string,
  answers: { isCorrect: boolean }[],
  params: BKTParams = DEFAULT_BKT_PARAMS
): { updatedState: KnowledgeState; deltas: { before: number; after: number; answers: boolean[] } } {
  const existing = state[subtopicId] || {
    pMastery: params.pL0,
    attempts: 0,
    correctCount: 0,
    lastUpdated: new Date().toISOString(),
  };

  let pMastery = existing.pMastery;
  const answerResults: boolean[] = [];

  // Apply each observation sequentially
  for (const answer of answers) {
    pMastery = updateMastery(pMastery, answer.isCorrect, params);
    answerResults.push(answer.isCorrect);
  }

  const correctCount = existing.correctCount + answers.filter(a => a.isCorrect).length;
  const attempts = existing.attempts + answers.length;

  const updatedState: KnowledgeState = {
    ...state,
    [subtopicId]: {
      pMastery,
      attempts,
      correctCount,
      lastUpdated: new Date().toISOString(),
    },
  };

  return {
    updatedState,
    deltas: {
      before: existing.pMastery,
      after: pMastery,
      answers: answerResults,
    },
  };
}

// ─── ZPD Classification ────────────────────────────────────────

/**
 * Classifies a knowledge component into a Zone of Proximal Development status.
 * 
 * Based on Vygotsky's ZPD theory:
 * - Below ZPD: Learner lacks prerequisites, needs more scaffolding
 * - In ZPD:    The optimal learning zone — challenging but achievable
 * - Mastered:  Learner has demonstrated reliable mastery
 * 
 * Thresholds chosen based on BKT literature:
 *   P(L) < 0.30 → Below ZPD (high uncertainty, likely doesn't know)
 *   0.30 ≤ P(L) ≤ 0.85 → In ZPD (learning is happening)
 *   P(L) > 0.85 → Mastered (standard BKT mastery threshold)
 */
export function getZPDStatus(pMastery: number): ZPDStatus {
  if (pMastery < 0.30) return 'below_zpd';
  if (pMastery > 0.85) return 'mastered';
  return 'in_zpd';
}

/**
 * Returns a human-readable label for ZPD status.
 */
export function getZPDLabel(status: ZPDStatus): string {
  switch (status) {
    case 'below_zpd': return 'Needs Foundation';
    case 'in_zpd': return 'Learning Zone';
    case 'mastered': return 'Mastered';
  }
}

// ─── Aggregate Metrics ─────────────────────────────────────────

/**
 * Computes a composite capability score from the BKT knowledge state.
 * This is the mean of all mastery probabilities × 100, providing a
 * backward-compatible replacement for the naive capabilityScore.
 * 
 * @param state  Complete knowledge state
 * @returns      Integer score 0-100
 */
export function computeCapabilityFromBKT(state: KnowledgeState): number {
  const entries = Object.values(state);
  if (entries.length === 0) return 50; // Default for users with no data

  const meanMastery = entries.reduce((sum, kc) => sum + kc.pMastery, 0) / entries.length;
  return Math.round(meanMastery * 100);
}

/**
 * Computes Normalized Learning Gain (Hake, 1998).
 * 
 * NLG = (postScore - preScore) / (100 - preScore)
 * 
 * This metric controls for ceiling effects — a student starting at 80%
 * has less room to grow than one starting at 20%.
 * 
 * @param preTestScore   Baseline assessment score (0-100)
 * @param currentAvgScore  Current average quiz performance (0-100)
 * @returns  Normalized learning gain as a percentage (0-100), or null if pre-test score is 100
 */
export function computeNormalizedLearningGain(
  preTestScore: number,
  currentAvgScore: number
): number | null {
  if (preTestScore >= 100) return null; // Can't improve from perfect
  const gain = ((currentAvgScore - preTestScore) / (100 - preTestScore)) * 100;
  return Math.round(clamp(gain, -100, 100));
}

/**
 * Determines the scaffolding level the AI mentor should use based on mastery.
 * Implements Vygotsky's scaffolding fading:
 *   - Low mastery  → Maximum scaffolding (break into tiny steps)
 *   - Mid mastery  → Moderate (guiding questions)
 *   - High mastery → Minimal (challenge them)
 *   - Mastered     → None (congratulate and move on)
 */
export function getScaffoldingLevel(pMastery: number): 'maximum' | 'moderate' | 'minimal' | 'none' {
  if (pMastery < 0.30) return 'maximum';
  if (pMastery < 0.60) return 'moderate';
  if (pMastery <= 0.85) return 'minimal';
  return 'none';
}

/**
 * Returns the scaffolding instruction for the AI mentor.
 */
export function getScaffoldingInstruction(pMastery: number): string {
  const level = getScaffoldingLevel(pMastery);
  switch (level) {
    case 'maximum':
      return 'Give MAXIMUM scaffolding. Break into the tiniest possible steps. Be extremely encouraging. The learner is still building foundations.';
    case 'moderate':
      return 'Give moderate hints. Ask guiding questions instead of giving answers. The learner is in their learning zone.';
    case 'minimal':
      return 'Give minimal help. Ask them to think through it independently. Challenge them with follow-up questions.';
    case 'none':
      return 'They have mastered this topic. Brief congratulation only. Suggest moving to the next challenge.';
  }
}

// ─── Utilities ─────────────────────────────────────────────────

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/**
 * Initializes BKT state for a subtopic with a custom initial mastery.
 * Used when pre-test results are available to set informed priors.
 */
export function initializeKC(
  subtopicId: string,
  initialMastery: number = DEFAULT_BKT_PARAMS.pL0
): KnowledgeComponentState {
  return {
    pMastery: clamp(initialMastery, 0.001, 0.999),
    attempts: 0,
    correctCount: 0,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Summary statistics for a knowledge state — useful for analytics.
 */
export function getKnowledgeStateSummary(state: KnowledgeState): {
  totalKCs: number;
  masteredCount: number;
  inZPDCount: number;
  belowZPDCount: number;
  avgMastery: number;
} {
  const entries = Object.values(state);
  if (entries.length === 0) {
    return { totalKCs: 0, masteredCount: 0, inZPDCount: 0, belowZPDCount: 0, avgMastery: 0 };
  }

  let masteredCount = 0;
  let inZPDCount = 0;
  let belowZPDCount = 0;

  for (const kc of entries) {
    const status = getZPDStatus(kc.pMastery);
    if (status === 'mastered') masteredCount++;
    else if (status === 'in_zpd') inZPDCount++;
    else belowZPDCount++;
  }

  const avgMastery = entries.reduce((sum, kc) => sum + kc.pMastery, 0) / entries.length;

  return {
    totalKCs: entries.length,
    masteredCount,
    inZPDCount,
    belowZPDCount,
    avgMastery: Math.round(avgMastery * 100) / 100,
  };
}
