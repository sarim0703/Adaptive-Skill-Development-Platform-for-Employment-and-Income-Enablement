"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Brain, TrendingUp, BookOpen, LogOut, Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  if (pathname === '/auth') return null;

  // Simple landing page check
  const isLandingPage = pathname === '/';
  const links = isLandingPage ? [] : [
    { href: "/learn", label: "Dashboard", icon: BookOpen },
    { href: "/analytics", label: "Analytics", icon: TrendingUp },
    { href: "/architecture", label: "Architecture", icon: Brain },
  ];

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex justify-center p-4 pointer-events-none">
      <nav className="w-full max-w-7xl h-16 bg-white/80 backdrop-blur-2xl border border-white/40 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08)] flex items-center justify-between px-6 pointer-events-auto animate-navFadeIn">
        {/* Left: Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-slate-800 tracking-tight text-lg hidden sm:block">SkillSync</span>
        </Link>

        {/* Center: Links (Only show if not landing or if logged in) */}
        {!isLandingPage && (
          <div className="hidden md:flex items-center bg-slate-100/50 p-1 rounded-full border border-slate-200/30">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-5 py-1.5 rounded-full text-sm font-bold transition-all ${
                    isActive 
                      ? "bg-white text-[#007AFF] shadow-sm" 
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          
          {isLandingPage ? (
            <Link href="/auth" className="btn-primary py-2 px-6 rounded-full text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
              {t("nav.signIn")}
            </Link>
          ) : (
            <button
              onClick={() => signOut({ callbackUrl: "/auth" })}
              className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100 hover:border-rose-100"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
