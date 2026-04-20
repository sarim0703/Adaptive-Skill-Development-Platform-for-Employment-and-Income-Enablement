"use client";

import { useState, useEffect, useRef } from "react";
import { PlayCircle, Clock, CheckCircle2, AlertTriangle, BookOpen, Flame, LogOut, TrendingUp, Target, Circle } from "lucide-react";
import Link from "next/link";
import QuizModal from "@/components/QuizModal";
import MentorChat from "@/components/MentorChat";
import { checkProactiveTriggers } from "@/app/actions";
import { signOut } from "next-auth/react";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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
    <div className="min-h-screen bg-warm-gradient">
      {/* Top Nav */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="font-semibold text-slate-800 text-sm">SkillSync</span>
            <span className="text-slate-300">|</span>
            <span className="text-sm text-slate-500 truncate max-w-[150px] md:max-w-none">{pathTitle}</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono text-xs">{formatTime(timeSpent)}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/auth" })}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 animate-fadeInUp">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            {getGreetingText()}, {userName || 'Learner'} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {userLocation && `${userLocation} · `}{t("learn.module")} {currentModuleNumber} {t("onboarding.of")} {totalModules} · {pathTitle}
          </p>
        </div>

        {/* Status Banners */}
        {subtopic.status === 'needs_review' && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">{t("learn.review.title")}</p>
              <p className="text-sm text-amber-600 mt-0.5">{t("learn.review.sub")}</p>
            </div>
          </div>
        )}

        {userModel?.pathSwitchSuggested && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">{t("learn.pathSwitch.title")}</p>
                <p className="text-sm text-red-600 mt-0.5">{t("learn.pathSwitch.sub")}</p>
              </div>
            </div>
            <Link href="/path-selection" className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
              {t("learn.pathSwitch.btn")}
            </Link>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left Column — Main Task (2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Task Card */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{TASK_ICONS[subtopic.task_type] || '📝'}</span>
                  <span className="badge badge-indigo text-xs uppercase tracking-wide">{subtopic.task_type}</span>
                </div>
                <span className="text-xs text-slate-400">{t("learn.task")} {currentSubtopicIndex + 1} {t("onboarding.of")} {currentModuleSubtopics.length}</span>
              </div>

              <h2 className="text-lg font-bold text-slate-800 mb-4">{subtopic.title}</h2>

              {/* Practical Task */}
              <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-xl mb-5">
                <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">{t("learn.whatToDo")}</h3>
                <p className="text-slate-700 leading-relaxed">{subtopic.practical_task}</p>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(subtopic.youtube_search_query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors bg-red-50 px-3 py-1.5 rounded-lg"
                >
                  <PlayCircle className="w-4 h-4" />
                  {t("learn.watchTutorial")}
                </a>
              </div>

              <button
                onClick={() => setShowQuiz(true)}
                className="btn-primary w-full py-3.5 text-base"
              >
                <CheckCircle2 className="w-5 h-5" />
                {t("learn.complete")}
              </button>
            </div>
          </div>

          {/* Right Column — Sidebar */}
          <div className="space-y-5">
            {/* Progress Card */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">{t("learn.progress")}</h3>
              <div className="space-y-4">
                {/* Overall Progress */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-slate-500">{t("learn.overall")}</span>
                    <span className="text-xs font-semibold text-indigo-600">{overallProgress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${overallProgress}%` }} />
                  </div>
                </div>

                {/* Capability Score */}
                <div className="flex items-center justify-between py-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm text-slate-600">{t("learn.capability")}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{capScore}/100</span>
                </div>

                {/* Streak */}
                <div className="flex items-center justify-between py-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-slate-600">{t("learn.streak")}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    {streak > 0 ? `${streak} day${streak > 1 ? 's' : ''} 🔥` : t("learn.streakStart")}
                  </span>
                </div>

                {/* Tasks Completed */}
                <div className="flex items-center justify-between py-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-slate-600">{t("learn.completedTasks")}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{completedSubtopics}/{totalSubtopics} {t("learn.task").toLowerCase()}s</span>
                </div>
              </div>
            </div>

            {/* Module Progress Card */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-800">{t("learn.module")} {currentModuleNumber}</h3>
                <Link href="/learn/outline" className="text-xs text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  {t("learn.fullOutline")}
                </Link>
              </div>
              <p className="text-xs text-slate-400 mb-3">{currentModuleTitle}</p>
              <div className="space-y-2">
                {currentModuleSubtopics.map((sub, idx) => (
                  <div key={idx} className={`flex items-center gap-2.5 py-1.5 px-2 rounded-lg text-sm ${
                    idx === currentSubtopicIndex ? 'bg-indigo-50 text-indigo-700 font-medium' : ''
                  }`}>
                    {sub.status === 'complete' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : sub.status === 'active' || sub.status === 'needs_review' ? (
                      <div className="w-4 h-4 rounded-full border-2 border-indigo-400 flex-shrink-0 animate-pulse-soft" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                    )}
                    <span className={`truncate ${sub.status === 'complete' ? 'text-slate-400 line-through' : sub.status === 'locked' ? 'text-slate-400' : 'text-slate-700'}`}>
                      {sub.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tips Card */}
            <div className="card p-5 bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
              <h3 className="text-sm font-semibold text-indigo-800 mb-2">💡 {t("learn.quickTip")}</h3>
              <p className="text-xs text-indigo-600 leading-relaxed">
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

      <MentorChat
        subtopicId={subtopic.subtopic_id}
        triggerType={activeTrigger}
        timeSpentSeconds={timeSpent}
        isPulsing={activeTrigger !== null}
      />
    </div>
  );
}
