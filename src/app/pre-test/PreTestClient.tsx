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
      <div className="relative min-h-screen bg-[#0A0A0C] text-white flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className="aurora-blob w-[600px] h-[600px] bg-blue-600/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse blur-[120px]"></div>
        <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none"></div>

        <div className="relative z-10 text-center max-w-lg animate-fadeInUp">
          <div className="inline-flex mb-12 relative group">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="w-24 h-24 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin flex items-center justify-center bg-black/40 backdrop-blur-xl">
               <Brain className="w-8 h-8 text-blue-400 animate-pulse" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 leading-tight uppercase">
            Synchronizing <span className="italic-gradient">Mentor</span>
          </h2>
          <p className="text-xl text-slate-400 font-medium opacity-80 mb-8">
            {t("pretest.loadingSub")}
          </p>
          <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden border border-white/5">
             <div className="h-full bg-blue-500 w-2/3 animate-[loading_3s_ease-in-out_infinite] shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex items-center justify-center p-6">
        <div className="glass-card p-12 text-center max-w-md border-rose-500/20 shadow-[0_0_50px_rgba(244,63,94,0.1)]">
          <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-8">
            <AlertCircle className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-4">Sync Interrupted</h2>
          <p className="text-slate-400 mb-10 font-medium leading-relaxed">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary w-full py-5 text-lg rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Result state
  if (showResult) {
    return (
      <div className="relative min-h-screen bg-[#0A0A0C] text-white flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* Background Decor */}
        <div className="aurora-blob w-[800px] h-[800px] bg-emerald-600/5 -top-1/4 -left-1/4 rounded-full pointer-events-none blur-[100px]"></div>
        <div className="absolute inset-0 bg-tech-grid opacity-10 pointer-events-none"></div>

        <div className="max-w-xl w-full relative z-10 animate-fadeInUp">
          <div className="glass-card p-12 text-center border-emerald-500/20 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
            <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-10 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 leading-tight uppercase italic-gradient">
              {t("pretest.done")}
            </h2>
            <p className="text-xl text-slate-400 mb-12 font-medium leading-relaxed opacity-80">
              {t("pretest.doneSub")}
            </p>

            <div className="relative p-12 rounded-[40px] bg-white/[0.03] border border-white/5 mb-12 overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 relative z-10">Baseline Capability</div>
              <div className="text-8xl font-black text-white mb-2 tracking-tighter relative z-10">
                {score}<span className="text-emerald-400 text-4xl">%</span>
              </div>
              <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] opacity-60 relative z-10">{t("pretest.baselineScore")}</div>
            </div>

            <button onClick={handleContinue} className="w-full py-6 rounded-3xl bg-white text-black font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:bg-emerald-500 hover:text-white hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group">
              {t("pretest.startLearning")}
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
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
    <div className="relative min-h-screen bg-[#0A0A0C] text-white pt-24 pb-24 px-6 overflow-hidden">
      {/* Background Decor */}
      <div className="aurora-blob w-[600px] h-[600px] bg-blue-600/5 top-0 right-0 rounded-full pointer-events-none blur-[100px]"></div>
      <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Progress Header */}
        <div className="mb-8 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-100">Mentor Calibration</span>
          </div>
          
          <div className="w-full flex gap-1.5 px-4 h-2">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-full flex-1 rounded-full transition-all duration-700 ${
                  i < currentIndex ? "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]" :
                  i === currentIndex ? "bg-white shadow-[0_0_15px_rgba(255,255,255,0.6)]" : "bg-white/10"
                }`}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4">
             <span className="text-[7px] font-black uppercase tracking-[0.3em] text-slate-500">Query {currentIndex + 1} of {questions.length}</span>
             <div className="px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[6px] font-black uppercase tracking-widest">{question.difficulty}</div>
          </div>
        </div>

        {/* Question Area */}
        <div className="grid grid-cols-1 gap-6" key={currentIndex}>
           <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2 leading-tight animate-fadeInUp">
                {question.question}
              </h1>
           </div>

           <div className="glass-card p-6 md:p-8 relative overflow-hidden group shadow-[0_32px_64px_rgba(0,0,0,0.5)] border-white/10">
              {/* Question Index Badge */}
              <div className="absolute top-2 right-6 text-[80px] font-black text-white/[0.02] pointer-events-none select-none z-0">
                0{currentIndex + 1}
              </div>

              <div className="relative z-10 grid grid-cols-1 gap-2">
                {question.options.map((option, idx) => {
                  const isSelected = answers[currentIndex] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 group/btn ${
                        isSelected
                          ? "bg-blue-600 border-blue-400 text-white shadow-[0_15px_40px_rgba(59,130,246,0.3)] scale-[1.01]"
                          : "bg-white/5 border-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm transition-all ${
                        isSelected
                          ? "bg-white text-blue-600"
                          : "bg-white/10 text-slate-500 group-hover/btn:bg-white/20 group-hover/btn:text-white"
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-base md:text-lg font-bold tracking-tight leading-snug">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div className="mt-8 flex items-center relative z-10">
                <button
                  onClick={handleNext}
                  disabled={!isAnswered || submitting}
                  className="w-full py-4 text-[9px] font-black uppercase tracking-[0.3em] shadow-[0_15px_40px_rgba(59,130,246,0.3)] bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:grayscale transition-all group/next"
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

        <div className="mt-6 flex items-center justify-center gap-3 text-slate-600 font-black uppercase tracking-[0.3em] text-[8px]">
           <Award className="w-3.5 h-3.5 text-amber-500 opacity-60" />
           {t("pretest.noWrong")}
        </div>
      </div>
    </div>
  );
}
