export default function LeaderboardLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="h-7 w-36 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-4 w-24 bg-white/5 rounded mt-2 animate-pulse" />
        </div>
        <div className="h-8 w-44 bg-white/5 rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-[#111] p-5 h-56 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
