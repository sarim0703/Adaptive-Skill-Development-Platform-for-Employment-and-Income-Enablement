"use client";

import { CheckCircle2, ArrowRight, Trophy, Sparkles, TrendingUp, Flame, Target, Loader2 } from "lucide-react";
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

  // SVG Ring
  const ringRadius = 58;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (progressPercent / 100) * ringCircumference;

  return (
    <div className="relative min-h-screen bg-[#0A0A0C] text-white flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background */}
      <div className="aurora-blob w-[800px] h-[800px] bg-emerald-600/5 -top-1/4 -left-1/4 rounded-full pointer-events-none blur-[120px]"></div>
      <div className="aurora-blob w-[600px] h-[600px] bg-blue-600/5 bottom-0 right-0 rounded-full pointer-events-none blur-[100px]" style={{ animationDelay: '3s' }}></div>
      <div className="absolute inset-0 bg-tech-grid opacity-5 pointer-events-none"></div>

      <div className="w-full max-w-lg space-y-6 relative z-10 animate-fadeInUp">
        
        {/* Celebration Card */}
        <div className="rounded-3xl bg-white/[0.03] border border-white/5 p-10 text-center overflow-hidden relative">
          
          {/* Icon */}
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-8 mx-auto">
            <div className={`absolute inset-0 rounded-3xl ${isPathComplete ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}></div>
            {isPathComplete ? (
              <Trophy className="w-10 h-10 text-amber-400 relative z-10" />
            ) : (
              <CheckCircle2 className="w-10 h-10 text-emerald-400 relative z-10" />
            )}
            <Sparkles className="w-5 h-5 text-amber-400 absolute -top-2 -right-2 z-10" />
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white mb-2">
            {isPathComplete ? t("learn.pathComplete") : t("learn.moduleComplete")}
          </h1>
          <p className="text-sm text-slate-400 mb-8 leading-relaxed max-w-xs mx-auto">
            {isPathComplete ? t("learn.pathCompleteSub") : t("learn.moduleCompleteSub")}
          </p>

          {/* Progress Ring */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <svg width="148" height="148" className="-rotate-90">
                <circle cx="74" cy="74" r={ringRadius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
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
                <span className="text-3xl font-black text-white tabular-nums">{progressPercent}%</span>
                <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">{t("learn.overall")}</span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="text-xl font-black text-white tabular-nums">{completedSubtopics}</div>
              <div className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">{t("learn.subtopicsDone")}</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl font-black text-white tabular-nums">{capabilityScore ?? 50}</div>
              <div className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">{t("learn.capability")}</div>
            </div>
            
            {learningGain !== null && learningGain !== undefined ? (
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className={`text-xl font-black tabular-nums ${learningGain >= 70 ? 'text-emerald-400' : learningGain >= 30 ? 'text-blue-400' : 'text-amber-400'}`}>
                  +{learningGain}%
                </div>
                <div className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">Hake Gain</div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-xl font-black text-white tabular-nums">{currentStreak ?? 0}</div>
                <div className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">{t("learn.streak")}</div>
              </div>
            )}
          </div>

          {/* Path info */}
          <div className="text-[9px] text-slate-600 mb-6 font-bold uppercase tracking-widest">
            {pathTitle} · {t("learn.module")} {lastCompletedModuleId} / {totalModules}
          </div>

          {/* Next Module Button */}
          {hasNextModule && (
            <button
              onClick={handleNextModule}
              disabled={isLoading}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm uppercase tracking-[0.2em] shadow-[0_15px_40px_rgba(59,130,246,0.25)] flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all group"
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
