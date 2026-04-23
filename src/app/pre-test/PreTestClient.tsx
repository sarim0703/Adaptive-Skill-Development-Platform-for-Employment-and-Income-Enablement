"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Brain, CheckCircle2, ArrowRight, Sparkles, Award } from "lucide-react";
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
      <div className="max-w-xl mx-auto px-6 py-32 text-center animate-fadeInUp">
        <div className="relative inline-flex mb-8">
          <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-20 animate-pulse"></div>
          <Brain className="w-16 h-16 text-[#007AFF] animate-spin relative" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">{t("pretest.loading")}</h2>
        <p className="text-lg text-slate-500 leading-relaxed">
          {t("pretest.loadingSub")}
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 animate-fadeInUp">
        <div className="card p-10 text-center">
          <p className="text-red-500 font-bold mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary w-full py-4 text-lg">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Result state
  if (showResult) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 animate-fadeInUp">
        <div className="card p-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#34C759]/10 flex items-center justify-center mx-auto mb-8 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-[#34C759]" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-3">{t("pretest.done")}</h2>
          <p className="text-lg text-slate-500 mb-10 leading-relaxed">{t("pretest.doneSub")}</p>

          <div className="bg-[#007AFF]/5 rounded-3xl p-10 mb-10 border border-[#007AFF]/10">
            <div className="text-sm font-bold text-[#007AFF] uppercase tracking-widest mb-2">Baseline Capability</div>
            <div className="text-6xl font-black text-[#1D1D1F] mb-2">{score}%</div>
            <div className="text-slate-400 text-sm font-medium">{t("pretest.baselineScore")}</div>
          </div>

          <div className="flex items-center gap-3 justify-center mb-10 text-slate-400">
            <Award className="w-5 h-5" />
            <p className="text-xs font-medium italic">{t("pretest.baselineNote")}</p>
          </div>

          <button onClick={handleContinue} className="btn-primary w-full py-5 text-xl font-bold group shadow-xl shadow-blue-500/20">
            {t("pretest.startLearning")}
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  // Quiz UI
  const question = questions[currentIndex];
  const isAnswered = answers[currentIndex] !== undefined;
  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 animate-fadeInUp">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-[#007AFF]/10 text-[#007AFF] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          {t("pretest.badge")}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">{t("pretest.title")}</h1>
        <p className="text-lg text-slate-500 font-medium">{t("pretest.sub")}</p>
      </div>

      {/* Progress Section */}
      <div className="mb-10 px-4">
        <div className="flex justify-between items-end mb-4">
          <div className="text-sm font-bold text-slate-400">
            Question <span className="text-slate-800">{currentIndex + 1}</span> of {questions.length}
          </div>
          <div className="badge badge-amber px-3 py-1 text-[10px] uppercase font-bold tracking-widest">
            {question.difficulty}
          </div>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#007AFF] shadow-[0_0_10px_rgba(0,122,255,0.4)] transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="card p-8 md:p-12 mb-8" key={currentIndex}>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-10 leading-tight">
          {question.question}
        </h2>

        <div className="grid gap-4">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center gap-6 group ${
                answers[currentIndex] === idx
                  ? "bg-blue-50/50 border-[#007AFF] text-[#007AFF] shadow-sm"
                  : "bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50/50"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${
                answers[currentIndex] === idx
                  ? "bg-[#007AFF] text-white"
                  : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
              }`}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="text-lg md:text-xl font-bold">{option}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="px-2">
        <button
          onClick={handleNext}
          disabled={!isAnswered || submitting}
          className="btn-primary w-full py-5 text-xl font-bold shadow-xl shadow-blue-500/10 transition-all active:scale-[0.98] disabled:opacity-30 disabled:grayscale"
        >
          {submitting ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : isLast ? (
            t("pretest.finish")
          ) : (
            <div className="flex items-center gap-2">
              {t("quiz.next")}
              <ArrowRight className="w-6 h-6" />
            </div>
          )}
        </button>
        
        <p className="text-center text-[10px] font-bold text-slate-400 mt-6 uppercase tracking-widest">
          {t("pretest.noWrong")}
        </p>
      </div>
    </div>
  );
}
