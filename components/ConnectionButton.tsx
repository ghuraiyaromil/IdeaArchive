"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Connection, ConnectionStatus } from "@/lib/types";

interface ConnectionButtonProps {
  founderId: string;
  investorId: string;
  existingConnection: Connection | null;
}

const STATUS_LABELS: Record<ConnectionStatus, string> = {
  pending: "Request Sent",
  accepted: "Connected",
  declined: "Declined",
};

const STATUS_STYLES: Record<ConnectionStatus, string> = {
  pending: "bg-amber-500/10 border-amber-400/20 text-amber-400 cursor-default",
  accepted: "bg-emerald-500/10 border-emerald-400/20 text-emerald-400 cursor-default",
  declined: "bg-rose-500/10 border-rose-400/20 text-rose-400 cursor-default",
};

export default function ConnectionButton({
  founderId,
  investorId,
  existingConnection,
}: ConnectionButtonProps) {
  const supabase = createClient();
  const [connection, setConnection] = useState<Connection | null>(existingConnection);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestConnection() {
    setLoading(true);
    setError(null);

    const { data, error: supaError } = await supabase
      .from("connections")
      .insert({ investor_id: investorId, founder_id: founderId, status: "pending" })
      .select()
      .single();

    setLoading(false);

    if (supaError) {
      setError(supaError.message);
      return;
    }

    if (data) {
      setConnection(data as Connection);
    }
  }

  if (connection) {
    return (
      <div className="flex flex-col gap-1">
        <span
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium font-mono ${STATUS_STYLES[connection.status]}`}
        >
          {connection.status === "pending" && (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          )}
          {connection.status === "accepted" && (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {STATUS_LABELS[connection.status]}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={requestConnection}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-white text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          "Sending…"
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
            </svg>
            Request Connection
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-rose-400">{error}</p>
      )}
    </div>
  );
}
