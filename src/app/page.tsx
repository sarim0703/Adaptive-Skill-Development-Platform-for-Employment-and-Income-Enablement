"use client";

import Link from "next/link";
import { Sparkles, Target, Brain, TrendingUp, ArrowRight, CheckCircle2, Users, BookOpen, BarChart3 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useSearchParams, useRouter } from "next/navigation";
import AuthSidePanel from "@/components/AuthSidePanel";

export default function Home() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isAuthVisible = searchParams.get("auth") === "true";

  const closeAuth = () => {
    router.push("/", { scroll: false });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0A0C] text-white">
      {/* Background Orbs */}
      <div className={`aurora-blob w-[800px] h-[800px] bg-blue-600/20 -top-1/4 -left-1/4 rounded-full transition-all duration-1000 ${isAuthVisible ? 'blur-[160px] scale-150 opacity-20' : ''}`}></div>
      <div className={`aurora-blob w-[600px] h-[600px] bg-violet-600/20 top-1/2 -right-1/4 rounded-full transition-all duration-1000 ${isAuthVisible ? 'blur-[160px] scale-150 opacity-20' : ''}`} style={{ animationDelay: '4s' }}></div>
      
      {/* Dynamic Grid Overlay */}
      <div className="absolute inset-0 bg-tech-grid pointer-events-none opacity-30"></div>

      {/* Main Content Wrapper */}
      <div className={`transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) ${isAuthVisible ? 'translate-x-[-30%] opacity-40 scale-95 pointer-events-none blur-sm' : 'translate-x-0 opacity-100 scale-100'}`}>
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10">
        
        {/* Massive Hero Section */}
        <section className="text-center mb-40 animate-fadeInUp">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-10 shadow-2xl">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">{t("hero.badge")}</span>
          </div>

          <h1 className="text-6xl md:text-[100px] font-black tracking-tighter leading-[0.9] mb-10">
            {t("hero.title")}<br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent italic">
              {t("hero.titleHighlight")}
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto mb-16 leading-relaxed font-medium">
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <Link
              href="/?auth=true"
              className="btn-primary px-12 py-6 text-2xl rounded-2xl shadow-[0_20px_50px_rgba(59,130,246,0.3)] group"
            >
              <span className="flex items-center gap-3">
                {t("hero.cta")}
                <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
              </span>
            </Link>
          </div>

          {/* Trust Line */}
          <div className="flex flex-wrap items-center justify-center gap-12 mt-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
             {[t("hero.trust1"), t("hero.trust2"), t("hero.trust3")].map((trust, i) => (
               <div key={i} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-white">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  {trust}
               </div>
             ))}
          </div>
        </section>

        {/* Bento Box Features Section */}
        <section className="mb-40">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Main Feature Card */}
            <div className="md:col-span-2 md:row-span-2 card p-12 flex flex-col justify-between overflow-hidden relative group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Brain className="w-48 h-48 text-blue-400" />
               </div>
               <div>
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-8">
                     <Brain className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-4xl font-black text-white mb-4 leading-tight">Adaptive Learning Engine</h3>
                  <p className="text-slate-400 text-lg font-medium leading-relaxed">
                    Our proprietary BKT engine tracks your mastery in real-time, adjusting difficulty as you learn.
                  </p>
               </div>
               <div className="mt-12 h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[65%] bg-gradient-to-r from-blue-500 to-violet-500 animate-pulse"></div>
               </div>
            </div>

            {/* Sub Feature 1 */}
            <div className="md:col-span-2 card p-10 group overflow-hidden">
               <div className="flex items-start justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">Live Market Insights</h3>
                    <p className="text-slate-400 font-medium">Real-time demand tracking for your specific region.</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-emerald-400 group-hover:scale-110 transition-transform" />
               </div>
            </div>

            {/* Sub Feature 2 */}
            <div className="card p-10 group">
               <Users className="w-8 h-8 text-violet-400 mb-6 group-hover:rotate-12 transition-transform" />
               <h3 className="text-xl font-black text-white mb-2">Social Proof</h3>
               <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">12k+ Active Learners</p>
            </div>

            {/* Sub Feature 3 */}
            <div className="card p-10 group border-blue-500/30 bg-blue-500/5">
               <Sparkles className="w-8 h-8 text-blue-400 mb-6 animate-pulse" />
               <h3 className="text-xl font-black text-white mb-2">AI Mentorship</h3>
               <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">24/7 Support Active</p>
            </div>
          </div>
        </section>

        {/* How it Works - Modern Horizontal Loop */}
        <section className="mb-40 text-center">
           <h2 className="text-4xl md:text-6xl font-black text-white mb-20 tracking-tighter">{t("how.title")}</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[0, 1, 2].map((index) => (
                <div key={index} className="relative group text-left">
                  <div className="text-[120px] font-black text-white/[0.03] absolute -top-16 -left-8 pointer-events-none group-hover:text-blue-500/10 transition-colors">
                    0{index + 1}
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-3xl font-black text-white mb-4 flex items-center gap-4">
                      {t(`how.step${index + 1}.title` as any)}
                      <ArrowRight className="w-6 h-6 text-blue-500 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                    </h3>
                    <p className="text-slate-400 text-lg font-medium leading-relaxed border-l-2 border-white/5 pl-6 group-hover:border-blue-500/50 transition-colors">
                      {t(`how.step${index + 1}.desc` as any)}
                    </p>
                  </div>
                </div>
              ))}
           </div>
        </section>

        {/* Final CTA */}
        <section className="mb-24 card p-20 text-center relative overflow-hidden bg-gradient-to-br from-blue-600/10 to-violet-600/10 border-blue-500/20">
           <div className="absolute inset-0 bg-tech-grid opacity-10"></div>
           <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">Ready to sync your skills?</h2>
              <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium">Join thousands of others building their future with adaptive AI learning.</p>
              <Link
                href="/?auth=true"
                className="btn-primary px-16 py-8 text-2xl rounded-full shadow-[0_0_60px_rgba(59,130,246,0.3)]"
              >
                {t("hero.cta")}
              </Link>
           </div>
        </section>

        {/* Footer */}
        <footer className="pt-24 pb-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">{t("footer.text1")}</span>
           </div>
           <div className="flex gap-8 text-xs font-black uppercase tracking-widest text-slate-600">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
           </div>
        </footer>
      </div>
      </div>

      {/* Integrated Auth Side Panel */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[500px] z-[60] transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${
        isAuthVisible ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full bg-black/40 backdrop-blur-3xl border-l border-white/10 shadow-[-50px_0_100px_rgba(0,0,0,0.5)]">
          <AuthSidePanel onClose={closeAuth} />
        </div>
      </div>

      {/* Overlay Backdrop (to close on click) */}
      {isAuthVisible && (
        <div 
          onClick={closeAuth}
          className="fixed inset-0 z-50 cursor-pointer"
        />
      )}
    </div>
  );
}
