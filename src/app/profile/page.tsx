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

export default function ProfilePage() {
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
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const skills = [
    { name: "Strategic Marketing", level: 85, color: "text-blue-400" },
    { name: "Data Analytics", level: 60, color: "text-emerald-400" },
    { name: "Campaign Optimization", level: 75, color: "text-violet-400" },
    { name: "Consumer Psychology", level: 45, color: "text-amber-400" },
    { name: "SEO / SEM", level: 90, color: "text-sky-400" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30">
      
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
              <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-blue-600 to-violet-600 p-1 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-full rounded-[1.8rem] bg-[#0A0A0A] flex items-center justify-center overflow-hidden">
                  <User className="w-12 h-12 text-white/50" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center border-4 border-[#050505] shadow-xl shadow-blue-600/20">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-black tracking-tight">Career Operative</h1>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400">Level 14</span>
              </div>
              <p className="text-xl text-slate-400 font-bold mb-4">{userData?.pathTitle || "Digital Strategist"}</p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  India Hub
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Active Learning Mode
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-widest text-slate-300">
              Edit Intel
            </button>
            <button className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all font-black text-[10px] uppercase tracking-widest text-white shadow-lg shadow-blue-600/20">
              Export CV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ── Left Column: Metrics ── */}
          <div className="space-y-8">
            {/* Capability Score Gauge */}
            <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp className="w-20 h-20 text-blue-500" />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Career Readiness Score</p>
              <div className="flex items-end gap-4 mb-2">
                <span className="text-6xl font-black text-white">{userData?.capabilityScore || 0}</span>
                <span className="text-2xl font-black text-blue-500 mb-2">/100</span>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-6">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${userData?.capabilityScore || 0}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-600 to-violet-600 rounded-full"
                />
              </div>
              <p className="text-xs font-bold text-slate-400 leading-relaxed">
                You are outperforming <span className="text-blue-400">74%</span> of applicants in your target market.
              </p>
            </div>

            {/* Path Stats */}
            <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-3xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Training Modules</p>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20 text-blue-500">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black">Roadmap Progress</p>
                      <p className="text-[10px] font-bold text-slate-500">4 of 12 complete</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-blue-400">33%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black">Milestones Hit</p>
                      <p className="text-[10px] font-bold text-slate-500">Expert Certification</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-400">8</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Middle Column: Skill Matrix ── */}
          <div className="lg:col-span-2 space-y-8">
            <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-3xl">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-600/10 flex items-center justify-center border border-violet-500/20">
                    <BrainCircuit className="w-6 h-6 text-violet-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">Skill Matrix</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Real-time Proficiency Trace</p>
                  </div>
                </div>
                <BarChart3 className="w-6 h-6 text-slate-700" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {skills.map((skill, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-black text-slate-300">{skill.name}</span>
                      <span className={`text-xs font-black ${skill.color}`}>{skill.level}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.level}%` }}
                        transition={{ delay: 0.2 * i, duration: 1 }}
                        className={`h-full bg-current ${skill.color} rounded-full opacity-60 group-hover:opacity-100 transition-opacity`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Focus / Roadmap Preview */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600/10 to-violet-600/10 border border-blue-500/20 backdrop-blur-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles className="w-24 h-24 text-white" />
              </div>
              <div className="flex items-center gap-4 mb-8">
                <Cpu className="w-5 h-5 text-blue-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-blue-400">Current Objective</h3>
              </div>
              <h2 className="text-3xl font-black mb-4 leading-tight">Master Advanced<br />Market Segmentation</h2>
              <p className="text-sm font-bold text-slate-400 mb-8 max-w-md">
                You are currently working on Module 5 of your roadmap. Completion will boost your Capability Score by <span className="text-emerald-400">+6.5 points</span>.
              </p>
              <button className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white text-black font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">
                Continue Training <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* ── Bottom Row: Recent Activity ── */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-3xl">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Market Insights</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-4">
                    <Briefcase className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-black">Matched Roles</p>
                      <p className="text-[10px] font-bold text-slate-500 italic">42 Identifed in Bengaluru</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-700" />
                </div>
              </div>
           </div>

           <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-3xl">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Recent Milestones</h3>
              <div className="space-y-4">
                {[
                  { label: "Module 4 Completed", time: "2h ago", icon: <Award className="w-3 h-3" /> },
                  { label: "SEO Proficiency Updated", time: "1d ago", icon: <TrendingUp className="w-3 h-3" /> },
                  { label: "New Job Match Found", time: "3d ago", icon: <Sparkles className="w-3 h-3" /> }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/10">
                        {item.icon}
                      </div>
                      <span className="text-xs font-bold text-slate-300">{item.label}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{item.time}</span>
                  </div>
                ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
