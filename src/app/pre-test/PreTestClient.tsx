"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Brain, CheckCircle2, ArrowRight, Sparkles, Award, AlertCircle, RefreshCw, BrainCircuit } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { submitPreTestResults } from "@/app/actions";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { preTestSchema } from "@/lib/ai/schemas";
import { motion, AnimatePresence } from "framer-motion";

type Question = {
  question: string;
  options: string[];
  correct_index: number;
  topic_area: string;
  difficulty: string;
};

type PreTestClientProps = {
  pathTitle: string;
  profileSummary: string;
  language: string;
};

export default function PreTestClient({ pathTitle, profileSummary, language }: PreTestClientProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  // STREAMING HOOK
  const { object, submit, isLoading } = useObject({
    api: "/api/pre-test",
    schema: preTestSchema,
    onError: (err) => {
      console.error(err);
      setError("Failed to load assessment questions");
    }
  });

  const questions = (object?.questions || []) as Question[];
  const TOTAL_QUESTIONS = 8;

  // Start generation on mount
  useEffect(() => {
    submit({ pathTitle, profileSummary, language });
  }, []);

  function handleAnswer(optionIndex: number) {
    setAnswers({ ...answers, [currentIndex]: optionIndex });
  }

  async function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setSubmitting(true);
      let totalWeight = 0;
      let earnedWeight = 0;
      
      const questionResults = questions.map((q, i) => {
        const isCorrect = Number(answers[i]) === Number(q.correct_index);
        const weight = q.difficulty === 'hard' ? 3 : q.difficulty === 'medium' ? 2 : 1;
        totalWeight += weight;
        if (isCorrect) earnedWeight += weight;

        return {
          topic_area: q.topic_area,
          isCorrect,
          difficulty: q.difficulty,
        };
      });

      const finalScore = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
      setScore(finalScore);

      try {
        await submitPreTestResults({
          score: finalScore,
          questionResults,
        });
        setShowResult(true);
      } catch (err) {
        console.error("Submission error:", err);
        setError("Network error: Failed to save your baseline. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }
  }

  function handleContinue() {
    router.refresh();
    router.push("/learn");
  }

  const isLast = currentIndex === questions.length - 1;
  const isAnswered = answers[currentIndex] !== undefined;

  // ── LOADING STATE ──
  if (isLoading && questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-6 transition-colors duration-300">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-lg"
        >
          <div className="w-24 h-24 rounded-[2rem] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-10 relative">
             <Brain className="w-10 h-10 text-blue-500 animate-pulse" />
             <div className="absolute inset-0 rounded-[2rem] bg-blue-500/5 animate-ping" />
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-4 text-foreground">
            Crafting Assessment...
          </h2>
          <p className="text-base text-text-tertiary mb-12 font-medium">
            AI is analyzing your background to generate a personalized diagnostic.
          </p>
          <div className="w-full bg-input rounded-full h-1.5 overflow-hidden border border-border">
             <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="h-full bg-blue-500 w-1/3 rounded-full" 
             />
          </div>
        </motion.div>
      </div>
    );
  }

  // ── ERROR STATE ──
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-card border border-border rounded-[2.5rem] p-12 text-center max-w-md shadow-2xl"
        >
          <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-8">
            <AlertCircle className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-4 italic">Interference Detected</h2>
          <p className="text-text-tertiary mb-10 text-sm font-bold leading-relaxed">{error}</p>
          <button onClick={() => window.location.reload()} className="w-full py-4 rounded-2xl bg-foreground text-background font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <RefreshCw className="w-4 h-4" />
            Retry Link
          </button>
        </motion.div>
      </div>
    );
  }

  // ── RESULT STATE ──
  if (showResult) {
    return (
      <div className="relative min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px]" />
        </div>
        
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-md w-full relative z-10"
        >
          <div className="bg-card border border-border rounded-[3rem] p-12 text-center shadow-2xl">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, delay: 0.2 }}
              className="w-24 h-24 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8"
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </motion.div>
            
            <h2 className="text-3xl font-black tracking-tight mb-3 text-foreground">
              {t("pretest.done")}
            </h2>
            <p className="text-sm font-bold text-text-tertiary mb-10 uppercase tracking-widest">
              Diagnostic Complete
            </p>

            <div className="p-10 rounded-[2rem] bg-input border border-border mb-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <BrainCircuit className="w-16 h-16 text-emerald-500" />
              </div>
              <div className="text-[10px] font-black text-text-tertiary mb-2 uppercase tracking-[0.2em]">{t("pretest.baselineScore")}</div>
              <div className="text-7xl font-black text-foreground mb-1 tabular-nums">
                {score}<span className="text-emerald-500 text-3xl">%</span>
              </div>
            </div>

            <button onClick={handleContinue} className="w-full py-5 rounded-2xl bg-foreground text-background font-black text-[11px] uppercase tracking-[0.2em] hover:bg-emerald-600 hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl">
              {t("pretest.startLearning")}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── QUIZ UI ──
  const question = questions[currentIndex];

  // Guard: if streaming hasn't delivered this question yet, show loading
  if (!question || !question.question || !question.options || question.options.length < 4) {
    return (
      <div className="relative min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-lg">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-bold text-foreground">Syncing Assessment Stream...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground pt-32 pb-32 px-6 overflow-hidden transition-colors duration-300">
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Progress Header */}
        <div className="mb-12 flex flex-col items-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-card border border-border mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Diagnostic Assessment</span>
          </div>
          
          <div className="w-full flex gap-2 px-4 h-2 mb-4">
            {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
              <div
                key={i}
                className={`h-full flex-1 rounded-full transition-all duration-700 ${
                  i < currentIndex ? "bg-blue-500" :
                  i === currentIndex ? "bg-foreground" : "bg-foreground/10"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Task {currentIndex + 1} of {TOTAL_QUESTIONS}</span>
             <div className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
               question.difficulty === 'hard' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
               question.difficulty === 'medium' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
               "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
             }`}>
               {question.difficulty || '...'}
             </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="grid grid-cols-1 gap-10"
          >
            <div className="text-center max-w-2xl mx-auto">
               <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-[1.2] text-foreground">
                 {question.question}
               </h1>
            </div>

            <div className="bg-card border border-border rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden">
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.options.map((option, idx) => {
                  const isSelected = answers[currentIndex] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className={`w-full text-left p-6 rounded-[2rem] border-2 transition-all flex items-center gap-5 group/btn ${
                        isSelected
                          ? "bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/20"
                          : "bg-input border-border text-text-secondary hover:border-border-hover hover:bg-card"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                        isSelected
                          ? "bg-white text-blue-600"
                          : "bg-foreground/5 text-text-tertiary group-hover/btn:bg-foreground/10 border border-border"
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-sm font-bold leading-relaxed">{option}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-12 pt-8 border-t border-border flex items-center relative z-10">
                <button
                  onClick={handleNext}
                  disabled={!isAnswered || submitting}
                  className="w-full py-5 text-[11px] font-black uppercase tracking-[0.2em] text-background bg-foreground rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-20 transition-all shadow-xl"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isLast ? (
                    <>{t("pretest.finish")} <Award className="w-4 h-4" /></>
                  ) : (
                    <>{t("quiz.next")} <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
