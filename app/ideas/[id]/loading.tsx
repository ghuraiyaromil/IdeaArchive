export default function IdeaDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div>
            <div className="h-5 w-20 bg-white/5 rounded-full animate-pulse mb-3" />
            <div className="h-9 w-3/4 bg-white/5 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-20 bg-white/5 rounded animate-pulse mb-2" />
              <div className="h-16 bg-white/5 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-5">
          <div className="h-40 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-48 bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
