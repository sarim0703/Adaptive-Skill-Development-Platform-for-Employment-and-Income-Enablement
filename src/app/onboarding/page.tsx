"use client";

import { useState } from "react";
import { saveOnboardingProfile } from "../actions";
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import SpeechInput from "@/components/SpeechInput";

const STEP_EMOJIS = ["📍", "🎂", "👤", "🎓", "🛠️", "💼", "💰", "📱", "🗣️", "💪"];

const LANG_MAP: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  kn: 'kn-IN'
};

export default function OnboardingPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [interimSpeech, setInterimSpeech] = useState("");

  const QUESTIONS = [
// ... (QUESTIONS array remains same)
    { id: 1, text: t("q1.text"), hint: t("q1.hint"), type: "select", options: [t("q1.opt1"), t("q1.opt2"), t("q1.opt3"), t("q1.opt4")] },
    { id: 2, text: t("q2.text"), hint: t("q2.hint"), type: "select", options: [t("q2.opt1"), t("q2.opt2"), t("q2.opt3"), t("q2.opt4"), t("q2.opt5")] },
    { id: 3, text: t("q3.text"), hint: t("q3.hint"), type: "select", options: [t("q3.opt1"), t("q3.opt2"), t("q3.opt3"), t("q3.opt4")] },
    { id: 4, text: t("q4.text"), hint: t("q4.hint"), type: "select", options: [t("q4.opt1"), t("q4.opt2"), t("q4.opt3"), t("q4.opt4")] },
    { id: 5, text: t("q5.text"), hint: t("q5.hint"), type: "text", placeholder: "e.g. 'electrical wiring', 'cooking', 'bikes'" },
    { id: 6, text: t("q6.text"), hint: t("q6.hint"), type: "select", options: [t("q6.opt1"), t("q6.opt2"), t("q6.opt3"), t("q6.opt4")] },
    { id: 7, text: t("q7.text"), hint: t("q7.hint"), type: "number", placeholder: "e.g. 15000" },
    { id: 8, text: t("q8.text"), hint: t("q8.hint"), type: "select", options: [t("q8.opt1"), t("q8.opt2"), t("q8.opt3"), t("q8.opt4")] },
    { id: 9, text: t("q9.text"), hint: t("q9.hint"), type: "select", options: [t("q9.opt1"), t("q9.opt2"), t("q9.opt3")] },
    { id: 10, text: t("q10.text"), hint: t("q10.hint"), type: "select", options: [t("q10.opt1"), t("q10.opt2"), t("q10.opt3"), t("q10.opt4"), t("q10.opt5")] },
  ];

  const question = QUESTIONS[currentStep];
  const isLastStep = currentStep === QUESTIONS.length - 1;

  async function handleNext() {
    if (!answers[question.id]) return;

    if (isLastStep) {
      setLoading(true);
      try {
        const res = await saveOnboardingProfile(answers);
        if (res.success) {
          router.push(res.destination || "/path-selection");
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 overflow-hidden transition-colors duration-300">

      <div className="w-full max-w-4xl relative z-10 animate-fadeInUp">
        
        {/* Progress Header */}
        <div className="mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-border backdrop-blur-md mb-8">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs font-medium text-text-secondary">Onboarding</span>
          </div>
          
          <div className="w-full flex gap-2 px-4 h-1.5">
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`h-full flex-1 rounded-full transition-all duration-700 ${
                  i < currentStep ? "bg-blue-500" :
                  i === currentStep ? "bg-foreground" : "bg-foreground/10"
                }`}
              />
            ))}
          </div>
          <div className="mt-6 flex items-center gap-4">
             <span className="text-xs font-medium text-text-tertiary">Step {currentStep + 1} of {QUESTIONS.length}</span>
             <span className="text-2xl grayscale hover:grayscale-0 transition-all">{STEP_EMOJIS[currentStep]}</span>
          </div>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
           <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6 leading-tight text-foreground">
                {question.text}
              </h2>
              <p className="text-base text-text-secondary border-l-2 border-blue-500/30 pl-5">
                {question.hint}
              </p>
           </div>

           <div className="bg-card border border-border rounded-xl p-8 relative overflow-hidden">

              <div className="relative z-10 space-y-6">
                {question.type === "select" && (
                  <div className="grid gap-3">
                    {question.options?.map((opt) => {
                      const isSelected = answers[question.id] === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => setAnswers({ ...answers, [question.id]: opt })}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left group/btn ${
                            isSelected
                              ? "bg-blue-600 border-blue-500 text-white"
                              : "bg-input border-border text-text-secondary hover:border-border-hover hover:bg-card-hover"
                          }`}
                        >
                          <span className="text-sm font-medium">{opt}</span>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected ? "bg-white border-white" : "border-border-hover group-hover/btn:border-foreground/30"
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {(question.type === "text" || question.type === "number") && (
                  <div className="relative pt-6">
                    {/* Live Preview Bubble */}
                    {interimSpeech && (
                      <div className="absolute -top-4 left-0 right-0 z-20 flex justify-center pointer-events-none">
                        <div className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-full shadow-[0_10px_30px_rgba(37,99,235,0.4)] animate-bounce flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                           {interimSpeech}
                        </div>
                      </div>
                    )}

                    <input
                      type={question.type}
                      placeholder={question.placeholder || "Describe in your own words..."}
                      value={answers[question.id] || ""}
                      onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                      className="w-full bg-input border border-border rounded-2xl p-6 pr-20 text-lg font-medium text-foreground placeholder:text-text-muted outline-none focus:border-blue-500/50 focus:bg-card-hover transition-all min-h-[80px]"
                      autoFocus
                    />
                    <div className="absolute right-4 top-[58%] -translate-y-1/2 flex items-center">
                      <SpeechInput 
                        language={LANG_MAP[language]} 
                        onInterimResult={(text) => setInterimSpeech(text)}
                        onResult={(text) => {
                          setAnswers(prev => ({ ...prev, [question.id]: prev[question.id] ? `${prev[question.id]} ${text}` : text }));
                          setInterimSpeech("");
                        }}
                        className="w-12 h-12 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="mt-12 flex flex-col sm:flex-row gap-4 items-center relative z-10">
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep(s => s - 1)}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 py-3 px-8 rounded-xl bg-card border border-border text-text-secondary font-medium text-sm hover:text-foreground hover:bg-card-hover transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t("onboarding.back")}
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={!answers[question.id] || loading}
                  className="w-full flex-1 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition-all"
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
        </div>

        <div className="mt-12 flex items-center justify-center">
           <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-border">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-medium text-text-tertiary">Your responses are private</span>
           </div>
        </div>
      </div>
    </div>
  );
}
