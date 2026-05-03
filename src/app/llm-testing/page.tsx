"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2, Sparkles, Download } from "lucide-react";

type SubtopicData = {
  subtopic_id: string;
  title: string;
  practical_task: string;
  task_type: string;
  youtube_search_query: string;
  complexity_branch: string;
};

type ModuleData = {
  module_id: number;
  module_title: string;
  subtopics: SubtopicData[];
};

type PathData = {
  title: string;
  summary: string;
  incomeMin: number;
  incomeMax: number;
  weeks: number;
  matchReason: string;
};

type ResultData = {
  paths: PathData[];
  selectedPathIndex: number;
  roadmap: { modules: ModuleData[] } | null;
  profile: Record<string, unknown>;
  generatedAt: string;
};

const STEP_EMOJIS = ["📍", "🎂", "👤", "🎓", "🛠️", "💼", "💰", "📱", "🗣️", "💪"];

const QUESTIONS = [
  { id: 1, text: "Where are you currently located?", hint: "This helps us find opportunities near you", type: "select", options: ["Metro City", "Tier-2 City", "Rural Area", "Village"] },
  { id: 2, text: "What is your age group?", hint: "This helps us suggest age-appropriate career paths", type: "select", options: ["18-24", "25-34", "35-44", "45+"] },
  { id: 3, text: "What is your gender?", hint: "Helps us suggest safer and more relevant job paths", type: "select", options: ["Male", "Female", "Other", "Prefer not to say"] },
  { id: 4, text: "What is your highest level of education?", hint: "We'll match tasks to your education level", type: "select", options: ["None", "Primary School", "High School", "Graduate"] },
  { id: 5, text: "What kind of work interests you?", hint: "Tell us what excites you — even something small like 'bikes' or 'cooking'", type: "text", placeholder: "e.g. 'electrical wiring', 'cooking', 'bikes'" },
  { id: 6, text: "How much work experience do you have?", hint: "No experience? No problem — everyone starts somewhere!", type: "select", options: ["No experience — just starting out", "Some informal work (home/shop/farm)", "1-2 years of work", "3+ years of work"] },
  { id: 7, text: "What is your target monthly income?", hint: "We'll find paths that match your income goal", type: "number", placeholder: "e.g. 15000" },
  { id: 8, text: "What device do you use most?", hint: "This helps us give you tasks you can actually do on your device", type: "select", options: ["Smartphone only", "Smartphone + Laptop", "Laptop/Desktop only", "Feature phone / basic mobile only"] },
  { id: 9, text: "Preferred language for learning?", hint: "Learn in the language you're most comfortable with", type: "select", options: ["English", "Hindi", "Kannada"] },
  { id: 10, text: "How confident are you with digital skills?", hint: "Be honest — there's no wrong answer here", type: "select", options: ["1 — Not at all", "2 — A little", "3 — Okay", "4 — Fairly confident", "5 — Very confident"] },
];

export default function LLMTestingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [testCount, setTestCount] = useState(0);
  const [phase, setPhase] = useState<"onboarding" | "results">("onboarding");
  const [alreadySaved, setAlreadySaved] = useState(false);

  const question = QUESTIONS[currentStep];
  const isLastStep = currentStep === QUESTIONS.length - 1;

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/llm-testing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: answers[1] || "",
          ageGroup: answers[2] || "",
          gender: answers[3] || "",
          educationLevel: answers[4] || "",
          workInterest: answers[5] || "",
          experienceLevel: answers[6] || "",
          targetIncomeExact: answers[7] ? parseInt(answers[7] as string) : 15000,
          deviceType: answers[8] || "",
          languagePreference: answers[9] || "English",
          confidenceLevel: answers[10] ? parseInt(answers[10] as string) : 3,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setAlreadySaved(false);
      setSaveStatus(null);
      setPhase("results");
    } catch (err) {
      alert("Generation failed: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!result || alreadySaved) return;
    setSaving(true);
    setSaveStatus(null);
    try {
      const res = await fetch("/api/llm-testing/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
        cache: "no-store",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTestCount((c) => c + 1);
      setAlreadySaved(true);
      setSaveStatus(`✅ Saved as Row #${data.serial} (Total: ${data.totalRows} rows) → LLM-testing/test_results.xlsx`);
    } catch (err) {
      console.error("Save error:", err);
      setSaveStatus("❌ Save failed: " + (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setPhase("onboarding");
    setCurrentStep(0);
    setAnswers({});
    setResult(null);
    setSaveStatus(null);
    setAlreadySaved(false);
  }

  function handleNext() {
    if (!answers[question.id]) return;
    if (isLastStep) {
      handleGenerate();
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  // ─── ONBOARDING PHASE ───
  if (phase === "onboarding") {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="w-full animate-fadeInUp">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3 h-3" />
              LLM Testing Mode
            </div>
            <h1 className="text-3xl font-bold text-slate-800">
              Test the AI Career Engine
            </h1>
            <p className="text-slate-400 mt-2 text-sm">Fill in user inputs → Generate → Save to Excel</p>
            {testCount > 0 && (
              <div className="inline-flex items-center gap-2 mt-4 bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-xs font-bold">
                ✅ {testCount} test(s) saved to Excel
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-10 px-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-slate-400">
                Step {currentStep + 1} / {QUESTIONS.length}
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
                <input
                  type={question.type}
                  placeholder={question.placeholder || "Type your answer..."}
                  value={answers[question.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                  className="input p-6 text-lg md:text-xl font-medium !rounded-2xl"
                  autoFocus
                />
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(s => s - 1)}
                  className="btn-secondary flex items-center justify-center gap-2 py-4 px-8 font-bold"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
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
                  "🚀 Generate Roadmap"
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 font-medium">
            LLM Testing Mode — Results will be saved to LLM-testing/test_results.xlsx
          </p>
        </div>
      </div>
    );
  }

  // ─── RESULTS PHASE ───
  return (
    <div className="min-h-screen bg-[#0B1120] text-[#E2E8F0] font-sans">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1E3A5F] to-[#0B1120] border-b border-[#1E3A5F] px-10 py-6 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-blue-400" />
              LLM Test Intelligence
            </h1>
            <p className="text-[#64748B] text-xs font-bold uppercase tracking-widest mt-1">
              Generated at {result?.generatedAt ? new Date(result.generatedAt).toLocaleString("en-IN") : "N/A"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={handleSave} 
              disabled={saving || alreadySaved} 
              className={`
                px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95
                ${alreadySaved 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20"}
                disabled:opacity-50
              `}
            >
              <Download className="w-4 h-4" />
              {alreadySaved ? "Saved to Excel" : saving ? "Saving Intel..." : "Export to Excel"}
            </button>
            <button 
              onClick={handleReset} 
              className="px-6 py-3 rounded-2xl bg-[#1E293B] text-[#94A3B8] border border-[#334155] text-sm font-black uppercase tracking-widest hover:text-white hover:border-[#475569] transition-all"
            >
              New Test
            </button>
            <div className="bg-[#1E293B] px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/10">
              Saved Rows: {testCount}
            </div>
          </div>
        </div>
      </div>

      {saveStatus && (
        <div className="max-w-7xl mx-auto px-10 mt-6 animate-fadeIn">
          <div className={`
            px-6 py-4 rounded-2xl text-sm font-bold border flex items-center gap-3
            ${saveStatus.startsWith("✅") 
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
              : "bg-rose-500/10 text-rose-400 border-rose-500/20"}
          `}>
            {saveStatus}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-10 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input & Paths (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Input Summary */}
          <div className="bg-[#111827] border border-[#1E3A5F] rounded-[2rem] p-8 shadow-2xl">
            <h3 className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em] mb-6">User Context</h3>
            <div className="grid grid-cols-2 gap-4">
              {QUESTIONS.map((q) => (
                <div key={q.id} className="bg-[#0D1117] rounded-2xl p-4 border border-[#1E293B]">
                  <div className="text-[8px] font-black text-[#64748B] uppercase tracking-widest mb-1 truncate">
                    {q.text.split("?")[0].split("your ").pop()}
                  </div>
                  <div className="text-xs font-bold text-[#E2E8F0] truncate">
                    {answers[q.id] || "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Paths */}
          <div className="bg-[#111827] border border-[#1E3A5F] rounded-[2rem] p-8 shadow-2xl">
            <h3 className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em] mb-6">Identified Career Paths</h3>
            <div className="space-y-4">
              {result?.paths.map((p, i) => (
                <div key={i} className={`
                  p-5 rounded-2xl border transition-all
                  ${i === result.selectedPathIndex 
                    ? "bg-[#0F2940] border-blue-500 shadow-lg shadow-blue-600/10" 
                    : "bg-[#0D1117] border-[#1E293B] opacity-60"}
                `}>
                  {i === result.selectedPathIndex && (
                    <div className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-2">Selected Pathway</div>
                  )}
                  <h4 className="text-sm font-black text-white mb-2">{p.title}</h4>
                  <p className="text-[10px] text-[#94A3B8] leading-relaxed mb-4">{p.summary}</p>
                  <div className="flex gap-2">
                    <span className="text-[9px] font-black bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md border border-blue-500/20">₹{p.incomeMin/1000}k-₹{p.incomeMax/1000}k</span>
                    <span className="text-[9px] font-black bg-slate-500/10 text-slate-400 px-2 py-1 rounded-md border border-slate-500/20">{p.weeks}W</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Roadmap & Raw Data (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Roadmap Modules */}
          <div className="space-y-6">
            {result?.roadmap?.modules.map((mod) => (
              <div key={mod.module_id} className="bg-[#111827] border border-[#1E3A5F] rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                <h3 className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">M{mod.module_id}</span>
                  {mod.module_title}
                </h3>
                <div className="space-y-4">
                  {mod.subtopics.map((st, i) => (
                    <div key={i} className="bg-[#0D1117] border border-[#1E293B] rounded-2xl p-6 group hover:border-[#2D3A5F] transition-all">
                      <div className="flex gap-4 items-start">
                        <div className="text-xl opacity-30 group-hover:opacity-100 transition-opacity">{(i+1).toString().padStart(2, '0')}</div>
                        <div className="flex-1">
                          <h4 className="text-base font-black text-white mb-2 tracking-tight">{st.title}</h4>
                          <div className="bg-[#111827] rounded-xl p-4 mb-4 border border-[#1E293B]/50">
                            <p className="text-xs text-[#94A3B8] font-medium leading-relaxed italic">" {st.practical_task} "</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">Type: {st.task_type}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20">{st.complexity_branch}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">🔍 {st.youtube_search_query}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Raw JSON */}
          <div className="bg-[#111827] border border-[#1E3A5F] rounded-[2rem] p-8 shadow-2xl">
            <h3 className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em] mb-6">System Debug Payload</h3>
            <pre className="bg-[#0D1117] border border-[#1E293B] rounded-2xl p-8 text-[10px] text-[#475569] overflow-auto max-h-[500px] custom-scrollbar leading-relaxed">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1E3A5F; border-radius: 10px; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}

