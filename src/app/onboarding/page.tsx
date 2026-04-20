"use client";

import { useState } from "react";
import { saveOnboardingProfile } from "../actions";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SpeechInput from "@/components/SpeechInput";

const STEP_EMOJIS = ["📍", "🎓", "⏰", "🛠️", "💼", "💰", "🗣️", "💪"];

const LANG_MAP: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  kn: 'kn-IN'
};

export default function OnboardingPage() {
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  const QUESTIONS = [
    { id: 1, text: t("q1.text"), hint: t("q1.hint"), type: "select", options: [t("q1.opt1"), t("q1.opt2"), t("q1.opt3"), t("q1.opt4")] },
    { id: 2, text: t("q2.text"), hint: t("q2.hint"), type: "select", options: [t("q2.opt1"), t("q2.opt2"), t("q2.opt3"), t("q2.opt4")] },
    { id: 3, text: t("q3.text"), hint: t("q3.hint"), type: "select", options: [t("q3.opt1"), t("q3.opt2"), t("q3.opt3")] },
    { id: 4, text: t("q4.text"), hint: t("q4.hint"), type: "text", placeholder: "e.g. 'I can drive', 'I know basic English'" },
    { id: 5, text: t("q5.text"), hint: t("q5.hint"), type: "text", placeholder: "e.g. 'Worked at a shop for 2 years'" },
    { id: 6, text: t("q6.text"), hint: t("q6.hint"), type: "number", placeholder: "e.g. 15000" },
    { id: 7, text: t("q7.text"), hint: t("q7.hint"), type: "select", options: [t("q7.opt1"), t("q7.opt2"), t("q7.opt3")] },
    { id: 8, text: t("q8.text"), hint: t("q8.hint"), type: "select", options: [t("q8.opt1"), t("q8.opt2"), t("q8.opt3"), t("q8.opt4"), t("q8.opt5")] },
  ];

  const question = QUESTIONS[currentStep];
  const isLastStep = currentStep === QUESTIONS.length - 1;

  async function handleNext() {
    if (!answers[question.id]) return;

    if (isLastStep) {
      setLoading(true);
      try {
        await saveOnboardingProfile(answers);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  return (
    <div className="min-h-screen bg-warm-gradient flex flex-col items-center justify-center p-4">
      {/* Top Switcher */}
      <div className="fixed top-6 right-6">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-lg animate-fadeInUp">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-600">
              {t("onboarding.step")} {currentStep + 1} {t("onboarding.of")} {QUESTIONS.length}
            </span>
            <span className="text-2xl">{STEP_EMOJIS[currentStep]}</span>
          </div>
          <div className="flex gap-1.5">
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  i < currentStep ? "bg-indigo-500" :
                  i === currentStep ? "bg-indigo-400 animate-pulse-soft" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question Card */}
        <div className="card p-8" key={currentStep}>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {STEP_EMOJIS[currentStep]} {question.text}
          </h2>
          <p className="text-sm text-slate-400 mb-6">{question.hint}</p>

          <div className="space-y-3 mb-8">
            {question.type === "select" && (
              <div className="grid gap-2.5">
                {question.options?.map((opt) => {
                  const isSelected = answers[question.id] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setAnswers({ ...answers, [question.id]: opt })}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-1.5 transition-all text-left ${
                        isSelected
                          ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-medium text-sm">{opt}</span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-500" />}
                    </button>
                  );
                })}
              </div>
            )}

            {(question.type === "text" || question.type === "number") && (
              <div className="relative group">
                <input
                  type={question.type}
                  placeholder={question.placeholder || "Type your answer..."}
                  value={answers[question.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                  className="input pr-12"
                  autoFocus
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <SpeechInput 
                    language={LANG_MAP[language]} 
                    onResult={(text) => setAnswers(prev => ({ ...prev, [question.id]: prev[question.id] ? `${prev[question.id]} ${text}` : text }))}
                    className="w-9 h-9"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={!answers[question.id] || loading}
            className="btn-primary w-full py-3.5 text-base"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isLastStep ? (
              t("onboarding.finish")
            ) : (
              <>
                {t("onboarding.continue")}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
