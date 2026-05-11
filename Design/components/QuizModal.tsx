"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, XCircle, Trophy, Flame, ArrowRight, RotateCcw, Sparkles, BrainCircuit, Brain } from "lucide-react";
import { submitQuizResult } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { quizSchema } from "@/lib/ai/schemas";
import { motion, AnimatePresence } from "framer-motion";

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

const PASSING_SCORE = 75; // Requires 6 out of 8 correct answers to pass

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
  const [isAnalyzingMastery, setIsAnalyzingMastery] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [resultData, setResultData] = useState<{ score: number; passed: boolean; correct: number; total: number } | null>(null);
  const router = useRouter();

  const { object, submit, isLoading } = useObject({
    api: "/api/quiz",
    schema: quizSchema,
  });

  useEffect(() => {
    submit({ subtopicTitle, practicalTask, youtubeSearchQuery, capabilityScore, language });
  }, []);

  const questions = object?.questions || [];
  const TOTAL_QUESTIONS = 8;

  const handleSelect = (idx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQ < TOTAL_QUESTIONS - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setIsAnalyzingMastery(true);
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q?.correct_index) correctCount++;
    });
    const score = Math.round((correctCount / TOTAL_QUESTIONS) * 100);
    const passed = score >= PASSING_SCORE;

    const cleanQuestions = questions.map(q => ({
      question: q?.question || "",
      options: q?.options || [],
      correct_index: q?.correct_index || 0,
      explanation: q?.explanation || "",
      topic_area: q?.topic_area || subtopicTitle,
      difficulty: q?.difficulty || "medium",
    }));

    try {
      await submitQuizResult({
        roadmapId, moduleId, subtopicId, score, passed,
        attemptNumber, timeSpent, questions: cleanQuestions, userAnswers: answers,
      });

      // Delay slightly for visual effect to show the analysis animation
      setTimeout(() => {
        setResultData({ score, passed, correct: correctCount, total: TOTAL_QUESTIONS });
        setIsAnalyzingMastery(false);
        setShowResults(true);
        setSubmitting(false);
      }, 1500);
    } catch (error) {
      console.error("[Quiz] Submission failed", error);
      setIsAnalyzingMastery(false);
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    onClose();
    // Refresh to update the UI (locking/unlocking next topics)
    router.refresh();
  };

  const randomMotivation = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  if (isLoading && questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-lg rounded-[2.5rem] bg-card border border-border p-12 flex flex-col items-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" />
          <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-8 relative">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <div className="absolute inset-0 rounded-3xl bg-blue-500/5 animate-ping" />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-2">Analyzing Mastery...</h2>
          <p className="text-sm text-text-tertiary text-center max-w-xs font-medium">Generating {TOTAL_QUESTIONS} scenario-based questions tailored to your skill level.</p>
        </motion.div>
      </div>
    );
  }

  if (isAnalyzingMastery) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-3xl flex items-center justify-center z-[110] p-4">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md rounded-[2.5rem] bg-card border border-border p-10 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
          
          <div className="relative z-10">
            <div className="flex justify-center gap-1.5 mb-8">
               {[0, 1, 2].map((i) => (
                 <motion.div
                   key={i}
                   animate={{ 
                     scale: [1, 1.2, 1],
                     opacity: [0.3, 1, 0.3],
                     y: [0, -10, 0]
                   }}
                   transition={{ 
                     repeat: Infinity, 
                     duration: 1.5, 
                     delay: i * 0.2,
                     ease: "easeInOut"
                   }}
                   className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                 />
               ))}
            </div>

            <Brain className="w-12 h-12 text-blue-400 mx-auto mb-6 animate-pulse" />
            
            <h3 className="text-xl font-black text-foreground mb-3 tracking-tight">Cognitive Analysis In Progress</h3>
            <div className="space-y-2">
              <p className="text-xs font-bold text-blue-500 uppercase tracking-widest animate-pulse">Running Bayesian Engine</p>
              <p className="text-sm text-text-tertiary leading-relaxed px-4">
                Processing response patterns to distinguish between luck and true mastery of <span className="text-foreground font-medium">{subtopicTitle}</span>.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
               <div className="flex justify-between items-center text-[10px] font-black text-text-muted uppercase tracking-wider mb-2 px-2">
                  <span>Knowledge Components</span>
                  <span>Tracing...</span>
               </div>
               <div className="w-full h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                  />
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showResults && resultData) {
    const { score, passed, correct, total } = resultData;
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-lg rounded-[3rem] bg-card border border-border shadow-2xl overflow-hidden relative"
        >
          <div className={`p-10 text-center relative ${passed ? "bg-emerald-500/5" : "bg-amber-500/5"}`}>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
              className={`w-24 h-24 rounded-[2rem] mx-auto mb-6 flex items-center justify-center ${passed ? "bg-emerald-500/20 border-2 border-emerald-500/30" : "bg-amber-500/20 border-2 border-amber-500/30"}`}
            >
              {passed ? <Trophy className="w-12 h-12 text-emerald-500" /> : <RotateCcw className="w-12 h-12 text-amber-500" />}
            </motion.div>
            <h2 className="text-3xl font-black text-foreground mb-2">
              {passed ? "Module Mastered!" : "Session Incomplete"}
            </h2>
            <p className="text-sm font-bold text-text-tertiary uppercase tracking-widest">{subtopicTitle}</p>
          </div>

          <div className="px-10 pb-10">
            <div className="flex items-center justify-center gap-8 py-8 mb-8 rounded-[2rem] bg-input border border-border">
              <div className="text-center">
                <div className={`text-5xl font-black tabular-nums ${passed ? "text-emerald-500" : "text-amber-500"}`}>{score}%</div>
                <div className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mt-2">Proficiency</div>
              </div>
              <div className="w-px h-16 bg-border" />
              <div className="text-center">
                <div className="text-5xl font-black text-foreground tabular-nums">{correct}<span className="text-text-tertiary text-xl">/{total}</span></div>
                <div className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mt-2">Accuracy</div>
              </div>
            </div>

            <div className={`flex items-start gap-4 p-5 rounded-2xl mb-8 ${passed ? "bg-emerald-500/5 border border-emerald-500/10" : "bg-amber-500/5 border border-amber-500/10"}`}>
              <Sparkles className={`w-5 h-5 flex-shrink-0 mt-0.5 ${passed ? "text-emerald-500" : "text-amber-500"}`} />
              <p className={`text-sm font-bold leading-relaxed ${passed ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                {randomMotivation(passed ? MOTIVATIONAL_PASS : MOTIVATIONAL_FAIL)}
              </p>
            </div>

            <button onClick={handleContinue}
              className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                passed
                  ? "bg-emerald-600 text-white shadow-xl shadow-emerald-600/20"
                  : "bg-amber-600 text-white shadow-xl shadow-amber-600/20"
              }`}>
              {passed ? (
                <><ArrowRight className="w-4 h-4" /> Deploy Knowledge</>
              ) : (
                <><RotateCcw className="w-4 h-4" /> Recalibrate & Retry</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const q = questions[currentQ];
  const isSelected = (idx: number) => answers[currentQ] === idx;
  const isQuestionReady = q && q.question && q.options && q.options.length === 4;
  const disableInteractions = isLoading && !isQuestionReady;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4 font-sans">
      <motion.div 
        layout
        className="w-full max-w-5xl rounded-[3rem] bg-card border border-border shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]"
      >
        <div className="w-full md:w-1/2 p-8 md:p-12 md:border-r border-border flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-input">
            <motion.div 
              className="h-full bg-blue-500" 
              initial={{ width: 0 }}
              animate={{ width: `${((currentQ + 1) / TOTAL_QUESTIONS) * 100}%` }}
            />
          </div>

          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <BrainCircuit className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em]">
                Assessment {currentQ + 1} / {TOTAL_QUESTIONS}
              </span>
            </div>
            {q?.difficulty && (
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                q.difficulty === 'hard' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : 
                q.difficulty === 'medium' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              }`}>
                {q.difficulty}
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={currentQ}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="flex-1"
            >
              <h2 className="text-2xl md:text-3xl font-black text-foreground leading-[1.3] tracking-tight">
                {q?.question || "Initializing Assessment..."}
                {disableInteractions && <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity }} className="inline-block w-1 h-6 ml-2 bg-blue-500 align-middle" />}
              </h2>
            </motion.div>
          </AnimatePresence>
          
          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest leading-relaxed">
              This question targets your <span className="text-blue-500">Zone of Proximal Development</span> to ensure optimal learning gain.
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-12 bg-input/30 flex flex-col relative">
          <button onClick={onClose} className="absolute top-8 right-8 text-text-tertiary hover:text-foreground transition-colors">
             <XCircle className="w-6 h-6 opacity-40 hover:opacity-100" />
          </button>

          <div className="space-y-4 mb-10 flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentQ}
                className="space-y-4"
              >
                {[0, 1, 2, 3].map((idx) => {
                  const optText = q?.options?.[idx];
                  return (
                    <motion.button 
                      key={`${currentQ}-${idx}`}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => handleSelect(idx)}
                      disabled={disableInteractions || !optText}
                      className={`w-full text-left p-6 rounded-3xl border-2 transition-all group relative overflow-hidden ${
                        isSelected(idx)
                          ? "border-blue-500 bg-blue-500/5 text-foreground"
                          : "border-border bg-card text-text-secondary hover:border-border-hover hover:scale-[1.01]"
                      } ${disableInteractions ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center gap-5 relative z-10">
                        <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected(idx) ? "bg-blue-500 border-blue-500 text-white" : "border-border bg-input group-hover:border-text-tertiary"
                        }`}>
                          <span className="text-[10px] font-black">{String.fromCharCode(65 + idx)}</span>
                        </div>
                        <span className="text-sm font-bold leading-snug">{optText || "..."}</span>
                      </div>
                      {isSelected(idx) && (
                        <motion.div 
                          layoutId="active-bg"
                          className="absolute inset-0 bg-blue-500/5 z-0"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          <button onClick={handleNext}
            disabled={answers[currentQ] === undefined || submitting || disableInteractions || (currentQ === TOTAL_QUESTIONS - 1 && isLoading)}
            className="w-full py-5 rounded-2xl bg-foreground text-background font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl">
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : currentQ < TOTAL_QUESTIONS - 1 ? (
              <>{t("quiz.next")} <ArrowRight className="w-4 h-4" /></>
            ) : (
              <>{t("quiz.submit")} <CheckCircle2 className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
