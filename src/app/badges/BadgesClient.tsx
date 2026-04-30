"use client";

import { motion } from "framer-motion";
import { 
  Rocket, Target, Zap, BrainCircuit, Trophy, Flame, Lock, 
  Award, Hexagon, Star
} from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";


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
  const { t } = useLanguage();
  const { user, badges } = initialData;

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : "?";

  const unlockedCount = badges.filter(b => b.isUnlocked).length;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative pb-32 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 pt-12 relative z-10">
        
        {/* Profile Header */}
        <div className="bg-card border border-border rounded-xl p-8 md:p-10 mb-12 relative overflow-hidden">

          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
            {/* Avatar Hexagon */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-3xl font-bold text-white">{userInitial}</span>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{user.name}</h1>
                <div className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-medium flex items-center gap-1.5">
                  <Star className="w-3 h-3" /> Lv. {unlockedCount + 1}
                </div>
              </div>
              <p className="text-base text-text-secondary mb-6">{t("badges.pursuing")} <span className="text-foreground">{user.path}</span></p>
              
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-input flex items-center justify-center border border-border">
                    <Award className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-xs text-text-tertiary font-medium">{t("badges.unlocked")}</div>
                    <div className="text-base font-semibold text-foreground">{unlockedCount} / {badges.length} {t("nav.badges")}</div>
                  </div>
                </div>
                <div className="w-px h-10 bg-border hidden md:block" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-input flex items-center justify-center border border-border">
                    <Target className="w-5 h-5 text-cyan-500" />
                  </div>
                  <div>
                    <div className="text-xs text-text-tertiary font-medium">{t("badges.completed")}</div>
                    <div className="text-base font-semibold text-foreground">{user.modulesCompleted} {t("learn.modulesCount")}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold tracking-tight mb-6 flex items-center gap-3 text-foreground">
            <Trophy className="w-5 h-5 text-yellow-500" />
            {t("badges.achievements")}
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
                  className={`relative overflow-hidden rounded-xl p-6 border transition-all duration-300 ${
                    badge.isUnlocked 
                      ? "bg-card border-border hover:border-border-hover group" 
                      : "bg-input border-border opacity-60 grayscale"
                  }`}
                >
                  {/* Glow Behind Icon */}
                  {badge.isUnlocked && (
                    <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${badge.color} rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity`} />
                  )}

                  <div className="flex flex-col h-full relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      {/* Premium Badge Icon */}
                      <div className="relative">
                        <Hexagon className={`w-16 h-16 ${badge.isUnlocked ? "text-foreground/10" : "text-foreground/5"}`} fill="currentColor" />
                        <div className={`absolute inset-0 flex items-center justify-center`}>
                          {badge.isUnlocked ? (
                            <div className={`p-3 rounded-full bg-gradient-to-br ${badge.color} shadow-[0_0_20px_rgba(255,255,255,0.2)]`}>
                              <IconComponent className="w-6 h-6 text-white drop-shadow-md" />
                            </div>
                          ) : (
                            <div className="p-3 rounded-full bg-white/5 border border-white/10">
                              <Lock className="w-5 h-5 text-text-muted" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status Pill */}
                      <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                        badge.isUnlocked 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                          : "bg-foreground/5 border-border text-text-tertiary"
                      }`}>
                        {badge.isUnlocked ? t("badges.unlocked") : t("badges.locked")}
                      </div>

                    </div>

                    <div>
                      <h3 className={`text-lg font-semibold mb-2 tracking-tight ${badge.isUnlocked ? "text-foreground" : "text-text-tertiary"}`}>
                        {badge.name}
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed">
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
