import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100dvh-3.5rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="font-mono text-6xl font-bold text-white/10 mb-4">404</p>
        <h1 className="text-xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-sm text-white/40 mb-8">
          This page doesn&apos;t exist or was removed.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="text-sm bg-white text-black font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
          >
            Go home
          </Link>
          <Link
            href="/leaderboard"
            className="text-sm border border-white/20 text-white/60 hover:text-white hover:border-white/40 px-4 py-2 rounded-lg transition-colors"
          >
            Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
