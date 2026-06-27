"use client";

import { useState } from "react";
import RatingForm from "@/components/RatingForm";
import type { Rating } from "@/lib/types";

interface Props {
  ideaId: string;
  userId: string;
  existingRating: Rating | null;
}

export default function RatingFormWrapper({ ideaId, userId, existingRating }: Props) {
  const [currentRating, setCurrentRating] = useState<Rating | null>(existingRating);

  return (
    <RatingForm
      ideaId={ideaId}
      userId={userId}
      existingRating={currentRating}
      onSuccess={(r) => setCurrentRating(r)}
    />
  );
}
