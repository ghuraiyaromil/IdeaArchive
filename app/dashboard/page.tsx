import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ScoreBar from "@/components/ScoreBar";
import type { Profile, Idea, LeaderboardEntry, Connection } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

interface ConnectionWithInvestor extends Connection {
  investor: Pick<Profile, "id" | "username" | "is_verified_investor">;
}

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profileData } = await supabase
    .from("profiles").select("*").eq("id", user.id).single();

  const profile = profileData as Profile | null;
  if (!profile || profile.role_type !== "founder") redirect("/leaderboard");

  // All ideas by this founder
  const { data: ideasData } = await supabase
    .from("ideas").select("*").eq("founder_id", user.id).order("created_at", { ascending: false });
  const ideas = (ideasData ?? []) as Idea[];

  // Leaderboard scores for each idea
  const { data: scoresData } = await supabase
    .from("idea_leaderboard").select("*").eq("founder_id", user.id);
  const scores = (scoresData ?? []) as LeaderboardEntry[];
  const scoreMap = new Map(scores.map((s) => [s.idea_id, s]));

  // Pending connections
  const { data: connectionsData } = await supabase
    .from("connections")
    .select("*, investor:profiles!investor_id(id, username, is_verified_investor)")
    .eq("founder_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  const pendingConnections = (connectionsData ?? []) as ConnectionWithInvestor[];

  // Aggregate stats
  const totalRatings = scores.reduce((sum, s) => sum + Number(s.rating_count), 0);
  const avgComposite = scores.length > 0
    ? scores.reduce((sum, s) => sum + Number(s.overall_composite_score), 0) / scores.length
    : null;
  const topIdea = scores.sort((a, b) => b.overall_composite_score - a.overall_composite_score)[0] ?? null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-white/40 mt-1 font-mono">@{profile.username}</p>
        </div>
        <Link href="/ideas/new"
          className="inline-flex items-center gap-2 bg-white text-black font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors text-sm">
          + Submit new idea
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Ideas submitted", value: ideas.length.toString() },
          { label: "Total ratings", value: totalRatings.toString() },
          { label: "Avg score", value: avgComposite ? avgComposite.toFixed(1) : "—" },
          { label: "Pending requests", value: pendingConnections.length.toString() },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/10 bg-[#111] p-4">
            <div className="text-2xl font-mono font-bold text-white">{value}</div>
            <div className="text-xs text-white/40 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ideas list */}
        <div className="lg:col-span-2">
          <p className="text-xs font-mono uppercase tracking-widest text-white/40 mb-4">
            Your ideas ({ideas.length})
          </p>

          {ideas.length === 0 ? (
            <div className="text-center py-16 border border-white/5 rounded-xl">
              <p className="text-white/30 text-sm">No ideas yet.</p>
              <Link href="/ideas/new" className="mt-3 inline-block text-sm text-white/50 hover:text-white transition-colors">
                Submit your first idea →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {ideas.map((idea) => {
                const s = scoreMap.get(idea.id);
                return (
                  <div key={idea.id} className="rounded-xl border border-white/10 bg-[#111] p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <Link href={`/ideas/${idea.id}`}
                          className="font-semibold text-white hover:text-white/80 transition-colors">
                          {idea.title}
                        </Link>
                        <p className="text-xs text-white/40 font-mono mt-0.5">{idea.industry}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {idea.visibility === "investor_only" && (
                          <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-400/20">
                            Investor only
                          </span>
                        )}
                        <Link href={`/ideas/${idea.id}/edit`}
                          className="text-xs text-white/30 hover:text-white/60 transition-colors border border-white/10 rounded-md px-2 py-1">
                          Edit
                        </Link>
                      </div>
                    </div>

                    {s ? (
                      <div className="flex flex-col gap-1.5">
                        <ScoreBar label="Market Size" score={s.avg_market_size} />
                        <ScoreBar label="Feasibility" score={s.avg_feasibility} />
                        <ScoreBar label="Clarity" score={s.avg_clarity} />
                        <p className="text-xs text-white/30 font-mono mt-1">
                          {s.rating_count} {s.rating_count === 1 ? "rating" : "ratings"} · composite {s.overall_composite_score.toFixed(1)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-white/20 font-mono">
                        No ratings yet — needs 3 to appear on leaderboard
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5">
          {/* Pending connections */}
          <div className="rounded-xl border border-white/10 bg-[#111] p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-mono uppercase tracking-widest text-white/40">
                Connection requests
              </p>
              <Link href="/inbox" className="text-xs text-white/30 hover:text-white/60 font-mono transition-colors">
                View all →
              </Link>
            </div>

            {pendingConnections.length === 0 ? (
              <p className="text-sm text-white/20">No pending requests.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {pendingConnections.slice(0, 5).map((c) => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link href={`/profile/${c.investor.id}`}
                        className="text-sm text-white/70 hover:text-white font-mono transition-colors">
                        @{c.investor.username}
                      </Link>
                      {c.investor.is_verified_investor && (
                        <span className="text-[10px] text-sky-400">✓</span>
                      )}
                    </div>
                    <Link href="/inbox"
                      className="text-xs text-amber-400 border border-amber-400/20 rounded px-2 py-0.5 hover:bg-amber-400/10 transition-colors">
                      Respond
                    </Link>
                  </div>
                ))}
                {pendingConnections.length > 5 && (
                  <Link href="/inbox" className="text-xs text-white/30 hover:text-white/50 font-mono transition-colors mt-1">
                    +{pendingConnections.length - 5} more →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Top idea */}
          {topIdea && (
            <div className="rounded-xl border border-white/10 bg-[#111] p-5">
              <p className="text-xs font-mono uppercase tracking-widest text-white/40 mb-3">
                Top rated idea
              </p>
              <Link href={`/ideas/${topIdea.idea_id}`}
                className="font-semibold text-white hover:text-white/80 transition-colors text-sm block mb-3">
                {topIdea.title}
              </Link>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-mono font-bold text-white">
                  {topIdea.overall_composite_score.toFixed(1)}
                </span>
                <span className="text-white/30 font-mono text-sm">/5</span>
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="rounded-xl border border-white/10 bg-[#111] p-5">
            <p className="text-xs font-mono uppercase tracking-widest text-white/40 mb-3">
              Quick links
            </p>
            <div className="flex flex-col gap-2">
              {[
                { href: `/profile/${user.id}`, label: "View public profile" },
                { href: "/profile/edit", label: "Edit profile" },
                { href: "/inbox", label: "All connection requests" },
                { href: "/leaderboard", label: "Browse leaderboard" },
              ].map(({ href, label }) => (
                <Link key={href} href={href}
                  className="text-sm text-white/50 hover:text-white transition-colors">
                  {label} →
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
