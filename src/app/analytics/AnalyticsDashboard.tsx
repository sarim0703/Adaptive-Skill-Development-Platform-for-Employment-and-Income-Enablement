"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import {
  Brain, TrendingUp, Target, Flame, BarChart3,
  CheckCircle2, Clock, ArrowLeft, Award, Zap, Download, Sparkles, PieChart
} from "lucide-react";

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
    case 'mastered': return 'bg-[#34C759]';
    case 'in_zpd': return 'bg-[#007AFF]';
    case 'below_zpd': return 'bg-[#FF9500]';
  }
}

function zpdBadge(zpd: ZPDStatus) {
  switch (zpd) {
    case 'mastered': return 'badge-green';
    case 'in_zpd': return 'badge-indigo';
    case 'below_zpd': return 'badge-amber';
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

  const nlgColor = data.normalizedLearningGain !== null
    ? data.normalizedLearningGain >= 70 ? 'text-[#34C759]' :
      data.normalizedLearningGain >= 30 ? 'text-[#007AFF]' : 'text-[#FF9500]'
    : 'text-slate-400';

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 animate-fadeInUp">
      
      {/* Header with Research Focus */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#007AFF]/10 text-[#007AFF] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
            <BarChart3 className="w-3 h-3" />
            Research Metrics
          </div>
          <h1 className="text-3xl font-bold text-slate-800 leading-tight">
            Learning Analytics Dashboard
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Analyzing {data.userName}&apos;s progress in <span className="text-slate-800 font-bold">{data.pathTitle}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.open('/api/export', '_blank')}
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-5 py-2.5 text-sm font-bold text-slate-700 hover:border-[#007AFF] hover:bg-[#007AFF]/5 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Research Data (CSV)
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Capability Widget */}
        <div className="card p-6 border-l-4 border-l-[#007AFF]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#007AFF]/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-[#007AFF]" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery</span>
          </div>
          <div className="text-4xl font-black text-slate-800 mb-1">{data.capabilityScore}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("analytics.capability")}</div>
        </div>

        {/* Learning Gain Widget */}
        <div className="card p-6 border-l-4 border-l-[#34C759]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#34C759]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#34C759]" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hake Gain</span>
          </div>
          <div className={`text-4xl font-black mb-1 ${nlgColor}`}>
            {data.normalizedLearningGain !== null ? `${data.normalizedLearningGain}%` : '—'}
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("analytics.nlg")}</div>
        </div>

        {/* Streak Widget */}
        <div className="card p-6 border-l-4 border-l-[#FF9500]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#FF9500]/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-[#FF9500]" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Momentum</span>
          </div>
          <div className="text-4xl font-black text-slate-800 mb-1">{data.currentStreak} <span className="text-xl">Days</span></div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("analytics.streak")}</div>
        </div>

        {/* Quizzes Widget */}
        <div className="card p-6 border-l-4 border-l-[#5856D6]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#5856D6]/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#5856D6]" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume</span>
          </div>
          <div className="text-4xl font-black text-slate-800 mb-1">{data.totalQuizzes}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("analytics.quizzes")}</div>
        </div>
      </div>

      {/* Detailed Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        
        {/* Left: Mastery Visuals */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Learning Curve Chart */}
          <div className="card p-8">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">BKT Learning Curve</h3>
              <div className="flex items-center gap-4 text-[10px] font-bold">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#007AFF]" /> Mastery Probability</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-200" /> Quiz Scores</span>
              </div>
            </div>

            {data.learningCurve.length > 0 ? (
              <div className="h-64 flex items-end gap-2 md:gap-4 px-2">
                {data.learningCurve.map((point) => (
                  <div key={point.attempt} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                      Cap: {point.capability} | Score: {point.quizScore}%
                    </div>
                    
                    <div className="w-full bg-[#007AFF] rounded-t-xl transition-all duration-700 shadow-sm relative group-hover:bg-[#007AFF]/80"
                         style={{ height: `${point.mastery}%` }}>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#007AFF]">{point.mastery}%</div>
                    </div>
                    
                    <div className="mt-3 text-[10px] font-black text-slate-300 uppercase tracking-tighter">Q{point.attempt}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-300 italic text-sm">No quiz data available yet.</div>
            )}
          </div>

          {/* BKT Mastery Grid */}
          <div className="card p-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Knowledge Component Mastery</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.masteryGrid.map((kc) => (
                <div key={kc.subtopicId} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 hover:bg-white hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-slate-800 truncate max-w-[180px]">{kc.subtopicId}</span>
                    <span className={`badge ${zpdBadge(kc.zpd)} text-[9px] py-0.5 px-2 font-black uppercase tracking-widest`}>
                      {zpdLabel(kc.zpd)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                      <div className={`h-full rounded-full transition-all duration-1000 ${zpdColor(kc.zpd)} shadow-sm`}
                           style={{ width: `${kc.mastery}%` }} />
                    </div>
                    <span className="text-lg font-black text-slate-800 w-12 text-right">{kc.mastery}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Summary Widgets */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* ZPD Summary Card */}
          <div className="card p-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Mastery Distribution</h3>
            <div className="space-y-6">
              {/* Progress Pie-style Bar */}
              <div className="flex h-12 rounded-2xl overflow-hidden p-1 bg-slate-50 border border-slate-100">
                <div className="bg-[#34C759] transition-all" style={{ width: `${(data.knowledgeSummary.masteredCount / data.knowledgeSummary.totalKCs) * 100}%` }} />
                <div className="bg-[#007AFF] transition-all" style={{ width: `${(data.knowledgeSummary.inZPDCount / data.knowledgeSummary.totalKCs) * 100}%` }} />
                <div className="bg-[#FF9500] transition-all" style={{ width: `${(data.knowledgeSummary.belowZPDCount / data.knowledgeSummary.totalKCs) * 100}%` }} />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#34C759]" />
                    <span className="text-sm font-bold text-slate-700">Mastered</span>
                  </div>
                  <span className="text-sm font-black text-slate-400">{data.knowledgeSummary.masteredCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#007AFF]" />
                    <span className="text-sm font-bold text-slate-700">Active ZPD</span>
                  </div>
                  <span className="text-sm font-black text-slate-400">{data.knowledgeSummary.inZPDCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#FF9500]" />
                    <span className="text-sm font-bold text-slate-700">Needs Work</span>
                  </div>
                  <span className="text-sm font-black text-slate-400">{data.knowledgeSummary.belowZPDCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SDG 8 Outcomes Widget */}
          <div className="card p-6 border-b-4 border-b-[#5856D6]">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Outcome Impact (SDG 8)</h3>
            <div className="space-y-3">
              {Object.entries(data.outcomeDistribution).map(([type, count]) => {
                const labels: Record<string, string> = {
                  gig_found: '💼 Job/Gig Secured',
                  interview: '🤝 Interview Invitation',
                  confidence: '💪 Skill Confidence',
                  still_learning: '📚 Training Active',
                };
                return (
                  <div key={type} className="flex items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                    <span className="text-sm font-bold text-slate-600">{labels[type] || type}</span>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-black text-[#5856D6] shadow-sm border border-slate-100">
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Methodology Footer */}
      <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">BKT Analytics Methodology</h4>
            <p className="text-[10px] text-slate-500 font-medium max-w-lg leading-relaxed">
              Capability scores are derived from real-time Bayesian Knowledge Tracing with a mastery threshold of 0.85. 
              Learning Gain is computed using Hake&apos;s formula: (Post - Pre) / (1 - Pre).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-slate-300" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Research-Grade Fidelity</span>
        </div>
      </div>
    </div>
  );
}
