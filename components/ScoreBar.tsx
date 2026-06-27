"use client";

interface ScoreBarProps {
  label: string;
  score: number; // 0–5
  maxScore?: number;
}

// Color shifts: low → amber, mid → sky, high → emerald
function scoreColor(pct: number): string {
  if (pct >= 0.75) return "bg-emerald-400";
  if (pct >= 0.5) return "bg-sky-400";
  if (pct >= 0.25) return "bg-amber-400";
  return "bg-rose-400";
}

export default function ScoreBar({
  label,
  score,
  maxScore = 5,
}: ScoreBarProps) {
  const pct = Math.min(Math.max(score / maxScore, 0), 1);
  const displayScore = score.toFixed(1);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50 uppercase tracking-widest font-mono">
          {label}
        </span>
        <span className="text-xs font-mono text-white/70">
          {displayScore}
          <span className="text-white/30">/{maxScore}</span>
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${scoreColor(pct)}`}
          style={{ width: `${pct * 100}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={maxScore}
          aria-label={`${label}: ${displayScore} out of ${maxScore}`}
        />
      </div>
    </div>
  );
}
