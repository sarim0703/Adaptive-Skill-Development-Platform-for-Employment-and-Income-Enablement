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
  const [onboardingMode, setOnboardingMode] = useState<"choice" | "wizard" | "smart" | "review">("choice");
  const [smartText, setSmartText] = useState("");
  const [isParsing, setIsParsing] = useState(false);


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
      submitProfile(answers);
    } else {
      setInterimSpeech(""); 
      setCurrentStep((s) => s + 1);
    }
  }

  async function submitProfile(profileData: Record<number | string, any>) {
    setLoading(true);
    try {
      const res = await saveOnboardingProfile(profileData);
      if (res.success) {
        router.push(res.destination || "/path-selection");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  async function handleSmartParse() {
    if (smartText.length < 15) return;
    setIsParsing(true);
    try {
      const res = await fetch("/api/onboarding/parse", {
        method: "POST",
        body: JSON.stringify({ text: smartText, language }),
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);

      // Map API response keys to the numeric question IDs the backend expects
      const mappedAnswers: Record<number, string> = {
        1: data.location,
        2: data.ageGroup,
        3: data.gender,
        4: data.educationLevel,
        5: data.workInterest,
        6: data.experienceLevel,
        7: data.targetIncomeExact.toString(),
        8: data.deviceType,
        9: data.languagePreference,
        10: data.confidenceLevel.toString(),
      };
      
      setAnswers(mappedAnswers);
      setOnboardingMode("review");
    } catch (err) {
      alert("Failed to understand. Try the step-by-step mode!");
      setOnboardingMode("wizard");
    } finally {
      setIsParsing(false);
    }
  }


  function handleBack() {
    setInterimSpeech(""); // Safety clear
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 overflow-hidden transition-colors duration-300">

      <div className="w-full max-w-4xl relative z-10 animate-fadeInUp">
        
        {/* Progress Header - Only show in Wizard mode */}
        {onboardingMode === "wizard" && (
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
        )}

        {/* ── Choice Phase ── */}
        {onboardingMode === "choice" && (
          <div className="flex flex-col items-center max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              {language === 'kn' ? 'ಸ್ವಾಗತ!' : language === 'hi' ? 'स्वागत है!' : 'Welcome!'}
            </h1>
            <p className="text-lg text-text-secondary mb-12">How would you like to build your profile today?</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <button 
                onClick={() => setOnboardingMode("smart")}
                className="group p-8 rounded-3xl bg-card border border-border hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Smart Mode</h3>
                <p className="text-sm text-text-tertiary leading-relaxed">Just tell us about yourself in a paragraph. Our AI will handle the rest.</p>
              </button>

              <button 
                onClick={() => setOnboardingMode("wizard")}
                className="group p-8 rounded-3xl bg-card border border-border hover:border-foreground/50 hover:bg-foreground/5 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-2xl bg-foreground/5 text-text-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Step-by-Step</h3>
                <p className="text-sm text-text-tertiary leading-relaxed">Prefer the traditional way? Fill out our guided form one question at a time.</p>
              </button>
            </div>
          </div>
        )}

        {/* ── Smart Mode Phase ── */}
        {onboardingMode === "smart" && (
          <div className="max-w-3xl mx-auto w-full">
            <button 
              onClick={() => {
                setOnboardingMode("choice");
                setSmartText("");
              }} 
              className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-foreground/5 text-text-tertiary hover:text-foreground hover:bg-foreground/10 mb-8 transition-all group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
              <span className="text-[10px] font-black uppercase tracking-widest">Switch Mode</span>
            </button>
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-4">Tell us your story</h2>
              <p className="text-text-secondary">Include things like your age, where you live, what you studied, and what kind of work you dream of doing.</p>
            </div>

            <div className="relative group">
              <textarea 
                value={smartText}
                onChange={(e) => setSmartText(e.target.value)}
                placeholder="e.g. I am a 22 year old graduate from Bangalore. I've always been interested in electrical work and fixing gadgets. I have a smartphone and I'm fairly confident with apps..."
                className="w-full h-64 bg-card border-2 border-border rounded-[2rem] p-10 text-lg leading-relaxed focus:border-blue-500 outline-none transition-all resize-none shadow-2xl shadow-blue-500/5 group-focus-within:shadow-blue-500/10"
              />
              
              <div className="absolute right-8 bottom-8 flex items-center gap-4">
                 <SpeechInput 
                    language={LANG_MAP[language]} 
                    onInterimResult={(text) => setInterimSpeech(text)}
                    onResult={(text) => setSmartText(prev => prev ? `${prev} ${text}` : text)}
                    className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-lg"
                 />
                 <button 
                  onClick={handleSmartParse}
                  disabled={smartText.length < 15 || isParsing}
                  className="h-14 px-8 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-500 transition-all disabled:opacity-30 shadow-xl shadow-blue-600/20"
                >
                  {isParsing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analyze Profile"}
                </button>
              </div>

              {interimSpeech && (
                <div className="absolute inset-x-10 -top-6 flex justify-center">
                   <div className="bg-blue-600 text-white text-sm font-bold px-6 py-3 rounded-2xl shadow-2xl animate-bounce">
                     {interimSpeech}...
                   </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Wizard Mode Phase ── */}
        {onboardingMode === "wizard" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="text-center md:text-left">
                <button 
                  onClick={() => {
                    setOnboardingMode("choice");
                    setCurrentStep(0);
                    setAnswers({});
                  }} 
                  className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-foreground/5 text-text-tertiary hover:text-foreground hover:bg-foreground/10 mb-8 transition-all group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                  <span className="text-[10px] font-black uppercase tracking-widest">Switch Mode</span>
                </button>
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
                      <input
                        type={question.type}
                        placeholder={question.placeholder || "Describe..."}
                        value={answers[question.id] || ""}
                        onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                        className="w-full bg-input border border-border rounded-2xl p-6 pr-20 text-lg font-medium text-foreground outline-none focus:border-blue-500/50 transition-all"
                        autoFocus
                      />
                      <div className="absolute right-4 top-[58%] -translate-y-1/2">
                        <SpeechInput 
                          language={LANG_MAP[language]} 
                          onResult={(text) => setAnswers(prev => ({ ...prev, [question.id]: prev[question.id] ? `${prev[question.id]} ${text}` : text }))}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-12 flex flex-col sm:flex-row gap-4 items-center relative z-10">
                  {currentStep > 0 && (
                    <button
                      onClick={handleBack}
                      className="w-full sm:w-auto flex items-center justify-center gap-3 py-3 px-8 rounded-xl bg-card border border-border text-text-secondary font-medium text-sm hover:text-foreground hover:bg-card-hover transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {t("onboarding.back")}
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    disabled={!answers[question.id] || loading}
                    className="w-full flex-1 py-3.5 text-sm font-semibold text-white bg-blue-600 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-500 disabled:opacity-50 transition-all"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isLastStep ? t("onboarding.finish") : t("onboarding.continue")}
                  </button>
                </div>
            </div>
          </div>
        )}

        {/* ── Review Phase ── */}
        {onboardingMode === "review" && (
          <div className="max-w-2xl mx-auto w-full">
            <div className="text-center mb-12">
               <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8" />
               </div>
               <h2 className="text-3xl font-bold mb-2">Almost there!</h2>
               <p className="text-text-secondary">We've understood your profile. Review the details below.</p>
            </div>

            <div className="bg-card border border-border rounded-[2rem] p-8 shadow-2xl mb-8">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {QUESTIONS.map((q) => (
                    <div key={q.id} className="p-4 rounded-2xl bg-input border border-border focus-within:border-blue-500/50 transition-all relative group">
                       <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest block mb-1">
                         {q.text.split("?")[0]}
                       </span>
                       <input 
                         type="text"
                         value={answers[q.id] || ""}
                         onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                         className="w-full bg-transparent text-sm font-bold text-foreground outline-none border-none p-0 focus:ring-0"
                       />
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Sparkles className="w-3 h-3 text-blue-500/50" />
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="flex gap-4">
               <button 
                  onClick={() => setOnboardingMode("smart")}
                  className="flex-1 py-4 rounded-2xl bg-card border border-border text-xs font-bold hover:bg-card-hover transition-all"
                >
                  Edit Story
               </button>
               <button 
                  onClick={() => {
                    setOnboardingMode("wizard");
                    setCurrentStep(0);
                  }}
                  className="flex-1 py-4 rounded-2xl bg-card border border-border text-xs font-bold hover:bg-card-hover transition-all"
                >
                  Fill Manually
               </button>
               <button 
                  onClick={() => submitProfile(answers)}
                  disabled={loading}
                  className="flex-[2] py-4 rounded-2xl bg-blue-600 text-white text-sm font-black uppercase tracking-widest hover:bg-blue-500 shadow-xl shadow-blue-600/20 disabled:opacity-50 transition-all"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Perfect, Let's Start!"}
               </button>
            </div>
          </div>
        )}


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
