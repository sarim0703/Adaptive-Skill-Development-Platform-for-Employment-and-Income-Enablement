"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, UserCircle2, Compass, Target, LineChart, Network, Database, BookOpen, Brain, Activity, Bot, ShieldCheck, PlaySquare, Filter, RefreshCcw, CheckCircle2, LayoutDashboard, TrendingUp, GraduationCap, Globe } from "lucide-react";
import { ParticleLayer } from "@/components/ParticleLayer";
import { MindMapNode } from "@/components/MindMapNode";
import { MindMapLine } from "@/components/MindMapLine";
import { TechnicalSidePanel, TechnicalData } from "@/components/TechnicalSidePanel";

const PHASES = [
  "System Overview",
  "Discovery & Onboarding",
  "BKT Diagnostic Baseline",
  "Live Curriculum Mapping",
  "BKT-First Adaptive Engine",
  "Hybrid Intelligence Layer",
  "Grounded Video Learning",
  "Assessment & Recalibration Loop",
  "Mastery Dashboard & Impact",
  "Research Impact & NSQF Alignment",
  "Full System Blueprint"
];

// Centralized Node Coordinates for the Cinematic Map
export const MAP_COORDS = {
  P1: { x: 0, y: 0 },         // Onboarding
  P2: { x: 350, y: 0 },       // Diagnostic
  P3: { x: 700, y: 0 },       // Mapping
  P4: { x: 1050, y: 0 },      // BKT Engine
  P5: { x: 1050, y: -250 },   // Hybrid AI (Branches Up)
  P6: { x: 1400, y: -250 },   // Video (Flows from AI)
  P7: { x: 1400, y: 250 },    // Quiz (Branches Down from BKT)
  P8: { x: 1750, y: 0 },      // Dashboard (Converges)
  P9: { x: 2100, y: 0 },      // Impact
};

const SIDE_PANEL_DATA: Record<number, TechnicalData> = {
  1: {
    id: "p1",
    title: "Dual-Mode Onboarding Pipeline",
    subtitle: "Data Ingestion & NSQF Mapper",
    color: "blue",
    purpose: "To ingest unstructured user goals, existing skills, and demographic context, and systematically map them to a standardized, mathematically viable learning trajectory.",
    keyLogic: [
      "<strong>Dual-Mode Ingestion:</strong> Uses a conversational NLP interface alongside a structured step-by-step wizard.",
      "<strong>Normalizer:</strong> Translates regional language dialects or informal phrasing into standardized skill vectors.",
      "<strong>Trajectory Matrix:</strong> Evaluates initial vectors against the NSQF to generate 3 tailored pathways, filtering out insurmountable barriers."
    ],
    interactions: "Pushes initial demographic and selected pathway data to PostgreSQL. Triggers the Diagnostic Baseline by defining the macro-scope of required Knowledge Components.",
    alignment: "Aligns directly with SDG 8. Guarantees the resulting curriculum has real-world labor market validity, preventing the pursuit of isolated skills with no structural employment value."
  },
  2: {
    id: "p2",
    title: "BKT Diagnostic Baseline",
    subtitle: "Bayesian Knowledge Tracing Engine",
    color: "rose",
    purpose: "The mathematical heart of CareerOrbit V3.1. It maintains a hidden Markov model for every individual Knowledge Component (KC) to track true cognitive mastery rather than simple completion metrics.",
    keyLogic: [
      "<strong>P(L₀) — Prior:</strong> Probability the user already knows the skill before any instruction.",
      "<strong>P(T) — Transit:</strong> Probability the user learns the skill after one learning opportunity.",
      "<strong>P(S) — Slip:</strong> Probability of getting it wrong even if the skill is known.",
      "<strong>P(G) — Guess:</strong> Probability of guessing correctly even if the skill is unknown.",
      "<strong>Correct Answer Update:</strong> P(L|Correct) = [P(L)·(1−P(S))] / [P(L)·(1−P(S)) + (1−P(L))·P(G)]",
      "<strong>Incorrect Answer Update:</strong> P(L|Incorrect) = [P(L)·P(S)] / [P(L)·P(S) + (1−P(L))·(1−P(G))]",
      "<strong>New State:</strong> P(L_{n+1}) = P(L_n|Obs) + (1 − P(L_n|Obs)) · P(T)",
      "<strong>Hybrid LLM + BKT:</strong> Classic BKT provides the deterministic mastery state. The LLM (GPT-5.0 class) handles rich content generation. Fusing both gives LLM creativity + BKT reliability."
    ],
    interactions: "Feeds the calculated P(L₀) directly into the BKT Engine to instantiate the hidden cognitive state matrix. Blocks Live Curriculum Mapping from executing until the diagnostic lock is secured.",
    alignment: "Adheres to the foundational requirement of Intelligent Tutoring Systems (ITS) to establish a scientifically valid control state. Fulfills Vygotsky's prerequisite for establishing a baseline before scaffolding."
  },
  3: {
    id: "p3",
    title: "Real-Time Dynamic Roadmap",
    subtitle: "Live Curriculum Generator",
    color: "amber",
    purpose: "To dynamically construct the user's learning journey on-the-fly, module by module, based strictly on their BKT diagnostic results and chosen NSQF pathway.",
    keyLogic: [
      "<strong>Streaming Orchestration:</strong> Uses the AI SDK to stream a highly structured JSON array of modules directly to the client interface.",
      "<strong>Atomic State Handoff:</strong> Once generated, the curriculum is securely locked into PostgreSQL.",
      "<strong>ZPD Constraint:</strong> Mathematically barred from inserting modules that exceed a cognitive load delta of +1 NSQF Level."
    ],
    interactions: "Consumes constraints from the Hybrid Intelligence Layer. Outputs UI structure and dictates search parameters for YouTube curation.",
    alignment: "Moves away from static MOOC structures, providing hyper-personalized scaffolding so marginalized learners are neither bored nor overwhelmed."
  },
  4: {
    id: "p4",
    title: "BKT-First Adaptive Engine",
    subtitle: "Core Intelligence Layer",
    color: "emerald",
    purpose: "The core intelligence layer. BKT continuously updates the user's mastery probabilities across every Knowledge Component (KC) and feeds this state into the LLM to dynamically adapt the curriculum.",
    keyLogic: [
      "<strong>Per-KC Mastery:</strong> Every KC has its own P(L) — an independent mastery probability updated after each interaction.",
      "<strong>P(L) &lt; 0.30 — Needs Foundation:</strong> Heavy scaffolding triggered. Micro-modules and remedial content injected.",
      "<strong>0.30 ≤ P(L) ≤ 0.70 — Optimal Zone:</strong> Standard curriculum pacing. Content difficulty matches cognitive load.",
      "<strong>P(L) &gt; 0.70 — Fast-Track:</strong> System accelerates to advanced tasks and skips redundant basics.",
      "<strong>Hybrid LLM + BKT:</strong> BKT acts as the deterministic truth layer. The LLM receives a structured BKT state summary and generates content that precisely matches the user's current cognitive load, preventing hallucination and ZPD violations."
    ],
    interactions: "Acts as the central nervous system. Receives inputs from the Assessment & Recalibration Loop and outputs strict state vectors to the Hybrid Intelligence Layer for content generation.",
    alignment: "BKT is the gold standard in cognitive science. It provides a scientifically verifiable ledger of cognitive growth required for institutional validation and NSQF competency mapping."
  },
  5: {
    id: "p5",
    title: "Zero-Trust Context Grounding",
    subtitle: "Hybrid Intelligence Layer",
    color: "cyan",
    purpose: "To safely fuse deterministic BKT mathematics with the generative capabilities of an LLM, ensuring the AI never hallucinates or drifts outside the ZPD.",
    keyLogic: [
      "<strong>Zero-Trust Prompting:</strong> LLM is treated as untrusted. Prompts are injected with strict BKT state strings (e.g. 'P(Mastery) is 0.82').",
      "<strong>Schema Enforcement:</strong> Utilizes Zod to violently enforce JSON output schemas, preventing conversational filler."
    ],
    interactions: "Sits as middleware between the BKT Engine and any generative feature (Live Curriculum Mapping, Empathetic Mentor).",
    alignment: "Solves 'AI Drift'. By mathematically chaining the LLM to the BKT state, it ensures pedagogical safety for sensitive demographics."
  },
  6: {
    id: "p6",
    title: "Grounded Video Learning",
    subtitle: "BKT-Filtered Resource Aggregator",
    color: "rose",
    purpose: "To source and curate high-quality instructional video content from YouTube, aggressively filtering out content that does not align with the user's current mastery level.",
    keyLogic: [
      "<strong>Contextual Query Construction:</strong> Translates KC requirements into highly specific search strings.",
      "<strong>BKT Sanitizer:</strong> Evaluates metadata. If P(L) < 0.5, prioritizes shorter, practical tutorials. If P(L) > 0.8, prioritizes deeper theoretical videos.",
      "<strong>Edge Caching:</strong> Implements aggressive caching to reduce API load."
    ],
    interactions: "Triggered by the active module in the Live Curriculum Mapping. Passes user viewing data to the Recalibration Loop.",
    alignment: "Democratizes access to education by utilizing existing open-source video infrastructure, but applies an intelligent pedagogical filter to prevent 'tutorial hell'."
  },
  7: {
    id: "p7",
    title: "Assessment & Recalibration Loop",
    subtitle: "Real-Time Mastery Recalibration",
    color: "amber",
    purpose: "After each learning event (video + quiz), the BKT engine updates the user's mastery state in real time and decides whether to recalibrate the next module.",
    keyLogic: [
      "<strong>BKT Recalculation:</strong> After every quiz answer on a KC, BKT runs the update formula: P(L_{n+1}) = P(L_n|Obs) + (1 − P(L_n|Obs)) · P(T)",
      "<strong>Micro-Scaffolding Trigger:</strong> If P(L) drops below 0.40 after recalculation, the system injects a simpler foundational micro-module instead of advancing.",
      "<strong>Mastery Fast-Track:</strong> If P(L) exceeds 0.95, the topic is marked as mastered and the curriculum fast-tracks to the next KC.",
      "<strong>Hybrid LLM + BKT:</strong> The LLM does not decide mastery — BKT does. The LLM only generates the next content based on the verified BKT state. This hybrid design keeps the system both creative and mathematically rigorous."
    ],
    interactions: "Serves as the primary input sensor for the BKT Engine. Evaluates each quiz response for Slip vs Guess patterns. Has the authority to dynamically rewrite the Live Curriculum roadmap.",
    alignment: "Replaces static testing with continuous formative assessment. Provides ZPD-aligned scaffolding exactly like an empathetic human tutor — preventing frustration while maintaining challenge."
  },
  8: {
    id: "p8",
    title: "Mastery Dashboard",
    subtitle: "Cognitive Telemetry UI",
    color: "cyan",
    purpose: "To visually expose the hidden BKT mathematical state to the user in an understandable, motivating way, proving actual learning has occurred.",
    keyLogic: [
      "<strong>Visualization:</strong> Translates complex probability matrices into intuitive radar charts and Mastery Orbs.",
      "<strong>Hake Gain Calculation:</strong> Calculates Normalized Learning Gain using g = (PostTest - PreTest) / (100 - PreTest).",
      "<strong>Efficacy Proof:</strong> Scores > 0.7 indicate high educational efficacy."
    ],
    interactions: "The terminal output layer. Aggregates data from the BKT Engine and the Recalibration Loop.",
    alignment: "Crucial for stakeholder reporting. Provides incontrovertible, peer-review-ready proof that the platform genuinely improves cognitive capabilities."
  },
  9: {
    id: "p9",
    title: "Research Impact & NSQF",
    subtitle: "Socio-Economic Efficacy Framework",
    color: "emerald",
    purpose: "The macro-objective of the platform. It ensures every technical feature serves the ultimate goal of measurable socio-economic upliftment.",
    keyLogic: [
      "<strong>Deterministic Traceability:</strong> Every mastered skill mathematically maps to an NSQF competency.",
      "<strong>SDG 8 Alignment:</strong> Optimizes for pathways with high labor-market demand and low entry barriers.",
      "<strong>Pedagogical Validity:</strong> BKT ensures the system is immune to LLM drift."
    ],
    interactions: "The conceptual umbrella that dictates the constraints and objectives for all other 8 architectural components.",
    alignment: "Transforms CareerOrbit into a verifiable educational instrument capable of bridging the gap between unstructured gig-economy labor and formalized national skill standards."
  }
};

export default function ArchitectureClient() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);

  const nextPhase = () => {
    if (currentPhase < PHASES.length - 1) {
      setCurrentPhase(prev => prev + 1);
      setActiveNodeId(null); // Close panel on phase change
    }
  };

  const prevPhase = () => {
    if (currentPhase > 0) {
      setCurrentPhase(prev => prev - 1);
      setActiveNodeId(null);
    }
  };

  // Cinematic Camera Coordinates based on phase
  const getCameraProps = (phase: number, activeId: number | null) => {
    // If the right-side panel is open, shift the camera left (-200px) 
    // so the active node remains centered in the visible viewport.
    const panelOffset = (activeId !== null && phase !== 10) ? -200 : 0;

    let baseCoords = { x: 0, y: 0, scale: 1 };
    
    switch (phase) {
      case 1: baseCoords = { x: -MAP_COORDS.P1.x, y: -MAP_COORDS.P1.y, scale: 1 }; break;
      case 2: baseCoords = { x: -MAP_COORDS.P2.x, y: -MAP_COORDS.P2.y, scale: 1.1 }; break;
      case 3: baseCoords = { x: -MAP_COORDS.P3.x, y: -MAP_COORDS.P3.y, scale: 1.1 }; break;
      case 4: baseCoords = { x: -MAP_COORDS.P4.x, y: -MAP_COORDS.P4.y, scale: 1.1 }; break;
      case 5: baseCoords = { x: -MAP_COORDS.P5.x, y: -MAP_COORDS.P5.y, scale: 1.1 }; break;
      case 6: baseCoords = { x: -MAP_COORDS.P6.x, y: -MAP_COORDS.P6.y, scale: 1.1 }; break;
      case 7: baseCoords = { x: -MAP_COORDS.P7.x, y: -MAP_COORDS.P7.y, scale: 1.1 }; break;
      case 8: baseCoords = { x: -MAP_COORDS.P8.x, y: -MAP_COORDS.P8.y, scale: 1.1 }; break;
      case 9: baseCoords = { x: -MAP_COORDS.P9.x, y: -MAP_COORDS.P9.y, scale: 1.1 }; break;
      case 10: baseCoords = { x: -1050, y: 0, scale: 0.45 }; break; // Final Cinematic Zoom Out
    }

    return {
      x: baseCoords.x + panelOffset,
      y: baseCoords.y,
      scale: baseCoords.scale
    };
  };

  const camera = getCameraProps(currentPhase, activeNodeId);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden selection:bg-emerald-500/30 font-sans flex flex-col">
      
      {/* ── Main Layout Scaffold ── */}
      <main className="relative z-10 flex-1 flex w-full h-full">
        <AnimatePresence mode="wait">
          {currentPhase === 0 ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center max-w-4xl mx-auto px-6 z-20 pointer-events-auto"
            >
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-8 shadow-2xl">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black tracking-[0.2em] text-emerald-100 uppercase">Live System Overview</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/20 mb-6 drop-shadow-sm">
                CareerOrbit Architecture
              </h1>
              
              <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto font-medium leading-relaxed mb-12">
                An interactive, cinematic mind-map exploration of our BKT-First cognitive engine and real-time curriculum mapping flow.
              </p>

              <button 
                onClick={nextPhase}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white text-black font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all"
              >
                Enter Architecture
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="mindmap-viewport"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
            >
              {/* Infinite Canvas */}
              <motion.div
                className="absolute top-1/2 left-1/2 w-[4000px] h-[4000px] origin-center pointer-events-auto"
                animate={{
                  x: `calc(-50% + ${camera.x}px)`,
                  y: `calc(-50% + ${camera.y}px)`,
                  scale: camera.scale
                }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Visual debug center point (will remove later) */}
                <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-emerald-500 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_#10b981] opacity-20" />
                
                {/* ── CONNECTION LINES ── */}
                {/* P1 -> P2 */}
                <MindMapLine 
                  from={{ x: 2000 + MAP_COORDS.P1.x, y: 2000 + MAP_COORDS.P1.y }} 
                  to={{ x: 2000 + MAP_COORDS.P2.x, y: 2000 + MAP_COORDS.P2.y }} 
                  isVisible={currentPhase >= 2} 
                  delay={0.1}
                  color="rose"
                />
                
                {/* P2 -> P3 */}
                <MindMapLine 
                  from={{ x: 2000 + MAP_COORDS.P2.x, y: 2000 + MAP_COORDS.P2.y }} 
                  to={{ x: 2000 + MAP_COORDS.P3.x, y: 2000 + MAP_COORDS.P3.y }} 
                  isVisible={currentPhase >= 3} 
                  delay={0.1}
                  color="amber"
                />

                {/* P3 -> P4 */}
                <MindMapLine 
                  from={{ x: 2000 + MAP_COORDS.P3.x, y: 2000 + MAP_COORDS.P3.y }} 
                  to={{ x: 2000 + MAP_COORDS.P4.x, y: 2000 + MAP_COORDS.P4.y }} 
                  isVisible={currentPhase >= 4} 
                  delay={0.1}
                  color="emerald"
                />

                {/* P4 -> P5 */}
                <MindMapLine 
                  from={{ x: 2000 + MAP_COORDS.P4.x, y: 2000 + MAP_COORDS.P4.y }} 
                  to={{ x: 2000 + MAP_COORDS.P5.x, y: 2000 + MAP_COORDS.P5.y }} 
                  isVisible={currentPhase >= 5} 
                  delay={0.1}
                  color="cyan"
                />

                {/* P5 -> P6 */}
                <MindMapLine 
                  from={{ x: 2000 + MAP_COORDS.P5.x, y: 2000 + MAP_COORDS.P5.y }} 
                  to={{ x: 2000 + MAP_COORDS.P6.x, y: 2000 + MAP_COORDS.P6.y }} 
                  isVisible={currentPhase >= 6} 
                  delay={0.1}
                  color="rose"
                />

                {/* P4 -> P7 */}
                <MindMapLine 
                  from={{ x: 2000 + MAP_COORDS.P4.x, y: 2000 + MAP_COORDS.P4.y }} 
                  to={{ x: 2000 + MAP_COORDS.P7.x, y: 2000 + MAP_COORDS.P7.y }} 
                  isVisible={currentPhase >= 7} 
                  delay={0.1}
                  color="amber"
                />

                {/* P6 -> P8 */}
                <MindMapLine 
                  from={{ x: 2000 + MAP_COORDS.P6.x, y: 2000 + MAP_COORDS.P6.y }} 
                  to={{ x: 2000 + MAP_COORDS.P8.x, y: 2000 + MAP_COORDS.P8.y }} 
                  isVisible={currentPhase >= 8} 
                  delay={0.1}
                  color="cyan"
                />

                {/* P7 -> P8 */}
                <MindMapLine 
                  from={{ x: 2000 + MAP_COORDS.P7.x, y: 2000 + MAP_COORDS.P7.y }} 
                  to={{ x: 2000 + MAP_COORDS.P8.x, y: 2000 + MAP_COORDS.P8.y }} 
                  isVisible={currentPhase >= 8} 
                  delay={0.1}
                  color="cyan"
                />

                {/* P8 -> P9 */}
                <MindMapLine 
                  from={{ x: 2000 + MAP_COORDS.P8.x, y: 2000 + MAP_COORDS.P8.y }} 
                  to={{ x: 2000 + MAP_COORDS.P9.x, y: 2000 + MAP_COORDS.P9.y }} 
                  isVisible={currentPhase >= 9} 
                  delay={0.1}
                  color="emerald"
                />

                {/* ── NODES ── */}
                {/* Phase 1 */}
                <MindMapNode
                  x={2000 + MAP_COORDS.P1.x}
                  y={2000 + MAP_COORDS.P1.y}
                  icon={UserCircle2}
                  title="Discovery & Onboarding"
                  subtitle="Data Ingestion"
                  color="blue"
                  isActive={currentPhase === 1}
                  isVisible={currentPhase >= 1}
                  delay={0.1}
                  onClick={() => setActiveNodeId(1)}
                />

                {/* Phase 2 */}
                <MindMapNode
                  x={2000 + MAP_COORDS.P2.x}
                  y={2000 + MAP_COORDS.P2.y}
                  icon={Target}
                  title="BKT Diagnostic Baseline"
                  subtitle="Pre-Test Sensor"
                  color="rose"
                  isActive={currentPhase === 2}
                  isVisible={currentPhase >= 2}
                  delay={0.4}
                  onClick={() => setActiveNodeId(2)}
                />

                {/* Phase 3 */}
                <MindMapNode
                  x={2000 + MAP_COORDS.P3.x}
                  y={2000 + MAP_COORDS.P3.y}
                  icon={Network}
                  title="Live Curriculum Mapping"
                  subtitle="LLM Orchestration"
                  color="amber"
                  isActive={currentPhase === 3}
                  isVisible={currentPhase >= 3}
                  delay={0.4}
                  onClick={() => setActiveNodeId(3)}
                />

                {/* Phase 4 */}
                <MindMapNode
                  x={2000 + MAP_COORDS.P4.x}
                  y={2000 + MAP_COORDS.P4.y}
                  icon={Brain}
                  title="BKT-First Adaptive Engine"
                  subtitle="Mathematical Core"
                  color="emerald"
                  isActive={currentPhase === 4}
                  isVisible={currentPhase >= 4}
                  delay={0.4}
                  onClick={() => setActiveNodeId(4)}
                />

                {/* Phase 5 */}
                <MindMapNode
                  x={2000 + MAP_COORDS.P5.x}
                  y={2000 + MAP_COORDS.P5.y}
                  icon={Bot}
                  title="Hybrid Intelligence Layer"
                  subtitle="Zero-Trust Enforcer"
                  color="cyan"
                  isActive={currentPhase === 5}
                  isVisible={currentPhase >= 5}
                  delay={0.4}
                  onClick={() => setActiveNodeId(5)}
                />

                {/* Phase 6 */}
                <MindMapNode
                  x={2000 + MAP_COORDS.P6.x}
                  y={2000 + MAP_COORDS.P6.y}
                  icon={PlaySquare}
                  title="Grounded Video Learning"
                  subtitle="YouTube Content API"
                  color="rose"
                  isActive={currentPhase === 6}
                  isVisible={currentPhase >= 6}
                  delay={0.4}
                  onClick={() => setActiveNodeId(6)}
                />

                {/* Phase 7 */}
                <MindMapNode
                  x={2000 + MAP_COORDS.P7.x}
                  y={2000 + MAP_COORDS.P7.y}
                  icon={RefreshCcw}
                  title="Assessment & Recalibration"
                  subtitle="Dynamic Quiz API"
                  color="amber"
                  isActive={currentPhase === 7}
                  isVisible={currentPhase >= 7}
                  delay={0.4}
                  onClick={() => setActiveNodeId(7)}
                />

                {/* Phase 8 */}
                <MindMapNode
                  x={2000 + MAP_COORDS.P8.x}
                  y={2000 + MAP_COORDS.P8.y}
                  icon={LayoutDashboard}
                  title="Mastery Dashboard"
                  subtitle="Telemetry UI"
                  color="cyan"
                  isActive={currentPhase === 8}
                  isVisible={currentPhase >= 8}
                  delay={0.4}
                  onClick={() => setActiveNodeId(8)}
                />

                {/* Phase 9 */}
                <MindMapNode
                  x={2000 + MAP_COORDS.P9.x}
                  y={2000 + MAP_COORDS.P9.y}
                  icon={Globe}
                  title="Research Impact & NSQF"
                  subtitle="Pedagogical Validity"
                  color="emerald"
                  isActive={currentPhase >= 9} // Active in Phase 9 and 10 (Full view)
                  isVisible={currentPhase >= 9}
                  delay={0.4}
                  onClick={() => setActiveNodeId(9)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Global Phase Control Bar ── */}
      <div className="fixed bottom-0 left-0 w-full z-50 p-6 md:p-8 pointer-events-none flex justify-center">
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
          className="w-full max-w-5xl bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2rem] p-4 flex flex-col md:flex-row items-center justify-between gap-6 pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          {/* Previous Button */}
          <button 
            onClick={prevPhase}
            disabled={currentPhase === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-all text-sm font-bold text-white uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" /> Prev
          </button>

          {/* Progress Indicator */}
          <div className="flex-1 flex flex-col items-center gap-3 w-full max-w-md px-4">
            <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] text-center h-4">
              {currentPhase > 0 ? PHASES[currentPhase] : ""}
            </div>
            <div className="w-full flex gap-1.5 h-1.5">
              {PHASES.map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-full transition-all duration-500 ${
                    i === currentPhase 
                      ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                      : i < currentPhase 
                        ? "bg-white/40" 
                        : "bg-white/10"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Next Button */}
          <button 
            onClick={nextPhase}
            disabled={currentPhase === PHASES.length - 1}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black hover:bg-white/90 disabled:opacity-50 transition-all text-sm font-black uppercase tracking-widest"
          >
            {currentPhase === 0 ? "Start" : currentPhase === PHASES.length - 1 ? "End" : "Next"} <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* ── Technical Side Panel ── */}
      <TechnicalSidePanel 
        isOpen={activeNodeId !== null} 
        onClose={() => setActiveNodeId(null)}
        data={activeNodeId ? SIDE_PANEL_DATA[activeNodeId] || null : null}
      />

    </div>
  );
}

