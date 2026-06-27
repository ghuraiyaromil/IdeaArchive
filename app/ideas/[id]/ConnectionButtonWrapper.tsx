"use client";

import ConnectionButton from "@/components/ConnectionButton";
import type { Connection } from "@/lib/types";

interface Props {
  founderId: string;
  investorId: string;
  existingConnectionData: Connection | null;
}

export default function ConnectionButtonWrapper({
  founderId,
  investorId,
  existingConnectionData,
}: Props) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#111] p-5">
      <p className="text-xs font-mono text-white/40 mb-3 uppercase tracking-widest">
        Connect with Founder
      </p>
      <ConnectionButton
        founderId={founderId}
        investorId={investorId}
        existingConnection={existingConnectionData}
      />
    </div>
  );
}
