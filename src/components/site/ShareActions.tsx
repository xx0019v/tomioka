"use client";

import { AnalyticsEvent, trackEvent } from "@/lib/analytics";
import styles from "./ShareActions.module.css";

interface ShareActionsProps {
  text: string;
  url: string;
}

export function ShareActions({ text, url }: ShareActionsProps) {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);

  return (
    <div className={styles.actions} aria-label="SNSで共有">
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent(AnalyticsEvent.ShareClick, { platform: "x" })}
      >
        Xで共有
      </a>
      <a
        href={`https://social-plugins.line.me/lineit/share?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent(AnalyticsEvent.ShareClick, { platform: "line" })}
      >
        LINEで送る
      </a>
    </div>
  );
}
