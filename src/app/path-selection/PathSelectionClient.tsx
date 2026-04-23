"use client";

import { useEffect, useState } from "react";
import { generateAndSavePathOptions, selectPath } from "../actions";
import { Loader2, TrendingUp, Clock, Target, Star, RefreshCw, AlertCircle, Sparkles, ChevronRight, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

type PathOptionType = {
  id: string;
  pathTitle: string;
  practicalSummary: string | null;
  estimatedIncomeMin: number | null;
  estimatedIncomeMax: number | null;
  estimatedWeeks: number | null;
  matchReason: string | null;
  previewWeeks: unknown;
};

export default function PathSelectionClient({ initialPaths }: { initialPaths: PathOptionType[] }) {
  const { t } = useLanguage();
  const [paths, setPaths] = useState(initialPaths);
  const [isGenerating, setIsGenerating] = useState(initialPaths.length === 0);
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (initialPaths.length === 0) {
      generatePaths();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generatePaths() {
    setIsGenerating(true);
    setError(null);
    try {
      const generatedPaths = await generateAndSavePathOptions();
      setPaths(generatedPaths);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to generate career paths. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleRegenerate() {
    setPaths([]);
    await generatePaths();
  }

  async function handleSelect(pathId: string) {
    setIsSelecting(true);
    try {
      await selectPath(pathId);
      router.push("/pre-test");
    } catch (err) {
      console.error(err);
      setIsSelecting(false);
    }
  }

  if (isGenerating) {
    return (
      <div className="max-w-xl mx-auto px-6 py-32 text-center animate-fadeInUp">
        <div className="relative inline-flex mb-8">
          <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-20 animate-pulse"></div>
          <Loader2 className="w-16 h-16 text-[#007AFF] animate-spin relative" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">{t("path.loading.title")}</h2>
        <p className="text-lg text-slate-500 leading-relaxed">
          {t("path.loading.sub")}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 animate-fadeInUp">
        <div className="card p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Something went wrong</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">{error}</p>
          <button onClick={generatePaths} className="btn-primary w-full py-4 text-lg">
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-fadeInUp">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-[#34C759]/10 text-[#34C759] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Recommended for you
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">{t("path.title")}</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">{t("path.sub")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 stagger">
        {paths.map((path, index) => (
          <div
            key={path.id}
            className={`card p-8 flex flex-col relative group ${index === 0 ? 'border-[#007AFF]/30 bg-blue-50/10' : ''}`}
          >
            {/* Recommended Badge */}
            {index === 0 && (
              <div className="absolute -top-3 left-8 bg-[#007AFF] text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/20">
                <Star className="w-3.5 h-3.5 fill-current" />
                {t("path.recommended")}
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-3">{path.pathTitle}</h2>
              <p className="text-slate-500 leading-relaxed line-clamp-3">{path.practicalSummary}</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t("path.income")}</div>
                <div className="text-lg font-bold text-[#34C759]">₹{(path.estimatedIncomeMin ?? 0).toLocaleString()}–₹{(path.estimatedIncomeMax ?? 0).toLocaleString()}</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Timeframe</div>
                <div className="text-lg font-bold text-slate-800">{path.estimatedWeeks} {t("path.weeks")}</div>
              </div>
            </div>

            {/* Match Reason */}
            <div className="flex items-start gap-3 p-4 bg-[#007AFF]/5 rounded-2xl mb-8 border border-[#007AFF]/10">
              <Target className="w-5 h-5 text-[#007AFF] mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                &quot;{path.matchReason}&quot;
              </p>
            </div>

            {/* Curriculum Preview */}
            <div className="mb-8 flex-grow">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" />
                Curriculum Overview
              </h3>
              <div className="space-y-3">
                {Array.isArray(path.previewWeeks) && (path.previewWeeks as { week: number; focus: string }[]).map((pw) => (
                  <div key={pw.week} className="flex items-center gap-3 text-sm group/item">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] font-bold group-hover/item:bg-blue-100 group-hover/item:text-blue-500 transition-colors">
                      0{pw.week}
                    </span>
                    <span className="text-slate-600 font-medium group-hover/item:text-slate-900 transition-colors">{pw.focus}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSelect(path.id)}
              disabled={isSelecting}
              className="btn-primary w-full py-4 text-lg font-bold group"
            >
              {isSelecting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {t("path.select")}
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-16 text-center">
        <button
          onClick={handleRegenerate}
          disabled={isGenerating}
          className="btn-secondary inline-flex items-center gap-2 text-sm font-bold"
        >
          <RefreshCw className="w-4 h-4" />
          Show different options
        </button>
        <p className="text-xs text-slate-400 mt-6 font-medium">
          Our AI analyzes market data from Urban Company, Swiggy, and local gig platforms to suggest these paths.
        </p>
      </div>
    </div>
  );
}
