"use client";

import { ArrowRight, Brain, Target, Compass, BookOpen, Activity, UserCircle2, MessageCircle, BarChart3, ChevronDown, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ArchitecturePage() {
  const { t } = useLanguage();

  const layers = [
    {
      title: "1. Learner Profiling",
      icon: UserCircle2,
      color: "from-[#007AFF] to-[#5856D6]",
      desc: "Captures location, education, and raw skills in regional languages to contextualize the learning path.",
      file: "src/app/actions.ts (saveOnboardingProfile)"
    },
    {
      title: "2. Path Recommendation",
      icon: Compass,
      color: "from-[#007AFF] to-[#5856D6]",
      desc: "AI generates realistic, hyper-local gig economy options based on the user's profile.",
      file: "src/lib/ai/generate-paths.ts"
    },
    {
      title: "3. Diagnostic Assessment",
      icon: Target,
      color: "from-[#007AFF] to-[#5856D6]",
      desc: "An 8-question pre-test establishes a baseline capability score before learning begins.",
      file: "src/app/api/pre-test/route.ts"
    },
    {
      title: "4. Progressive Roadmap",
      icon: BookOpen,
      color: "from-[#007AFF] to-[#5856D6]",
      desc: "Curriculum is generated as practical, micro-learning tasks mapped to specific YouTube tutorials.",
      file: "src/lib/ai/generate-roadmap.ts"
    },
    {
      title: "5. Knowledge Tracing (BKT)",
      icon: Brain,
      color: "from-[#007AFF] to-[#5856D6]",
      desc: "Bayesian Knowledge Tracing calculates the probability of mastery for each subtopic after every quiz.",
      file: "src/lib/adaptive/bkt-engine.ts"
    },
    {
      title: "6. Behavioral Observation",
      icon: Activity,
      color: "from-[#007AFF] to-[#5856D6]",
      desc: "Tracks time spent, consecutive failures, and streak consistency to detect struggle in real-time.",
      file: "src/lib/adaptive/triggers.ts"
    },
    {
      title: "7. Proactive Mentoring",
      icon: MessageCircle,
      color: "from-[#007AFF] to-[#5856D6]",
      desc: "AI Mentor intervenes automatically when the user is stuck, adjusting scaffolding based on BKT mastery.",
      file: "src/lib/ai/build-mentor-context.ts"
    },
    {
      title: "8. Outcome Measurement",
      icon: BarChart3,
      color: "from-[#34C759] to-[#30B0C7]",
      desc: "Calculates Normalized Learning Gain (Hake) and captures qualitative SDG 8 outcomes (e.g., job secured).",
      file: "src/app/actions.ts (getAnalyticsData)"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-fadeInUp">
      
      {/* Header */}
      <div className="text-center mb-20">
        <div className="inline-flex items-center gap-2 bg-[#007AFF]/10 text-[#007AFF] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
          <Sparkles className="w-4 h-4" />
          Technical Blueprint
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight leading-tight mb-6">
          SkillSync Architecture
        </h1>
        <p className="text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
          A high-fidelity 8-layer adaptive feedback loop designed for scientific precision in upskilling.
        </p>
      </div>

      {/* Architecture Visualization */}
      <div className="relative space-y-16">
        
        {/* Animated Blueprint Background Lines */}
        <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none opacity-5">
           <div className="w-full h-full border-[1px] border-[#007AFF] rounded-full scale-110" />
           <div className="absolute w-full h-full border-[1px] border-[#007AFF] rounded-full scale-75" />
           <div className="absolute w-full h-full border-[1px] border-[#007AFF] rounded-full scale-50" />
        </div>

        {layers.map((layer, idx) => (
          <div key={idx} className="relative group">
            
            {/* Step Connection Indicator */}
            {idx < layers.length - 1 && (
              <div className="absolute left-1/2 -bottom-12 -translate-x-1/2 flex flex-col items-center gap-1 z-0">
                <div className="w-1 h-1 rounded-full bg-[#007AFF]/20" />
                <div className="w-1 h-1 rounded-full bg-[#007AFF]/40" />
                <div className="w-1 h-1 rounded-full bg-[#007AFF]/60" />
                <ChevronDown className="w-4 h-4 text-[#007AFF]" />
              </div>
            )}

            {/* Layer Card */}
            <div className="card p-10 md:p-12 relative overflow-hidden group hover:border-[#007AFF]/50 transition-all">
              {/* Layer Number Badge */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${layer.color} opacity-[0.03] rounded-bl-[100px] -z-10`} />
              
              <div className="flex flex-col md:flex-row gap-10 items-center">
                
                {/* Icon Container */}
                <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${layer.color} flex items-center justify-center shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform flex-shrink-0`}>
                  <layer.icon className="w-10 h-10 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{layer.title}</h3>
                    <div className="h-px flex-1 bg-slate-100 hidden md:block" />
                  </div>
                  
                  <p className="text-lg text-slate-500 font-medium leading-relaxed mb-6">
                    {layer.desc}
                  </p>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 text-slate-400 px-4 py-2 rounded-xl text-xs font-bold tracking-wider">
                      <BookOpen className="w-3.5 h-3.5" />
                      {layer.file}
                    </div>
                    {idx === 4 && (
                      <div className="badge badge-indigo text-[10px] font-black uppercase tracking-widest">
                        Core Engine
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Technical Summary Footer */}
      <div className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card p-10 border-[#007AFF]/20 bg-[#007AFF]/5">
          <h4 className="text-sm font-black text-[#007AFF] uppercase tracking-[0.3em] mb-4">Architecture Compliance</h4>
          <p className="text-slate-600 font-medium leading-relaxed">
            The SkillSync architecture implements Vygotsky&apos;s Zone of Proximal Development (ZPD) 
            through a Bayesian Knowledge Tracing (BKT) engine, ensuring that all AI interventions 
            are pedagogically grounded and measurable.
          </p>
        </div>

        <div className="card p-10 border-[#5856D6]/20 bg-[#5856D6]/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center shadow-lg shadow-blue-500/10">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-sm font-black text-[#5856D6] uppercase tracking-[0.3em]">Zero-Trust AI Security</h4>
          </div>
          <p className="text-slate-600 font-medium leading-relaxed mb-4 italic">
            &quot;We employ a Zero-Trust AI Architecture. By combining model-level safety (ShieldGemma/Phi-4 DPO) with application-level grounding (BKT State + JSON Schema Enforcement), we ensure the LLM acts strictly as an educational mentor.&quot;
          </p>
          <ul className="text-xs text-slate-500 font-bold space-y-2 uppercase tracking-wider">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#5856D6]" />
              Input Sanitization (Prompt Shields)
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#5856D6]" />
              Strict Schema Validation (Zod)
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#5856D6]" />
              Immutable System Instruction Layer
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
