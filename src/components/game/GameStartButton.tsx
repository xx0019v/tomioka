"use client";

import Link from "next/link";
import { AnalyticsEvent, trackEvent } from "@/lib/analytics";
import { startGame } from "@/lib/progress";

export function GameStartButton({ className }: { className?: string }) {
  return (
    <Link
      href="/checkpoints/atelier/"
      className={className}
      onClick={() => {
        startGame();
        trackEvent(AnalyticsEvent.GameStart, { source: "game_guide" });
      }}
    >
      最初の地点へ
    </Link>
  );
}
