"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { getDashboardData } from "@/app/actions";
import MasteryDashboard from "./MasteryDashboard";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function ProfilePage() {
  const { t } = useLanguage();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getDashboardData();
        setUserData(data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
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

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/30">
      {/* ── Background Elements ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px]" />
      </div>

      <MasteryDashboard data={userData} />
    </div>
  );
}
