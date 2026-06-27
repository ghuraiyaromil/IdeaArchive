"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RatingFormValues, Rating } from "@/lib/types";

interface RatingFormProps {
  ideaId: string;
  userId: string;
  existingRating: Rating | null;
  onSuccess: (rating: Rating) => void;
}

const SLIDER_CONFIG = [
  {
    key: "market_size_score" as const,
    label: "Market Size",
    hint: "How large is the addressable market?",
  },
  {
    key: "feasibility_score" as const,
    label: "Feasibility",
    hint: "How achievable is this idea today?",
  },
  {
    key: "clarity_score" as const,
    label: "Clarity",
    hint: "How well is the idea explained?",
  },
];

function scoreLabel(v: number): string {
  switch (v) {
    case 1: return "Poor";
    case 2: return "Fair";
    case 3: return "Good";
    case 4: return "Great";
    case 5: return "Excellent";
    default: return "";
  }
}

export default function RatingForm({
  ideaId,
  userId,
  existingRating,
  onSuccess,
}: RatingFormProps) {
  const supabase = createClient();

  const [values, setValues] = useState<RatingFormValues>({
    market_size_score: existingRating?.market_size_score ?? 3,
    feasibility_score: existingRating?.feasibility_score ?? 3,
    clarity_score: existingRating?.clarity_score ?? 3,
    feedback_text: existingRating?.feedback_text ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function setScore(key: keyof Pick<RatingFormValues, "market_size_score" | "feasibility_score" | "clarity_score">, val: number) {
    setValues((prev) => ({ ...prev, [key]: val }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      idea_id: ideaId,
      rater_id: userId,
      market_size_score: values.market_size_score,
      feasibility_score: values.feasibility_score,
      clarity_score: values.clarity_score,
      feedback_text: values.feedback_text || null,
    };

    const { data, error: supaError } = await supabase
      .from("ratings")
      .upsert(payload, { onConflict: "idea_id,rater_id" })
      .select()
      .single();

    setSaving(false);

    if (supaError) {
      setError(supaError.message);
      return;
    }

    if (data) {
      setSaved(true);
      onSuccess(data as Rating);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-white/10 bg-[#111] p-5 flex flex-col gap-5"
    >
      <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider font-mono">
        {existingRating ? "Update Your Rating" : "Rate This Idea"}
      </h2>

      {SLIDER_CONFIG.map(({ key, label, hint }) => (
        <div key={key} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white font-medium">{label}</p>
              <p className="text-xs text-white/40">{hint}</p>
            </div>
            <span className="font-mono text-sm text-white bg-white/10 rounded-md px-2 py-0.5 min-w-[80px] text-center">
              {values[key]} — {scoreLabel(values[key])}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={values[key]}
            onChange={(e) => setScore(key, Number(e.target.value))}
            className="w-full accent-white cursor-pointer"
            aria-label={label}
          />
          <div className="flex justify-between text-[10px] text-white/20 font-mono px-0.5">
            <span>1 Poor</span>
            <span>3 Good</span>
            <span>5 Excellent</span>
          </div>
        </div>
      ))}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="feedback" className="text-sm text-white/60">
          Feedback <span className="text-white/30">(optional)</span>
        </label>
        <textarea
          id="feedback"
          value={values.feedback_text}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, feedback_text: e.target.value }))
          }
          placeholder="Share what you think could be improved…"
          rows={3}
          className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-rose-400 bg-rose-400/10 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-white text-black text-sm font-semibold py-2.5 rounded-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? "Saving…" : saved ? "Saved ✓" : existingRating ? "Update Rating" : "Submit Rating"}
      </button>
    </form>
  );
}
