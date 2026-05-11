"use client";

import { useState } from "react";
import { CheckCircle2, Circle, AlertTriangle, ArrowLeft, Loader2, PlayCircle, RefreshCw, Flame } from "lucide-react";
import Link from "next/link";
import { recalibrateModuleAction } from "@/app/actions";
import { useRouter } from "next/navigation";

type OutlineClientProps = {
  roadmap: {
    id: string;
    pathTitle: string;
    modules: unknown[];
  };
  currentStreak?: number;
  capabilityScore?: number;
};

export default function OutlineClient({ roadmap, currentStreak, capabilityScore }: OutlineClientProps) {
  const [recalibratingModId, setRecalibratingModId] = useState<number | null>(null);
  const router = useRouter();

  const handleRecalibrate = async (moduleId: number) => {
    setRecalibratingModId(moduleId);
    try {
      await recalibrateModuleAction(roadmap.id, moduleId);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setRecalibratingModId(null);
    }
  };

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'active': return <PlayCircle className="w-5 h-5 text-indigo-500 animate-pulse-soft" />;
      case 'needs_review': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'locked': return <Circle className="w-5 h-5 text-slate-300" />;
      default: return <Circle className="w-5 h-5 text-slate-200" />;
    }
  };

  return (
    <div className="min-h-screen bg-warm-gradient p-4 md:p-8">
      <div className="max-w-3xl mx-auto animate-fadeInUp">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/learn" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800">Learning Outline</h1>
            <p className="text-slate-500 text-sm">{roadmap.pathTitle}</p>
          </div>
          <div className="flex items-center gap-3">
            {(currentStreak ?? 0) > 0 && (
              <span className="badge badge-amber">
                <Flame className="w-3.5 h-3.5" /> {currentStreak} days
              </span>
            )}
            <span className="badge badge-indigo">
              📊 {capabilityScore ?? 50}/100
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-0">
          {(roadmap.modules as { module_id: number; module_title: string; subtopics?: { subtopic_id: string; title: string; status: string }[]; status?: string }[]).map((mod, index) => {
            const isCalibrated = mod.subtopics && mod.subtopics.length > 0;
            const prevComplete = index === 0 || ((roadmap.modules as { subtopics?: { status: string }[] }[])[index - 1]?.subtopics?.every((s: { status: string }) => s.status === 'complete'));
            const canCalibrate = prevComplete || index === 0;

            return (
              <div key={mod.module_id} className="relative">
                {/* Connector line */}
                {index > 0 && (
                  <div className="absolute left-[23px] -top-4 w-0.5 h-4 bg-slate-200" />
                )}

                {isCalibrated ? (
                  <div className="card p-5 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                          {mod.module_id}
                        </span>
                        {mod.module_title}
                      </h2>
                    </div>
                    <div className="space-y-2 ml-8">
                      {mod.subtopics?.map((sub) => (
                        <div key={sub.subtopic_id} className="flex items-center gap-3 py-1.5">
                          {renderStatusIcon(sub.status)}
                          <span className={`text-sm ${
                            sub.status === 'complete' ? 'text-slate-400 line-through' :
                            sub.status === 'active' ? 'text-slate-800 font-medium' :
                            sub.status === 'needs_review' ? 'text-amber-600 font-medium' :
                            'text-slate-400'
                          }`}>
                            {sub.title}
                          </span>
                          {sub.status === 'needs_review' && (
                            <span className="badge badge-amber text-xs py-0">Review</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Pending Module */
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 mb-4 bg-slate-50/50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-base font-bold text-slate-400 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-bold">
                            {mod.module_id}
                          </span>
                          Module {mod.module_id}
                        </h2>
                        <p className="text-sm text-slate-400 mt-1 ml-8">
                          This module will be generated based on your progress ✨
                        </p>
                      </div>
                      {canCalibrate && (
                        <button
                          onClick={() => handleRecalibrate(mod.module_id)}
                          disabled={recalibratingModId === mod.module_id}
                          className="btn-primary text-sm py-2 px-4"
                        >
                          {recalibratingModId === mod.module_id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4" />
                              Generate
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
