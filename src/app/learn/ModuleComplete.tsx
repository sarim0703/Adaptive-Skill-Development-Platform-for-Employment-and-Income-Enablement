"use client";

import { CheckCircle2, ArrowRight, Trophy, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import { recalibrateModuleAction, saveOutcome } from "@/app/actions";
import OutcomeCard from "@/components/OutcomeCard";
import { useState } from "react";

type ModuleCompleteProps = {
  roadmapId: string;
  pathTitle: string;
  completedSubtopics: number;
  totalSubtopics: number;
  totalModules: number;
  lastCompletedModuleId: number;
  hasNextModule: boolean;
  capabilityScore?: number;
  currentStreak?: number;
  learningGain?: number | null;
};

export default function ModuleComplete({
  roadmapId,
  pathTitle,
  completedSubtopics,
  totalSubtopics,
  totalModules,
  lastCompletedModuleId,
  hasNextModule,
  capabilityScore,
  currentStreak,
  learningGain,
}: ModuleCompleteProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const isPathComplete = !hasNextModule;
  const progressPercent = Math.round((completedSubtopics / totalSubtopics) * 100);

  async function handleNextModule() {
    setIsLoading(true);
    try {
      await recalibrateModuleAction(roadmapId, lastCompletedModuleId + 1);
      router.refresh();
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  }

  async function handleOutcome(outcomeType: string) {
    await saveOutcome(roadmapId, lastCompletedModuleId, outcomeType);
  }

  return (
    <div className="min-h-screen bg-warm-gradient flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6 animate-fadeInUp">
        {/* Celebration Card */}
        <div className="card p-8 text-center">
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 mb-6 mx-auto">
            {isPathComplete ? (
              <Trophy className="w-10 h-10 text-indigo-600" />
            ) : (
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            )}
            <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1 -right-1" />
          </div>

          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            {isPathComplete ? t("learn.pathComplete") : t("learn.moduleComplete")}
          </h1>
          <p className="text-slate-500 mb-6">
            {isPathComplete ? t("learn.pathCompleteSub") : t("learn.moduleCompleteSub")}
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-2xl font-bold text-indigo-600">{completedSubtopics}</div>
              <div className="text-xs text-slate-400">{t("learn.subtopicsDone")}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-2xl font-bold text-violet-600">{capabilityScore ?? 50}</div>
              <div className="text-xs text-slate-400">{t("learn.capability")}</div>
            </div>
            
            {learningGain !== null && learningGain !== undefined ? (
              <div className="bg-slate-50 rounded-xl p-3">
                <div className={`text-2xl font-bold ${learningGain >= 70 ? 'text-green-600' : learningGain >= 30 ? 'text-indigo-600' : 'text-amber-600'}`}>
                  +{learningGain}%
                </div>
                <div className="text-xs text-slate-400">Hake Gain</div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="text-2xl font-bold text-amber-600">{currentStreak ?? 0}🔥</div>
                <div className="text-xs text-slate-400">{t("learn.streak")}</div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>{t("learn.overall")}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Path info */}
          <div className="text-xs text-slate-400 mb-6">
            {pathTitle} · {t("learn.module")} {lastCompletedModuleId} / {totalModules}
          </div>

          {/* Next Module Button */}
          {hasNextModule && (
            <button
              onClick={handleNextModule}
              disabled={isLoading}
              className="btn-primary w-full py-3.5 text-base group"
            >
              {isLoading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <>
                  {t("learn.nextModule")}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Outcome Card */}
        <OutcomeCard
          roadmapId={roadmapId}
          moduleId={lastCompletedModuleId}
          onSubmit={handleOutcome}
        />
      </div>
    </div>
  );
}
