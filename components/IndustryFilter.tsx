"use client";

import { useRouter, useSearchParams } from "next/navigation";

const INDUSTRIES = [
  "All",
  "AI / ML", "FinTech", "HealthTech", "EdTech", "CleanTech",
  "SaaS", "Marketplace", "DTC / Consumer", "DeepTech", "Other",
];

interface Props {
  current: string;
}

export default function IndustryFilter({ current }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value === "All") {
      params.delete("industry");
    } else {
      params.set("industry", e.target.value);
    }
    router.push(`/leaderboard?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="industry-select"
        className="text-xs text-white/40 font-mono uppercase tracking-widest whitespace-nowrap">
        Industry
      </label>
      <select id="industry-select" value={current || "All"} onChange={handleChange}
        className="bg-[#111] border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-white/30 cursor-pointer font-mono">
        {INDUSTRIES.map((ind) => (
          <option key={ind} value={ind}>{ind}</option>
        ))}
      </select>
    </div>
  );
}
