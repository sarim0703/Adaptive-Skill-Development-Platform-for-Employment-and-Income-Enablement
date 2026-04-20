"use client";

import { useState } from "react";
import { Briefcase, MessageSquare, Heart, BookOpen, Loader2, CheckCircle2 } from "lucide-react";

type OutcomeCardProps = {
  roadmapId: string;
  moduleId: number;
  onSubmit: (outcomeType: string) => Promise<void>;
};

const outcomeOptions = [
  { type: 'gig_found', label: 'I found a gig or job!', icon: Briefcase, color: 'bg-green-50 border-green-200 text-green-700' },
  { type: 'interview', label: 'I got an interview', icon: MessageSquare, color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { type: 'confidence', label: 'I feel more confident', icon: Heart, color: 'bg-pink-50 border-pink-200 text-pink-700' },
  { type: 'still_learning', label: 'Still learning, not yet', icon: BookOpen, color: 'bg-amber-50 border-amber-200 text-amber-700' },
];

export default function OutcomeCard({ onSubmit }: OutcomeCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    await onSubmit(selected);
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800 mb-1">Thanks for sharing! 🙏</h3>
        <p className="text-slate-400 text-sm">Your feedback helps us improve SkillSync for everyone.</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-1">Module Complete! 🎉</h3>
      <p className="text-slate-500 text-sm mb-5">Has this module helped you make real progress?</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
        {outcomeOptions.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selected === opt.type;
          return (
            <button
              key={opt.type}
              onClick={() => setSelected(opt.type)}
              className={`p-4 rounded-xl border-1.5 text-left flex items-center gap-3 transition-all ${
                isSelected ? opt.color + ' ring-2 ring-indigo-200' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{opt.label}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selected || submitting}
        className="btn-primary w-full"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Submit Feedback
      </button>
    </div>
  );
}
