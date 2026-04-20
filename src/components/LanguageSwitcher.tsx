"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Language } from "@/lib/translations";
import { Globe } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function LanguageSwitcher() {
  const { language, setLanguage, t, isLoaded } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  if (!isLoaded) return <div className="w-24 h-9 animate-pulse bg-slate-100 rounded-lg"></div>;

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as Language;
    
    // If the user is inside the app (has a roadmap), warn them about progress loss (Option A)
    if (pathname.includes('/learn') || pathname.includes('/path-selection')) {
      const confirmReset = window.confirm(t("lang.switch.alert"));
      if (!confirmReset) return;
      
      // We need to call a server action to clear their roadmap so it gets regenerated in new language
      try {
        await fetch('/api/user/reset-roadmap', { method: 'POST' });
        setLanguage(newLang);
        router.push('/path-selection'); // Redirect to path selection to start fresh in new language
      } catch (err) {
        console.error("Failed to reset roadmap", err);
      }
    } else {
      // Just change language for landing/auth pages
      setLanguage(newLang);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-white/50 border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm hover:bg-white transition-colors">
      <Globe className="w-4 h-4 text-slate-500" />
      <select 
        value={language}
        onChange={handleLanguageChange}
        className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer appearance-none pr-4 relative"
      >
        <option value="en">English</option>
        <option value="hi">हिंदी (Hindi)</option>
        <option value="kn">ಕನ್ನಡ (Kannada)</option>
      </select>
    </div>
  );
}
