"use client";

import { useEffect } from "react";

/**
 * 見出しの行単位マスクリビール。
 *
 * 「紙の下から一行ずつ現れる」動きだけを与える。
 * 1 文字ずつ飛ばす／タイプライター／常時動く文字はしない。
 * 表示後は完全に静止し、可読性を最優先する。
 *
 * 実装方針:
 *  - 対象は `[data-line-reveal]` を持つ見出しだけ。要素ごとに JS を持たせない
 *  - reduce 指定時は observer を張らず、最初から完成状態にする（CSS 任せにしない）
 *  - 一度出たら observer を外す。スクロールのたびに再生しない
 */
export function TypographyReveal() {
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | null = null;

    const targets = () =>
      Array.from(document.querySelectorAll<HTMLElement>("[data-line-reveal]"));

    const showAll = () => {
      for (const el of targets()) el.dataset.lineReveal = "shown";
    };

    const sync = () => {
      observer?.disconnect();
      observer = null;

      if (motionQuery.matches) {
        showAll();
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            (entry.target as HTMLElement).dataset.lineReveal = "shown";
            observer?.unobserve(entry.target);
          }
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.1 },
      );

      for (const el of targets()) {
        if (el.dataset.lineReveal === "shown") continue;
        el.dataset.lineReveal = "waiting";
        observer.observe(el);
      }
    };

    sync();
    motionQuery.addEventListener("change", sync);
    return () => {
      observer?.disconnect();
      motionQuery.removeEventListener("change", sync);
    };
  }, []);

  return null;
}
