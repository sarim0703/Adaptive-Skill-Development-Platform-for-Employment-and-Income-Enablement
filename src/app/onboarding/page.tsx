"use client";

import { useState } from "react";
import { saveOnboardingProfile } from "../actions";
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
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
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="w-full animate-fadeInUp">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3 h-3" />
            {t("onboarding.title") || "Getting Started"}
          </div>
          <h1 className="text-3xl font-bold text-slate-800">
            Let&apos;s build your career path
          </h1>
        </div>

        {/* Progress Bar */}
        <div className="mb-10 px-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-slate-400">
              {t("onboarding.step")} {currentStep + 1} / {QUESTIONS.length}
            </span>
            <span className="text-xl filter drop-shadow-sm">{STEP_EMOJIS[currentStep]}</span>
          </div>
          <div className="flex gap-2">
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  i < currentStep ? "bg-[#34C759]" :
                  i === currentStep ? "bg-[#007AFF] shadow-[0_0_10px_rgba(0,122,255,0.4)]" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question Card */}
        <div className="card p-8 md:p-12 mb-8" key={currentStep}>
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3 leading-tight">
              {question.text}
            </h2>
            <p className="text-lg text-slate-400 font-medium">{question.hint}</p>
          </div>

          <div className="space-y-4 mb-10">
            {question.type === "select" && (
              <div className="grid gap-3">
                {question.options?.map((opt) => {
                  const isSelected = answers[question.id] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setAnswers({ ...answers, [question.id]: opt })}
                      className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left group ${
                        isSelected
                          ? "bg-blue-50/50 border-[#007AFF] text-[#007AFF] shadow-sm"
                          : "bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50/50"
                      }`}
                    >
                      <span className="font-bold text-base md:text-lg">{opt}</span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? "bg-[#007AFF] border-[#007AFF]" : "border-slate-200 group-hover:border-slate-300"
                      }`}>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
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
                  className="input p-6 text-lg md:text-xl font-medium !rounded-2xl"
                  autoFocus
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <SpeechInput 
                    language={LANG_MAP[language]} 
                    onResult={(text) => setAnswers(prev => ({ ...prev, [question.id]: prev[question.id] ? `${prev[question.id]} ${text}` : text }))}
                    className="w-10 h-10 shadow-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(s => s - 1)}
                className="btn-secondary flex items-center justify-center gap-2 py-4 px-8 font-bold"
              >
                <ArrowLeft className="w-5 h-5" />
                {t("onboarding.back")}
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!answers[question.id] || loading}
              className="btn-primary flex-1 py-4 text-lg shadow-lg shadow-blue-500/20"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : isLastStep ? (
                t("onboarding.finish")
              ) : (
                <>
                  {t("onboarding.continue")}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
        
        <p className="text-center text-xs text-slate-400 font-medium">
          Your data is used only to personalize your career roadmap.
        </p>
      </div>
    </div>
  );
}
