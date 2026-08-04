"use client";

import { useEffect, useRef, useState } from "react";
import { setWeaveProgress } from "./silkWeaveStore";
import styles from "./SilkPull.module.css";

/**
 * 来場者が絹糸を「手繰る」ヒーローの仕掛け。
 *
 * 画面のヒーローに、繭を握りとして置く。指（またはマウス）で横へ手繰ると、
 * 繭から絹糸が payout され、その手繰り量が silkWeaveStore を通じて
 * そのまま題字（WovenTitle trigger="pull"）の織り量になる。
 *
 * 受け身のスクロールを、能動的な所作に変えるのが狙い。
 *
 * 守っていること:
 *  - 触れなくても題字は数秒で必ず織り上がる（WovenTitle 側の保険）。この仕掛けは
 *    「読めるようにする」ためではなく「触れたら気持ちいい」ための"上乗せ"に徹する
 *  - 握り以外は pointer-events を持たない。本文・CTA・スクロールを一切妨げない
 *  - Pointer Events で統一（マウス・タッチ・ペン共通）。ドラッグ中だけ move を張る
 *  - reduce / coarse でない環境の別扱いはしない。誰でも同じ所作ができる
 *  - reduce 指定では握りを出さない（動きを増やさない。題字は最初から完成）
 */

const PULL_DISTANCE = 168; // これだけ手繰れば「引ききった」

export function SilkPull() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const stateRef = useRef({ dragging: false, startX: 0, pulled: false });

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setVisible(!motionQuery.matches);
    apply();
    motionQuery.addEventListener("change", apply);
    return () => motionQuery.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !visible) return;

    const setProgress = (p: number) => {
      root.style.setProperty("--pull", p.toFixed(3));
      setWeaveProgress(p); // 手繰り量 = 織り量
    };

    const finish = () => {
      if (stateRef.current.pulled) return;
      stateRef.current.pulled = true;
      setProgress(1);
      root.dataset.pulled = "true";
    };

    const onMove = (event: PointerEvent) => {
      if (!stateRef.current.dragging) return;
      const delta = event.clientX - stateRef.current.startX;
      const p = Math.max(0, Math.min(1, delta / PULL_DISTANCE));
      setProgress(p);
      if (p >= 1) {
        stateRef.current.dragging = false;
        finish();
      }
    };

    const onUp = () => {
      if (!stateRef.current.dragging) return;
      stateRef.current.dragging = false;
      // 途中で放したら、引ききっていれば織り、足りなければ静かに戻す
      const current = Number.parseFloat(root.style.getPropertyValue("--pull") || "0");
      if (current >= 0.55) finish();
      else {
        root.dataset.releasing = "true";
        setProgress(0);
        window.setTimeout(() => {
          if (root.dataset) delete root.dataset.releasing;
        }, 420);
      }
    };

    const handle = root.querySelector<HTMLElement>(`.${styles.handle}`);
    const onDown = (event: PointerEvent) => {
      if (stateRef.current.pulled) return;
      stateRef.current.dragging = true;
      stateRef.current.startX = event.clientX;
      handle?.setPointerCapture(event.pointerId);
    };

    handle?.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      handle?.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div ref={rootRef} className={styles.root} data-pulled="false">
      {/* 手繰られて伸びる絹糸。--pull（0..1）で張りと払い出しが変わる */}
      <svg className={styles.svg} viewBox="0 0 220 120" preserveAspectRatio="none" aria-hidden="true">
        <path className={styles.thread} d="M4 96 C 60 96, 90 40, 210 24" pathLength={1} />
        <path className={styles.threadSheen} d="M4 96 C 60 96, 90 40, 210 24" pathLength={1} />
      </svg>

      {/* 握り＝繭。ここだけが操作対象。ラベルで所作を伝える */}
      <button
        type="button"
        className={styles.handle}
        aria-label="絹糸を手繰って物語をひらく"
        onKeyDown={(event) => {
          // キーボードでも所作を成立させる（Enter / Space / →）
          if (event.key === "Enter" || event.key === " " || event.key === "ArrowRight") {
            event.preventDefault();
            rootRef.current?.style.setProperty("--pull", "1");
            if (rootRef.current) rootRef.current.dataset.pulled = "true";
            setWeaveProgress(1);
          }
        }}
      >
        <span className={styles.cocoon} aria-hidden="true" />
        <span className={styles.hint}>手繰る</span>
      </button>
    </div>
  );
}
