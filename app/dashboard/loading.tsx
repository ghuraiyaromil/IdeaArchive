export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="h-8 w-40 bg-white/5 rounded-lg animate-pulse mb-10" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <div className="h-40 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-28 bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
