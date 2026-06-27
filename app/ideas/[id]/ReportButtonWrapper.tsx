"use client";

import ReportButton from "@/components/ReportButton";

interface Props {
  ideaId: string;
  reporterId: string;
  alreadyReported: boolean;
}

export default function ReportButtonWrapper({ ideaId, reporterId, alreadyReported }: Props) {
  return (
    <ReportButton
      ideaId={ideaId}
      reporterId={reporterId}
      alreadyReported={alreadyReported}
    />
  );
}
