export default function LoginLoading() {
  return (
    <div className="min-h-[calc(100dvh-3.5rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="h-8 w-40 mx-auto bg-white/5 rounded-lg animate-pulse mb-8" />
        <div className="rounded-xl border border-white/10 bg-[#111] p-6">
          <div className="h-16 bg-white/5 rounded-lg animate-pulse mb-4" />
          <div className="h-16 bg-white/5 rounded-lg animate-pulse mb-4" />
          <div className="h-10 bg-white/5 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}
