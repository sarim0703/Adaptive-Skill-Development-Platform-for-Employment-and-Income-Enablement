"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import {
  Brain, TrendingUp, Target, Flame, BarChart3,
  CheckCircle2, Clock, ArrowLeft, Award, Zap, Download, Sparkles, PieChart, Info, ExternalLink, Briefcase
} from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import { useCompletion } from '@ai-sdk/react';
import { Loader2, ChevronRight, AlertCircle } from "lucide-react";
import { useEffect } from "react";

type ZPDStatus = 'below_zpd' | 'in_zpd' | 'mastered';

type AnalyticsData = {
  userName: string;
  pathTitle: string;
  capabilityScore: number;
  knowledgeSummary: {
    totalKCs: number;
    masteredCount: number;
    inZPDCount: number;
    belowZPDCount: number;
    avgMastery: number;
  };
  masteryGrid: {
    subtopicId: string;
    mastery: number;
    attempts: number;
    correct: number;
    zpd: ZPDStatus;
  }[];
  preTestScore: number | null;
  currentAvgScore: number | null;
  normalizedLearningGain: number | null;
  learningCurve: {
    attempt: number;
    mastery: number;
    quizScore: number;
    capability: number;
  }[];
  totalQuizzes: number;
  currentStreak: number;
  longestStreak: number;
  consistencyScore: number;
  moduleProgress: {
    moduleId: number;
    title: string;
    total: number;
    completed: number;
    percent: number;
  }[];
  outcomeDistribution: Record<string, number>;
  totalOutcomes: number;
};

function zpdColor(zpd: ZPDStatus) {
  switch (zpd) {
    case 'mastered': return 'from-emerald-500 to-teal-400';
    case 'in_zpd': return 'from-blue-500 to-cyan-400';
    case 'below_zpd': return 'from-amber-500 to-orange-400';
  }
}

function zpdText(zpd: ZPDStatus) {
  switch (zpd) {
    case 'mastered': return 'text-emerald-400';
    case 'in_zpd': return 'text-blue-400';
    case 'below_zpd': return 'text-amber-400';
  }
}

function zpdLabel(zpd: ZPDStatus) {
  switch (zpd) {
    case 'mastered': return 'Mastered';
    case 'in_zpd': return 'Active ZPD';
    case 'below_zpd': return 'Prerequisites';
  }
}

export default function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const { t } = useLanguage();
  const router = useRouter();

  const { completion, complete, isLoading: isLoadingAnalysis, error: analysisError } = useCompletion({
    api: '/api/analytics/analyze',
    streamProtocol: 'text',
  });

  useEffect(() => {
    if (completion) {
      console.log("[Analytics] AI Analysis chunk received:", completion.length);
    }
  }, [completion]);

  const nlgColor = data.normalizedLearningGain !== null
    ? data.normalizedLearningGain >= 70 ? 'text-emerald-400' :
      data.normalizedLearningGain >= 30 ? 'text-blue-400' : 'text-amber-400'
    : 'text-slate-500';

  return (
    <div className="relative min-h-screen bg-[#0A0A0C] text-white overflow-hidden pb-20">
      {/* Background Decor */}
      <div className="aurora-blob w-[800px] h-[800px] bg-blue-600/5 -top-1/4 -right-1/4 rounded-full pointer-events-none blur-[120px]"></div>
      <div className="aurora-blob w-[600px] h-[600px] bg-violet-600/5 bottom-0 -left-1/4 rounded-full pointer-events-none blur-[100px]"></div>
      <div className="absolute inset-0 bg-tech-grid opacity-5 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 pt-24 relative z-10">
        
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-400 mb-4">
              <BarChart3 className="w-3.5 h-3.5" />
              Intelligence Dashboard
            </div>
            <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
              Learning Analytics
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              Analyzing <span className="text-white">{data.userName}</span>&apos;s cognitive trajectory in <span className="text-blue-400">{data.pathTitle}</span>
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4"
          >
            <button 
              onClick={() => window.open('/api/export', '_blank')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/5 text-xs font-bold text-slate-300 hover:bg-white/[0.06] hover:text-white transition-all group"
            >
              <Download className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
              Export CSV
            </button>
          </motion.div>
        </div>

        {/* ── Core KPI Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          {[
            { label: t("analytics.capability"), val: data.capabilityScore, icon: Brain, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", sub: "Cognitive Level" },
            { label: t("analytics.nlg"), val: data.normalizedLearningGain !== null ? `${data.normalizedLearningGain}%` : '—', icon: TrendingUp, color: nlgColor, bg: "bg-emerald-400/10", border: "border-emerald-400/20", sub: "Skill Delta" },
            { label: t("analytics.streak"), val: `${data.currentStreak} Days`, icon: Flame, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", sub: "Continuity" },
            { label: t("analytics.quizzes"), val: data.totalQuizzes, icon: Zap, color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20", sub: "Session Count" }
          ].map((kpi, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-3xl bg-white/[0.03] border ${kpi.border} p-6 relative overflow-hidden group hover:scale-[1.02] transition-all`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{kpi.sub}</span>
              </div>
              <div className={`text-4xl font-black mb-1 ${kpi.color}`}>{kpi.val}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Secondary Charts Section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Left: Mastery Visuals (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Learning Curve Chart */}
            <div className="rounded-3xl bg-white/[0.03] border border-white/5 p-8 relative overflow-hidden">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Cognitive Trajectory</h3>
                  <h2 className="text-xl font-bold text-white">BKT Learning Curve</h2>
                </div>
                <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-500">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" /> Mastery</span>
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white/10" /> Quiz Scores</span>
                </div>
              </div>

              {data.learningCurve.length > 0 ? (
                <div className="h-72 flex items-end gap-3 md:gap-5 px-2 relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-x-0 top-0 h-px bg-white/[0.03]" />
                  <div className="absolute inset-x-0 top-1/4 h-px bg-white/[0.03]" />
                  <div className="absolute inset-x-0 top-2/4 h-px bg-white/[0.03]" />
                  <div className="absolute inset-x-0 top-3/4 h-px bg-white/[0.03]" />

                  {data.learningCurve.map((point, i) => (
                    <div key={point.attempt} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                      {/* Tooltip */}
                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all bg-[#111] border border-white/10 text-white text-[10px] font-bold px-3 py-2 rounded-xl pointer-events-none whitespace-nowrap z-20 shadow-2xl">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="w-3 h-3 text-violet-400" />
                          <span>Capability: {point.capability}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-3 h-3 text-emerald-400" />
                          <span>Score: {point.quizScore}%</span>
                        </div>
                      </div>
                      
                      {/* Mastery Bar */}
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${point.mastery}%` }}
                        transition={{ delay: i * 0.05, duration: 1, ease: "easeOut" }}
                        className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-xl relative group-hover:from-blue-500 group-hover:to-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">{point.mastery}%</div>
                      </motion.div>
                      
                      <div className="mt-4 text-[9px] font-black text-slate-600 uppercase tracking-tighter">Attempt {point.attempt}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-72 flex flex-col items-center justify-center text-slate-600 gap-4">
                  <Info className="w-8 h-8 text-slate-800" />
                  <p className="italic text-sm">Calibration required: Complete your first module to see your curve.</p>
                </div>
              )}
            </div>

            {/* BKT Mastery Grid */}
            <div className="rounded-3xl bg-white/[0.03] border border-white/5 p-8">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Detailed Breakdown</h3>
                  <h2 className="text-xl font-bold text-white">Knowledge Components</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.masteryGrid.map((kc, i) => (
                  <motion.div 
                    key={kc.subtopicId}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.04] transition-all group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-white truncate max-w-[180px] group-hover:text-blue-400 transition-colors">{kc.subtopicId}</span>
                      <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 ${zpdText(kc.zpd)}`}>
                        {zpdLabel(kc.zpd)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden p-0.5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${kc.mastery}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className={`h-full rounded-full bg-gradient-to-r ${zpdColor(kc.zpd)} shadow-[0_0_10px_rgba(255,255,255,0.1)]`}
                        />
                      </div>
                      <span className="text-base font-black text-white w-10 text-right tabular-nums">{kc.mastery}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Summary Widgets (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Mastery Distribution Card */}
            <div className="rounded-3xl bg-white/[0.03] border border-white/5 p-6">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Mastery Distribution</h3>
              
              <div className="space-y-8">
                {/* Visual Stacked Bar */}
                <div className="relative h-20 rounded-2xl overflow-hidden p-1 bg-white/[0.03] border border-white/5 flex gap-1">
                  <div className="h-full bg-emerald-500/80 rounded-lg relative group transition-all" style={{ width: `${(data.knowledgeSummary.masteredCount / data.knowledgeSummary.totalKCs) * 100}%` }}>
                     <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity">Mastered</div>
                  </div>
                  <div className="h-full bg-blue-500/80 rounded-lg relative group transition-all" style={{ width: `${(data.knowledgeSummary.inZPDCount / data.knowledgeSummary.totalKCs) * 100}%` }}>
                     <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity">ZPD</div>
                  </div>
                  <div className="h-full bg-amber-500/80 rounded-lg relative group transition-all" style={{ width: `${(data.knowledgeSummary.belowZPDCount / data.knowledgeSummary.totalKCs) * 100}%` }}>
                     <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity">Active</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { label: "Mastered", count: data.knowledgeSummary.masteredCount, color: "bg-emerald-500" },
                    { label: "Active ZPD", count: data.knowledgeSummary.inZPDCount, color: "bg-blue-500" },
                    { label: "Needs Review", count: data.knowledgeSummary.belowZPDCount, color: "bg-amber-500" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
                        <span className="text-sm font-bold text-slate-300">{item.label}</span>
                      </div>
                      <span className="text-sm font-black text-white">{item.count} <span className="text-[9px] text-slate-600">KCs</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SDG 8 Impact Card */}
            <div className="rounded-3xl bg-white/[0.03] border-b-4 border-b-violet-500/30 border border-white/5 p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Briefcase className="w-20 h-20 text-white" />
              </div>
              
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">SDG 8 Outcome Impact</h3>
              
              <div className="space-y-3">
                {Object.entries(data.outcomeDistribution).map(([type, count]) => {
                  const labels: Record<string, string> = {
                    gig_found: 'Job/Gig Secured',
                    interview: 'Interview Invitation',
                    confidence: 'Skill Confidence',
                    still_learning: 'Training Active',
                  };
                  return (
                    <div key={type} className="flex items-center justify-between bg-white/[0.03] p-4 rounded-2xl border border-white/5 group/row hover:bg-white/5 transition-all">
                      <span className="text-xs font-bold text-slate-400 group-hover/row:text-white transition-colors">{labels[type] || type}</span>
                      <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center text-xs font-black text-violet-400 border border-violet-500/20">
                        {count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Methodology Footer ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white/[0.03] border border-white/5 p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden mb-12"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/30" />
          
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                BKT Analytics Methodology
                <Info className="w-3.5 h-3.5 text-slate-600" />
              </h4>
              <p className="text-[11px] text-slate-500 font-medium max-w-2xl leading-relaxed">
                CareerOrbit utilizes <span className="text-slate-300">Bayesian Knowledge Tracing (BKT)</span> to model your mastery as a latent variable. 
                Our algorithms process response patterns to distinguish between luck and true cognitive mastery. 
                Capability levels are normalized against research-grade datasets to ensure high-fidelity career readiness metrics.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 border-l border-white/5 pl-8 md:pl-12">
            <div className="text-right hidden md:block">
              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Platform Integrity</p>
              <p className="text-[10px] font-bold text-emerald-400">Research Verified</p>
            </div>
            <PieChart className="w-8 h-8 text-slate-700" />
          </div>
        </motion.div>

        {/* ── Deep Cognitive Analysis Section ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-[40px] bg-gradient-to-br from-indigo-600/10 via-transparent to-blue-600/10 border border-white/10 p-1 md:p-8"
        >
          <div className="rounded-[32px] bg-[#0D0D0F]/80 backdrop-blur-3xl p-8 md:p-12 border border-white/5 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
              <div className="max-w-2xl text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-black uppercase tracking-widest text-violet-400 mb-4">
                  <Sparkles className="w-3 h-3" />
                  AI Reasoning Engine
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
                  Deep Cognitive Analysis
                </h2>
                <p className="text-slate-400 font-medium leading-relaxed">
                  Let our AI Mentor analyze your diagnostic patterns, BKT mastery deltas, and behavioral data to provide a research-grade breakdown of your unique learning persona.
                </p>
              </div>

              <button
                onClick={() => complete("")}
                disabled={isLoadingAnalysis}
                className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl font-black text-sm uppercase tracking-widest shadow-[0_15px_40px_rgba(59,130,246,0.3)] hover:shadow-[0_20px_50px_rgba(59,130,246,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
              >
                {isLoadingAnalysis ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Patterns...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    Analyze My Performance
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </div>
                )}
              </button>
            </div>

            {/* Analysis Result Display */}
            {analysisError && (
              <div className="mt-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                Failed to generate analysis. Please try again.
              </div>
            )}

            {(completion || isLoadingAnalysis) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative mt-8"
              >
                <div className="absolute inset-0 bg-blue-500/5 rounded-3xl blur-2xl" />
                <div className="relative bg-white/[0.02] border border-white/10 rounded-3xl p-8 md:p-10 font-medium text-slate-300 leading-loose prose prose-invert prose-blue max-w-none prose-sm md:prose-base min-h-[100px]">
                   {completion ? (
                     <ReactMarkdown>{completion}</ReactMarkdown>
                   ) : (
                     <div className="flex flex-col gap-4 animate-pulse">
                        <div className="h-4 bg-white/5 rounded w-3/4" />
                        <div className="h-4 bg-white/5 rounded w-1/2" />
                        <div className="h-4 bg-white/5 rounded w-5/6" />
                     </div>
                   )}
                   {isLoadingAnalysis && completion && (
                     <div className="flex gap-1 mt-6">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                     </div>
                   )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}


