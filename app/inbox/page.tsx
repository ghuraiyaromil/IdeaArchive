import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InboxClient from "./InboxClient";
import type { Profile, Connection } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Inbox" };

interface ConnectionRow extends Connection {
  investor: Pick<Profile, "id" | "username" | "is_verified_investor" | "linkedin_url">;
  idea: { id: string; title: string };
}

export default async function InboxPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profileData } = await supabase
    .from("profiles").select("*").eq("id", user.id).single();

  const profile = profileData as Profile | null;
  if (!profile || profile.role_type !== "founder") redirect("/leaderboard");

  // Fetch all connection requests where this user is the founder
  // Join investor profile + the idea title via a separate query
  const { data: connectionsData, error } = await supabase
    .from("connections")
    .select(`
      *,
      investor:profiles!investor_id(id, username, is_verified_investor, linkedin_url)
    `)
    .eq("founder_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <p className="text-rose-400 text-sm">Failed to load inbox: {error.message}</p>
      </div>
    );
  }

  const connections = (connectionsData ?? []) as ConnectionRow[];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Inbox</h1>
        <p className="text-sm text-white/40 mt-1">
          Connection requests from investors · {connections.length} total
        </p>
      </div>
      <InboxClient connections={connections} founderId={user.id} />
    </div>
  );
}
