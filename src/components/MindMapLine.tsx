"use client";

import { motion } from "framer-motion";

interface MindMapLineProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isVisible?: boolean;
  delay?: number;
  color?: "emerald" | "cyan" | "blue" | "rose" | "amber" | "white";
  animated?: boolean;
}

const strokeColors = {
  emerald: "stroke-emerald-500/30",
  cyan: "stroke-cyan-500/30",
  blue: "stroke-blue-500/30",
  rose: "stroke-rose-500/30",
  amber: "stroke-amber-500/30",
  white: "stroke-white/20",
};

const glowColors = {
  emerald: "stroke-emerald-400",
  cyan: "stroke-cyan-400",
  blue: "stroke-blue-400",
  rose: "stroke-rose-400",
  amber: "stroke-amber-400",
  white: "stroke-white",
};

export function MindMapLine({
  from,
  to,
  isVisible = true,
  delay = 0,
  color = "white",
  animated = true
}: MindMapLineProps) {
  if (!isVisible) return null;

  // Calculate SVG bounding box to minimize DOM footprint
  // Add padding to ensure stroke width/glow isn't clipped
  const padding = 100;
  const minX = Math.min(from.x, to.x) - padding;
  const minY = Math.min(from.y, to.y) - padding;
  const maxX = Math.max(from.x, to.x) + padding;
  const maxY = Math.max(from.y, to.y) + padding;
  
  const width = maxX - minX;
  const height = maxY - minY;

  // Map absolute coordinates to local SVG coordinates
  const startX = from.x - minX;
  const startY = from.y - minY;
  const endX = to.x - minX;
  const endY = to.y - minY;

  // Bezier curve for an organic "flow" look
  // Horizontal easing by default
  const dx = Math.abs(endX - startX);
  const controlPointX1 = startX + dx * 0.5;
  const controlPointY1 = startY;
  const controlPointX2 = endX - dx * 0.5;
  const controlPointY2 = endY;

  const path = `M ${startX} ${startY} C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${endX} ${endY}`;

  return (
    <svg 
      className="absolute pointer-events-none z-0"
      style={{ left: minX, top: minY, width, height }}
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* Base faint connecting line */}
      <motion.path
        d={path}
        fill="transparent"
        strokeWidth="2"
        className={strokeColors[color]}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut", delay }}
      />
      
      {/* Animated glowing pulse traveling along the path */}
      {animated && (
        <motion.path
          d={path}
          fill="transparent"
          strokeWidth="3"
          strokeLinecap="round"
          className={`${glowColors[color]}`}
          style={{ filter: "drop-shadow(0 0 8px currentColor)" }}
          initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
          animate={{ 
            pathLength: [0, 0.2, 0.2, 0], 
            pathOffset: [0, 0, 0.8, 1],
            opacity: [0, 1, 1, 0]
          }}
          transition={{ 
            duration: 3, 
            ease: "linear", 
            repeat: Infinity,
            delay: delay + 1.5 // Start pulsing after the line draws
          }}
        />
      )}
    </svg>
  );
}
