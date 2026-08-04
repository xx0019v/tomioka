"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getWeaveProgress, subscribeWeave } from "./silkWeaveStore";
import styles from "./WovenTitle.module.css";

/**
 * 題字を「織り上げる」。ファーストビューで一度だけ。
 *
 * 文字は分解しない。1 つのテキストノードのまま、縦糸を張り → 横糸を左から通し →
 * 通った範囲の布（＝文字）が現れる。織りは `--weave`（0..1）で clip される。
 *
 *  - trigger="auto": マウント後に自分で --weave を 0→1 へ動かす（既定）
 *  - trigger="pull": 来場者の手繰り（silkWeaveStore の進行）が、そのまま織りになる。
 *      触れられなくても短い保険で必ず織り上がる（題字が読めない時間を作らない）。
 *
 * 一度織り終えたら二度と戻さない。
 */

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToMotion(onChange: () => void) {
  const query = window.matchMedia(MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeToMotion,
    () => window.matchMedia(MOTION_QUERY).matches,
    () => true,
  );
}

function usePullProgress() {
  return useSyncExternalStore(subscribeWeave, getWeaveProgress, () => 0);
}

interface WovenTitleProps {
  children: React.ReactNode;
  /** 行ごとにずらす。次の段を織りはじめる間 */
  delayMs?: number;
  className?: string;
  trigger?: "auto" | "pull";
}

export function WovenTitle({
  children,
  delayMs = 0,
  className = "",
  trigger = "auto",
}: WovenTitleProps) {
  const reduced = useReducedMotion();
  const pull = usePullProgress();
  const clothRef = useRef<HTMLSpanElement>(null);
  // 保険タイマーで一度立てたら戻さない（触れられなくても必ず織り上がる）
  const [fallbackDone, setFallbackDone] = useState(false);

  useEffect(() => {
    if (reduced || fallbackDone) return;
    const fallback = trigger === "pull" ? 1600 : delayMs + 380;
    const timer = window.setTimeout(() => setFallbackDone(true), fallback);
    return () => window.clearTimeout(timer);
  }, [reduced, fallbackDone, trigger, delayMs]);

  // 織り上がりきったか（派生状態）。reduce / 保険 / 手繰りきり のいずれか
  const locked = reduced || fallbackDone || pull >= 1;

  // 実際の織り量。ロック後は 1、pull 中は手繰り量、auto は下の CSS 遷移に任せる
  const weave = reduced || locked ? 1 : trigger === "pull" ? pull : 0;
  const phase = reduced ? "static" : locked ? "done" : trigger === "pull" ? "pull" : "ready";

  return (
    <span
      className={`${styles.loom} ${className}`}
      data-woven={phase}
      style={
        {
          "--woven-delay": `${delayMs}ms`,
          "--weave": weave,
        } as React.CSSProperties
      }
    >
      <span className={styles.warp} aria-hidden="true" />
      <span className={styles.weft} aria-hidden="true" />
      <span ref={clothRef} className={styles.cloth}>
        {children}
      </span>
    </span>
  );
}
