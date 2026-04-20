"use client";

import Link from "next/link";
import { Sparkles, Target, Brain, TrendingUp, ArrowRight, CheckCircle2, Users, BookOpen, BarChart3 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-warm-gradient text-slate-800 overflow-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between max-w-6xl mx-auto px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">SkillSync</span>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            href="/auth"
            className="btn-primary text-sm py-2.5 px-5"
          >
            {t("nav.signIn")}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="badge badge-indigo text-xs uppercase tracking-widest px-4 py-2 mb-8 inline-flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          {t("hero.badge")}
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6 text-slate-800">
          {t("hero.title")}{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
            {t("hero.titleHighlight")}
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          {t("hero.subtitle")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth"
            className="btn-primary px-8 py-4 text-lg shadow-lg shadow-indigo-500/20 group"
          >
            {t("hero.cta")}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-14 text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>{t("hero.trust1")}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>{t("hero.trust2")}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>{t("hero.trust3")}</span>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="card p-1 grid grid-cols-3 divide-x divide-slate-100">
          <div className="text-center py-6 px-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="w-4 h-4 text-indigo-400" />
              <span className="text-2xl font-bold text-slate-800">{t("stats.1.title")}</span>
            </div>
            <span className="text-xs text-slate-400">{t("stats.1.sub")}</span>
          </div>
          <div className="text-center py-6 px-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-violet-400" />
              <span className="text-2xl font-bold text-slate-800">{t("stats.2.title")}</span>
            </div>
            <span className="text-xs text-slate-400">{t("stats.2.sub")}</span>
          </div>
          <div className="text-center py-6 px-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-green-400" />
              <span className="text-2xl font-bold text-slate-800">{t("stats.3.title")}</span>
            </div>
            <span className="text-xs text-slate-400">{t("stats.3.sub")}</span>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 text-slate-800">{t("how.title")}</h2>
        <p className="text-slate-500 text-center mb-14 max-w-lg mx-auto">
          {t("how.sub")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger">
          {/* Step 1 */}
          <div className="card p-8 hover:-translate-y-1 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-5 group-hover:bg-indigo-100 transition-colors">
              <Target className="w-6 h-6 text-indigo-500" />
            </div>
            <div className="badge badge-indigo text-xs mb-3">{t("how.step1.badge")}</div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{t("how.step1.title")}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {t("how.step1.desc")}
            </p>
          </div>

          {/* Step 2 */}
          <div className="card p-8 hover:-translate-y-1 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center mb-5 group-hover:bg-violet-100 transition-colors">
              <Brain className="w-6 h-6 text-violet-500" />
            </div>
            <div className="text-xs font-semibold text-violet-600 bg-violet-50 rounded-full px-3 py-1 inline-block mb-3">{t("how.step2.badge")}</div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{t("how.step2.title")}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {t("how.step2.desc")}
            </p>
          </div>

          {/* Step 3 */}
          <div className="card p-8 hover:-translate-y-1 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-5 group-hover:bg-green-100 transition-colors">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-xs font-semibold text-green-600 bg-green-50 rounded-full px-3 py-1 inline-block mb-3">{t("how.step3.badge")}</div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{t("how.step3.title")}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {t("how.step3.desc")}
            </p>
          </div>
        </div>
      </section>

      {/* AI Mentor Feature */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="card p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-5 leading-tight text-slate-800">
                {t("mentor.title")}{" "}
                <span className="text-indigo-500">{t("mentor.titleHighlight")}</span>
              </h2>
              <p className="text-slate-500 leading-relaxed mb-7">
                {t("mentor.desc")}
              </p>
              <div className="space-y-3">
                {[
                  t("mentor.point1"),
                  t("mentor.point2"),
                  t("mentor.point3"),
                  t("mentor.point4"),
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mock Chat */}
            <div className="card p-5 space-y-3 bg-slate-50">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">{t("mentor.chat.name")}</div>
                  <div className="text-xs text-slate-400">{t("mentor.chat.status")}</div>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-slate-600 max-w-[85%] shadow-sm">
                {t("mentor.chat.msg1")}
              </div>
              <div className="bg-indigo-500 rounded-2xl rounded-br-md px-4 py-3 text-sm text-white max-w-[85%] ml-auto">
                {t("mentor.chat.msg2")}
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-slate-600 max-w-[85%] shadow-sm">
                {t("mentor.chat.msg3")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="card p-12 md:p-16 bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-100">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-slate-800">{t("cta.title")}</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            {t("cta.sub")}
          </p>
          <Link
            href="/auth"
            className="btn-primary px-8 py-4 text-lg shadow-lg shadow-indigo-500/20 group inline-flex"
          >
            {t("cta.button")}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-8">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-slate-400">{t("footer.text1")}</span>
          </div>
          <span className="text-xs text-slate-400">{t("footer.text2")}</span>
        </div>
      </footer>
    </div>
  );
}
