export default function InboxLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="h-8 w-24 bg-white/5 rounded-lg animate-pulse mb-2" />
      <div className="h-4 w-48 bg-white/5 rounded animate-pulse mb-10" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse mb-3" />
      ))}
    </div>
  );
}
