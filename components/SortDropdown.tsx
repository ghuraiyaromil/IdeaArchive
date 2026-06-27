"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "composite", label: "Overall Score" },
  { value: "market_size", label: "Market Size" },
  { value: "feasibility", label: "Feasibility" },
  { value: "clarity", label: "Clarity" },
  { value: "rating_count", label: "Most Rated" },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]["value"];

interface SortDropdownProps {
  current: string;
}

export default function SortDropdown({ current }: SortDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    router.push(`/leaderboard?${params.toString()}`);
  }

  const validCurrent: SortOption = SORT_OPTIONS.some((o) => o.value === current)
    ? (current as SortOption)
    : "composite";

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="sort-select"
        className="text-xs text-white/40 font-mono uppercase tracking-widest whitespace-nowrap"
      >
        Sort by
      </label>
      <select
        id="sort-select"
        value={validCurrent}
        onChange={handleChange}
        className="bg-[#111] border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-white/30 cursor-pointer font-mono"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
