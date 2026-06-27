"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const REASONS = [
  "Spam or self-promotion",
  "Duplicate idea",
  "Misleading or false information",
  "Inappropriate content",
  "Other",
];

interface Props {
  ideaId: string;
  reporterId: string;
  alreadyReported: boolean;
}

export default function ReportButton({ ideaId, reporterId, alreadyReported }: Props) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(alreadyReported);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from("reports").insert({
      idea_id: ideaId,
      reporter_id: reporterId,
      reason,
    });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setDone(true);
    setOpen(false);
  }

  if (done) {
    return (
      <span className="text-xs text-white/20 font-mono">Reported</span>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-white/20 hover:text-rose-400 transition-colors font-mono"
      >
        Report
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#111] p-6">
            <h2 className="font-semibold text-white mb-1">Report this idea</h2>
            <p className="text-xs text-white/40 mb-4">
              Help us keep IdeaArchive high quality.
            </p>

            <div className="flex flex-col gap-2 mb-4">
              {REASONS.map((r) => (
                <label key={r}
                  className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="reason" value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="accent-white" />
                  <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                    {r}
                  </span>
                </label>
              ))}
            </div>

            {error && (
              <p className="text-xs text-rose-400 mb-3">{error}</p>
            )}

            <div className="flex gap-2">
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 bg-white text-black font-semibold py-2 rounded-lg hover:bg-white/90 disabled:opacity-50 text-sm transition-colors">
                {submitting ? "Submitting…" : "Submit report"}
              </button>
              <button onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/30 text-sm transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
