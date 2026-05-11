"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface MindMapNodeProps {
  id?: string;
  x: number;
  y: number;
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  color?: "emerald" | "cyan" | "blue" | "rose" | "amber";
  delay?: number;
  isActive?: boolean;
  isVisible?: boolean;
  onClick?: () => void;
}

const colorMap = {
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)]",
  cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.15)]",
  blue: "border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.15)]",
  rose: "border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.15)]",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.15)]",
};

export function MindMapNode({ 
  x, 
  y, 
  icon: Icon, 
  title, 
  subtitle, 
  color = "emerald",
  delay = 0,
  isActive = true,
  isVisible = true,
  onClick
}: MindMapNodeProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: isActive ? 1 : 0.8, opacity: isActive ? 1 : 0.4 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
      className="absolute group cursor-pointer w-64 -ml-32 -mt-[88px] z-10" // Centers the node correctly on x,y
      style={{ left: x, top: y }}
      whileHover={{ scale: 1.05, zIndex: 50 }}
      onClick={onClick}
    >
      <div className={`p-5 rounded-[2rem] border backdrop-blur-xl transition-all duration-500 ${colorMap[color]} group-hover:bg-white/10 group-hover:border-white/30`}>
        <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center mb-3 mx-auto transition-colors">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-base font-black text-white text-center tracking-tight leading-tight">{title}</h3>
        {subtitle && (
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-center mt-1.5 opacity-70">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}
