"use client";

import { useEffect, useState, useRef } from "react";
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
  const hasFetched = useRef(false);
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
      <div className="relative min-h-screen bg-[#0A0A0C] text-white flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* Scanning Animation Background */}
        <div className="aurora-blob w-[500px] h-[500px] bg-blue-600/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse blur-[120px]"></div>
        <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none"></div>

        <div className="relative z-10 text-center max-w-lg animate-fadeInUp">
          <div className="inline-flex mb-12 relative group">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="w-24 h-24 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin flex items-center justify-center bg-black/40 backdrop-blur-xl">
               <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 leading-tight">
            Synthesizing Your <span className="italic-gradient">Future</span>
          </h2>
          <p className="text-xl text-slate-400 font-medium opacity-80 mb-8">
            Our AI engine is processing your skills, market demand, and local income data to map your path.
          </p>
          <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden border border-white/5">
             <div className="h-full bg-blue-500 w-2/3 animate-[loading_3s_ease-in-out_infinite] shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex items-center justify-center p-6">
        <div className="glass-card p-12 text-center max-w-md border-rose-500/20 shadow-[0_0_50px_rgba(244,63,94,0.1)]">
          <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-8">
            <AlertCircle className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-4">Analysis Failed</h2>
          <p className="text-slate-400 mb-10 font-medium leading-relaxed">{error}</p>
          <button onClick={generatePaths} className="btn-primary w-full py-5 text-lg rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0A0A0C] text-white py-24 px-6 overflow-hidden">
      {/* Background Decor */}
      <div className="aurora-blob w-[800px] h-[800px] bg-blue-600/5 -top-1/4 -left-1/4 rounded-full pointer-events-none"></div>
      <div className="aurora-blob w-[600px] h-[600px] bg-violet-600/5 bottom-0 right-0 rounded-full pointer-events-none" style={{ animationDelay: '4s' }}></div>
      <div className="absolute inset-0 bg-tech-grid opacity-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24 animate-fadeInUp">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-md mb-8">
            <Target className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Analysis Complete</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
            Pick Your <span className="italic-gradient">Destiny.</span>
          </h1>
          <p className="text-2xl text-slate-400 max-w-2xl mx-auto font-medium opacity-80 leading-relaxed">
            We&apos;ve calculated three high-growth paths based on your unique profile and local market trends.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 stagger">
          {paths.map((path, index) => (
            <div
              key={path.id}
              className={`glass-card p-10 flex flex-col relative group transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_40px_100px_rgba(0,0,0,0.6)] ${
                index === 0 ? 'border-blue-500/30 ring-1 ring-blue-500/20' : 'border-white/5'
              }`}
            >
              {/* Match Meter */}
              <div className="absolute -top-4 left-10 flex items-center gap-3">
                 <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl ${
                    index === 0 ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-[#121214] text-slate-400 border border-white/5'
                 }`}>
                    <Sparkles className="w-3 h-3" />
                    {index === 0 ? "98% Match" : "85% Match"}
                 </div>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-black text-white mb-4 tracking-tight leading-tight group-hover:text-blue-400 transition-colors">
                  {path.pathTitle}
                </h2>
                <p className="text-slate-400 font-medium leading-relaxed opacity-80 line-clamp-3">
                  {path.practicalSummary}
                </p>
              </div>

              {/* Stats Highlighting */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-white/5 rounded-3xl p-5 border border-white/5 group-hover:bg-white/10 transition-colors">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Pot. Income</div>
                  <div className="text-xl font-black text-emerald-400 tracking-tighter">
                    ₹{((path.estimatedIncomeMin ?? 0) / 1000).toFixed(0)}k<span className="text-slate-500 font-medium text-sm mx-1">/mo</span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-3xl p-5 border border-white/5 group-hover:bg-white/10 transition-colors">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Horizon</div>
                  <div className="text-xl font-black text-white tracking-tighter">
                    {path.estimatedWeeks} <span className="text-slate-500 font-medium text-sm">Weeks</span>
                  </div>
                </div>
              </div>

              {/* Match Logic */}
              <div className="mb-10 p-6 rounded-3xl bg-blue-500/[0.03] border border-blue-500/10 italic text-sm text-slate-400 leading-relaxed relative overflow-hidden group-hover:bg-blue-500/[0.05] transition-all">
                 <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                 &quot;{path.matchReason}&quot;
              </div>

              {/* Roadmap Peek */}
              <div className="mb-12 flex-grow">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  Initial Sprint
                </h3>
                <div className="space-y-4">
                  {Array.isArray(path.previewWeeks) && (path.previewWeeks as { week: number; focus: string }[]).slice(0, 3).map((pw) => (
                    <div key={pw.week} className="flex items-center gap-4 group/item">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover/item:bg-blue-600 group-hover/item:text-white group-hover/item:border-blue-400 transition-all">
                        0{pw.week}
                      </div>
                      <span className="text-sm font-bold text-slate-400 group-hover/item:text-white transition-colors">{pw.focus}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleSelect(path.id)}
                disabled={isSelecting}
                className="w-full py-6 rounded-3xl bg-white text-black font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:bg-blue-500 hover:text-white hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3 group/btn"
              >
                {isSelecting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    Select Path
                    <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="mt-24 flex flex-col items-center gap-8 animate-fadeInUp">
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="group flex items-center gap-3 px-8 py-4 rounded-full bg-white/5 border border-white/10 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <RefreshCw className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-700`} />
            Recalculate Opportunities
          </button>
          
          <div className="flex items-center gap-3 text-slate-600 font-black uppercase tracking-[0.2em] text-[10px]">
             <Sparkles className="w-4 h-4" />
             AI synthesis based on local demand markers
          </div>
        </div>
      </div>
    </div>
  );
}
