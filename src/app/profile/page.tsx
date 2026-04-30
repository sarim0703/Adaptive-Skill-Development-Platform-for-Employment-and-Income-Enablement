"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Award, 
  Target, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  Clock, 
  Briefcase, 
  BookOpen,
  MapPin,
  ChevronRight,
  Sparkles,
  BarChart3,
  Cpu,
  BrainCircuit
} from "lucide-react";
import { motion } from "framer-motion";
import { getAnalyticsData } from "@/app/actions";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";


export default function ProfilePage() {
  const { t } = useLanguage();
  const [userData, setUserData] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getAnalyticsData();
        setUserData(data);
      } catch (err) {
        console.error("Failed to fetch profile data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Fallback if no data is found (e.g. user hasn't selected a path)
  if (!userData) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="max-w-md w-full bg-card border border-border p-10 rounded-3xl text-center shadow-2xl">
        <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center mx-auto mb-8">
           <User className="w-10 h-10 text-blue-500" />
        </div>
        <h2 className="text-3xl font-black text-foreground mb-4 tracking-tight">{t("profile.notReady")}</h2>
        <p className="text-text-secondary leading-relaxed mb-10 font-medium">{t("profile.selectPathDesc")}</p>
        <Link href="/path-selection" className="w-full inline-block py-4 rounded-2xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">
          {t("profile.goPathSelection")}
        </Link>
      </div>

      </div>
    );
  }

  const skills = userData.masteryGrid?.slice(0, 5).map((m: any, i: number) => {
    const colors = ["text-blue-500", "text-emerald-500", "text-violet-500", "text-amber-500", "text-sky-500"];
    return { name: m.subtopicId, level: m.mastery, color: colors[i % colors.length] };
  }) || [];

  const completedModules = userData.moduleProgress?.filter((m: any) => m.percent === 100).length || 0;
  const totalModules = userData.moduleProgress?.length || 0;
  const roadmapProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/30">
      
      {/* ── Background Elements ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-16">
          <div className="flex items-center gap-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-blue-500 to-violet-500 p-1 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-full rounded-[1.8rem] bg-card flex items-center justify-center overflow-hidden">
                  <User className="w-12 h-12 text-text-secondary" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center border-4 border-background shadow-xl shadow-blue-600/20">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-black tracking-tight">{userData.userName || "Career Operative"}</h1>
                <span className="px-3 py-1 rounded-full bg-input border border-border text-[10px] font-black uppercase tracking-widest text-text-secondary">{t("profile.level")} {Math.max(1, Math.floor(userData.capabilityScore / 10))}</span>

              </div>
              <p className="text-xl text-text-secondary font-bold mb-4">{userData?.pathTitle || "Active Learner"}</p>
                <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-xs font-bold text-text-tertiary">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  {t("profile.localHub")}
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-text-tertiary">
                  <Zap className="w-4 h-4 text-amber-500" />
                  {t("profile.activeMode")}
                </div>
              </div>

            </div>
          </div>

          <div className="flex gap-4">
            <button className="px-6 py-3 rounded-2xl bg-input border border-border hover:bg-card-hover transition-all font-black text-[10px] uppercase tracking-widest text-text-secondary">
              {t("profile.editIntel")}
            </button>
            <button className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all font-black text-[10px] uppercase tracking-widest text-white shadow-lg shadow-blue-600/20">
              {t("profile.exportCV")}
            </button>

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ── Left Column: Metrics ── */}
          <div className="space-y-8">
            {/* Capability Score Gauge */}
            <div className="p-8 rounded-[2.5rem] bg-card border border-border relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <TrendingUp className="w-20 h-20 text-blue-500" />
              </div>
              <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-8">{t("profile.readinessScore")}</p>

              <div className="flex items-end gap-4 mb-2">
                <span className="text-6xl font-black text-foreground">{userData?.capabilityScore || 0}</span>
                <span className="text-2xl font-black text-blue-500 mb-2">/100</span>
              </div>
              <div className="w-full h-3 bg-input rounded-full overflow-hidden mb-6">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${userData?.capabilityScore || 0}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                />
              </div>
              <p className="text-xs font-bold text-text-secondary leading-relaxed">
                {t("profile.outperforming")} <span className="text-blue-500">{Math.min(99, Math.floor(userData.capabilityScore * 1.2))}%</span> {t("profile.ofApplicants")}
              </p>

            </div>

            {/* Path Stats */}
            <div className="p-8 rounded-[2.5rem] bg-card border border-border">
              <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-8">{t("profile.trainingModules")}</p>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-500">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-foreground">{t("profile.roadmapProgress")}</p>
                      <p className="text-[10px] font-bold text-text-secondary">{completedModules} {t("onboarding.of")} {totalModules} {t("profile.completeCount")}</p>
                    </div>

                  </div>
                  <span className="text-xs font-black text-blue-500">{roadmapProgress}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-foreground">{t("profile.milestonesHit")}</p>
                      <p className="text-[10px] font-bold text-text-secondary">Core Foundations</p>
                    </div>

                  </div>
                  <span className="text-xs font-black text-emerald-500">{completedModules}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Middle Column: Skill Matrix ── */}
          <div className="lg:col-span-2 space-y-8">
            <div className="p-8 rounded-[2.5rem] bg-card border border-border">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                    <BrainCircuit className="w-6 h-6 text-violet-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-foreground">{t("profile.skillMatrix")}</h2>
                    <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">{t("profile.proficiencyTrace")}</p>
                  </div>

                </div>
                <BarChart3 className="w-6 h-6 text-text-tertiary" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {skills.length > 0 ? skills.map((skill: any, i: number) => (
                  <div key={i} className="p-6 rounded-3xl bg-input border border-border hover:border-border-hover transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-black text-foreground truncate mr-2" title={skill.name}>{skill.name}</span>
                      <span className={`text-xs font-black ${skill.color}`}>{skill.level}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.level}%` }}
                        transition={{ delay: 0.2 * i, duration: 1 }}
                        className={`h-full bg-current ${skill.color} rounded-full opacity-60 group-hover:opacity-100 transition-opacity`}
                      />
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 text-center py-8 text-text-secondary text-sm font-medium">
                    {t("learn.noNotes")}
                  </div>

                )}
              </div>
            </div>

            {/* Current Focus / Roadmap Preview */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-blue-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles className="w-24 h-24 text-blue-500" />
              </div>
              <div className="flex items-center gap-4 mb-8">
                <Cpu className="w-5 h-5 text-blue-500" />
                <h3 className="text-xs font-black uppercase tracking-widest text-blue-500">{t("profile.currentObjective")}</h3>
              </div>
              <h2 className="text-3xl font-black mb-4 leading-tight text-foreground">{t("profile.continueJourney")}</h2>
              <p className="text-sm font-bold text-text-secondary mb-8 max-w-md">
                {t("profile.workingOnModule")} {completedModules + 1} {t("onboarding.of")} {totalModules}. {t("profile.boostScore")}
              </p>
              <Link href="/learn" className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-foreground text-background font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">
                {t("profile.continueTraining")} <ChevronRight className="w-4 h-4" />
              </Link>

            </div>
          </div>

        </div>

        {/* ── Bottom Row: Recent Activity ── */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="p-8 rounded-[2.5rem] bg-card border border-border">
              <h3 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-8">{t("profile.marketInsights")}</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-input border border-border">
                  <div className="flex items-center gap-4">
                    <Briefcase className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-black text-foreground">{t("profile.matchedRoles")}</p>
                      <p className="text-[10px] font-bold text-text-secondary italic">{t("profile.opsInArea")}</p>
                    </div>

                  </div>
                  <ChevronRight className="w-4 h-4 text-text-tertiary" />
                </div>
              </div>
           </div>

           <div className="p-8 rounded-[2.5rem] bg-card border border-border">
              <h3 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-8">{t("profile.recentMilestones")}</h3>
              <div className="space-y-4">
                {[
                  { label: "Started Learning Path", time: "Recently", icon: <Award className="w-3 h-3" /> },
                  { label: "Pre-test Completed", time: "Recently", icon: <TrendingUp className="w-3 h-3" /> },
                  { label: "Profile Created", time: "Recently", icon: <Sparkles className="w-3 h-3" /> }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/10">
                        {item.icon}
                      </div>
                      <span className="text-xs font-bold text-text-secondary">{item.label}</span>
                    </div>
                    <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">{item.time}</span>
                  </div>
                ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
