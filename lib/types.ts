// ─────────────────────────────────────────────
//  IdeaArchive — shared TypeScript interfaces
// ─────────────────────────────────────────────

export type RoleType = "founder" | "investor";

export type Visibility = "public" | "investor_only";

export type ConnectionStatus = "pending" | "accepted" | "declined";

// ── Database row shapes ────────────────────────

export interface Profile {
  id: string;
  username: string;
  bio: string | null;
  role_type: RoleType;
  created_at: string;
}

export interface Idea {
  id: string;
  founder_id: string;
  title: string;
  industry: string;
  problem: string;
  solution: string;
  market_size_desc: string;
  business_model: string;
  visibility: Visibility;
  created_at: string;
}

export interface Rating {
  id: string;
  idea_id: string;
  rater_id: string;
  market_size_score: number; // 1-5
  feasibility_score: number; // 1-5
  clarity_score: number;     // 1-5
  feedback_text: string | null;
  created_at: string;
}

export interface Connection {
  id: string;
  investor_id: string;
  founder_id: string;
  status: ConnectionStatus;
  created_at: string;
}

// ── View / computed shapes ─────────────────────

export interface LeaderboardEntry {
  idea_id: string;
  title: string;
  industry: string;
  problem: string;
  visibility: Visibility;
  founder_id: string;
  founder_username: string;
  avg_market_size: number;
  avg_feasibility: number;
  avg_clarity: number;
  overall_composite_score: number;
  rating_count: number;
}

// ── Form input types ───────────────────────────

export interface IdeaFormValues {
  title: string;
  industry: string;
  problem: string;
  solution: string;
  market_size_desc: string;
  business_model: string;
  visibility: Visibility;
}

export interface RatingFormValues {
  market_size_score: number;
  feasibility_score: number;
  clarity_score: number;
  feedback_text: string;
}

// ── Enriched shapes (joins) ────────────────────

export interface IdeaWithFounder extends Idea {
  founder: Pick<Profile, "id" | "username">;
}

export interface RatingWithRater extends Rating {
  rater: Pick<Profile, "id" | "username">;
}
