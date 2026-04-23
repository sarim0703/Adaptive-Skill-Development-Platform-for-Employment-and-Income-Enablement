"use client";

import Link from "next/link";
import { Sparkles, Target, Brain, TrendingUp, ArrowRight, CheckCircle2, Users, BookOpen, BarChart3 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Hero */}
      <section className="text-center mb-24 animate-fadeInUp">
        <div className="badge badge-indigo px-4 py-2 mb-8 inline-flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          {t("hero.badge")}
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-8 text-[#1D1D1F]">
          {t("hero.title")}<br />
          <span className="text-[#007AFF]">
            {t("hero.titleHighlight")}
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
          {t("hero.subtitle")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            href="/auth"
            className="btn-primary px-10 py-5 text-xl shadow-xl shadow-blue-500/10 group rounded-full"
          >
            {t("hero.cta")}
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-10 mt-16 text-sm font-medium text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#34C759]" />
            <span>{t("hero.trust1")}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#34C759]" />
            <span>{t("hero.trust2")}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#34C759]" />
            <span>{t("hero.trust3")}</span>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">{t("stats.1.title")}</h3>
            <p className="text-sm text-slate-500">{t("stats.1.sub")}</p>
          </div>
          <div className="card p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">{t("stats.2.title")}</h3>
            <p className="text-sm text-slate-500">{t("stats.2.sub")}</p>
          </div>
          <div className="card p-8 text-center border-emerald-100 bg-emerald-50/30">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">{t("stats.3.title")}</h3>
            <p className="text-sm text-slate-500">{t("stats.3.sub")}</p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="mb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4">{t("how.title")}</h2>
          <p className="text-lg text-slate-500">{t("how.sub")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger">
          {[1, 2, 3].map((step) => (
            <div key={step} className="glass-card p-10 group">
              <div className="text-5xl font-black text-slate-100 mb-6 group-hover:text-blue-50 transition-colors">0{step}</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">{t(`how.step${step}.title`)}</h3>
              <p className="text-slate-500 leading-relaxed">
                {t(`how.step${step}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture CTA */}
      <section className="mb-24 text-center">
        <Link href="/architecture" className="inline-flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-6 py-4 hover:border-blue-300 hover:bg-blue-50/30 transition-all shadow-sm">
          <Brain className="w-6 h-6 text-blue-600" />
          <div className="text-left">
            <div className="text-sm font-bold text-slate-800">Explore our Research Architecture</div>
            <div className="text-xs text-slate-500">Learn about the 8-layer adaptive feedback loop</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 ml-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 pt-12 pb-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-slate-400" />
            </div>
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">{t("footer.text1")}</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">{t("footer.text2")}</p>
        </div>
      </footer>
    </div>
  );
}
