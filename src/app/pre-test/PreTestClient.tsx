"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Brain, CheckCircle2, ArrowRight, Sparkles, Award, AlertCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { submitPreTestResults } from "@/app/actions";

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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch("/api/pre-test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pathTitle, profileSummary, language }),
        });
        const data = await res.json();
        if (data.questions) {
          setQuestions(data.questions);
        } else {
          setError("Failed to load assessment questions");
        }
      } catch {
        setError("Failed to connect to the server");
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [pathTitle, profileSummary, language]);

  function handleAnswer(optionIndex: number) {
    setAnswers({ ...answers, [currentIndex]: optionIndex });
  }

  async function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setSubmitting(true);
      let correct = 0;
      const questionResults = questions.map((q, i) => {
        const isCorrect = answers[i] === q.correct_index;
        if (isCorrect) correct++;
        return {
          topic_area: q.topic_area,
          isCorrect,
          difficulty: q.difficulty,
        };
      });
      const finalScore = Math.round((correct / questions.length) * 100);
      setScore(finalScore);

      try {
        await submitPreTestResults({
          score: finalScore,
          questionResults,
        });
        setShowResult(true);
      } catch (err) {
        console.error(err);
        setError("Failed to submit results");
      } finally {
        setSubmitting(false);
      }
    }
  }

  function handleContinue() {
    router.push("/learn");
  }

  // Loading state
  if (loading) {
    return (
      <div className="relative min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 overflow-hidden transition-colors duration-300">
        <div className="relative z-10 text-center max-w-lg">
          <div className="inline-flex mb-10">
            <div className="w-20 h-20 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin flex items-center justify-center bg-card">
               <Brain className="w-7 h-7 text-blue-500 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight mb-4 text-foreground">
            Preparing questions...
          </h2>
          <p className="text-base text-text-secondary mb-8">
            {t("pretest.loadingSub")}
          </p>
          <div className="w-full bg-foreground/5 rounded-full h-1 overflow-hidden border border-border">
             <div className="h-full bg-blue-500 w-2/3 animate-[loading_3s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 transition-colors duration-300">
        <div className="bg-card border border-border rounded-xl p-10 text-center max-w-md">
          <div className="w-16 h-16 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-3">Something went wrong</h2>
          <p className="text-text-secondary mb-8 text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary w-full py-3 text-sm rounded-xl flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Result state
  if (showResult) {
    return (
      <div className="relative min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 overflow-hidden transition-colors duration-300">
        <div className="max-w-md w-full relative z-10">
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <div className="w-16 h-16 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            
            <h2 className="text-2xl font-semibold tracking-tight mb-3 text-foreground">
              {t("pretest.done")}
            </h2>
            <p className="text-base text-text-secondary mb-8">
              {t("pretest.doneSub")}
            </p>

            <div className="p-8 rounded-xl bg-input border border-border mb-8">
              <div className="text-xs font-medium text-text-tertiary mb-2">{t("pretest.baselineScore")}</div>
              <div className="text-6xl font-bold text-foreground mb-1 tabular-nums">
                {score}<span className="text-emerald-500 text-2xl">%</span>
              </div>
            </div>

            <button onClick={handleContinue} className="w-full py-3.5 rounded-xl bg-foreground text-background font-semibold text-sm hover:bg-emerald-600 hover:text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              {t("pretest.startLearning")}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz UI
  const question = questions[currentIndex];
  const isAnswered = answers[currentIndex] !== undefined;
  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="relative min-h-screen bg-background text-foreground pt-24 pb-24 px-6 overflow-hidden transition-colors duration-300">
      <div className="max-w-3xl mx-auto relative z-10">
        {/* Progress Header */}
        <div className="mb-8 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border mb-6">
            <Sparkles className="w-3 h-3 text-blue-500" />
            <span className="text-xs font-medium text-text-secondary">Diagnostic Assessment</span>
          </div>
          
          <div className="w-full flex gap-1.5 px-4 h-1.5">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-full flex-1 rounded-full transition-all duration-700 ${
                  i < currentIndex ? "bg-blue-500" :
                  i === currentIndex ? "bg-foreground" : "bg-foreground/10"
                }`}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3">
             <span className="text-xs font-medium text-text-tertiary">Question {currentIndex + 1} of {questions.length}</span>
             <div className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-medium">{question.difficulty}</div>
          </div>
        </div>

        {/* Question Area */}
        <div className="grid grid-cols-1 gap-6" key={currentIndex}>
           <div className="text-center">
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight mb-2 leading-tight text-foreground">
                {question.question}
              </h1>
           </div>

           <div className="bg-card border border-border rounded-xl p-6 md:p-8 relative overflow-hidden">
              <div className="relative z-10 grid grid-cols-1 gap-2">
                {question.options.map((option, idx) => {
                  const isSelected = answers[currentIndex] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 group/btn ${
                        isSelected
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-input border-border text-text-secondary hover:border-border-hover hover:bg-card-hover"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-semibold text-sm transition-all ${
                        isSelected
                          ? "bg-white text-blue-600"
                          : "bg-foreground/5 text-text-tertiary group-hover/btn:bg-foreground/10"
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-sm font-medium leading-snug">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div className="mt-8 flex items-center relative z-10">
                <button
                  onClick={handleNext}
                  disabled={!isAnswered || submitting}
                  className="w-full py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] disabled:opacity-30 transition-all"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isLast ? (
                    t("pretest.finish")
                  ) : (
                    <>
                      {t("quiz.next")}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
           </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
           <Award className="w-3.5 h-3.5 text-amber-500 opacity-60" />
           <span className="text-xs font-medium text-text-tertiary">{t("pretest.noWrong")}</span>
        </div>
      </div>
    </div>
  );
}
