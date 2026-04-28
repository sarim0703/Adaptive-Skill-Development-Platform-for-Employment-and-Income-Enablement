import { getUserRoadmap, getUserModel, getUserProfile } from "../actions";
import LearnClient from "./LearnClient";
import ModuleComplete from "./ModuleComplete";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function LearnPage({ searchParams }: { searchParams: { exploreId?: string } }) {
  const [roadmap, userModel, userProfile] = await Promise.all([
    getUserRoadmap(),
    getUserModel(),
    getUserProfile()
  ]);

  if (!roadmap) {
    redirect("/path-selection");
  }

  const exploreId = searchParams.exploreId;
  let activeModuleId = null;
  let activeSubtopic = null;
  let isExploring = false;

  const modules = roadmap.modules as { module_id: number; module_title: string; subtopics: { status: string; subtopic_id: string; title: string; task_type: string; practical_task: string; youtube_search_query: string; attempt_count?: number; key_learning_notes?: string }[] }[];

  // Logic: If exploring, find that specific ID. Otherwise, find the first active/review one.
  if (exploreId) {
    for (const mod of modules) {
      const found = mod.subtopics.find(st => st.subtopic_id === exploreId);
      if (found) {
        activeModuleId = mod.module_id;
        activeSubtopic = found;
        
        // Determine if they are actually exploring (not their current active one)
        let realActiveId = null;
        for (const m of modules) {
          const firstIncomplete = m.subtopics.find(s => s.status === 'active' || s.status === 'needs_review');
          if (firstIncomplete) {
            realActiveId = firstIncomplete.subtopic_id;
            break;
          }
        }
        if (realActiveId !== exploreId) {
          isExploring = true;
        }
        break;
      }
    }
  }

  if (!activeSubtopic) {
    isExploring = false;
    for (const mod of modules) {
      if (!mod.subtopics) continue;
      for (const st of mod.subtopics) {
        if (st.status === 'active' || st.status === 'needs_review') {
          activeModuleId = mod.module_id;
          activeSubtopic = st;
          break;
        }
      }
      if (activeSubtopic) break;
    }
  }

  // Calculate progress stats
  let totalSubtopics = 0;
  let completedSubtopics = 0;
  let currentModuleTitle = '';
  let currentModuleSubtopics: { title: string; status: string }[] = [];
  let currentSubtopicIndex = 0;
  let lastCompletedModuleId = 0;

  for (const mod of modules) {
    if (!mod.subtopics) continue;
    let allComplete = true;
    for (const st of mod.subtopics) {
      totalSubtopics++;
      if (st.status === 'complete') {
        completedSubtopics++;
      } else {
        allComplete = false;
      }
    }
    if (allComplete && mod.subtopics.length > 0) {
      lastCompletedModuleId = mod.module_id;
    }
    if (activeModuleId && mod.module_id === activeModuleId) {
      currentModuleTitle = mod.module_title;
      currentModuleSubtopics = mod.subtopics.map(s => ({ title: s.title, status: s.status }));
      currentSubtopicIndex = mod.subtopics.findIndex(s => s.subtopic_id === activeSubtopic!.subtopic_id);
    }
  }

  // No active subtopic = module/path complete
  if (!activeSubtopic) {
    const hasNextModule = modules.some(m => m.module_id > lastCompletedModuleId && (!m.subtopics || m.subtopics.length === 0 || m.subtopics.some(s => s.status !== 'complete')));
    
    // Fetch analytics data just for the learning gain calculation on completion
    const { getAnalyticsData } = await import('@/app/actions');
    const analytics = await getAnalyticsData();
    const learningGain = analytics?.normalizedLearningGain ?? null;
    
    return (
      <ModuleComplete
        roadmapId={roadmap.id}
        pathTitle={roadmap.pathTitle}
        completedSubtopics={completedSubtopics}
        totalSubtopics={totalSubtopics}
        totalModules={modules.length}
        lastCompletedModuleId={lastCompletedModuleId}
        hasNextModule={hasNextModule}
        capabilityScore={(userModel as { capabilityScore?: number } | null)?.capabilityScore}
        currentStreak={(userModel as { currentStreak?: number } | null)?.currentStreak}
        learningGain={learningGain}
      />
    );
  }

  return (
    <LearnClient 
      roadmapId={roadmap.id}
      moduleId={activeModuleId!}
      subtopic={activeSubtopic}
      userModel={userModel as { capabilityScore?: number; pathSwitchSuggested?: boolean; currentStreak?: number; quizAverage?: number } | null}
      pathTitle={roadmap.pathTitle}
      userName={userProfile?.name ?? undefined}
      userLocation={userProfile?.location ?? undefined}
      totalSubtopics={totalSubtopics}
      completedSubtopics={completedSubtopics}
      currentModuleTitle={currentModuleTitle}
      currentModuleSubtopics={currentModuleSubtopics}
      currentSubtopicIndex={currentSubtopicIndex}
      totalModules={modules.length}
      currentModuleNumber={activeModuleId!}
      allModules={modules}
      isExploring={isExploring}
    />
  );
}
