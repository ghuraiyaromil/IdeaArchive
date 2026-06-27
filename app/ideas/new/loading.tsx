export default function NewIdeaLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse mb-2" />
      <div className="h-4 w-72 bg-white/5 rounded animate-pulse mb-10" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="mb-6">
          <div className="h-4 w-24 bg-white/5 rounded animate-pulse mb-2" />
          <div className="h-20 bg-white/5 rounded-lg animate-pulse" />
        </div>
      ))}
    </div>
  );
}
