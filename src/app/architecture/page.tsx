"use client";

import { ArrowRight, Brain, Target, Compass, BookOpen, Activity, UserCircle2, MessageCircle, BarChart3, ChevronDown, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ArchitecturePage() {
  const { t } = useLanguage();

  const layers = [
    {
      title: "1. Learner Profiling",
      icon: UserCircle2,
      color: "from-blue-500 to-indigo-500",
      desc: "Captures location, education, and raw skills in regional languages to contextualize the learning path.",
      file: "src/app/actions.ts (saveOnboardingProfile)"
    },
    {
      title: "2. Path Recommendation",
      icon: Compass,
      color: "from-blue-500 to-indigo-500",
      desc: "AI generates realistic, hyper-local gig economy options based on the user's profile.",
      file: "src/lib/ai/generate-paths.ts"
    },
    {
      title: "3. Diagnostic Assessment",
      icon: Target,
      color: "from-blue-500 to-indigo-500",
      desc: "An 8-question pre-test establishes a baseline capability score before learning begins.",
      file: "src/app/api/pre-test/route.ts"
    },
    {
      title: "4. Progressive Roadmap",
      icon: BookOpen,
      color: "from-blue-500 to-indigo-500",
      desc: "Curriculum is generated as practical, micro-learning tasks mapped to specific YouTube tutorials.",
      file: "src/lib/ai/generate-roadmap.ts"
    },
    {
      title: "5. Knowledge Tracing (BKT)",
      icon: Brain,
      color: "from-blue-500 to-indigo-500",
      desc: "Bayesian Knowledge Tracing calculates the probability of mastery for each subtopic after every quiz.",
      file: "src/lib/adaptive/bkt-engine.ts"
    },
    {
      title: "6. Behavioral Observation",
      icon: Activity,
      color: "from-blue-500 to-indigo-500",
      desc: "Tracks time spent, consecutive failures, and streak consistency to detect struggle in real-time.",
      file: "src/lib/adaptive/triggers.ts"
    },
    {
      title: "7. Proactive Mentoring",
      icon: MessageCircle,
      color: "from-blue-500 to-indigo-500",
      desc: "AI Mentor intervenes automatically when the user is stuck, adjusting scaffolding based on BKT mastery.",
      file: "src/lib/ai/build-mentor-context.ts"
    },
    {
      title: "8. Outcome Measurement",
      icon: BarChart3,
      color: "from-emerald-500 to-cyan-500",
      desc: "Calculates Normalized Learning Gain (Hake) and captures qualitative SDG 8 outcomes (e.g., job secured).",
      file: "src/app/actions.ts (getAnalyticsData)"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-fadeInUp">
      
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-500 px-4 py-1.5 rounded-full text-xs font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          Technical Overview
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight leading-tight mb-4">
          Platform Architecture
        </h1>
        <p className="text-lg text-text-secondary max-w-3xl mx-auto leading-relaxed">
          An 8-layer adaptive feedback loop designed for measurable upskilling outcomes.
        </p>
      </div>

      {/* Architecture Visualization */}
      <div className="relative space-y-16">
        
        {/* Animated Blueprint Background Lines */}
        <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none opacity-5">
           <div className="w-full h-full border border-blue-500 rounded-full scale-110" />
           <div className="absolute w-full h-full border border-blue-500 rounded-full scale-75" />
           <div className="absolute w-full h-full border border-blue-500 rounded-full scale-50" />
        </div>

        {layers.map((layer, idx) => (
          <div key={idx} className="relative group">
            
            {/* Step Connection Indicator */}
            {idx < layers.length - 1 && (
              <div className="absolute left-1/2 -bottom-12 -translate-x-1/2 flex flex-col items-center gap-1 z-0">
                <div className="w-1 h-1 rounded-full bg-blue-500/20" />
                <div className="w-1 h-1 rounded-full bg-blue-500/40" />
                <div className="w-1 h-1 rounded-full bg-blue-500/60" />
                <ChevronDown className="w-4 h-4 text-blue-500" />
              </div>
            )}

            {/* Layer Card */}
            <div className="card p-8 md:p-10 relative overflow-hidden group hover:border-blue-500/30 transition-all">
              {/* Layer Number Badge */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${layer.color} opacity-[0.03] rounded-bl-[100px] -z-10`} />
              
              <div className="flex flex-col md:flex-row gap-10 items-center">
                
                {/* Icon Container */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${layer.color} flex items-center justify-center flex-shrink-0`}>
                  <layer.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold text-foreground tracking-tight">{layer.title}</h3>
                    <div className="h-px flex-1 bg-border hidden md:block" />
                  </div>
                  
                  <p className="text-base text-text-secondary leading-relaxed mb-4">
                    {layer.desc}
                  </p>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <div className="inline-flex items-center gap-2 bg-input border border-border text-text-tertiary px-3 py-1.5 rounded-lg text-xs font-medium">
                      <BookOpen className="w-3.5 h-3.5" />
                      {layer.file}
                    </div>
                    {idx === 4 && (
                      <div className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-xs font-medium">
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
      <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-8 border-blue-500/20 bg-blue-500/5">
          <h4 className="text-sm font-semibold text-blue-500 mb-3">Architecture Compliance</h4>
          <p className="text-text-secondary text-sm leading-relaxed">
            The CareerOrbit architecture implements Vygotsky&apos;s Zone of Proximal Development (ZPD) 
            through a Bayesian Knowledge Tracing (BKT) engine, ensuring that all AI interventions 
            are pedagogically grounded and measurable.
          </p>
        </div>

        <div className="card p-8 border-indigo-500/20 bg-indigo-500/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-sm font-semibold text-indigo-500">Zero-Trust AI Security</h4>
          </div>
          <p className="text-text-secondary text-sm leading-relaxed mb-4 italic">
            &quot;We employ a Zero-Trust AI Architecture. By combining model-level safety (ShieldGemma/Phi-4 DPO) with application-level grounding (BKT State + JSON Schema Enforcement), we ensure the LLM acts strictly as an educational mentor.&quot;
          </p>
          <ul className="text-xs text-text-tertiary font-medium space-y-2">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Input Sanitization (Prompt Shields)
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Strict Schema Validation (Zod)
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Immutable System Instruction Layer
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
