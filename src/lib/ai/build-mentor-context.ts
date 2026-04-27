import { db } from "@/db";
import { getZPDStatus, getZPDLabel, getScaffoldingInstruction, type KnowledgeState } from "@/lib/adaptive/bkt-engine";

export async function buildMentorContext(userId: string, subtopicId: string, triggerType: string | null, timeSpentSeconds: number) {
  const [model, profile, roadmap] = await Promise.all([
    db.query.userModel.findFirst({
      where: (um, { eq }) => eq(um.userId, userId),
    }),
    db.query.profiles.findFirst({
      where: (p, { eq }) => eq(p.userId, userId),
    }),
    db.query.roadmaps.findFirst({
      where: (r, { eq, and }) => and(eq(r.userId, userId), eq(r.status, 'active')),
    })
  ]);

  if (!model || !profile || !roadmap) return '';

  // Find current subtopic info
  let currentSubtopic = 'Unknown';
  let currentModule = 'Unknown';
  for (const mod of (roadmap.modules as unknown[])) {
    const typedMod = mod as { module_title?: string; subtopics?: { subtopic_id: string; title: string; status: string }[] };
    for (const st of (typedMod.subtopics ?? [])) {
      if (st.subtopic_id === subtopicId) {
        currentSubtopic = `${st.title} (${st.status})`;
        currentModule = typedMod.module_title ?? 'Unknown';
      }
    }
  }

  // ─── BKT Knowledge State ────────────────────────────────────
  const knowledgeState = (model.knowledgeState as KnowledgeState) || {};
  const currentKC = knowledgeState[subtopicId];
  const currentMastery = currentKC?.pMastery ?? 0.10;
  const zpdStatus = getZPDStatus(currentMastery);
  const zpdLabel = getZPDLabel(zpdStatus);
  const scaffoldingInstruction = getScaffoldingInstruction(currentMastery);

  // Build a mapping of subtopic IDs to titles for the AI to understand
  const subtopicTitles: Record<string, string> = {};
  for (const mod of (roadmap.modules as any[])) {
    mod.subtopics?.forEach((st: any) => {
      subtopicTitles[st.subtopic_id] = st.title;
    });
  }

  const prettifySlug = (slug: string) => slug.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Build per-subtopic mastery summary (top 5 most recent)
  const masteryEntries = Object.entries(knowledgeState)
    .sort((a, b) => new Date(b[1].lastUpdated).getTime() - new Date(a[1].lastUpdated).getTime())
    .slice(0, 5)
    .map(([id, kc]) => `  - ${subtopicTitles[id] || prettifySlug(id)}: ${Math.round(kc.pMastery * 100)}% (${getZPDLabel(getZPDStatus(kc.pMastery))})`)
    .join('\n');

  // ─── Trigger Instruction ────────────────────────────────────
  let instruction = scaffoldingInstruction;
  switch (triggerType) {
    case 'stuck':
      instruction = 'The user has been stuck for a long time. Acknowledge their time spent. Break the task into ONE smaller step. Ask them to try just that.';
      break;
    case 'repeated_failure':
      instruction = 'The user has failed the quiz multiple times. Validate their effort first. Drop to the most basic level. Give them one tiny win to build confidence.';
      break;
    case 'performing_well':
      instruction = 'The user is doing great! Brief congratulation. Pose a slightly harder challenge question to keep them engaged.';
      break;
    case 'path_switch':
      instruction = 'The user is struggling with this path. Be empathetic. Suggest exploring the original alternative paths. Frame it as finding a better fit, NOT failure.';
      break;
  }

  const contextBlock = `--- LIVE USER CONTEXT ---
User: ${profile.location ?? 'Unknown'} | Language: ${profile.languagePreference ?? 'English'}
Path: ${roadmap.pathTitle}
Module: ${currentModule}
Current Task: ${currentSubtopic}

BAYESIAN KNOWLEDGE STATE (BKT):
Current Subtopic Mastery: ${Math.round(currentMastery * 100)}% | ZPD Status: ${zpdLabel}
Attempts on this KC: ${currentKC?.attempts ?? 0} | Correct: ${currentKC?.correctCount ?? 0}
${masteryEntries ? `Recent Knowledge Components:\n${masteryEntries}` : 'No prior knowledge data.'}

PERFORMANCE:
Capability (BKT-derived): ${model.capabilityScore ?? 50}/100 | Velocity: ${model.learningVelocity ?? 'medium'}
Streak: ${model.currentStreak ?? 0} days | Consecutive Passes: ${model.consecutivePassCount ?? 0}
Avg Quiz Score: ${model.avgQuizScore ?? 0}%
Weak Areas: ${JSON.stringify(model.weakAreas ?? [])}

BEHAVIORAL SIGNAL:
Time on this step: ${Math.floor(timeSpentSeconds / 60)} minutes
Trigger: ${triggerType ?? 'user_initiated'}

SCAFFOLDING LEVEL:
${instruction}
--- END CONTEXT ---`;

  return contextBlock;
}
