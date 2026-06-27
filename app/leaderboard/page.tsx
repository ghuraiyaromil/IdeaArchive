import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import IdeaCard from "@/components/IdeaCard";
import SortDropdown from "@/components/SortDropdown";
import type { LeaderboardEntry } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Top-rated startup ideas ranked by community composite score.",
};

export const revalidate = 30;

type SortKey =
  | "composite"
  | "market_size"
  | "feasibility"
  | "clarity"
  | "rating_count";

const SORT_COLUMN: Record<SortKey, keyof LeaderboardEntry> = {
  composite: "overall_composite_score",
  market_size: "avg_market_size",
  feasibility: "avg_feasibility",
  clarity: "avg_clarity",
  rating_count: "rating_count",
};

function isValidSort(value: string): value is SortKey {
  return value in SORT_COLUMN;
}

interface PageProps {
  searchParams: { sort?: string };
}

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const rawSort = searchParams.sort ?? "composite";
  const sort: SortKey = isValidSort(rawSort) ? rawSort : "composite";
  const sortColumn = SORT_COLUMN[sort];

  const supabase = createClient();

  const { data, error } = await supabase
    .from("idea_leaderboard")
    .select("*")
    .order(sortColumn as string, { ascending: false });

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <p className="text-rose-400 text-sm">
          Failed to load leaderboard: {error.message}
        </p>
      </div>
    );
  }

  const entries = (data ?? []) as LeaderboardEntry[];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
          <p className="text-sm text-white/40 mt-1">
            {entries.length} rated {entries.length === 1 ? "idea" : "ideas"}
          </p>
        </div>
        <Suspense>
          <SortDropdown current={sort} />
        </Suspense>
      </div>

      {/* Grid */}
      {entries.length === 0 ? (
        <div className="text-center py-24 border border-white/5 rounded-xl">
          <p className="text-white/30 text-sm">
            No rated ideas yet — be the first to submit and rate.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry, i) => (
            <IdeaCard key={entry.idea_id} entry={entry} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
