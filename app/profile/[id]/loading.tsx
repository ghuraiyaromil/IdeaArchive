export default function ProfileLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-start gap-6 mb-12 pb-12 border-b border-white/10">
        <div className="w-16 h-16 rounded-full bg-white/5 animate-pulse" />
        <div className="flex-1">
          <div className="h-8 w-40 bg-white/5 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-64 bg-white/5 rounded animate-pulse mb-2" />
          <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
