"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { submitQuizResult } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

type QuizModalProps = {
  roadmapId: string;
  moduleId: number;
  subtopicId: string;
  subtopicTitle: string;
  practicalTask: string;
  capabilityScore: number;
  timeSpent: number;
  attemptNumber: number;
  onClose: () => void;
};

export default function QuizModal({
  roadmapId,
  moduleId,
  subtopicId,
  subtopicTitle,
  practicalTask,
  capabilityScore,
  timeSpent,
  attemptNumber,
  onClose,
}: QuizModalProps) {
  const { t, language } = useLanguage();
  const [questions, setQuestions] = useState<{ question: string; options: string[]; correct_index: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            subtopicTitle, 
            practicalTask, 
            capabilityScore,
            language // Pass language to AI
          }),
        });
        const data = await res.json();
        setQuestions(data.questions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [subtopicTitle, practicalTask, capabilityScore, language]);

  const handleSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct_index) correctCount++;
    });

    const score = (correctCount / questions.length) * 100;
    const passed = score >= 50;

    await submitQuizResult({
      roadmapId,
      moduleId,
      subtopicId,
      score,
      passed,
      attemptNumber,
      timeSpent,
      questions,
      userAnswers: answers,
    });

    onClose();
    router.refresh();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="card p-8 flex flex-col items-center max-w-sm w-full animate-fadeInUp">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
          <h2 className="text-lg font-bold text-slate-800 mb-1">{t("quiz.preparing")}</h2>
          <p className="text-slate-400 text-center text-sm">
            {t("quiz.sub")}
          </p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return null;

  const q = questions[currentQ];
  const isSelected = (idx: number) => answers[currentQ] === idx;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card p-6 max-w-md w-full animate-fadeInUp">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-semibold text-slate-500">
              {t("quiz.question")} {currentQ + 1} {t("onboarding.of")} {questions.length}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm">
              ✕
            </button>
          </div>
          <div className="flex gap-1.5">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  i <= currentQ ? "bg-indigo-500" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question */}
        <p className="text-slate-800 mb-5 text-base font-medium leading-relaxed">{q.question}</p>

        {/* Options */}
        <div className="space-y-2.5 mb-6">
          {q.options.map((opt: string, idx: number) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left p-3.5 rounded-xl border-1.5 transition-all text-sm flex items-center gap-3 ${
                isSelected(idx)
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                isSelected(idx) ? "border-indigo-500 bg-indigo-500" : "border-slate-300"
              }`}>
                {isSelected(idx) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </span>
              {opt}
            </button>
          ))}
        </div>

        {/* Submit */}
        <button
          onClick={handleNext}
          disabled={answers[currentQ] === undefined || submitting}
          className="btn-primary w-full py-3"
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : currentQ < questions.length - 1 ? (
            `${t("quiz.next")} →`
          ) : (
            t("quiz.submit")
          )}
        </button>
      </div>
    </div>
  );
}
