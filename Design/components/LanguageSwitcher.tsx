"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Language } from "@/lib/translations";
import { Globe, ChevronDown } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function LanguageSwitcher() {
  const { language, setLanguage, t, isLoaded } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isLoaded) return <div className="w-24 h-9 animate-pulse bg-foreground/5 rounded-full"></div>;

  const handleLanguageChange = async (newLang: Language) => {
    setIsOpen(false);
    if (language === newLang) return;
    
    if (pathname.includes('/learn') || pathname.includes('/path-selection')) {
      const confirmReset = window.confirm(t("lang.switch.alert"));
      if (!confirmReset) return;
      
      try {
        await fetch('/api/user/reset-roadmap', { method: 'POST' });
        setLanguage(newLang);
        router.push('/path-selection');
      } catch (err) {
        console.error("Failed to reset roadmap", err);
      }
    } else {
      setLanguage(newLang);
    }
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
  ] as const;

  const currentLangLabel = languages.find(l => l.code === language)?.label || 'English';

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-foreground/5 backdrop-blur-md border border-border rounded-full px-4 py-2 shadow-sm hover:bg-foreground/10 transition-all group"
      >
        <Globe className="w-4 h-4 text-blue-500 group-hover:rotate-12 transition-transform" />
        <span className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">{currentLangLabel}</span>
        <ChevronDown className={`w-3 h-3 text-foreground/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-32 bg-card border border-border backdrop-blur-2xl rounded-2xl p-2 shadow-xl z-[100] animate-fadeInUp">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                language === lang.code 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                  : "text-slate-500 hover:bg-foreground/5 hover:text-foreground"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
