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

  const QUESTIONS = [
    { id: 1, text: t("q1.text"), hint: t("q1.hint"), type: "select", options: [t("q1.opt1"), t("q1.opt2"), t("q1.opt3"), t("q1.opt4")] },
    { id: 2, text: t("q2.text"), hint: t("q2.hint"), type: "select", options: [t("q2.opt1"), t("q2.opt2"), t("q2.opt3"), t("q2.opt4")] },
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
          router.push("/path-selection");
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
    <div className="relative min-h-screen bg-[#0A0A0C] text-white flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Orbs */}
      <div className="aurora-blob w-[600px] h-[600px] bg-blue-600/10 -top-20 -left-20 rounded-full"></div>
      <div className="aurora-blob w-[400px] h-[400px] bg-indigo-600/10 bottom-0 right-0 rounded-full" style={{ animationDelay: '3s' }}></div>
      <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-4xl relative z-10 animate-fadeInUp">
        
        {/* Progress Header */}
        <div className="mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">Profile Construction</span>
          </div>
          
          <div className="w-full flex gap-2 px-4 h-1.5">
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`h-full flex-1 rounded-full transition-all duration-700 ${
                  i < currentStep ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" :
                  i === currentStep ? "bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]" : "bg-white/10"
                }`}
              />
            ))}
          </div>
          <div className="mt-6 flex items-center gap-4">
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Step {currentStep + 1} of {QUESTIONS.length}</span>
             <span className="text-2xl grayscale hover:grayscale-0 transition-all">{STEP_EMOJIS[currentStep]}</span>
          </div>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
           <div className="text-center md:text-left">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 leading-[1.1] animate-fadeInUp">
                {question.text}
              </h2>
              <p className="text-xl text-slate-400 font-medium opacity-80 border-l-4 border-blue-600/30 pl-6">
                {question.hint}
              </p>
           </div>

           <div className="glass-card p-10 relative overflow-hidden group shadow-[0_32px_64px_rgba(0,0,0,0.5)] border-white/10">
              {/* Question Index Badge - Pushed further back */}
              <div className="absolute top-4 right-8 text-[120px] font-black text-white/[0.03] pointer-events-none select-none z-0">
                0{currentStep + 1}
              </div>

              <div className="relative z-10 space-y-6">
                {question.type === "select" && (
                  <div className="grid gap-3">
                    {question.options?.map((opt) => {
                      const isSelected = answers[question.id] === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => setAnswers({ ...answers, [question.id]: opt })}
                          className={`w-full flex items-center justify-between p-6 rounded-2xl border transition-all text-left group/btn ${
                            isSelected
                              ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_30px_rgba(59,130,246,0.3)] scale-[1.02]"
                              : "bg-white/5 border-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
                          }`}
                        >
                          <span className="font-black uppercase tracking-widest text-[10px]">{opt}</span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected ? "bg-white border-white" : "border-white/10 group-hover/btn:border-white/30"
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {(question.type === "text" || question.type === "number") && (
                  <div className="relative pt-4">
                    <input
                      type={question.type}
                      placeholder={question.placeholder || "Describe in your own words..."}
                      value={answers[question.id] || ""}
                      onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 pr-20 text-2xl font-black text-white placeholder:text-white/10 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all tracking-tight"
                      autoFocus
                    />
                    <div className="absolute right-4 bottom-4">
                      <SpeechInput 
                        language={LANG_MAP[language]} 
                        onResult={(text) => setAnswers(prev => ({ ...prev, [question.id]: prev[question.id] ? `${prev[question.id]} ${text}` : text }))}
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
                    className="w-full sm:w-auto flex items-center justify-center gap-3 py-5 px-10 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-white hover:bg-white/10 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t("onboarding.back")}
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={!answers[question.id] || loading}
                  className="w-full flex-1 py-5 text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(59,130,246,0.3)] bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale transition-all"
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

        <div className="mt-16 flex items-center justify-center gap-4 text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">
           <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Your responses are encrypted and private
           </div>
        </div>
      </div>
    </div>
  );
}
