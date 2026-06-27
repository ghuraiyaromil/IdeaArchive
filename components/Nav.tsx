"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export default function Nav() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function loadSession() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (data) setProfile(data as Profile);
      }
      setLoading(false);
    }
    loadSession();
    const { data: listener } = supabase.auth.onAuthStateChange(() => loadSession());
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-mono font-bold text-white text-sm tracking-tight">
          Idea<span className="text-white/40">Archive</span>
        </Link>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-6">
          <Link href="/leaderboard" className="text-sm text-white/60 hover:text-white transition-colors">
            Leaderboard
          </Link>
          {!loading && (
            <>
              {profile ? (
                <>
                  {profile.role_type === "founder" && (
                    <>
                      <Link href="/dashboard" className="text-sm text-white/60 hover:text-white transition-colors">
                        Dashboard
                      </Link>
                      <Link href="/inbox" className="text-sm text-white/60 hover:text-white transition-colors">
                        Inbox
                      </Link>
                      <Link href="/ideas/new" className="text-sm text-white/60 hover:text-white transition-colors">
                        Submit
                      </Link>
                    </>
                  )}
                  <Link href={`/profile/${profile.id}`}
                    className="text-sm text-white/60 hover:text-white transition-colors font-mono">
                    @{profile.username}
                  </Link>
                  <button onClick={handleSignOut}
                    className="text-sm text-white/40 hover:text-white/70 transition-colors">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-sm text-white/60 hover:text-white transition-colors">
                    Sign in
                  </Link>
                  <Link href="/auth/signup"
                    className="text-sm bg-white text-black font-semibold px-4 py-1.5 rounded-lg hover:bg-white/90 transition-colors">
                    Join
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="sm:hidden text-white/60 hover:text-white p-1"
          onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-white/10 bg-[#0a0a0a] px-4 py-3 flex flex-col gap-3">
          <Link href="/leaderboard" className="text-sm text-white/60 hover:text-white" onClick={() => setMenuOpen(false)}>Leaderboard</Link>
          {!loading && profile ? (
            <>
              {profile.role_type === "founder" && (
                <>
                  <Link href="/dashboard" className="text-sm text-white/60 hover:text-white" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                  <Link href="/inbox" className="text-sm text-white/60 hover:text-white" onClick={() => setMenuOpen(false)}>Inbox</Link>
                  <Link href="/ideas/new" className="text-sm text-white/60 hover:text-white" onClick={() => setMenuOpen(false)}>Submit Idea</Link>
                </>
              )}
              <Link href={`/profile/${profile.id}`} className="text-sm text-white/60 hover:text-white font-mono" onClick={() => setMenuOpen(false)}>@{profile.username}</Link>
              <button onClick={() => { setMenuOpen(false); handleSignOut(); }} className="text-left text-sm text-white/40 hover:text-white/70">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-white/60 hover:text-white" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link href="/auth/signup" className="text-sm text-white font-semibold" onClick={() => setMenuOpen(false)}>Join</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
