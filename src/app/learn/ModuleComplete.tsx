"use client";

import { CheckCircle2, ArrowRight, Trophy, Sparkles, TrendingUp, Flame, Target, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import { recalibrateModuleAction, saveOutcome } from "@/app/actions";
import OutcomeCard from "@/components/OutcomeCard";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { moduleSchema } from "@/lib/ai/schemas";
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

  const { object: streamingModule, submit: startRecalibrate, isLoading: isStreaming } = useObject({
    api: '/api/roadmap/recalibrate',
    schema: moduleSchema,
    onFinish: () => {
      setTimeout(() => {
        router.push("/learn");
        router.refresh();
      }, 1000);
    }
  });

  async function handleNextModule() {
    startRecalibrate({ roadmapId, targetModuleId: lastCompletedModuleId + 1 });
  }

  async function handleOutcome(outcomeType: string) {
    await saveOutcome(roadmapId, lastCompletedModuleId, outcomeType);
  }

  // SVG Ring
  const ringRadius = 58;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (progressPercent / 100) * ringCircumference;

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 overflow-hidden transition-colors duration-300">
      <div className="w-full max-w-lg space-y-6 relative z-10">
        
        {/* Celebration Card */}
        <div className="rounded-xl bg-card border border-border p-10 text-center overflow-hidden relative">
          
          {/* Icon */}
          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6 mx-auto">
            <div className={`absolute inset-0 rounded-xl ${isPathComplete ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}></div>
            {isPathComplete ? (
              <Trophy className="w-8 h-8 text-amber-400 relative z-10" />
            ) : (
              <CheckCircle2 className="w-8 h-8 text-emerald-400 relative z-10" />
            )}
            <Sparkles className="w-5 h-5 text-amber-400 absolute -top-2 -right-2 z-10" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
            {isPathComplete ? t("learn.pathComplete") : t("learn.moduleComplete")}
          </h1>
          <p className="text-sm text-text-secondary mb-8 max-w-xs mx-auto">
            {isPathComplete ? t("learn.pathCompleteSub") : t("learn.moduleCompleteSub")}
          </p>

          {/* Progress Ring */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <svg width="148" height="148" className="-rotate-90">
                <circle cx="74" cy="74" r={ringRadius} fill="none" stroke="var(--border-subtle)" strokeWidth="7" />
                <circle
                  cx="74" cy="74" r={ringRadius} fill="none"
                  stroke={isPathComplete ? "#F59E0B" : "#10B981"}
                  strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-semibold text-foreground tabular-nums">{progressPercent}%</span>
                <span className="text-xs font-medium text-text-tertiary">{t("learn.overall")}</span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="p-3 rounded-xl bg-input border border-border">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="text-xl font-semibold text-foreground tabular-nums">{completedSubtopics}</div>
              <div className="text-xs font-medium text-text-tertiary">{t("learn.subtopicsDone")}</div>
            </div>
            <div className="p-3 rounded-xl bg-input border border-border">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-xl font-semibold text-foreground tabular-nums">{capabilityScore ?? 50}</div>
              <div className="text-xs font-medium text-text-tertiary">{t("learn.capability")}</div>
            </div>
            
            {learningGain !== null && learningGain !== undefined ? (
              <div className="p-3 rounded-xl bg-input border border-border">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className={`text-xl font-semibold tabular-nums ${learningGain >= 70 ? 'text-emerald-500' : learningGain >= 30 ? 'text-blue-500' : 'text-amber-500'}`}>
                  +{learningGain}%
                </div>
                <div className="text-xs font-medium text-text-tertiary">Learning Gain</div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-input border border-border">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="text-xl font-semibold text-foreground tabular-nums">{currentStreak ?? 0}</div>
                <div className="text-xs font-medium text-text-tertiary">{t("learn.streak")}</div>
              </div>
            )}
          </div>

          {/* Path info */}
          <div className="text-xs text-text-tertiary mb-6 font-medium">
            {pathTitle} · {t("learn.module")} {lastCompletedModuleId} / {totalModules}
          </div>

          {/* Next Module Button / Streaming State */}
          {hasNextModule && (
            <div className="space-y-4">
              {isStreaming || streamingModule ? (
                <div className="p-6 rounded-xl bg-blue-500/5 border border-blue-500/20 text-left animate-fadeIn">
                  <div className="flex items-center gap-3 mb-4">
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Crafting Next Module...</span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground mb-2">{streamingModule?.module_title || "..."}</h4>
                  <div className="space-y-2">
                    {streamingModule?.subtopics?.map((st: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] text-text-secondary">
                        <div className="w-1 h-1 rounded-full bg-blue-500/40" />
                        {st?.title || "..."}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleNextModule}
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {t("learn.nextModule")}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              )}
            </div>
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
