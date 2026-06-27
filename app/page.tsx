import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import IdeaCard from "@/components/IdeaCard";
import type { LeaderboardEntry } from "@/lib/types";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = createClient();

  // Top 3 ideas for preview
  const { data: topIdeas, error } = await supabase
    .from("idea_leaderboard")
    .select("*")
    .order("overall_composite_score", { ascending: false })
    .limit(3);

  if (error) {
    console.error("Homepage leaderboard error:", error.message);
  }

  const entries = (topIdeas ?? []) as LeaderboardEntry[];

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="mb-20 max-w-2xl">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-white/40 border border-white/10 rounded-full px-3 py-1 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Peer-reviewed startup ideas
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
          Where ideas go to
          <br />
          <span className="text-white/40">earn their stripes.</span>
        </h1>

        <p className="text-lg text-white/50 leading-relaxed mb-8">
          Founders submit structured pitches. The community rates them across
          three dimensions. Investors discover what&apos;s worth their attention.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/auth/signup"
            className="bg-white text-black font-semibold px-5 py-2.5 rounded-lg hover:bg-white/90 transition-colors text-sm"
          >
            Get started
          </Link>
          <Link
            href="/leaderboard"
            className="border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
          >
            Browse ideas
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-16 max-w-lg">
        {[
          { label: "Dimensions rated", value: "3" },
          { label: "Score range", value: "1–5" },
          { label: "Honor system", value: "✓" },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-white/10 bg-[#111] px-4 py-3"
          >
            <div className="text-2xl font-mono font-bold text-white">{value}</div>
            <div className="text-xs text-white/40 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Top ideas preview */}
      {entries.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-mono uppercase tracking-widest text-white/40">
              Top Rated
            </h2>
            <Link
              href="/leaderboard"
              className="text-xs text-white/40 hover:text-white/70 transition-colors font-mono"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map((entry, i) => (
              <IdeaCard key={entry.idea_id} entry={entry} rank={i + 1} />
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="mt-20 border-t border-white/5 pt-16">
        <h2 className="text-sm font-mono uppercase tracking-widest text-white/30 mb-10">
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Submit a pitch",
              body: "Founders fill in six structured fields: problem, solution, market, model, and more.",
            },
            {
              step: "02",
              title: "Community rates it",
              body: "Anyone (except the founder) rates Market Size, Feasibility, and Clarity from 1–5.",
            },
            {
              step: "03",
              title: "Investors discover",
              body: "Top-composite ideas surface on the leaderboard. Investors request connections directly.",
            },
          ].map(({ step, title, body }) => (
            <div key={step} className="flex flex-col gap-2">
              <span className="font-mono text-xs text-white/20">{step}</span>
              <h3 className="text-white font-semibold">{title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
