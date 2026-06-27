"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { RoleType } from "@/lib/types";

type Step = "role" | "details";

interface RoleCard {
  role: RoleType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const ROLES: RoleCard[] = [
  {
    role: "founder",
    title: "Founder",
    description:
      "Submit structured pitches, get community ratings, and connect with investors.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.355a3 3 0 01-3 0M10.5 8.25h3l-3 4.5h3"
        />
      </svg>
    ),
  },
  {
    role: "investor",
    title: "Investor",
    description:
      "Discover top-rated ideas, access investor-only pitches, and request founder introductions.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
        />
      </svg>
    ),
  },
];

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<RoleType | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function selectRole(r: RoleType) {
    setRole(r);
    setStep("details");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;

    if (username.trim().length < 2) {
      setError("Username must be at least 2 characters.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.trim(),
          role_type: role,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    router.push("/leaderboard");
    router.refresh();
  }

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="font-mono font-bold text-white text-xl">
            Idea<span className="text-white/40">Archive</span>
          </Link>
          <p className="text-sm text-white/40 mt-2">Create your account</p>
        </div>

        {/* Step 1 — role selector */}
        {step === "role" && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-white/60 text-center mb-2">
              I&apos;m joining as a…
            </p>
            {ROLES.map(({ role: r, title, description, icon }) => (
              <button
                key={r}
                onClick={() => selectRole(r)}
                className="w-full text-left rounded-xl border border-white/10 bg-[#111] p-4 hover:border-white/30 hover:bg-white/[0.03] transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/50 group-hover:text-white/70 transition-colors">
                    {icon}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{title}</div>
                    <p className="text-sm text-white/40 mt-0.5 leading-snug">
                      {description}
                    </p>
                  </div>
                </div>
              </button>
            ))}

            <p className="text-center text-sm text-white/30 mt-3">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-white/60 hover:text-white transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        )}

        {/* Step 2 — details */}
        {step === "details" && role && (
          <div>
            <button
              onClick={() => { setStep("role"); setError(null); }}
              className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors mb-5 font-mono"
            >
              ← Back
            </button>

            <div className="inline-flex items-center gap-2 text-xs font-mono border border-white/10 rounded-full px-3 py-1 mb-5 text-white/40">
              Signing up as{" "}
              <span className="text-white capitalize">{role}</span>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-xl border border-white/10 bg-[#111] p-6 flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label htmlFor="username" className="text-sm text-white/60">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="yourname"
                  required
                  minLength={2}
                  maxLength={30}
                  pattern="[a-zA-Z0-9_-]+"
                  title="Letters, numbers, underscores, and hyphens only"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm text-white/60">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm text-white/60">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              {error && (
                <p className="text-sm text-rose-400 bg-rose-400/10 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <p className="text-[11px] text-white/20 leading-relaxed">
                Investor status is self-declared (honor system). By joining you
                agree to rate ideas honestly.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-semibold py-2.5 rounded-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
