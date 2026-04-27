"use client";

import { motion } from "framer-motion";
import { 
  Rocket, Target, Zap, BrainCircuit, Trophy, Flame, Lock, 
  Award, Hexagon, Star
} from "lucide-react";
import Image from "next/image";

const ICON_MAP: Record<string, any> = {
  Rocket,
  Target,
  Zap,
  BrainCircuit,
  Trophy,
  Flame,
};

type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isUnlocked: boolean;
};

type UserData = {
  name: string;
  email?: string | null;
  path: string;
  modulesCompleted: number;
  roadmapsCompleted: number;
};

export default function BadgesClient({ initialData }: { initialData: { user: UserData, badges: Badge[] } }) {
  const { user, badges } = initialData;
  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : "?";

  const unlockedCount = badges.filter(b => b.isUnlocked).length;

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white overflow-hidden relative pb-32">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-tech-grid opacity-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 pt-12 relative z-10">
        
        {/* Profile Header */}
        <div className="glass-card p-8 md:p-12 mb-16 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-20 -mt-20 transition-all duration-700 group-hover:bg-blue-500/20" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
            {/* Avatar Hexagon */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <Hexagon className="absolute inset-0 w-full h-full text-blue-500/20 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-[spin_20s_linear_infinite]" strokeWidth={1} />
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl rotate-45 flex items-center justify-center shadow-2xl">
                <span className="text-4xl font-black -rotate-45 text-white drop-shadow-md">{userInitial}</span>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">{user.name}</h1>
                <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Star className="w-3 h-3" /> Lv. {unlockedCount + 1}
                </div>
              </div>
              <p className="text-xl text-slate-400 font-medium mb-6">Pursuing <span className="text-white">{user.path}</span></p>
              
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <Award className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Unlocked</div>
                    <div className="text-lg font-bold">{unlockedCount} / {badges.length} Badges</div>
                  </div>
                </div>
                <div className="w-px h-10 bg-white/10 hidden md:block" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <Target className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Mastery</div>
                    <div className="text-lg font-bold">{user.modulesCompleted} Modules</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-black tracking-tight mb-8 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Achievements Cabinet
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges.map((badge, idx) => {
              const IconComponent = ICON_MAP[badge.icon] || Award;
              
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`relative overflow-hidden rounded-3xl p-8 border transition-all duration-500 ${
                    badge.isUnlocked 
                      ? "bg-[#141416] border-white/10 hover:border-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] group" 
                      : "bg-[#0A0A0C] border-white/5 opacity-70 grayscale"
                  }`}
                >
                  {/* Glow Behind Icon */}
                  {badge.isUnlocked && (
                    <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${badge.color} rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity`} />
                  )}

                  <div className="flex flex-col h-full relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      {/* Premium Badge Icon */}
                      <div className="relative">
                        <Hexagon className={`w-20 h-20 ${badge.isUnlocked ? "text-white/10" : "text-white/5"}`} fill="currentColor" />
                        <div className={`absolute inset-0 flex items-center justify-center`}>
                          {badge.isUnlocked ? (
                            <div className={`p-3 rounded-full bg-gradient-to-br ${badge.color} shadow-[0_0_20px_rgba(255,255,255,0.2)]`}>
                              <IconComponent className="w-6 h-6 text-white drop-shadow-md" />
                            </div>
                          ) : (
                            <div className="p-3 rounded-full bg-white/5 border border-white/10">
                              <Lock className="w-5 h-5 text-slate-500" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status Pill */}
                      <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        badge.isUnlocked 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                          : "bg-white/5 border-white/5 text-slate-500"
                      }`}>
                        {badge.isUnlocked ? "Unlocked" : "Locked"}
                      </div>
                    </div>

                    <div>
                      <h3 className={`text-xl font-black mb-2 tracking-tight ${badge.isUnlocked ? "text-white" : "text-slate-400"}`}>
                        {badge.name}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
