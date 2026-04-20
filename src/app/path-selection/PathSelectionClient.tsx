"use client";

import { useEffect, useState } from "react";
import { generateAndSavePathOptions, selectPath } from "../actions";
import { Loader2, TrendingUp, Clock, Target, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type PathOptionType = {
  id: string;
  pathTitle: string;
  practicalSummary: string | null;
  estimatedIncomeMin: number | null;
  estimatedIncomeMax: number | null;
  estimatedWeeks: number | null;
  matchReason: string | null;
  previewWeeks: unknown;
};

export default function PathSelectionClient({ initialPaths }: { initialPaths: PathOptionType[] }) {
  const { t } = useLanguage();
  const [paths, setPaths] = useState(initialPaths);
  const [isGenerating, setIsGenerating] = useState(initialPaths.length === 0);
  const [isSelecting, setIsSelecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (initialPaths.length === 0) {
      generateAndSavePathOptions()
        .then((generatedPaths) => {
          setPaths(generatedPaths);
          setIsGenerating(false);
        })
        .catch((err) => {
          console.error(err);
          setIsGenerating(false);
        });
    }
  }, [initialPaths.length]);

  async function handleSelect(pathId: string) {
    setIsSelecting(true);
    try {
      await selectPath(pathId);
      router.push("/learn");
    } catch (err) {
      console.error(err);
      setIsSelecting(false);
    }
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-warm-gradient flex flex-col items-center justify-center p-4">
        <div className="text-center animate-fadeInUp">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">{t("path.loading.title")}</h2>
          <p className="text-slate-500 max-w-md">
            {t("path.loading.sub")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-gradient p-4 md:p-8">
      <div className="max-w-5xl mx-auto animate-fadeInUp">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">{t("path.title")}</h1>
            <p className="text-slate-500">{t("path.sub")}</p>
          </div>
          <div className="flex justify-center">
            <LanguageSwitcher />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger">
          {paths.map((path, index) => (
            <div
              key={path.id}
              className="card p-6 flex flex-col transition-all hover:-translate-y-1"
            >
              {/* Best Match Badge */}
              {index === 0 && (
                <div className="badge badge-green mb-4 self-start">
                  <Star className="w-3.5 h-3.5" />
                  {t("path.recommended")}
                </div>
              )}

              <h2 className="text-lg font-bold text-slate-800 mb-2">{path.pathTitle}</h2>
              <p className="text-slate-500 text-sm mb-5 flex-grow leading-relaxed">{path.practicalSummary}</p>

              <div className="space-y-2.5 mb-5">
                <div className="flex items-center gap-3 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-slate-600">
                    <span className="badge badge-green text-xs font-semibold">
                      {t("path.income")}: ₹{(path.estimatedIncomeMin ?? 0).toLocaleString()} – ₹{(path.estimatedIncomeMax ?? 0).toLocaleString()}/mo
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>{t("path.readyIn")} <strong>{path.estimatedWeeks} {t("path.weeks")}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <Target className="w-4 h-4 text-amber-400" />
                  <span className="line-clamp-1">{path.matchReason}</span>
                </div>
              </div>

              {/* Curriculum Preview */}
              <div className="bg-slate-50 rounded-xl p-4 mb-5">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  {t("path.preview")}
                </h3>
                <div className="space-y-2">
                  {Array.isArray(path.previewWeeks) && (path.previewWeeks as { week: number; focus: string }[]).map((pw) => (
                    <div key={pw.week} className="flex gap-3 text-sm">
                      <span className="badge badge-indigo text-xs py-0.5 px-2">{t("onboarding.step")} {pw.week}</span>
                      <span className="text-slate-600 line-clamp-1">{pw.focus}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleSelect(path.id)}
                disabled={isSelecting}
                className="btn-primary w-full"
              >
                {isSelecting ? <Loader2 className="w-5 h-5 animate-spin" /> : `${t("path.select")} →`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
