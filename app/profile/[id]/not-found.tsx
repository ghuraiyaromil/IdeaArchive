import Link from "next/link";

export default function ProfileNotFound() {
  return (
    <div className="min-h-[calc(100dvh-3.5rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="font-mono text-xs text-white/20 uppercase tracking-widest mb-4">
          Profile not found
        </p>
        <h1 className="text-xl font-bold text-white mb-2">
          User doesn&apos;t exist
        </h1>
        <p className="text-sm text-white/40 mb-8">
          This account may have been removed.
        </p>
        <Link
          href="/"
          className="text-sm bg-white text-black font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
