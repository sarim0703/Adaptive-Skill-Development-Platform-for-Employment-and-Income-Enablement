"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import React from "react";

export interface TechnicalData {
  id: string;
  title: string;
  subtitle: string;
  color: "emerald" | "cyan" | "blue" | "rose" | "amber";
  purpose: React.ReactNode;
  keyLogic: React.ReactNode[];
  interactions: React.ReactNode;
  alignment: React.ReactNode;
}

interface TechnicalSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: TechnicalData | null;
}

const colorMap = {
  emerald: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  cyan: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
  blue: "text-blue-400 border-blue-500/20 bg-blue-500/10",
  rose: "text-rose-400 border-rose-500/20 bg-rose-500/10",
  amber: "text-amber-400 border-amber-500/20 bg-amber-500/10",
};

const dotColorMap = {
  emerald: "bg-emerald-400",
  cyan: "bg-cyan-400",
  blue: "bg-blue-400",
  rose: "bg-rose-400",
  amber: "bg-amber-400",
};

export function TechnicalSidePanel({ isOpen, onClose, data }: TechnicalSidePanelProps) {
  return (
    <AnimatePresence>
      {isOpen && data && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 h-screen w-full md:w-[450px] z-[100] bg-[#050505]/95 backdrop-blur-3xl border-l border-white/10 shadow-[-30px_0_50px_rgba(0,0,0,0.8)] overflow-y-auto flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 p-6 md:p-8 flex items-start justify-between">
            <div>
              <div className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] mb-4 shadow-sm ${colorMap[data.color]}`}>
                System Component
              </div>
              <h2 className="text-2xl font-black text-white leading-tight tracking-tight">{data.title}</h2>
              <p className="text-white/40 text-xs uppercase tracking-widest font-bold mt-2">{data.subtitle}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all hover:scale-105 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 md:p-8 space-y-10 pb-32">
            
            {/* Section: Purpose */}
            <section>
              <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-white/30" /> Exact Purpose
              </h4>
              <div className="text-sm text-white/80 leading-relaxed font-medium">
                {data.purpose}
              </div>
            </section>

            {/* Section: Key Logic */}
            <section>
              <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-white/30" /> Key Logic & Execution
              </h4>
              <ul className="space-y-3">
                {data.keyLogic.map((logic, i) => (
                  <li key={i} className="text-sm text-white/80 leading-relaxed font-medium flex items-start gap-3 bg-white/[0.02] p-4 rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-colors">
                    <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 shadow-[0_0_8px_currentColor] ${dotColorMap[data.color]}`} />
                    <div dangerouslySetInnerHTML={{ __html: logic as string }} />
                  </li>
                ))}
              </ul>
            </section>

            {/* Section: Component Interactions */}
            <section>
              <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-white/30" /> Architectural Interactions
              </h4>
              <div className="text-sm text-white/80 leading-relaxed font-medium bg-white/[0.02] p-5 rounded-2xl border border-white/5">
                {data.interactions}
              </div>
            </section>

            {/* Section: NSQF Alignment */}
            <section>
              <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-white/30" /> Research & Validity
              </h4>
              <div className="text-sm text-white/80 leading-relaxed font-medium border-l-2 border-white/20 pl-5 py-1">
                {data.alignment}
              </div>
            </section>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
