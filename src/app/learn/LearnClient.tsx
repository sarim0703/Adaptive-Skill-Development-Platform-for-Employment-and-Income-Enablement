"use client";

import { useState, useEffect, useRef } from "react";
import { PlayCircle, Clock, CheckCircle2, AlertTriangle, BookOpen, Flame, LogOut, TrendingUp, Target, Circle, Sparkles, ChevronRight, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import QuizModal from "@/components/QuizModal";
import MentorChat from "@/components/MentorChat";
import { checkProactiveTriggers } from "@/app/actions";
import { signOut } from "next-auth/react";
import { useLanguage } from "@/context/LanguageContext";

type LearnClientProps = {
  roadmapId: string;
  moduleId: number;
  subtopic: {
    subtopic_id: string;
    title: string;
    practical_task: string;
    task_type: string;
    youtube_search_query: string;
    status: string;
    attempt_count?: number;
    [key: string]: unknown;
  };
  userModel: { capabilityScore?: number; pathSwitchSuggested?: boolean; currentStreak?: number; quizAverage?: number } | null;
  pathTitle: string;
  userName?: string;
  userLocation?: string;
  totalSubtopics: number;
  completedSubtopics: number;
  currentModuleTitle: string;
  currentModuleSubtopics: { title: string; status: string }[];
  currentSubtopicIndex: number;
  totalModules: number;
  currentModuleNumber: number;
};

const TASK_ICONS: Record<string, string> = {
  install: "📲", create: "✏️", apply: "🎯", practice: "🔄", submit: "📤", call: "📞",
};

export default function LearnClient({
  roadmapId, moduleId, subtopic, userModel, pathTitle, userName, userLocation,
  totalSubtopics, completedSubtopics, currentModuleTitle, currentModuleSubtopics,
  currentSubtopicIndex, totalModules, currentModuleNumber,
}: LearnClientProps) {
  const { t } = useLanguage();
  const [timeSpent, setTimeSpent] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [activeTrigger, setActiveTrigger] = useState<string | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      timeRef.current += 1;
      setTimeSpent(timeRef.current);
      if (timeRef.current % 30 === 0) {
        checkProactiveTriggers(subtopic.subtopic_id as string, timeRef.current).then(trigger => {
          if (trigger) setActiveTrigger(trigger);
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [subtopic.subtopic_id]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const getGreetingText = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("learn.greeting.morning");
    if (hour < 17) return t("learn.greeting.afternoon");
    return t("learn.greeting.evening");
  };

  const capScore = userModel?.capabilityScore ?? 50;
  const streak = userModel?.currentStreak ?? 0;
  const overallProgress = totalSubtopics > 0 ? Math.round((completedSubtopics / totalSubtopics) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 animate-fadeInUp">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#007AFF]/10 text-[#007AFF] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
            <LayoutDashboard className="w-3 h-3" />
            {pathTitle}
          </div>
          <h1 className="text-3xl font-bold text-slate-800 leading-tight">
            {getGreetingText()}, {userName || 'Learner'} 👋
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {t("learn.module")} {currentModuleNumber} / {totalModules}: {currentModuleTitle}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Session Timer</span>
            <span className="text-sm font-mono font-bold text-slate-700">{formatTime(timeSpent)}</span>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <div className="flex items-center gap-2 px-1">
            <Flame className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-bold text-slate-800">{streak}</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left/Main Column: Focused Task */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Status Banners */}
          {subtopic.status === 'needs_review' && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-5 rounded-2xl flex items-start gap-3 shadow-sm">
              <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm uppercase tracking-wide">{t("learn.review.title")}</p>
                <p className="text-sm text-amber-700 mt-1">{t("learn.review.sub")}</p>
              </div>
            </div>
          )}

          {userModel?.pathSwitchSuggested && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 justify-between shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-rose-500 flex-shrink-0" />
                <div>
                  <p className="font-bold text-sm uppercase tracking-wide">{t("learn.pathSwitch.title")}</p>
                  <p className="text-sm text-rose-700 mt-1">{t("learn.pathSwitch.sub")}</p>
                </div>
              </div>
              <Link href="/path-selection" className="btn-primary py-2 px-5 text-xs rounded-full">
                {t("learn.pathSwitch.btn")}
              </Link>
            </div>
          )}

          {/* Core Task Card */}
          <div className="card p-8 md:p-10 relative overflow-hidden group">
            {/* Type Accent */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#007AFF]" />
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl shadow-inner border border-slate-100">
                  {TASK_ICONS[subtopic.task_type] || '📝'}
                </div>
                <div>
                  <span className="text-[10px] font-black text-[#007AFF] uppercase tracking-[0.2em]">Step {currentSubtopicIndex + 1} of {currentModuleSubtopics.length}</span>
                  <h2 className="text-2xl font-bold text-slate-800 mt-0.5">{subtopic.title}</h2>
                </div>
              </div>
            </div>

            {/* Practical Task Instructions */}
            <div className="bg-slate-50/80 rounded-3xl p-8 mb-8 border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-[#007AFF]" />
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("learn.whatToDo")}</h3>
              </div>
              <p className="text-xl font-medium text-slate-700 leading-relaxed italic">
                &quot;{subtopic.practical_task}&quot;
              </p>
            </div>

            {/* Resource Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(subtopic.youtube_search_query)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#FF0000]/5 text-[#FF0000] px-5 py-3 rounded-2xl text-sm font-bold border border-[#FF0000]/10 hover:bg-[#FF0000]/10 transition-all"
              >
                <PlayCircle className="w-5 h-5" />
                {t("learn.watchTutorial")}
              </a>
              
              <div className="flex items-center gap-2 bg-slate-100 text-slate-500 px-4 py-3 rounded-2xl text-sm font-bold border border-slate-200">
                <BookOpen className="w-5 h-5" />
                Documentation
              </div>
            </div>

            {/* Primary Action */}
            <button
              onClick={() => setShowQuiz(true)}
              className="btn-primary w-full py-5 text-xl font-bold shadow-2xl shadow-blue-500/20 group rounded-2xl"
            >
              <CheckCircle2 className="w-6 h-6" />
              {t("learn.complete")}
              <ChevronRight className="w-5 h-5 ml-auto group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Quick Tip Widget */}
          <div className="glass-card p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">{t("learn.quickTip")}</h4>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {subtopic.task_type === 'install' && t("learn.tip.install")}
                {subtopic.task_type === 'create' && t("learn.tip.create")}
                {subtopic.task_type === 'apply' && t("learn.tip.apply")}
                {subtopic.task_type === 'practice' && t("learn.tip.practice")}
                {subtopic.task_type === 'submit' && t("learn.tip.submit")}
                {subtopic.task_type === 'call' && t("learn.tip.call")}
                {!TASK_ICONS[subtopic.task_type] && t("learn.tip.default")}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Information & Overview */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Progress Summary Widget */}
          <div className="card p-6 border-b-4 border-b-[#34C759]">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Learning Analytics</h3>
            <div className="space-y-6">
              {/* Radial or Visual Progress */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-slate-700">Path Completion</span>
                  <span className="text-2xl font-black text-[#007AFF]">{overallProgress}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div className="h-full bg-gradient-to-r from-[#007AFF] to-[#5856D6] rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(0,122,255,0.4)]" style={{ width: `${overallProgress}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Capability</div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#007AFF]" />
                    <span className="text-lg font-black text-slate-800">{capScore}</span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Milestones</div>
                  <div className="flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-[#34C759]" />
                    <span className="text-lg font-black text-slate-800">{completedSubtopics}/{totalSubtopics}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Module Roadmap Widget */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Module Roadmap</h3>
              <Link href="/learn/outline" className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-blue-50 hover:text-blue-500 transition-colors border border-slate-100">
                <BookOpen className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="space-y-4 relative">
              {/* Vertical Line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100" />
              
              {currentModuleSubtopics.map((sub, idx) => (
                <div key={idx} className={`flex items-start gap-4 relative group ${
                  idx === currentSubtopicIndex ? '' : 'opacity-60'
                }`}>
                  <div className={`mt-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black z-10 border-2 transition-all ${
                    sub.status === 'complete' ? 'bg-[#34C759] border-[#34C759] text-white' :
                    idx === currentSubtopicIndex ? 'bg-white border-[#007AFF] text-[#007AFF] shadow-lg shadow-blue-500/20' :
                    'bg-white border-slate-200 text-slate-300'
                  }`}>
                    {sub.status === 'complete' ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <div className="flex-1">
                    <span className={`text-sm font-bold block leading-tight ${
                      idx === currentSubtopicIndex ? 'text-slate-800' : 'text-slate-500'
                    }`}>
                      {sub.title}
                    </span>
                    {idx === currentSubtopicIndex && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#007AFF] uppercase mt-1">
                        Current Focus
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showQuiz && (
        <QuizModal
          roadmapId={roadmapId}
          moduleId={moduleId}
          subtopicId={subtopic.subtopic_id}
          subtopicTitle={subtopic.title}
          practicalTask={subtopic.practical_task}
          capabilityScore={capScore}
          timeSpent={timeSpent}
          attemptNumber={(subtopic.attempt_count ?? 0) + 1}
          onClose={() => setShowQuiz(false)}
        />
      )}

      {/* AI Assistant */}
      <MentorChat
        subtopicId={subtopic.subtopic_id}
        triggerType={activeTrigger}
        timeSpentSeconds={timeSpent}
        isPulsing={activeTrigger !== null}
      />
    </div>
  );
}
