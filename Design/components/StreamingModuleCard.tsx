"use client";

import { motion } from "framer-motion";
import { BookOpen, Sparkles, BrainCircuit } from "lucide-react";

interface StreamingModuleCardProps {
  title: string;
  index: number;
  isGenerating: boolean;
}

export function StreamingModuleCard({ title, index, isGenerating }: StreamingModuleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 shadow-sm mb-3 group transition-all hover:border-blue-500/30 relative overflow-hidden"
    >
      {/* Background Glow during generation */}
      {isGenerating && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent animate-pulse" />
      )}

      <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
        isGenerating 
          ? "bg-blue-500/10 border border-blue-500/20" 
          : "bg-foreground/5 border border-transparent"
      }`}>
        {isGenerating ? (
          <BrainCircuit className="w-5 h-5 text-blue-500 animate-pulse" />
        ) : (
          <BookOpen className="w-5 h-5 text-text-tertiary group-hover:text-blue-500 transition-colors" />
        )}
      </div>
      
      <div className="relative z-10 flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
            Module {index + 1}
          </span>
          {isGenerating && (
            <motion.span 
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex h-1.5 w-1.5 rounded-full bg-blue-500" 
            />
          )}
        </div>
        <h3 className="text-sm font-bold text-foreground truncate group-hover:text-blue-500 transition-colors">
          {title || "Planning cognitive path..."}
        </h3>
      </div>

      {isGenerating && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
        >
          <Sparkles className="w-3 h-3 text-blue-500 animate-spin-slow" />
          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Analysing</span>
        </motion.div>
      )}
    </motion.div>
  );
}
