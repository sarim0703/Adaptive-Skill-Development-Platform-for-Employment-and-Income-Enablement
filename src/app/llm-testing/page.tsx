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
    <div style={{ minHeight: "100vh", background: "#0B1120", color: "#E2E8F0", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1E3A5F 0%, #0B1120 100%)", borderBottom: "1px solid #1E3A5F", padding: "24px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#fff" }}>🧪 LLM Test Results</h1>
            <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: 13 }}>Generated at {result?.generatedAt ? new Date(result.generatedAt).toLocaleString("en-IN") : "N/A"}</p>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={handleSave} disabled={saving || alreadySaved} style={{
              padding: "10px 24px",
              background: alreadySaved ? "#1E293B" : saving ? "#374151" : "linear-gradient(135deg, #059669, #047857)",
              color: alreadySaved ? "#34D399" : "#fff",
              border: alreadySaved ? "1px solid #059669" : "none",
              borderRadius: 12, fontSize: 14, fontWeight: 700,
              cursor: alreadySaved ? "default" : "pointer",
              display: "flex", alignItems: "center", gap: 8,
              opacity: alreadySaved ? 0.8 : 1,
            }}>
              <Download style={{ width: 16, height: 16 }} />
              {alreadySaved ? "✅ Saved" : saving ? "Saving..." : "Save to Excel"}
            </button>
            <button onClick={handleReset} style={{
              padding: "10px 24px", background: "#1E293B", color: "#94A3B8", border: "1px solid #334155",
              borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}>
              🔄 New Test
            </button>
            <div style={{ background: "#1E293B", padding: "8px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700, color: "#34D399" }}>
              Tests Saved: {testCount}
            </div>
          </div>
        </div>
      </div>

      {saveStatus && (
        <div style={{ maxWidth: 1200, margin: "12px auto 0", padding: "0 40px" }}>
          <div style={{
            padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600,
            background: saveStatus.startsWith("✅") ? "#052e16" : "#450a0a",
            color: saveStatus.startsWith("✅") ? "#34D399" : "#F87171",
            border: saveStatus.startsWith("✅") ? "1px solid #14532d" : "1px solid #7f1d1d",
          }}>
            {saveStatus}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 40px" }}>
        {/* Input Summary */}
        <div style={cardStyle}>
          <h3 style={sectionTitle}>Input Profile Summary</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {QUESTIONS.map((q) => (
              <div key={q.id} style={{ background: "#0D1117", borderRadius: 12, padding: 14, border: "1px solid #1E293B" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>
                  {STEP_EMOJIS[q.id - 1]} {q.text.split("?")[0].split("your ").pop()}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#E2E8F0" }}>
                  {answers[q.id] || "—"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Paths */}
        {result && (
          <div style={{ ...cardStyle, marginTop: 24 }}>
            <h3 style={sectionTitle}>Generated Career Paths ({result.paths.length})</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {result.paths.map((p, i) => (
                <div key={i} style={{
                  background: i === result.selectedPathIndex ? "#0F2940" : "#0D1117",
                  border: i === result.selectedPathIndex ? "2px solid #3B82F6" : "1px solid #1E293B",
                  borderRadius: 16, padding: 20,
                }}>
                  {i === result.selectedPathIndex && (
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#3B82F6", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
                      ▶ Selected for Roadmap
                    </div>
                  )}
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "#F1F5F9", margin: "0 0 8px" }}>{p.title}</h4>
                  <p style={{ fontSize: 13, color: "#94A3B8", margin: "0 0 12px", lineHeight: 1.5 }}>{p.summary}</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={tagStyle}>₹{p.incomeMin?.toLocaleString()} - ₹{p.incomeMax?.toLocaleString()}/mo</span>
                    <span style={tagStyle}>{p.weeks} weeks</span>
                  </div>
                  <p style={{ fontSize: 11, color: "#64748B", marginTop: 10, fontStyle: "italic" }}>{p.matchReason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Roadmap Modules */}
        {result?.roadmap?.modules.map((mod) => (
          <div key={mod.module_id} style={{ ...cardStyle, marginTop: 24 }}>
            <h3 style={sectionTitle}>Module {mod.module_id}: {mod.module_title}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {mod.subtopics.map((st, i) => (
                <div key={i} style={{
                  background: "#0D1117", border: "1px solid #1E293B", borderRadius: 12, padding: 16,
                  display: "flex", gap: 16, alignItems: "flex-start",
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: "#1E3A5F", color: "#3B82F6",
                    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0", margin: "0 0 4px" }}>{st.title}</h4>
                    <p style={{ fontSize: 13, color: "#94A3B8", margin: "0 0 8px" }}>📋 {st.practical_task}</p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ ...tagStyle, background: "#1E293B" }}>Type: {st.task_type}</span>
                      <span style={{ ...tagStyle, background: "#1E293B" }}>Level: {st.complexity_branch}</span>
                      <span style={{ ...tagStyle, background: "#0F2940", color: "#60A5FA" }}>🔍 {st.youtube_search_query}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Raw JSON */}
        {result && (
          <div style={{ ...cardStyle, marginTop: 24 }}>
            <h3 style={sectionTitle}>Raw LLM Response (JSON)</h3>
            <pre style={{
              background: "#0D1117", border: "1px solid #1E293B", borderRadius: 12, padding: 20,
              fontSize: 11, color: "#94A3B8", overflow: "auto", maxHeight: 400, whiteSpace: "pre-wrap",
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Styles ──
const cardStyle: React.CSSProperties = {
  background: "#111827",
  border: "1px solid #1E3A5F",
  borderRadius: 20,
  padding: 28,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  color: "#64748B",
  textTransform: "uppercase",
  letterSpacing: 2,
  marginBottom: 16,
};

const tagStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#94A3B8",
  background: "#1E3A5F22",
  padding: "4px 10px",
  borderRadius: 8,
  border: "1px solid #1E3A5F",
};
