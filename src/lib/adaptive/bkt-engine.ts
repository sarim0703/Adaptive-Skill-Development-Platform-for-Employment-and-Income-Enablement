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
  pG: number;   // Base Guess rate            (default: 0.25)
  pS: number;   // Base Slip rate             (default: 0.10)
}

export type ItemDifficulty = 'easy' | 'medium' | 'hard';

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
 * Performs an Adaptive Bayesian Knowledge Tracing update step utilizing 
 * Item Response Theory (IRT) heuristics for dynamic Guess and Slip rates.
 * 
 * ACADEMIC ENHANCEMENTS (BKT-IRT Hybrid):
 * 1. ITEM DIFFICULTY WEIGHTING: Adjusts pG and pS dynamically based on question difficulty.
 *    - Hard items: Lower guess rate, higher slip rate.
 *    - Easy items: Higher guess rate, lower slip rate.
 * 2. RECOVERY COEFFICIENT: Mitigates the "Zero Trap" for learners with P(L) < 0.20.
 * 3. ASYMPTOTIC CLAMPING: Bounds P(L) to [0.05, 0.95] to prevent HMM saturation.
 */
export function updateMastery(
  currentMastery: number,
  isCorrect: boolean,
  difficulty: ItemDifficulty = 'medium',
  params: BKTParams = DEFAULT_BKT_PARAMS
): number {
  const { pT, pG: basePG, pS: basePS } = params;

  // --- Step 1: IRT Dynamic Parameter Adjustment ---
  let pG = basePG;
  let pS = basePS;

  switch (difficulty) {
    case 'easy':
      pG = Math.min(0.40, basePG * 1.5); // Easier to guess correctly
      pS = Math.max(0.05, basePS * 0.5); // Harder to slip up
      break;
    case 'hard':
      pG = Math.max(0.10, basePG * 0.5); // Harder to guess
      pS = Math.min(0.25, basePS * 1.5); // Easier to slip up
      break;
    case 'medium':
    default:
      // Keep base parameters
      break;
  }

  // --- Step 1: Human-Centric Adjustments ---
  
  // Recovery Boost: If they were at < 20% and got it right, they likely 
  // just had a breakthrough. We temporarily lower the "Guess" penalty.
  let adjustedPG = pG;
  if (isCorrect && currentMastery < 0.20) {
    adjustedPG = pG * 0.5; // Treat it less like a lucky guess, more like learning
  }

  // --- Step 2: Standard Bayesian Update ---
  
  const pObserved = isCorrect
    ? currentMastery * (1 - pS) + (1 - currentMastery) * adjustedPG
    : currentMastery * pS + (1 - currentMastery) * (1 - adjustedPG);

  if (pObserved === 0) return currentMastery;

  const pMasteryGivenObs = isCorrect
    ? (currentMastery * (1 - pS)) / pObserved
    : (currentMastery * pS) / pObserved;

  // --- Step 3: Learning Transition ---
  
  let pNew = pMasteryGivenObs + (1 - pMasteryGivenObs) * pT;

  // --- Step 4: Asymptotic Clamping (HMM Regularization) ---
  
  // Bound to [0.05, 0.95] to ensure the Markov chain remains responsive
  // to future evidence (preventing permanent lock-in at 0 or 1).
  return clamp(pNew, 0.05, 0.95);
}

// ─── Batch Update ──────────────────────────────────────────────

/**
 * Updates knowledge state for a subtopic based on all quiz answers.
 * Each answer is treated as an independent observation for the same KC.
 * 
 * @param state       Current knowledge state object
 * @param subtopicId  The knowledge component being assessed
 * @param answers     Array of { isCorrect, difficulty } for each question
 * @param params      BKT parameters
 * @returns           Updated knowledge state (new object, immutable)
 */
export function batchUpdateFromQuiz(
  state: KnowledgeState,
  subtopicId: string,
  answers: { isCorrect: boolean, difficulty?: ItemDifficulty }[],
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
    pMastery = updateMastery(pMastery, answer.isCorrect, answer.difficulty || 'medium', params);
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
 * SAFETY UTILITY: Verifies and repairs a KnowledgeState object.
 * Useful for ensuring data integrity before persistence or after migrations.
 */
export function verifyKnowledgeState(ks: KnowledgeState): KnowledgeState {
  const verified: KnowledgeState = {};
  
  for (const [id, state] of Object.entries(ks || {})) {
    // Ensure id is a string and state is an object
    if (!id || typeof state !== 'object' || state === null) continue;
    
    // Sanitize mastery probability
    let mastery = Number(state.pMastery);
    if (isNaN(mastery)) mastery = 0.10;
    mastery = Math.max(0, Math.min(1, mastery));
    
    verified[id] = {
      pMastery: mastery,
      attempts: Math.max(0, Number(state.attempts) || 0),
      correctCount: Math.max(0, Number(state.correctCount) || 0),
      lastUpdated: state.lastUpdated || new Date().toISOString(),
    };
  }
  
  return verified;
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

// ─── Recalibration Summary for LLM ────────────────────────────

/**
 * Builds a structured, human-readable BKT summary for LLM prompts.
 * 
 * Instead of passing raw JSON to the AI, this produces a pre-analyzed
 * breakdown of the learner's knowledge state with ZPD classifications,
 * enabling the LLM to make informed scaffolding decisions.
 * 
 * @param state           Current knowledge state
 * @param subtopicTitles  Optional mapping of subtopic IDs to human-readable titles
 * @returns               Formatted string for LLM prompt injection
 */
export function buildBKTRecalibrationSummary(
  state: KnowledgeState,
  subtopicTitles: Record<string, string> = {}
): string {
  const entries = Object.entries(state);
  if (entries.length === 0) {
    return 'No prior knowledge data available. Treat learner as a complete beginner (pMastery = 0.10 for all topics).';
  }

  const summary = getKnowledgeStateSummary(state);
  const prettifySlug = (slug: string) => slug.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Group KCs by ZPD status for structured output
  const grouped: Record<ZPDStatus, { name: string; mastery: number; attempts: number }[]> = {
    'below_zpd': [],
    'in_zpd': [],
    'mastered': [],
  };

  for (const [id, kc] of entries) {
    const status = getZPDStatus(kc.pMastery);
    grouped[status].push({
      name: subtopicTitles[id] || prettifySlug(id),
      mastery: Math.round(kc.pMastery * 100),
      attempts: kc.attempts,
    });
  }

  // Sort each group by mastery (ascending for weak, descending for strong)
  grouped['below_zpd'].sort((a, b) => a.mastery - b.mastery);
  grouped['in_zpd'].sort((a, b) => a.mastery - b.mastery);
  grouped['mastered'].sort((a, b) => b.mastery - a.mastery);

  let output = `--- BKT KNOWLEDGE STATE ANALYSIS ---
Overall: ${summary.totalKCs} Knowledge Components tracked | Average Mastery: ${Math.round(summary.avgMastery * 100)}%
Distribution: ${summary.masteredCount} Mastered | ${summary.inZPDCount} In Learning Zone | ${summary.belowZPDCount} Needs Foundation\n`;

  if (grouped['below_zpd'].length > 0) {
    output += `\nNEEDS FOUNDATION (pMastery < 30% — REQUIRES HEAVY SCAFFOLDING):\n`;
    for (const kc of grouped['below_zpd']) {
      output += `  ⚠ ${kc.name}: ${kc.mastery}% mastery (${kc.attempts} attempts)\n`;
    }
  }

  if (grouped['in_zpd'].length > 0) {
    output += `\nLEARNING ZONE (30-85% — OPTIMAL FOR GROWTH):\n`;
    for (const kc of grouped['in_zpd']) {
      output += `  → ${kc.name}: ${kc.mastery}% mastery (${kc.attempts} attempts)\n`;
    }
  }

  if (grouped['mastered'].length > 0) {
    output += `\nMASTERED (> 85% — SKIP BASICS, USE ADVANCED CHALLENGES):\n`;
    for (const kc of grouped['mastered']) {
      output += `  ✓ ${kc.name}: ${kc.mastery}% mastery (${kc.attempts} attempts)\n`;
    }
  }

  output += `--- END BKT ANALYSIS ---`;
  return output;
}

/**
 * Computes BKT-native Normalized Learning Gain (Hake, 1998).
 * 
 * Uses BKT pMastery probabilities directly instead of naive quiz scores:
 *   NLG = (currentAvgMastery - baselineAvgMastery) / (1.0 - baselineAvgMastery)
 * 
 * @param baselineState  The knowledge state from the pre-test initialization
 * @param currentState   The current knowledge state after learning
 * @returns  Normalized learning gain as a percentage (0-100), or null if baseline is perfect
 */
export function computeBKTLearningGain(
  baselineState: KnowledgeState,
  currentState: KnowledgeState
): number | null {
  // Only compute gain for KCs that exist in both states
  const commonKCs = Object.keys(baselineState).filter(k => k in currentState);
  if (commonKCs.length === 0) return null;

  const baselineAvg = commonKCs.reduce((sum, k) => sum + baselineState[k].pMastery, 0) / commonKCs.length;
  const currentAvg = commonKCs.reduce((sum, k) => sum + currentState[k].pMastery, 0) / commonKCs.length;

  if (baselineAvg >= 0.99) return null; // Can't improve from near-perfect
  
  const gain = ((currentAvg - baselineAvg) / (1.0 - baselineAvg)) * 100;
  return Math.round(clamp(gain, -100, 100));
}

