"use client";

import { useState, useEffect, useRef } from "react";
import {
  PlayCircle, Clock, CheckCircle2, AlertTriangle, BookOpen,
  Flame, Target, ChevronRight, ChevronDown, Loader2,
  Zap, ExternalLink, FileText, Sparkles, ListChecks, Globe
} from "lucide-react";
import Link from "next/link";
import QuizModal from "@/components/QuizModal";
import MentorChat from "@/components/MentorChat";
import { checkProactiveTriggers } from "@/app/actions";
import { useLanguage } from "@/context/LanguageContext";

type ModuleData = {
  module_id: number;
  module_title: string;
  subtopics: {
    status: string; subtopic_id: string; title: string;
    task_type: string; practical_task: string;
    youtube_search_query: string; attempt_count?: number;
    key_learning_notes?: string; [key: string]: unknown;
  }[];
};

type LearnClientProps = {
  roadmapId: string;
  moduleId: number;
  subtopic: {
    subtopic_id: string; title: string; practical_task: string;
    task_type: string; youtube_search_query: string; status: string;
    attempt_count?: number; key_learning_notes?: string;
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
  allModules: ModuleData[];
};

const TASK_ICONS: Record<string, string> = {
  install: "📲", create: "✏️", apply: "🎯", practice: "🔄", submit: "📤", call: "📞",
};

export default function LearnClient({
  roadmapId, moduleId, subtopic, userModel, pathTitle, userName,
  totalSubtopics, completedSubtopics, currentModuleTitle,
  currentSubtopicIndex, totalModules, currentModuleNumber, allModules,
  isExploring
}: LearnClientProps & { isExploring?: boolean }) {
  const { t } = useLanguage();
  const [timeSpent, setTimeSpent] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [activeTrigger, setActiveTrigger] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<{ videoId: string; title: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"task" | "notes">("task");
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([moduleId]));
  const timeRef = useRef(0);

  const capScore = userModel?.capabilityScore ?? 50;
  const streak = userModel?.currentStreak ?? 0;
  const overallProgress = totalSubtopics > 0 ? Math.round((completedSubtopics / totalSubtopics) * 100) : 0;

  // Fetch video
  useEffect(() => {
    async function getGroundedVideo() {
      if (!subtopic.youtube_search_query) return;
      try {
        const apiKey = "AIzaSyCVtyevZxmJ3UHMRkx1-KdGK5Rf67wiL9U";
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(subtopic.youtube_search_query)}&type=video&videoCaption=closedCaption&relevanceLanguage=en&videoDuration=medium&key=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.items?.[0]) {
          setVideoData({ videoId: data.items[0].id.videoId, title: data.items[0].snippet.title });
        }
      } catch (err) { console.error("Video fetch error:", err); }
    }
    getGroundedVideo();
  }, [subtopic.youtube_search_query]);



  // Timer + proactive triggers
  useEffect(() => {
    const timer = setInterval(() => {
      timeRef.current += 1;
      setTimeSpent(timeRef.current);
      if (timeRef.current % 30 === 0) {
        checkProactiveTriggers(subtopic.subtopic_id, timeRef.current).then(trigger => {
          if (trigger) setActiveTrigger(trigger);
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [subtopic.subtopic_id]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const getGreetingText = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("learn.greeting.morning");
    if (hour < 17) return t("learn.greeting.afternoon");
    return t("learn.greeting.evening");
  };

  const toggleModule = (id: number) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Progress ring
  const ringRadius = 40;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (overallProgress / 100) * ringCircumference;

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden transition-colors duration-500">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-tech-grid opacity-5 pointer-events-none" />
      <div className="fixed w-[500px] h-[500px] bg-blue-600/5 -top-40 -right-40 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed w-[400px] h-[400px] bg-violet-600/5 -bottom-40 -left-40 rounded-full blur-[120px] pointer-events-none" />

      {/* ═══ MAIN LAYOUT ═══ */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-24 relative z-10">

        {/* ── Top Status Strip ── */}
        <div className="flex items-center justify-between py-4 mb-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-medium text-text-tertiary">
              <span>{pathTitle}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-text-secondary">Module {currentModuleNumber}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground">Lesson {currentSubtopicIndex + 1}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-mono font-bold text-foreground tabular-nums">{formatTime(timeSpent)}</span>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-bold text-amber-400">{streak}</span>
              </div>
            )}
          </div>
        </div>

        {/* Exploration Banner */}
        {isExploring && (
          <div className="relative group mb-6">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-violet-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative flex items-center justify-between p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground tracking-tight">Exploration Mode Active</h4>
                  <p className="text-[11px] text-slate-400">You are viewing a future lesson. Mastery quizzes are locked until you reach this stage.</p>
                </div>
              </div>
              <Link href="/learn" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                Return to Active Task
              </Link>
            </div>
          </div>
        )}

        {/* Banners */}
        {subtopic.status === "needs_review" && (
          <div className="flex items-start gap-3 p-4 mb-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-400">{t("learn.review.title")}</p>
              <p className="text-xs text-amber-400/60 mt-0.5">{t("learn.review.sub")}</p>
            </div>
          </div>
        )}
        {userModel?.pathSwitchSuggested && (
          <div className="flex items-center justify-between p-4 mb-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-rose-400">{t("learn.pathSwitch.title")}</p>
                <p className="text-xs text-rose-400/60 mt-0.5">{t("learn.pathSwitch.sub")}</p>
              </div>
            </div>
            <Link href="/path-selection" className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-foreground text-background rounded-xl hover:bg-rose-500 hover:text-white transition-all">
              {t("learn.pathSwitch.btn")}
            </Link>
          </div>
        )}

        {/* ── Two-Column Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ═══ LEFT COLUMN: Video + Content (8 cols) ═══ */}
          <div className="lg:col-span-8 space-y-5">

            {/* Video Player Card */}
            <div className="rounded-2xl overflow-hidden bg-card border border-border shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              {videoData ? (
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${videoData.videoId}?modestbranding=1&rel=0`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={videoData.title}
                  />
                </div>
              ) : (
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card">
                    <Loader2 className="w-8 h-8 text-slate-600 animate-spin" />
                    <p className="text-slate-600 font-bold text-[9px] uppercase tracking-widest">{t("quiz.preparing")}</p>
                  </div>
                </div>
              )}
              {/* Video Info Bar */}
              {videoData && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-card">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <PlayCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-xs text-slate-400 font-medium truncate">{videoData.title}</p>
                  </div>
                  <a href={`https://www.youtube.com/watch?v=${videoData.videoId}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[9px] font-bold text-slate-500 hover:text-foreground transition-colors uppercase tracking-widest flex-shrink-0 ml-3">
                    YouTube <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Lesson Header */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-lg">
                  {TASK_ICONS[subtopic.task_type] || "📝"}
                </div>
                <div>
                  <div className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">
                    Step {currentSubtopicIndex + 1} · {subtopic.task_type}
                    {subtopic.attempt_count !== undefined && subtopic.attempt_count > 0 && (
                      <span className="text-amber-400 ml-2">· Attempt {(subtopic.attempt_count ?? 0) + 1}</span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-foreground leading-tight">{subtopic.title}</h2>
                </div>
              </div>
            </div>

            {/* Tabbed Content */}
            <div className="rounded-2xl bg-card border border-border overflow-hidden">
              {/* Tab Bar */}
              <div className="flex border-b border-border">
                <button onClick={() => setActiveTab("task")}
                  className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                    activeTab === "task" ? "border-blue-500 text-foreground bg-white/[0.02]" : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}>
                  <Target className="w-3.5 h-3.5" /> {t("learn.whatToDo")}
                </button>
                <button onClick={() => setActiveTab("notes")}
                  className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                    activeTab === "notes" ? "border-blue-500 text-foreground bg-white/[0.02]" : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}>
                  <BookOpen className="w-3.5 h-3.5" /> Notes
                </button>

              </div>

              {/* Tab Content */}
              <div className="p-5">
                {activeTab === "task" && (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-blue-500/[0.03] border border-blue-500/10 p-5 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                      <p className="text-base text-foreground leading-relaxed font-medium pl-3">{subtopic.practical_task}</p>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/[0.03] border border-amber-500/10">
                      <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">{t("learn.quickTip")}</h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          {subtopic.task_type === "install" && t("learn.tip.install")}
                          {subtopic.task_type === "create" && t("learn.tip.create")}
                          {subtopic.task_type === "apply" && t("learn.tip.apply")}
                          {subtopic.task_type === "practice" && t("learn.tip.practice")}
                          {subtopic.task_type === "submit" && t("learn.tip.submit")}
                          {subtopic.task_type === "call" && t("learn.tip.call")}
                          {!["install","create","apply","practice","submit","call"].includes(subtopic.task_type) && t("learn.tip.default")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "notes" && (
                  subtopic.key_learning_notes ? (
                    <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{subtopic.key_learning_notes}</div>
                  ) : (
                    <div className="text-center py-8 text-text-secondary">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-xs font-medium">No notes available for this lesson.</p>
                    </div>
                  )
                )}

              </div>
            </div>

            {/* CTA */}
            {isExploring ? (
              <Link href="/learn"
                className="w-full py-5 rounded-2xl bg-card border border-border text-foreground font-bold text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white/10 transition-all group">
                <PlayCircle className="w-5 h-5 text-blue-400" />
                Return to Active Lesson
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <button onClick={() => setShowQuiz(true)}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm uppercase tracking-[0.2em] shadow-[0_15px_40px_rgba(59,130,246,0.25)] flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-all group">
                <CheckCircle2 className="w-5 h-5" />
                {t("learn.complete")}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

          {/* ═══ RIGHT COLUMN: Sidebar (4 cols) ═══ */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-28 lg:self-start">

            {/* Progress Card */}
            <div className="rounded-2xl bg-card border border-border p-5">
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <svg width="96" height="96" className="-rotate-90">
                    <circle cx="48" cy="48" r={ringRadius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                    <circle cx="48" cy="48" r={ringRadius} fill="none" stroke="url(#pgGrad)" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={ringCircumference} strokeDashoffset={ringOffset} className="transition-all duration-1000" />
                    <defs><linearGradient id="pgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" /><stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient></defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-foreground tabular-nums">{overallProgress}%</span>
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Path Progress</h3>
                  <p className="text-sm font-bold text-foreground">{completedSubtopics} <span className="text-slate-500 font-normal">of {totalSubtopics} lessons</span></p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Capability: {capScore}/100</p>
                </div>
              </div>
            </div>

            {/* Course Curriculum */}
            <div className="rounded-2xl bg-card border border-border overflow-hidden">
              <div className="px-5 py-5 border-b border-border flex items-center justify-between">
                <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Course Content</h3>
                <span className="text-[10px] text-slate-600">{totalModules} modules</span>
              </div>

              <div className="max-h-[72vh] overflow-y-auto custom-scrollbar">
                {allModules.map((mod) => {
                  const isExpanded = expandedModules.has(mod.module_id);
                  const completedInMod = mod.subtopics?.filter(s => s.status === "complete").length ?? 0;
                  const totalInMod = mod.subtopics?.length ?? 0;
                  const isCurrent = mod.module_id === moduleId;

                  return (
                    <div key={mod.module_id} className="border-b border-border last:border-b-0">
                      <button onClick={() => toggleModule(mod.module_id)}
                        className={`w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-white/[0.02] transition-colors ${isCurrent ? "bg-white/[0.03]" : ""}`}>
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-600 flex-shrink-0 transition-transform duration-200 ${isExpanded ? "" : "-rotate-90"}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold truncate ${isCurrent ? "text-foreground" : "text-slate-400"}`}>
                            {mod.module_title}
                          </p>
                          <p className="text-[10px] text-slate-600 mt-0.5">{completedInMod}/{totalInMod} done</p>
                        </div>
                      </button>

                      {isExpanded && mod.subtopics && (
                        <div className="pb-2">
                          {mod.subtopics.map((st, idx) => {
                            const isActive = st.subtopic_id === subtopic.subtopic_id;
                            const isComplete = st.status === "complete";
                            return (
                              <Link key={st.subtopic_id} href={`/learn?exploreId=${st.subtopic_id}`}
                                className={`flex items-center gap-3 pl-10 pr-5 py-2 transition-colors group ${isActive ? "bg-blue-500/[0.05]" : "hover:bg-white/[0.02]"}`}>
                                <div className="flex-shrink-0">
                                  {isComplete ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  ) : isActive ? (
                                    <div className="w-4 h-4 rounded-full bg-blue-500/20 border-2 border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border border-slate-700 group-hover:border-slate-500" />
                                  )}
                                </div>
                                <span className={`text-xs leading-snug truncate ${
                                  isActive ? "text-foreground font-semibold" : isComplete ? "text-slate-500" : "text-slate-400 group-hover:text-slate-200"
                                }`}>
                                  {st.title}
                                </span>
                                {isActive && <Zap className="w-3 h-3 text-blue-400 flex-shrink-0 ml-auto" />}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {showQuiz && (
        <QuizModal roadmapId={roadmapId} moduleId={moduleId}
          subtopicId={subtopic.subtopic_id} subtopicTitle={subtopic.title}
          practicalTask={subtopic.practical_task} youtubeSearchQuery={subtopic.youtube_search_query}
          capabilityScore={capScore} timeSpent={timeSpent}
          attemptNumber={(subtopic.attempt_count ?? 0) + 1} onClose={() => setShowQuiz(false)} />
      )}

      {/* AI Mentor */}
      <MentorChat subtopicId={subtopic.subtopic_id} triggerType={activeTrigger}
        timeSpentSeconds={timeSpent} isPulsing={activeTrigger !== null} />
    </div>
  );
}
