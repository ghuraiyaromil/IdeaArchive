import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Idea } from "@/lib/types";
import type { Metadata } from "next";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", params.id)
    .single();
  if (!data) return { title: "Profile" };
  return { title: `@${(data as Pick<Profile, "username">).username}` };
}

export default async function ProfilePage({ params }: PageProps) {
  const supabase = createClient();

  const { data: profileData, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !profileData) notFound();

  const profile = profileData as Profile;

  // Ideas (only show public ideas to anonymous; show all if own profile or investor)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userProfile: Profile | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (data) userProfile = data as Profile;
  }

  const isOwnProfile = user?.id === profile.id;
  const isInvestor = userProfile?.role_type === "investor";

  // Non-investor, non-owner sees only public ideas
  let query = supabase
    .from("ideas")
    .select("*")
    .eq("founder_id", profile.id)
    .order("created_at", { ascending: false });

  if (!isOwnProfile && !isInvestor) {
    query = query.eq("visibility", "public");
  }

  const { data: ideasData } = await query;
  const ideas = (ideasData ?? []) as Idea[];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-12 pb-12 border-b border-white/10">
        {/* Avatar placeholder */}
        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold text-white/50">
          {profile.username.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">
              @{profile.username}
            </h1>
            <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/10 text-white/40">
              {profile.role_type}
            </span>
          </div>

          {profile.bio && (
            <p className="text-white/50 text-sm mt-2 max-w-xl leading-relaxed">
              {profile.bio}
            </p>
          )}

          <p className="text-xs text-white/20 font-mono mt-3">
            Joined{" "}
            {new Date(profile.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </div>

      {/* Ideas */}
      {profile.role_type === "founder" && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-mono uppercase tracking-widest text-white/40">
              Ideas <span className="text-white/20">({ideas.length})</span>
            </h2>
            {isOwnProfile && (
              <Link
                href="/ideas/new"
                className="text-xs bg-white text-black font-semibold px-3 py-1.5 rounded-lg hover:bg-white/90 transition-colors"
              >
                + New Idea
              </Link>
            )}
          </div>

          {ideas.length === 0 ? (
            <div className="text-center py-16 border border-white/5 rounded-xl">
              <p className="text-white/30 text-sm">
                {isOwnProfile
                  ? "You haven't submitted any ideas yet."
                  : "No public ideas yet."}
              </p>
              {isOwnProfile && (
                <Link
                  href="/ideas/new"
                  className="mt-4 inline-block text-sm text-white/50 hover:text-white transition-colors"
                >
                  Submit your first idea →
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {ideas.map((idea) => (
                <Link
                  key={idea.id}
                  href={`/ideas/${idea.id}`}
                  className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-[#111] p-4 hover:border-white/25 hover:bg-white/[0.02] transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-white group-hover:text-white/90 truncate">
                        {idea.title}
                      </h3>
                      {idea.visibility === "investor_only" && (
                        <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-400/20 flex-shrink-0">
                          Investor Only
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/40 font-mono">
                      {idea.industry}
                    </p>
                    <p className="text-sm text-white/40 mt-2 line-clamp-2 leading-relaxed">
                      {idea.problem}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-xs text-white/20 font-mono whitespace-nowrap">
                    {new Date(idea.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {profile.role_type === "investor" && (
        <div className="text-center py-16 border border-white/5 rounded-xl">
          <p className="text-white/30 text-sm">
            Investor profiles don&apos;t display public ideas.
          </p>
          <Link
            href="/leaderboard"
            className="mt-4 inline-block text-sm text-white/50 hover:text-white transition-colors"
          >
            Browse the leaderboard →
          </Link>
        </div>
      )}
    </div>
  );
}
