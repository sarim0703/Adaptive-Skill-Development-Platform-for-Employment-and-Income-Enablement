"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ArchNodeProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  delay?: number;
  isActive?: boolean;
  color?: "emerald" | "cyan" | "blue" | "rose" | "amber";
  details?: string[];
}

const colorMap = {
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)]",
  cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.15)]",
  blue: "border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.15)]",
  rose: "border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.15)]",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.15)]",
};

export function ArchNode({ 
  icon: Icon, 
  title, 
  subtitle, 
  delay = 0, 
  isActive = true,
  color = "emerald",
  details
}: ArchNodeProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: isActive ? 1 : 0.3 }}
      transition={{ delay, type: "spring", bounce: 0.4 }}
      className="relative group cursor-pointer"
    >
      <div className={`p-6 rounded-[2rem] border backdrop-blur-xl transition-all duration-500 ${colorMap[color]} hover:scale-105 hover:bg-white/10`}>
        <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center mb-4 mx-auto group-hover:border-white/30 transition-colors">
          <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-white text-center tracking-tight">{title}</h3>
        {subtitle && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-center mt-2 opacity-70">
            {subtitle}
          </p>
        )}
      </div>

      {/* Hover Reveal Technical Tooltip */}
      {details && details.length > 0 && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 p-5 rounded-2xl bg-[#0a0a0a]/95 border border-white/10 backdrop-blur-2xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-50 shadow-2xl">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-3 border-b border-white/10 pb-2">Technical Depth</div>
          <ul className="space-y-2">
            {details.map((detail, i) => (
              <li key={i} className="text-[11px] text-white/80 font-medium leading-relaxed flex items-start gap-2">
                <span className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 opacity-50 bg-current`} />
                {detail}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
