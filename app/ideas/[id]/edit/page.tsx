"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Idea, IdeaFormValues, Visibility } from "@/lib/types";

const INDUSTRIES = [
  "AI / ML", "FinTech", "HealthTech", "EdTech", "CleanTech",
  "SaaS", "Marketplace", "DTC / Consumer", "DeepTech", "Other",
];

const inputClass =
  "w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors";
const textareaClass = `${inputClass} resize-none`;

function Field({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
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

export default function EditIdeaPage() {
  const router = useRouter();
  const params = useParams();
  const ideaId = params.id as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<IdeaFormValues>({
    title: "", industry: "", problem: "", solution: "",
    market_size_desc: "", business_model: "", visibility: "public",
  });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data, error: fetchError } = await supabase
        .from("ideas").select("*").eq("id", ideaId).single();

      if (fetchError || !data) { router.push("/leaderboard"); return; }

      const idea = data as Idea;
      if (idea.founder_id !== user.id) { router.push(`/ideas/${ideaId}`); return; }

      setValues({
        title: idea.title,
        industry: idea.industry,
        problem: idea.problem,
        solution: idea.solution,
        market_size_desc: idea.market_size_desc,
        business_model: idea.business_model,
        visibility: idea.visibility,
      });
      setLoading(false);
    }
    load();
  }, [supabase, ideaId, router]);

  function set<K extends keyof IdeaFormValues>(key: K, value: IdeaFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("ideas")
      .update({
        title: values.title.trim(),
        industry: values.industry,
        problem: values.problem.trim(),
        solution: values.solution.trim(),
        market_size_desc: values.market_size_desc.trim(),
        business_model: values.business_model.trim(),
        visibility: values.visibility,
      })
      .eq("id", ideaId);

    setSaving(false);

    if (updateError) { setError(updateError.message); return; }
    router.push(`/ideas/${ideaId}`);
  }

  async function handleDelete() {
    if (!confirm("Delete this idea permanently? This cannot be undone.")) return;
    setDeleting(true);
    const { error: deleteError } = await supabase.from("ideas").delete().eq("id", ideaId);
    if (deleteError) { setError(deleteError.message); setDeleting(false); return; }
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 flex justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/ideas/${ideaId}`} className="text-xs text-white/30 hover:text-white/60 font-mono transition-colors">
          ← Back to idea
        </Link>
      </div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Edit Idea</h1>
        <p className="text-sm text-white/40 mt-1">Changes are saved immediately. Existing ratings are preserved.</p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <Field label="Title" hint="Short, memorable name.">
          <input type="text" value={values.title} onChange={(e) => set("title", e.target.value)}
            maxLength={120} className={inputClass} required />
        </Field>

        <Field label="Industry" hint="Pick the closest category.">
          <select value={values.industry} onChange={(e) => set("industry", e.target.value)} className={inputClass} required>
            <option value="">Select an industry…</option>
            {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
          </select>
        </Field>

        <Field label="Problem" hint="What pain are you solving? For whom?">
          <textarea value={values.problem} onChange={(e) => set("problem", e.target.value)}
            rows={3} className={textareaClass} required />
        </Field>

        <Field label="Solution" hint="How do you solve it?">
          <textarea value={values.solution} onChange={(e) => set("solution", e.target.value)}
            rows={3} className={textareaClass} required />
        </Field>

        <Field label="Market Size" hint="Describe the TAM/SAM with data or estimates.">
          <textarea value={values.market_size_desc} onChange={(e) => set("market_size_desc", e.target.value)}
            rows={3} className={textareaClass} required />
        </Field>

        <Field label="Business Model" hint="How do you make money?">
          <textarea value={values.business_model} onChange={(e) => set("business_model", e.target.value)}
            rows={3} className={textareaClass} required />
        </Field>

        <Field label="Visibility" hint="Who can see this idea?">
          <div className="grid grid-cols-2 gap-3">
            {(["public", "investor_only"] as Visibility[]).map((v) => (
              <button key={v} type="button" onClick={() => set("visibility", v)}
                className={`rounded-lg border px-4 py-3 text-sm text-left transition-all ${
                  values.visibility === v
                    ? "border-white/40 bg-white/5 text-white"
                    : "border-white/10 text-white/40 hover:border-white/20"
                }`}>
                <div className="font-medium">{v === "public" ? "Public" : "Investor Only"}</div>
                <div className="text-xs text-white/30 mt-0.5">
                  {v === "public" ? "Visible on leaderboard" : "Investors only"}
                </div>
              </button>
            ))}
          </div>
        </Field>

        {error && (
          <p className="text-sm text-rose-400 bg-rose-400/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="flex-1 bg-white text-black font-semibold py-2.5 rounded-lg hover:bg-white/90 disabled:opacity-50 transition-colors">
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button type="button" onClick={handleDelete} disabled={deleting}
            className="px-5 py-2.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 disabled:opacity-50 transition-colors text-sm font-medium">
            {deleting ? "Deleting…" : "Delete idea"}
          </button>
        </div>
      </form>
    </div>
  );
}
