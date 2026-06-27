"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="font-mono text-xs text-white/20 uppercase tracking-widest mb-4">
          Something went wrong
        </p>
        <h1 className="text-xl font-bold text-white mb-2">
          Unexpected error
        </h1>
        <p className="text-sm text-white/40 mb-2">
          {error.message || "An unknown error occurred."}
        </p>
        {error.digest && (
          <p className="text-xs font-mono text-white/20 mb-6">
            ID: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="text-sm bg-white text-black font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
