import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import RatingFormWrapper from "./RatingFormWrapper";
import ConnectionButtonWrapper from "./ConnectionButtonWrapper";
import ScoreBar from "@/components/ScoreBar";
import ShareButton from "@/components/ShareButton";
import ReportButtonWrapper from "./ReportButtonWrapper";
import type {
  Idea, Profile, Rating, RatingWithRater, LeaderboardEntry,
} from "@/lib/types";
import type { Metadata } from "next";

interface PageProps { params: { id: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase.from("ideas").select("title, problem").eq("id", params.id).single();
  if (!data) return { title: "Idea" };
  return {
    title: (data as Pick<Idea, "title">).title,
    description: (data as Pick<Idea, "problem">).problem.slice(0, 160),
  };
}

export default async function IdeaDetailPage({ params }: PageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: ideaData, error: ideaError } = await supabase
    .from("ideas")
    .select("*, founder:profiles!founder_id(id, username, bio, role_type, created_at, linkedin_url, is_verified_investor)")
    .eq("id", params.id)
    .single();

  if (ideaError || !ideaData) notFound();
  const idea = ideaData as Idea & { founder: Profile };

  const { data: scoreData } = await supabase
    .from("idea_leaderboard").select("*").eq("idea_id", params.id).single();
  const scores = scoreData as LeaderboardEntry | null;

  const { data: ratingsData } = await supabase
    .from("ratings")
    .select("*, rater:profiles!rater_id(id, username, bio, role_type, created_at, linkedin_url, is_verified_investor)")
    .eq("idea_id", params.id)
    .order("created_at", { ascending: false });
  const ratings = (ratingsData ?? []) as RatingWithRater[];

  let myRating: Rating | null = null;
  if (user) myRating = ratings.find((r) => r.rater_id === user.id) ?? null;

  let userProfile: Profile | null = null;
  if (user) {
    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (profileData) userProfile = profileData as Profile;
  }

  let existingConnectionData = null;
  if (user && userProfile?.role_type === "investor") {
    const { data } = await supabase.from("connections").select("*")
      .eq("investor_id", user.id).eq("founder_id", idea.founder_id).single();
    existingConnectionData = data;
  }

  let existingReport = null;
  if (user) {
    const { data } = await supabase.from("reports").select("id")
      .eq("idea_id", idea.id).eq("reporter_id", user.id).single();
    existingReport = data;
  }

  const isOwner = user?.id === idea.founder_id;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs font-mono text-white/40 border border-white/10 rounded-full px-2.5 py-0.5">
                {idea.industry}
              </span>
              {idea.visibility === "investor_only" && (
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-400/20">
                  Investor Only
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-white leading-tight mb-3">{idea.title}</h1>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-white/30 font-mono">
                <Link href={`/profile/${idea.founder_id}`} className="hover:text-white/60 transition-colors">
                  @{idea.founder.username}
                </Link>
                <span>·</span>
                <time>{new Date(idea.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</time>
              </div>
              <ShareButton title={idea.title} />
              {isOwner && (
                <Link href={`/ideas/${idea.id}/edit`}
                  className="text-xs text-white/30 hover:text-white/60 transition-colors font-mono border border-white/10 rounded-lg px-3 py-1.5 hover:border-white/20">
                  Edit
                </Link>
              )}
              {user && !isOwner && (
                <ReportButtonWrapper
                  ideaId={idea.id}
                  reporterId={user.id}
                  alreadyReported={!!existingReport}
                />
              )}
            </div>
          </div>

          {/* Pitch fields */}
          {[
            { label: "Problem", value: idea.problem },
            { label: "Solution", value: idea.solution },
            { label: "Market Size", value: idea.market_size_desc },
            { label: "Business Model", value: idea.business_model },
          ].map(({ label, value }) => (
            <PitchSection key={label} label={label} value={value} />
          ))}

          {/* Peer reviews */}
          <section>
            <h2 className="text-sm font-mono uppercase tracking-widest text-white/40 mb-4">
              Community Reviews <span className="text-white/20">({ratings.length})</span>
            </h2>
            {ratings.length === 0 ? (
              <p className="text-sm text-white/30 py-4">No ratings yet — be the first.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {ratings.map((r) => <ReviewCard key={r.id} rating={r} />)}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5">
          {scores ? (
            <div className="rounded-xl border border-white/10 bg-[#111] p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-white/40">Community Score</span>
                <span className="text-2xl font-mono font-bold text-white">
                  {scores.overall_composite_score.toFixed(1)}<span className="text-white/30 text-base">/5</span>
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <ScoreBar label="Market Size" score={scores.avg_market_size} />
                <ScoreBar label="Feasibility" score={scores.avg_feasibility} />
                <ScoreBar label="Clarity" score={scores.avg_clarity} />
              </div>
              <p className="text-xs text-white/30 font-mono mt-3">
                {scores.rating_count} {scores.rating_count === 1 ? "rating" : "ratings"}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-[#111] p-5">
              <p className="text-sm text-white/30">No ratings yet.</p>
              <p className="text-xs text-white/20 mt-1">Needs 3 ratings to appear on leaderboard.</p>
            </div>
          )}

          {user && userProfile?.role_type === "investor" && !isOwner && (
            <ConnectionButtonWrapper
              founderId={idea.founder_id}
              investorId={user.id}
              existingConnectionData={existingConnectionData}
            />
          )}

          {user && !isOwner ? (
            <RatingFormWrapper ideaId={idea.id} userId={user.id} existingRating={myRating} />
          ) : !user ? (
            <div className="rounded-xl border border-white/10 bg-[#111] p-5 text-center">
              <p className="text-sm text-white/40 mb-3">Sign in to rate this idea.</p>
              <Link href="/auth/login"
                className="text-sm bg-white text-black font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors">
                Sign in
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-[#111] p-5">
              <p className="text-xs text-white/30 font-mono">You can&apos;t rate your own idea.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PitchSection({ label, value }: { label: string; value: string }) {
  return (
    <section>
      <h2 className="text-xs font-mono uppercase tracking-widest text-white/40 mb-2">{label}</h2>
      <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{value}</p>
    </section>
  );
}

function ReviewCard({ rating }: { rating: RatingWithRater }) {
  const composite = (rating.market_size_score + rating.feasibility_score + rating.clarity_score) / 3;
  return (
    <div className="rounded-xl border border-white/10 bg-[#111] p-4">
      <div className="flex items-center justify-between mb-3">
        <Link href={`/profile/${rating.rater_id}`}
          className="text-xs font-mono text-white/50 hover:text-white/70 transition-colors">
          @{rating.rater.username}
        </Link>
        <span className="font-mono text-sm text-white font-bold">{composite.toFixed(1)}</span>
      </div>
      <div className="flex gap-3 text-xs font-mono text-white/30 mb-3">
        <span>Market {rating.market_size_score}</span>
        <span>·</span>
        <span>Feasibility {rating.feasibility_score}</span>
        <span>·</span>
        <span>Clarity {rating.clarity_score}</span>
      </div>
      {rating.feedback_text && (
        <p className="text-sm text-white/50 leading-relaxed">{rating.feedback_text}</p>
      )}
    </div>
  );
}
