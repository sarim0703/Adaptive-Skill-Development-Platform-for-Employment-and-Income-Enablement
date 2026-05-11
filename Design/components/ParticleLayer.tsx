"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function ParticleLayer() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    // Generate particles purely on the client side to prevent hydration mismatches
    const generated = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1, // 1px to 4px
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 10 // 10s to 20s float time
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ 
            opacity: 0, 
            y: `${p.y}vh`, 
            x: `${p.x}vw` 
          }}
          animate={{ 
            opacity: [0, 0.8, 0],
            y: [`${p.y}vh`, `${p.y - 20}vh`], // Float upwards
            x: [`${p.x}vw`, `${p.x + (Math.random() * 10 - 5)}vw`] // Slight horizontal drift
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear"
          }}
          className={`absolute rounded-full ${p.id % 2 === 0 ? "bg-emerald-500" : "bg-cyan-500"}`}
          style={{ 
            width: p.size, 
            height: p.size,
            boxShadow: `0 0 ${p.size * 3}px currentColor` // Glow effect
          }}
        />
      ))}
    </div>
  );
}
