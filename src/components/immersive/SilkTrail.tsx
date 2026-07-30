"use client";

import { useEffect, useRef } from "react";
import styles from "./SilkTrail.module.css";

/**
 * 絹糸の導線。
 *
 * ページ全体を一本の糸で縫い、スクロール量に応じて糸が伸びる。
 * 糸の先端には繭が付き、いま読んでいる位置を示す。
 *
 * 設計上の制約:
 *  - 常時 rAF ループは持たない。スクロールとリサイズのときだけ 1 フレーム描き直す。
 *  - 更新するのは stroke-dashoffset と transform だけ（レイアウトを起こさない）。
 *  - 画面に無いとき・タブが非表示のときは更新しない。
 *  - prefers-reduced-motion では糸を最初から引ききった状態で静止させる（情報を失わない）。
 *  - pointer-events: none。操作を一切奪わない。
 */
export function SilkTrail() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const beadRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    const bead = beadRef.current;
    if (!path) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;

    let frame = 0;
    let active = true;

    const drawStatic = () => {
      // 動きを止める場合でも糸は「引かれた状態」で見せる
      path.style.strokeDashoffset = "0";
      if (bead) bead.style.opacity = "0";
    };

    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;

      path.style.strokeDashoffset = `${length * (1 - progress)}`;

      if (bead) {
        const point = path.getPointAtLength(length * progress);
        bead.style.transform = `translate(${point.x}px, ${point.y}px)`;
        bead.style.opacity = progress > 0.01 ? "1" : "0";
      }
    };

    const request = () => {
      if (!active || frame) return;
      frame = window.requestAnimationFrame(update);
    };

    const applyMotionPreference = () => {
      if (reduce.matches) {
        active = false;
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        drawStatic();
        return;
      }
      active = true;
      request();
    };

    // この糸は position: fixed の常時オーバーレイなので、画面外判定は不要。
    // 意味のある停止条件はタブの非表示だけ。
    const onVisibility = () => {
      if (reduce.matches) return;
      active = !document.hidden;
      if (active) request();
    };

    applyMotionPreference();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    reduce.addEventListener("change", applyMotionPreference);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      document.removeEventListener("visibilitychange", onVisibility);
      reduce.removeEventListener("change", applyMotionPreference);
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.trail} aria-hidden="true">
      <svg viewBox="0 0 40 1000" preserveAspectRatio="none" focusable="false">
        {/* 下地。糸が通る道筋をごく淡く示す */}
        <path
          className={styles.guide}
          d="M20 0 C 6 120, 34 240, 20 360 S 6 600, 20 720 S 34 880, 20 1000"
        />
        {/* 実際に伸びる絹糸 */}
        <path
          ref={pathRef}
          className={styles.thread}
          d="M20 0 C 6 120, 34 240, 20 360 S 6 600, 20 720 S 34 880, 20 1000"
        />
        {/* 糸の先端の繭 */}
        <g ref={beadRef} className={styles.bead}>
          <ellipse rx="3.4" ry="5" />
        </g>
      </svg>
    </div>
  );
}
