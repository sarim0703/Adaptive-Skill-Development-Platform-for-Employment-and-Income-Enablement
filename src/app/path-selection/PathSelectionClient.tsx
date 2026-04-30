"use client";

import { useEffect, useState, useRef } from "react";
import { generateAndSavePathOptions } from "../actions";
import { Loader2, RefreshCw, AlertCircle, Sparkles, ChevronRight, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { experimental_useObject } from "@ai-sdk/react";
import { roadmapSchema } from "@/lib/ai/schemas";

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
  const [selectingPathId, setSelectingPathId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);
  const [showPreTestIntro, setShowPreTestIntro] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (initialPaths.length === 0 && !hasFetched.current) {
      hasFetched.current = true;
      generatePaths();
    }
  }, [initialPaths.length]);

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

  const { 
    object: streamingRoadmap, 
    submit: startStreaming, 
    isLoading: isStreamingRoadmap 
  } = experimental_useObject({
    api: '/api/roadmap/stream',
    schema: roadmapSchema,
    onFinish: () => {
      // Small delay to ensure DB persistence completes, then show intro
      setTimeout(() => {
        setShowPreTestIntro(true);
      }, 1000);
    },
    onError: (err) => {
      console.error("Streaming error:", err);
      setSelectingPathId(null);
      setError("Failed to generate roadmap. Please try again.");
    }
  });

  async function handleSelect(pathId: string) {
    setSelectingPathId(pathId);
    startStreaming({ pathId });
  }

  // Show the "Generating Roadmap" screen if we are streaming
  if (isStreamingRoadmap || (selectingPathId && streamingRoadmap)) {
    return (
      <div className="relative min-h-screen bg-background text-foreground flex flex-col items-center justify-start py-20 px-6 overflow-y-auto">
        
        {/* Intro Modal Overlay */}
        {showPreTestIntro && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md animate-fadeIn">
            <div className="max-w-md w-full bg-card border border-border p-10 rounded-[32px] shadow-[0_50px_100px_rgba(0,0,0,0.4)] text-center animate-scaleIn">
              <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-8">
                <Sparkles className="w-10 h-10 text-blue-500" />
              </div>
              <h2 className="text-3xl font-black text-foreground mb-4 tracking-tight">
                {t("pretest.intro.title")}
              </h2>
              <p className="text-text-secondary leading-relaxed mb-10 font-medium">
                {t("pretest.intro.desc")}
              </p>
              <button
                onClick={() => router.push("/pre-test")}
                className="w-full py-5 rounded-2xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-500 shadow-[0_20px_40px_rgba(37,99,235,0.3)] active:scale-95 transition-all"
              >
                {t("pretest.intro.btn")}
              </button>
            </div>
          </div>
        )}

        <div className={`max-w-2xl w-full text-center mb-12 transition-all duration-700 ${showPreTestIntro ? 'blur-xl opacity-20 scale-95' : 'blur-0 opacity-100 scale-100'}`}>
          <div className="inline-flex mb-6 relative">
            <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin flex items-center justify-center bg-card">
              <Sparkles className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">{t("paths.building")}</h2>
          <p className="text-text-secondary">{t("paths.designing")}</p>

        </div>

        <div className={`max-w-2xl w-full space-y-6 transition-all duration-700 ${showPreTestIntro ? 'blur-xl opacity-20 scale-95' : 'blur-0 opacity-100 scale-100'}`}>
          {streamingRoadmap?.modules?.map((mod: any, idx: number) => (
            <div key={idx} className="p-6 rounded-2xl bg-card border border-border animate-fadeInUp shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-30 group-hover:opacity-100 transition-opacity" />
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-xs font-black text-blue-500 border border-blue-500/20">
                    {idx + 1}
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{mod?.module_title || t("paths.drafting")}</h3>

               </div>
               
               <div className="space-y-3 pl-12">
                  {mod?.subtopics?.map((st: any, sIdx: number) => (
                    <div key={sIdx} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40 mt-1.5 flex-shrink-0" />
                      <p className="text-sm text-text-secondary leading-snug">{st?.title || "..."}</p>
                    </div>
                  ))}
               </div>
            </div>
          ))}
          
          {/* Animated Placeholder for next module */}
          {!streamingRoadmap?.modules || streamingRoadmap.modules.length < 3 ? (
            <div className="p-6 rounded-2xl border border-dashed border-border flex items-center gap-4 opacity-40 animate-pulse">
               <div className="w-8 h-8 rounded-lg bg-foreground/5" />
               <div className="h-4 w-48 bg-foreground/5 rounded" />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="relative min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 overflow-hidden transition-colors duration-300">
        <div className="relative z-10 text-center max-w-lg">
          <div className="inline-flex mb-10 relative">
            <div className="w-20 h-20 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin flex items-center justify-center bg-card backdrop-blur-xl">
               <Sparkles className="w-7 h-7 text-blue-500 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4 text-foreground">
            {t("paths.finding")}
          </h2>
          <p className="text-base text-text-secondary mb-8">
            {t("paths.mapping")}
          </p>

          <div className="w-full bg-foreground/5 rounded-full h-1 overflow-hidden border border-border">
             <div className="h-full bg-blue-500 w-2/3 animate-[loading_3s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 transition-colors duration-300">
        <div className="bg-card border border-border rounded-xl p-10 text-center max-w-md">
          <div className="w-16 h-16 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-3">Something went wrong</h2>
          <p className="text-text-secondary mb-8 text-sm">{error}</p>
          <button onClick={generatePaths} className="btn-primary w-full py-3 text-sm rounded-xl flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground py-24 px-6 overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
            {t("paths.choose")}
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            {t("paths.tailored")}
          </p>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 stagger">
          {paths.map((path, index) => (
            <div
              key={path.id}
              className={`bg-card border rounded-xl p-8 flex flex-col relative group transition-all duration-300 hover:border-border-hover ${
                index === 0 ? 'border-blue-500/30 ring-1 ring-blue-500/10' : 'border-border'
              }`}
            >
              {/* Match Meter */}
              <div className="absolute -top-3 left-8 flex items-center gap-3">
                 <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                    index === 0 ? 'bg-blue-600 text-white' : 'bg-bg-secondary text-text-secondary border border-border'
                 }`}>
                    <Sparkles className="w-3 h-3" />
                    {index === 0 ? t("paths.bestMatch") : t("paths.goodMatch")}

                 </div>
              </div>

              <div className="mb-6 mt-4">
                <h2 className="text-xl font-semibold text-foreground mb-3 tracking-tight group-hover:text-blue-500 transition-colors">
                  {path.pathTitle}
                </h2>
                <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
                  {path.practicalSummary}
                </p>
              </div>

              {/* Stats Highlighting */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-input rounded-xl p-4 border border-border">
                  <div className="text-xs font-medium text-text-tertiary mb-1">{t("paths.income")}</div>
                  <div className="text-lg font-semibold text-emerald-500">
                    ₹{((path.estimatedIncomeMin ?? 0) / 1000).toFixed(0)}k<span className="text-text-tertiary font-normal text-sm ml-0.5">/mo</span>
                  </div>
                </div>
                <div className="bg-input rounded-xl p-4 border border-border">
                  <div className="text-xs font-medium text-text-tertiary mb-1">{t("paths.duration")}</div>
                  <div className="text-lg font-semibold text-foreground">
                    {path.estimatedWeeks} <span className="text-text-tertiary font-normal text-sm">{t("paths.weeks")}</span>
                  </div>
                </div>

              </div>

              {/* Match Logic */}
              <div className="mb-6 p-4 rounded-xl bg-blue-500/[0.03] border border-blue-500/10 text-sm text-text-secondary leading-relaxed relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-0.5 h-full bg-blue-500"></div>
                 <span className="pl-3 block italic">&quot;{path.matchReason}&quot;</span>
              </div>

              {/* Roadmap Peek */}
              <div className="mb-8 flex-grow">
                <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wide mb-4 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  {t("paths.preview")}

                </h3>
                <div className="space-y-3">
                  {Array.isArray(path.previewWeeks) && (path.previewWeeks as { week: number; focus: string }[]).slice(0, 3).map((pw) => (
                    <div key={pw.week} className="flex items-center gap-3 group/item">
                      <div className="w-7 h-7 rounded-lg bg-input border border-border flex items-center justify-center text-xs font-medium text-text-tertiary group-hover/item:bg-blue-600 group-hover/item:text-white group-hover/item:border-blue-500 transition-all">
                        {pw.week}
                      </div>
                      <span className="text-sm text-text-secondary group-hover/item:text-foreground transition-colors">{pw.focus}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleSelect(path.id)}
                disabled={!!selectingPathId}
                className="w-full py-3.5 rounded-xl bg-foreground text-background font-semibold text-sm hover:bg-blue-600 hover:text-white active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {selectingPathId === path.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {t("paths.select")}
                    <ChevronRight className="w-4 h-4" />
                  </>

                )}
              </button>
            </div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="mt-16 flex justify-center">
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-text-secondary font-medium text-sm hover:text-foreground hover:border-border-hover transition-all"
          >
            <RefreshCw className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-700`} />
            {t("paths.regenerate")}

          </button>
        </div>
      </div>
    </div>
  );
}
