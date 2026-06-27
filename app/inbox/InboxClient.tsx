"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Connection, Profile, ConnectionStatus } from "@/lib/types";

interface ConnectionRow extends Connection {
  investor: Pick<Profile, "id" | "username" | "is_verified_investor" | "linkedin_url">;
}

interface Props {
  connections: ConnectionRow[];
  founderId: string;
}

const STATUS_STYLES: Record<ConnectionStatus, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-400/20",
  accepted: "bg-emerald-500/10 text-emerald-400 border-emerald-400/20",
  declined: "bg-white/5 text-white/30 border-white/10",
};

export default function InboxClient({ connections: initial, founderId }: Props) {
  const supabase = createClient();
  const [connections, setConnections] = useState(initial);
  const [updating, setUpdating] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function updateStatus(connectionId: string, status: ConnectionStatus) {
    setUpdating(connectionId);
    setErrors((prev) => ({ ...prev, [connectionId]: "" }));

    const { error } = await supabase
      .from("connections")
      .update({ status })
      .eq("id", connectionId)
      .eq("founder_id", founderId);

    setUpdating(null);

    if (error) {
      setErrors((prev) => ({ ...prev, [connectionId]: error.message }));
      return;
    }

    setConnections((prev) =>
      prev.map((c) => (c.id === connectionId ? { ...c, status } : c))
    );
  }

  const pending = connections.filter((c) => c.status === "pending");
  const others = connections.filter((c) => c.status !== "pending");

  if (connections.length === 0) {
    return (
      <div className="text-center py-24 border border-white/5 rounded-xl">
        <p className="text-white/30 text-sm">No connection requests yet.</p>
        <p className="text-white/20 text-xs mt-2">When investors request to connect, they'll appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {pending.length > 0 && (
        <section>
          <p className="text-xs font-mono uppercase tracking-widest text-white/40 mb-4">
            Pending ({pending.length})
          </p>
          <div className="flex flex-col gap-3">
            {pending.map((c) => (
              <ConnectionCard
                key={c.id}
                connection={c}
                updating={updating === c.id}
                error={errors[c.id]}
                onAccept={() => updateStatus(c.id, "accepted")}
                onDecline={() => updateStatus(c.id, "declined")}
              />
            ))}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section>
          <p className="text-xs font-mono uppercase tracking-widest text-white/40 mb-4">
            Previous ({others.length})
          </p>
          <div className="flex flex-col gap-3">
            {others.map((c) => (
              <ConnectionCard
                key={c.id}
                connection={c}
                updating={updating === c.id}
                error={errors[c.id]}
                onAccept={() => updateStatus(c.id, "accepted")}
                onDecline={() => updateStatus(c.id, "declined")}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ConnectionCard({
  connection,
  updating,
  error,
  onAccept,
  onDecline,
}: {
  connection: ConnectionRow;
  updating: boolean;
  error: string | undefined;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const { investor, status, created_at } = connection;
  const statusStyle = STATUS_STYLES[status];

  return (
    <div className="rounded-xl border border-white/10 bg-[#111] p-5">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white/50 text-sm">
          {investor.username.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Link
              href={`/profile/${investor.id}`}
              className="font-semibold text-white hover:text-white/80 transition-colors font-mono"
            >
              @{investor.username}
            </Link>
            {investor.is_verified_investor && (
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-400/20">
                ✓ Verified
              </span>
            )}
            <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${statusStyle}`}>
              {status}
            </span>
          </div>

          {investor.linkedin_url && (
            <a
              href={investor.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/30 hover:text-white/60 transition-colors font-mono"
            >
              LinkedIn ↗
            </a>
          )}

          <p className="text-xs text-white/20 font-mono mt-1">
            {new Date(created_at).toLocaleDateString("en-US", {
              year: "numeric", month: "short", day: "numeric",
            })}
          </p>
        </div>

        {/* Actions */}
        {status === "pending" && (
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={onAccept}
              disabled={updating}
              className="text-sm bg-white text-black font-semibold px-4 py-1.5 rounded-lg hover:bg-white/90 disabled:opacity-50 transition-colors"
            >
              {updating ? "…" : "Accept"}
            </button>
            <button
              onClick={onDecline}
              disabled={updating}
              className="text-sm border border-white/10 text-white/50 hover:text-white hover:border-white/30 px-4 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
            >
              {updating ? "…" : "Decline"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-rose-400 mt-3">{error}</p>
      )}
    </div>
  );
}
