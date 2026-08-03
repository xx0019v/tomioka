"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import styles from "./WovenTitle.module.css";

/**
 * 題字を「織り上げる」。ファーストビューで一度だけ。
 *
 * 文字は分解しない。1 つのテキストノードのまま、
 * 縦糸を張り → 横糸を左から通し → 通った範囲の布（＝文字）が現れる。
 *
 * 一度織り終えたら二度と再生しない。戻ってきても静止したまま。
 */

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToMotion(onChange: () => void) {
  const query = window.matchMedia(MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** 動きを減らす設定かどうか。SSR では「減らす」側に倒して、織らない状態で描き出す */
function useReducedMotion() {
  return useSyncExternalStore(
    subscribeToMotion,
    () => window.matchMedia(MOTION_QUERY).matches,
    () => true,
  );
}

interface WovenTitleProps {
  children: React.ReactNode;
  /** 行ごとにずらす。次の段を織りはじめる間 */
  delayMs?: number;
  className?: string;
}

export function WovenTitle({ children, delayMs = 0, className = "" }: WovenTitleProps) {
  const reduced = useReducedMotion();
  const [woven, setWoven] = useState(false);

  useEffect(() => {
    if (reduced || woven) return;
    const total = delayMs + 380 + 1180 + 120;
    const timer = window.setTimeout(() => setWoven(true), total);
    return () => window.clearTimeout(timer);
  }, [reduced, woven, delayMs]);

  const phase = reduced ? "static" : woven ? "done" : "ready";

  return (
    <span
      className={`${styles.loom} ${className}`}
      data-woven={phase}
      style={{ "--woven-delay": `${delayMs}ms` } as React.CSSProperties}
    >
      <span className={styles.warp} aria-hidden="true" />
      <span className={styles.weft} aria-hidden="true" />
      <span className={styles.cloth}>{children}</span>
    </span>
  );
}
