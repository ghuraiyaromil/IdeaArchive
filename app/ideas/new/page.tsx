"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { IdeaFormValues, Profile, Visibility } from "@/lib/types";

const INDUSTRIES = [
  "AI / ML",
  "FinTech",
  "HealthTech",
  "EdTech",
  "CleanTech",
  "SaaS",
  "Marketplace",
  "DTC / Consumer",
  "DeepTech",
  "Other",
];

const INITIAL: IdeaFormValues = {
  title: "",
  industry: "",
  problem: "",
  solution: "",
  market_size_desc: "",
  business_model: "",
  visibility: "public",
};

export default function NewIdeaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [values, setValues] = useState<IdeaFormValues>(INITIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (!data || (data as Profile).role_type !== "founder") {
        router.push("/leaderboard");
        return;
      }
      setProfile(data as Profile);
      setAuthChecked(true);
    }
    checkAuth();
  }, [supabase, router]);

  function set<K extends keyof IdeaFormValues>(key: K, value: IdeaFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    const missing = (
      ["title", "industry", "problem", "solution", "market_size_desc", "business_model"] as (keyof IdeaFormValues)[]
    ).find((k) => !values[k]?.toString().trim());
    if (missing) {
      setError(`Please fill in the ${missing.replace(/_/g, " ")} field.`);
      return;
    }

    setSaving(true);
    setError(null);

    const { data, error: supaError } = await supabase
      .from("ideas")
      .insert({
        founder_id: profile.id,
        title: values.title.trim(),
        industry: values.industry,
        problem: values.problem.trim(),
        solution: values.solution.trim(),
        market_size_desc: values.market_size_desc.trim(),
        business_model: values.business_model.trim(),
        visibility: values.visibility,
      })
      .select()
      .single();

    setSaving(false);

    if (supaError) {
      setError(supaError.message);
      return;
    }

    if (data) {
      router.push(`/ideas/${(data as { id: string }).id}`);
    }
  }

  if (!authChecked) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Submit an Idea</h1>
        <p className="text-sm text-white/40 mt-1">
          All six fields are required. Be specific — clarity is rated.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Title */}
        <Field label="Title" hint="Short, memorable name for your idea.">
          <input
            type="text"
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. PocketCFO"
            maxLength={120}
            className={inputClass}
            required
          />
        </Field>

        {/* Industry */}
        <Field label="Industry" hint="Pick the closest category.">
          <select
            value={values.industry}
            onChange={(e) => set("industry", e.target.value)}
            className={inputClass}
            required
          >
            <option value="">Select an industry…</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </Field>

        {/* Problem */}
        <Field label="Problem" hint="What pain are you solving? For whom?">
          <textarea
            value={values.problem}
            onChange={(e) => set("problem", e.target.value)}
            placeholder="Describe the specific problem and who experiences it…"
            rows={3}
            className={textareaClass}
            required
          />
        </Field>

        {/* Solution */}
        <Field label="Solution" hint="How do you solve it? What makes it different?">
          <textarea
            value={values.solution}
            onChange={(e) => set("solution", e.target.value)}
            placeholder="Your approach, key differentiator, and how it works…"
            rows={3}
            className={textareaClass}
            required
          />
        </Field>

        {/* Market Size Description */}
        <Field
          label="Market Size"
          hint="Describe the TAM/SAM. Include any data or estimates."
        >
          <textarea
            value={values.market_size_desc}
            onChange={(e) => set("market_size_desc", e.target.value)}
            placeholder="e.g. 50M SMBs in the US spend ~$200B/yr on accounting…"
            rows={3}
            className={textareaClass}
            required
          />
        </Field>

        {/* Business Model */}
        <Field
          label="Business Model"
          hint="How do you make money? Subscription, marketplace, etc."
        >
          <textarea
            value={values.business_model}
            onChange={(e) => set("business_model", e.target.value)}
            placeholder="e.g. SaaS subscription at $29/mo per seat…"
            rows={3}
            className={textareaClass}
            required
          />
        </Field>

        {/* Visibility */}
        <Field
          label="Visibility"
          hint="Investor-only ideas are hidden from the public leaderboard."
        >
          <div className="grid grid-cols-2 gap-3">
            {(["public", "investor_only"] as Visibility[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => set("visibility", v)}
                className={`rounded-lg border px-4 py-3 text-sm text-left transition-all ${
                  values.visibility === v
                    ? "border-white/40 bg-white/5 text-white"
                    : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                }`}
              >
                <div className="font-medium">
                  {v === "public" ? "Public" : "Investor Only"}
                </div>
                <div className="text-xs text-white/30 mt-0.5">
                  {v === "public"
                    ? "Visible on leaderboard"
                    : "Only verified investors see it"}
                </div>
              </button>
            ))}
          </div>
        </Field>

        {error && (
          <p className="text-sm text-rose-400 bg-rose-400/10 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "Submitting…" : "Submit Idea"}
        </button>
      </form>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────

const inputClass =
  "w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors";

const textareaClass = `${inputClass} resize-none`;

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div>
        <label className="text-sm font-medium text-white">{label}</label>
        <p className="text-xs text-white/40 mt-0.5">{hint}</p>
      </div>
      {children}
    </div>
  );
}
