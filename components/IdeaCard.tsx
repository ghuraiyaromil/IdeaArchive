import Link from "next/link";
import ScoreBar from "@/components/ScoreBar";
import type { LeaderboardEntry } from "@/lib/types";

interface IdeaCardProps {
  entry: LeaderboardEntry;
  rank: number;
}

export default function IdeaCard({ entry, rank }: IdeaCardProps) {
  return (
    <Link
      href={`/ideas/${entry.idea_id}`}
      className="group block rounded-xl border border-white/10 bg-[#111] p-5 hover:border-white/25 hover:bg-white/[0.03] transition-all duration-200"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          {/* Rank badge */}
          <span className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-white/40">
            {rank}
          </span>

          <div>
            <h3 className="font-semibold text-white group-hover:text-white/90 leading-snug line-clamp-2">
              {entry.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-white/40 font-mono">
                {entry.industry}
              </span>
              {entry.visibility === "investor_only" && (
                <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-400/20">
                  Investor Only
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Composite score badge */}
        <div className="flex-shrink-0 text-right">
          <div className="text-2xl font-mono font-bold text-white tabular-nums">
            {entry.overall_composite_score.toFixed(1)}
          </div>
          <div className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
            / 5
          </div>
        </div>
      </div>

      {/* Problem teaser */}
      <p className="text-sm text-white/50 line-clamp-2 mb-4 leading-relaxed">
        {entry.problem}
      </p>

      {/* Score bars */}
      <div className="flex flex-col gap-2.5">
        <ScoreBar label="Market Size" score={entry.avg_market_size} />
        <ScoreBar label="Feasibility" score={entry.avg_feasibility} />
        <ScoreBar label="Clarity" score={entry.avg_clarity} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
        <Link
          href={`/profile/${entry.founder_id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-white/40 hover:text-white/70 transition-colors font-mono"
        >
          @{entry.founder_username}
        </Link>
        <span className="text-xs text-white/30 font-mono">
          {entry.rating_count} {entry.rating_count === 1 ? "rating" : "ratings"}
        </span>
      </div>
    </Link>
  );
}
