import Link from "next/link";

export default function IdeaNotFound() {
  return (
    <div className="min-h-[calc(100dvh-3.5rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="font-mono text-xs text-white/20 uppercase tracking-widest mb-4">
          Idea not found
        </p>
        <h1 className="text-xl font-bold text-white mb-2">
          This idea doesn&apos;t exist
        </h1>
        <p className="text-sm text-white/40 mb-8">
          It may have been removed, or you may not have permission to view it.
        </p>
        <Link
          href="/leaderboard"
          className="text-sm bg-white text-black font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
        >
          Browse ideas
        </Link>
      </div>
    </div>
  );
}
