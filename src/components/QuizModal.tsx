"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, XCircle, Trophy, Flame, ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { submitQuizResult } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { quizSchema } from "@/lib/ai/schemas";

type QuizModalProps = {
  roadmapId: string;
  moduleId: number;
  subtopicId: string;
  subtopicTitle: string;
  practicalTask: string;
  youtubeSearchQuery: string;
  capabilityScore: number;
  timeSpent: number;
  attemptNumber: number;
  onClose: () => void;
};

const MOTIVATIONAL_PASS = [
  "You're on fire! 🔥 Keep this momentum going!",
  "Excellent work! You truly understood this lesson.",
  "Nailed it! You're one step closer to mastery.",
  "Brilliant! Your skills are growing fast.",
];

const MOTIVATIONAL_FAIL = [
  "Every expert was once a beginner. Review and try again!",
  "Learning is a journey — you're getting closer each time.",
  "Don't give up! Watch the video again and you'll ace it.",
  "Mistakes are proof you're trying. One more attempt!",
];

export default function QuizModal({
  roadmapId, moduleId, subtopicId, subtopicTitle, practicalTask,
  youtubeSearchQuery, capabilityScore, timeSpent, attemptNumber, onClose,
}: QuizModalProps) {
  const { t, language } = useLanguage();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [resultData, setResultData] = useState<{ score: number; passed: boolean; correct: number; total: number } | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const router = useRouter();

  // STREAMING HOOK
  const { object, submit, isLoading } = useObject({
    api: "/api/quiz",
    schema: quizSchema,
  });

  // START GENERATING ON MOUNT
  useEffect(() => {
    submit({ subtopicTitle, practicalTask, youtubeSearchQuery, capabilityScore, language });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const questions = object?.questions || [];
  const TOTAL_QUESTIONS = 8; // We strictly requested 8 questions in the API

  const handleSelect = (idx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);
    setShowExplanation(false);
  };

  const handleNext = () => {
    if (currentQ < TOTAL_QUESTIONS - 1) {
      setCurrentQ(currentQ + 1);
      setShowExplanation(false);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q?.correct_index) correctCount++;
    });
    const score = Math.round((correctCount / TOTAL_QUESTIONS) * 100);
    const passed = score >= 75;

    // Use a clean version of the questions for the database
    const cleanQuestions = questions.map(q => ({
      question: q?.question || "",
      options: q?.options || [],
      correct_index: q?.correct_index || 0,
      explanation: q?.explanation || "",
    }));

    await submitQuizResult({
      roadmapId, moduleId, subtopicId, score, passed,
      attemptNumber, timeSpent, questions: cleanQuestions, userAnswers: answers,
    });

    setResultData({ score, passed, correct: correctCount, total: TOTAL_QUESTIONS });
    setShowResults(true);
    setSubmitting(false);
  };

  const handleContinue = () => {
    onClose();
    router.refresh();
  };

  const randomMotivation = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  // ── INITIAL LOADING STATE (Before any stream data arrives) ──
  if (isLoading && questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-lg rounded-3xl bg-[#141416] border border-white/10 p-8 flex flex-col items-center shadow-2xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-colors z-10">✕</button>
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Generating Quiz...</h2>
          <p className="text-sm text-slate-500 text-center">Creating {TOTAL_QUESTIONS} research-grade questions</p>
        </div>
      </div>
    );
  }

  // ── Results Screen ──
  if (showResults && resultData) {
    const { score, passed, correct, total } = resultData;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-lg rounded-3xl bg-[#141416] border border-white/10 shadow-2xl overflow-hidden relative">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-colors z-10">✕</button>
          {/* Result Header */}
          <div className={`p-8 text-center ${passed ? "bg-gradient-to-b from-emerald-500/10 to-transparent" : "bg-gradient-to-b from-amber-500/10 to-transparent"}`}>
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${passed ? "bg-emerald-500/10 border-2 border-emerald-500/30" : "bg-amber-500/10 border-2 border-amber-500/30"}`}>
              {passed ? <Trophy className="w-10 h-10 text-emerald-500" /> : <RotateCcw className="w-10 h-10 text-amber-500" />}
            </div>
            <h2 className="text-2xl font-black text-white mb-1">
              {passed ? "Lesson Mastered!" : "Keep Practicing!"}
            </h2>
            <p className="text-sm text-slate-400">{subtopicTitle}</p>
          </div>

          {/* Score */}
          <div className="px-8 pb-6">
            <div className="flex items-center justify-center gap-6 py-5 mb-5 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="text-center">
                <div className={`text-4xl font-black tabular-nums ${passed ? "text-emerald-400" : "text-amber-400"}`}>{score}%</div>
                <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">Score</div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center">
                <div className="text-4xl font-black text-white tabular-nums">{correct}<span className="text-slate-600 text-lg">/{total}</span></div>
                <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">Correct</div>
              </div>
            </div>

            {/* Motivation */}
            <div className={`flex items-start gap-3 p-4 rounded-xl mb-5 ${passed ? "bg-emerald-500/5 border border-emerald-500/10" : "bg-amber-500/5 border border-amber-500/10"}`}>
              <Sparkles className={`w-4 h-4 flex-shrink-0 mt-0.5 ${passed ? "text-emerald-500" : "text-amber-500"}`} />
              <p className={`text-sm leading-relaxed ${passed ? "text-emerald-300" : "text-amber-300"}`}>
                {randomMotivation(passed ? MOTIVATIONAL_PASS : MOTIVATIONAL_FAIL)}
              </p>
            </div>

            {/* Answer Review */}
            <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
              {questions.map((q, idx) => {
                const isCorrect = answers[idx] === q?.correct_index;
                return (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex-shrink-0 mt-0.5">
                      {isCorrect
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        : <XCircle className="w-4 h-4 text-rose-500" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-300 leading-snug line-clamp-2">{q?.question}</p>
                      {!isCorrect && q?.explanation && (
                        <p className="text-[10px] text-slate-500 mt-1 leading-snug">{q.explanation}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <button onClick={handleContinue}
              className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] ${
                passed
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
                  : "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-[0_10px_30px_rgba(245,158,11,0.2)]"
              }`}>
              {passed ? (
                <><ArrowRight className="w-4 h-4" /> Continue Learning</>
              ) : (
                <><RotateCcw className="w-4 h-4" /> Try Again</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz Questions ──
  const q = questions[currentQ];
  const isSelected = (idx: number) => answers[currentQ] === idx;
  const isQuestionReady = q && q.question && q.options && q.options.length === 4 && q.correct_index !== undefined;
  
  // We disable interactions if the current question is still typing out
  const disableInteractions = isLoading && !isQuestionReady;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl rounded-3xl bg-[#141416] border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[400px]">

        {/* Left Column: Header & Question */}
        <div className="w-full md:w-1/2 p-6 md:p-8 md:border-r border-white/10 flex flex-col bg-[#141416]">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              {t("quiz.question")} {currentQ + 1} {t("onboarding.of")} {TOTAL_QUESTIONS}
              {isLoading && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
            </h2>
            <button onClick={onClose} className="md:hidden w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-colors text-sm">✕</button>
          </div>
          {/* Progress Dots */}
          <div className="flex gap-1.5 mb-8">
            {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i < currentQ ? "bg-emerald-500" : i === currentQ ? "bg-blue-500" : "bg-white/10"
              }`} />
            ))}
          </div>

          {/* Question */}
          <div className="flex-1">
            <p className="text-white text-lg md:text-xl font-medium leading-relaxed">
              {q?.question || "..."}
              {disableInteractions && <span className="inline-block w-1 h-5 ml-1 bg-blue-500 animate-pulse align-middle" />}
            </p>
          </div>
        </div>

        {/* Right Column: Options & Submit */}
        <div className="w-full md:w-1/2 p-6 md:p-8 bg-white/[0.02] flex flex-col relative">
          <button onClick={onClose} className="hidden md:flex absolute top-6 right-6 w-8 h-8 rounded-lg bg-white/5 border border-white/5 items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-colors text-sm">✕</button>

          {/* Options */}
          <div className="space-y-3 mb-8 mt-10 md:mt-0 flex-1">
            {[0, 1, 2, 3].map((idx) => {
              const optText = q?.options?.[idx];
              return (
                <button key={idx} onClick={() => handleSelect(idx)}
                  disabled={disableInteractions || !optText}
                  className={`w-full text-left p-4 rounded-xl border transition-all text-sm flex items-center gap-3 ${
                    isSelected(idx)
                      ? "border-blue-500/40 bg-blue-500/10 text-white"
                      : "border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-slate-300"
                  } ${disableInteractions ? "opacity-50 cursor-not-allowed" : ""}`}>
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected(idx) ? "border-blue-500 bg-blue-500" : "border-slate-600"
                  }`}>
                    {isSelected(idx) && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </span>
                  <span className="leading-snug">{optText || "..."}</span>
                </button>
              );
            })}
          </div>

          {/* Submit / Next */}
          <button onClick={handleNext}
            disabled={answers[currentQ] === undefined || submitting || disableInteractions || (currentQ === TOTAL_QUESTIONS - 1 && isLoading)}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_10px_30px_rgba(59,130,246,0.2)] mt-auto">
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : currentQ < TOTAL_QUESTIONS - 1 ? (
              <>{t("quiz.next")} <ArrowRight className="w-4 h-4" /></>
            ) : (
              <>{t("quiz.submit")} <CheckCircle2 className="w-4 h-4" /></>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
