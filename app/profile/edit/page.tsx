"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export default function EditProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (!data) { router.push("/"); return; }

      const p = data as Profile;
      setProfile(p);
      setUsername(p.username);
      setBio(p.bio ?? "");
      setLinkedinUrl(p.linkedin_url ?? "");
      setLoading(false);
    }
    load();
  }, [supabase, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    if (username.trim().length < 2) { setError("Username must be at least 2 characters."); return; }

    setSaving(true);
    setError(null);
    setSaved(false);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username: username.trim(),
        bio: bio.trim() || null,
        linkedin_url: linkedinUrl.trim() || null,
      })
      .eq("id", profile.id);

    setSaving(false);

    if (updateError) { setError(updateError.message); return; }
    setSaved(true);
    router.refresh();
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 flex justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href={`/profile/${profile?.id}`}
          className="text-xs text-white/30 hover:text-white/60 font-mono transition-colors">
          ← Back to profile
        </Link>
        <h1 className="text-2xl font-bold text-white mt-4">Edit Profile</h1>
      </div>

      <form onSubmit={handleSubmit}
        className="rounded-xl border border-white/10 bg-[#111] p-6 flex flex-col gap-5">

        <div className="flex flex-col gap-1.5">
          <label htmlFor="username" className="text-sm font-medium text-white">Username</label>
          <input id="username" type="text" value={username}
            onChange={(e) => { setUsername(e.target.value); setSaved(false); }}
            minLength={2} maxLength={30} pattern="[a-zA-Z0-9_-]+"
            title="Letters, numbers, underscores, hyphens only"
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
            required />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="bio" className="text-sm font-medium text-white">
            Bio <span className="text-white/30 font-normal">(optional)</span>
          </label>
          <textarea id="bio" value={bio}
            onChange={(e) => { setBio(e.target.value); setSaved(false); }}
            placeholder="Tell founders or investors a bit about yourself…"
            rows={3} maxLength={300}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 resize-none transition-colors" />
          <p className="text-xs text-white/20 text-right">{bio.length}/300</p>
        </div>

        {profile?.role_type === "investor" && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="linkedin" className="text-sm font-medium text-white">
              LinkedIn URL <span className="text-white/30 font-normal">(optional — builds trust with founders)</span>
            </label>
            <input id="linkedin" type="url" value={linkedinUrl}
              onChange={(e) => { setLinkedinUrl(e.target.value); setSaved(false); }}
              placeholder="https://linkedin.com/in/yourname"
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors" />
          </div>
        )}

        {error && (
          <p className="text-sm text-rose-400 bg-rose-400/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <button type="submit" disabled={saving}
          className="w-full bg-white text-black font-semibold py-2.5 rounded-lg hover:bg-white/90 disabled:opacity-50 transition-colors">
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
