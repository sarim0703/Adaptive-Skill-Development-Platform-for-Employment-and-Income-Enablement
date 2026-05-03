"use client";

import { motion } from "framer-motion";
import { 
  User, 
  ShieldCheck, 
  MapPin, 
  Zap, 
  Target, 
  Trophy,
  ArrowUpRight,
  TrendingUp,
  Brain,
  BarChart3,
  Info,
  BrainCircuit,
  Globe,
  Calendar,
  Sparkles,
  Loader2,
  ArrowRight,
  Download,
  Edit3
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import ReactMarkdown from 'react-markdown';
import { useCompletion } from '@ai-sdk/react';

const getZPDStyle = (zpd: string) => {
  switch (zpd) {
    case 'in_zpd': return 'bg-blue-500/10 border-blue-500/30 text-blue-500';
    case 'below_zpd': return 'bg-amber-500/10 border-amber-500/30 text-amber-500';
    case 'mastered': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500';
    default: return 'bg-foreground/10 border-border text-text-tertiary';
  }
};

const getZPDLabel = (zpd: string) => {
  switch (zpd) {
    case 'in_zpd': return 'Growth Zone';
    case 'below_zpd': return 'Support Needed';
    case 'mastered': return 'Career Ready';
    default: return 'Evaluating';
  }
};

const getZPDProgressColor = (zpd: string) => {
  switch (zpd) {
    case 'in_zpd': return 'bg-blue-500';
    case 'below_zpd': return 'bg-amber-500';
    case 'mastered': return 'bg-emerald-500';
    default: return 'bg-foreground/20';
  }
};

interface MasteryDashboardProps {
  data: any;
}

export default function MasteryDashboard({ data }: MasteryDashboardProps) {
  const { t } = useLanguage();

  const { completion, complete, isLoading: isLoadingAnalysis } = useCompletion({
    api: '/api/analytics/analyze',
    streamProtocol: 'text',
  });

  const level = Math.max(1, Math.floor((data.capabilityScore || 50) / 10));

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
      
      {/* ── HERO SECTION ── */}
      <div className="flex flex-col lg:flex-row items-start justify-between gap-12 mb-20">
        
        {/* Left: Professional Identity */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative group">
            <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-br from-blue-600 via-indigo-500 to-violet-600 p-1.5 shadow-2xl shadow-blue-500/20 rotate-3 group-hover:rotate-0 transition-all duration-700">
              <div className="w-full h-full rounded-[2.2rem] bg-card flex items-center justify-center overflow-hidden">
                <User className="w-16 h-16 text-text-secondary group-hover:scale-110 transition-transform duration-700" />
              </div>
            </div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center border-4 border-background shadow-xl"
            >
              <ShieldCheck className="w-6 h-6 text-white" />
            </motion.div>
          </div>

          <div className="text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
              <h1 className="text-5xl font-black tracking-tight text-foreground">{data.userName}</h1>
              <div className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
                <Trophy className="w-3 h-3" />
                Rank: Level {level}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-xl font-bold text-text-secondary flex items-center justify-center md:justify-start gap-2">
                <Target className="w-5 h-5 text-indigo-500" />
                {data.pathTitle}
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-6">
                <div className="flex items-center gap-2 text-xs font-bold text-text-tertiary">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  {data.location}
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-text-tertiary">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Active Learning Mode
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-text-tertiary">
                  <Brain className="w-4 h-4 text-blue-500" />
                  BKT Engine Verified
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-foreground text-background font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
                  <Download className="w-4 h-4" />
                  Export Mastery CV
                </button>
                <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-card border border-border text-foreground font-black text-[10px] uppercase tracking-widest hover:bg-input transition-all">
                  <Edit3 className="w-4 h-4" />
                  Edit Profile Intel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Stats Summary (Readiness Focus) */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4">
          <div className="flex-1 lg:w-48 p-6 rounded-[2rem] bg-card border border-border shadow-xl hover:border-blue-500/30 transition-all group">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Market Readiness</p>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-4xl font-black text-foreground">{data.capabilityScore}</span>
              <span className="text-sm font-bold text-blue-500 pb-1.5">/100</span>
            </div>
            <div className="w-full h-1.5 bg-input rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${data.capabilityScore}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
              />
            </div>
          </div>

          <div className="flex-1 lg:w-48 p-6 rounded-[2rem] bg-indigo-600 shadow-2xl shadow-indigo-600/20 text-white group cursor-pointer hover:scale-[1.02] transition-all">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Career Growth</p>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
            <div className="text-3xl font-black mb-1">+{data.normalizedLearningGain}%</div>
            <p className="text-[10px] font-bold opacity-70">Mastery Velocity</p>
          </div>
        </div>
      </div>

      {/* ── TIER 2: THE GROWTH NARRATIVE ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        
        {/* Consistency Index */}
        <div className="p-8 rounded-[2.5rem] bg-card border border-border group hover:border-amber-500/30 transition-all">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">Consistency Index</h3>
              <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Resilience Tracking</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="text-center flex-1 border-r border-border">
              <p className="text-3xl font-black text-foreground mb-1">{data.currentStreak}</p>
              <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Day Streak</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-3xl font-black text-foreground mb-1">{data.totalQuizzes}</p>
              <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Quizzes</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-center">
            <p className="text-xs font-bold text-amber-600">
              {data.currentStreak >= 3 ? "🔥 You're on a roll!" : "Keep the momentum going!"}
            </p>
          </div>
        </div>

        {/* Effort Pattern */}
        <div className="p-8 rounded-[2.5rem] bg-card border border-border group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">Effort Pattern</h3>
              <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Growth Mindset</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-end mb-2">
              <p className="text-xs font-black text-foreground">Consistency Score</p>
              <p className="text-2xl font-black text-emerald-500">{data.consistencyScore}%</p>
            </div>
            <div className="w-full h-2 bg-input rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${data.consistencyScore}%` }}
                transition={{ duration: 1.5, delay: 0.2 }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
          </div>

          <p className="text-xs font-bold text-text-secondary leading-relaxed">
            Your pattern shows <span className="text-emerald-500">strong dedication</span> to regular practice, which is key to long-term skill retention.
          </p>
        </div>

        {/* Temporal Learning Curve (T-04) */}
        <div className="lg:col-span-1 p-8 rounded-[2.5rem] bg-card border border-border group hover:border-blue-500/30 transition-all flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-foreground">Learning Velocity</h3>
              <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Mastery Trend</p>
            </div>
            <BarChart3 className="w-5 h-5 text-text-muted" />
          </div>

          <div className="flex-1 min-h-[160px] flex items-end gap-2 px-2 relative">
             <div className="absolute inset-x-0 top-0 h-px bg-border/50" />
             <div className="absolute inset-x-0 top-1/2 h-px bg-border/50" />
             
             {data.learningCurve && data.learningCurve.length > 0 ? (
                data.learningCurve.slice(-8).map((point: any, i: number) => (
                  <div key={i} className="flex-1 flex flex-col items-center group/bar relative h-full justify-end">
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all bg-[#111] border border-white/10 text-white text-[10px] font-bold px-3 py-2 rounded-xl pointer-events-none whitespace-nowrap z-20 shadow-2xl scale-95 group-hover/bar:scale-100">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-3 h-3 text-blue-400" />
                        <span>Capability: {point.capability}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-3 h-3 text-emerald-400" />
                        <span>Score: {point.quizScore}%</span>
                      </div>
                    </div>
                    
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${point.mastery}%` }}
                      transition={{ delay: i * 0.05, duration: 1, ease: "easeOut" }}
                      className="w-full bg-gradient-to-t from-blue-600/80 to-blue-400 rounded-t-lg relative group-hover/bar:from-blue-500 group-hover/bar:to-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all"
                    >
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black text-blue-400 opacity-0 group-hover/bar:opacity-100 transition-opacity">
                        {point.mastery}%
                      </div>
                    </motion.div>
                    
                    <div className="mt-3 text-[9px] font-black text-text-tertiary uppercase tracking-tighter">Att {point.attempt}</div>
                  </div>
                ))
             ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted gap-2">
                  <Info className="w-6 h-6 opacity-20" />
                  <p className="text-[10px] font-bold italic uppercase tracking-widest">Awaiting Data</p>
                </div>
             )}
          </div>
        </div>
      </div>

      {/* ── TIER 3: THE COGNITIVE MAP (T-05) ── */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
            <BrainCircuit className="w-6 h-6 text-violet-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground">Cognitive Skill Matrix</h2>
            <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest italic">Prioritized by Zone of Proximal Development (ZPD)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.masteryGrid && data.masteryGrid.length > 0 ? (
            [...data.masteryGrid]
              .sort((a, b) => {
                const priority: Record<string, number> = { in_zpd: 0, below_zpd: 1, mastered: 2 };
                return priority[a.zpd] - priority[b.zpd];
              })
              .map((skill: any, i: number) => (
                <motion.div 
                  key={skill.subtopicId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-6 rounded-3xl bg-card border border-border hover:border-violet-500/20 transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary group-hover:text-foreground transition-colors">
                      {skill.subtopicId}
                    </span>
                    <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${getZPDStyle(skill.zpd)}`}>
                      {getZPDLabel(skill.zpd)}
                    </div>
                  </div>

                  <div className="flex items-end gap-3 mb-4">
                    <span className="text-3xl font-black text-foreground">{skill.mastery}%</span>
                    <span className="text-[10px] font-bold text-text-tertiary pb-1.5 uppercase">Mastery</span>
                  </div>

                  <div className="w-full h-1.5 bg-input rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.mastery}%` }}
                      transition={{ duration: 1.5, delay: 0.1 + i * 0.05 }}
                      className={`h-full rounded-full ${getZPDProgressColor(skill.zpd)}`}
                    />
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-[10px] font-bold text-text-tertiary">
                    <span>{skill.attempts} Assessments</span>
                    <span>{skill.correct} Correct</span>
                  </div>
                </motion.div>
              ))
          ) : (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-[2.5rem] text-text-muted italic font-medium">
              Initializing Skill Matrix from Bayesian Baseline...
            </div>
          )}
        </div>
      </div>

      {/* ── TIER 4: THE PROFESSIONAL FOOTPRINT (T-06) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="p-8 rounded-[2.5rem] bg-card border border-border group hover:border-emerald-500/20 transition-all">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Globe className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground">Real-World Impact</h2>
                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">UN SDG 8 Distribution</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-foreground">{data.totalOutcomes}</span>
              <p className="text-[9px] font-black text-text-tertiary uppercase">Verified Outcomes</p>
            </div>
          </div>

          <div className="space-y-6">
            {Object.entries(data.outcomeDistribution || {}).length > 0 ? (
              Object.entries(data.outcomeDistribution).map(([type, count]: [string, any], i) => (
                <div key={type} className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-text-secondary">{type.replace('_', ' ')}</span>
                    <span className="text-foreground">{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-input rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / data.totalOutcomes) * 100}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full bg-emerald-500/60 rounded-full"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center bg-input/30 rounded-3xl border border-dashed border-border">
                <p className="text-xs font-bold text-text-tertiary italic">Reporting Impact Patterns...</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-card border border-border flex flex-col">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground">Career Milestones</h2>
              <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Timeline of Advancement</p>
            </div>
          </div>

          <div className="flex-1 space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-border/50">
            {[
              { date: data.memberSince, label: "Journey Commenced", desc: "Baseline evaluation initialized", icon: <Sparkles className="w-3 h-3" />, color: "bg-blue-500" },
              { date: "Recent", label: "Diagnostic Baseline", desc: "BKT Engine Calibration Complete", icon: <Target className="w-3 h-3" />, color: "bg-indigo-500" },
              { date: "In Progress", label: `${data.pathTitle} Mastery`, desc: "Current Cognitive Objective", icon: <TrendingUp className="w-3 h-3" />, color: "bg-violet-500" },
            ].map((milestone, i) => (
              <div key={i} className="relative pl-10">
                <div className={`absolute left-0 top-1 w-6 h-6 rounded-full ${milestone.color} flex items-center justify-center text-white shadow-lg shadow-blue-500/10 z-10 border-4 border-background`}>
                  {milestone.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">{milestone.date}</span>
                  <h3 className="text-sm font-black text-foreground">{milestone.label}</h3>
                  <p className="text-[10px] font-bold text-text-tertiary">{milestone.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI REFLECTION ENGINE (T-07) ── */}
      <div className="p-12 rounded-[3rem] bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700 shadow-2xl shadow-blue-600/20 text-white relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
            <Sparkles className="w-32 h-32" />
         </div>
         <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-[0.2em]">
                Personal Learning Reflection
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Live Analysis
              </div>
            </div>
            
            <h2 className="text-4xl font-black mb-8 tracking-tight">How far you've come...</h2>

            <div className="w-full text-left bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem] mb-10 min-h-[200px] relative">
              {isLoadingAnalysis && !completion ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin opacity-50" />
                  <p className="text-xs font-bold uppercase tracking-widest opacity-50">Synthesizing BKT History...</p>
                </div>
              ) : completion ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{completion}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-10 opacity-60">
                   <Brain className="w-12 h-12 mb-4 opacity-20" />
                   <p className="text-sm font-medium italic">Click the button below to generate a deep cognitive analysis of your current career trajectory.</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => complete("")}
              disabled={isLoadingAnalysis}
              className="group flex items-center gap-3 px-10 py-5 rounded-[2rem] bg-white text-indigo-600 font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl disabled:opacity-50 disabled:scale-100"
            >
              {isLoadingAnalysis ? "Analyzing Growth..." : "Generate AI Reflection"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
         </div>
      </div>

      {/* ── FOOTER: RESEARCH SEAL ── */}
      <div className="mt-20 pt-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8 opacity-50">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center border border-foreground/20 grayscale">
              <Brain className="w-5 h-5 text-foreground" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Verified by Bayesian Tracing</p>
              <p className="text-[8px] font-bold text-text-tertiary">CareerOrbit Cognitive Engine v3.1</p>
           </div>
        </div>
        <div className="flex items-center gap-6 text-[8px] font-black uppercase tracking-widest text-text-tertiary">
           <span>Research-Grade Dashboard</span>
           <div className="w-1 h-1 rounded-full bg-border" />
           <span>NSQF Level Aligned</span>
           <div className="w-1 h-1 rounded-full bg-border" />
           <span>Student-Centric Reporting</span>
        </div>
      </div>

    </div>
  );
}
