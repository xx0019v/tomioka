"use client";

import { useEffect } from "react";

/**
 * 絹糸が項目を順に結んでいく。
 *
 * 参加方法（壱・弐・参）と、駅から入口までの道順で共通に使う。
 * 読み進めた項目に `data-reached="true"` が付き、
 * いま読んでいる項目に `data-current="true"` が付く。
 * 見た目は各セクションの CSS が決める（ここでは状態だけを配る）。
 *
 * 守っていること:
 *  - 一度到達した項目は戻さない。上下に揺らすと「読んだ／まだ」が分からなくなる
 *  - rAF もタイマーも持たない。IntersectionObserver だけ
 *  - reduce では観測せず、最初からすべて到達済みにする（情報を隠さない）
 *  - 文章そのものは常に読める。アニメーションで本文を隠さない
 */
interface ThreadProgressProps {
  /** 対象リストの CSS セレクタ（この配下の直下要素を順番に見る） */
  selector: string;
}

export function ThreadProgress({ selector }: ThreadProgressProps) {
  useEffect(() => {
    const list = document.querySelector(selector);
    if (!list) return;

    const items = Array.from(list.children).filter(
      (node): node is HTMLElement => node instanceof HTMLElement,
    );
    if (items.length === 0) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | null = null;
    let detachScroll: (() => void) | null = null;

    const markAll = () => {
      for (const item of items) {
        item.dataset.reached = "true";
        delete item.dataset.current;
      }
    };

    const sync = () => {
      observer?.disconnect();
      observer = null;
      detachScroll?.();
      detachScroll = null;

      if (motionQuery.matches) {
        markAll();
        return;
      }

      for (const item of items) {
        if (item.dataset.reached !== "true") item.dataset.reached = "false";
      }

      // いま画面の中央にいちばん近い項目だけを「読んでいる」とみなす。
      // IntersectionObserver は交差の瞬間しか呼ばれないため、
      // スクロール中の追従にはスクロール側の合図が要る。
      const updateCurrent = () => {
        const middle = window.innerHeight / 2;
        let closest: HTMLElement | null = null;
        let best = Infinity;
        for (const item of items) {
          const rect = item.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
          const distance = Math.abs(rect.top + rect.height / 2 - middle);
          if (distance < best) {
            best = distance;
            closest = item;
          }
        }
        for (const item of items) {
          if (item === closest) item.dataset.current = "true";
          else delete item.dataset.current;
        }
      };

      // スクロール 1 回につき rAF 1 回だけ。止まれば何も回らない
      let pending = false;
      const onScroll = () => {
        if (pending) return;
        pending = true;
        requestAnimationFrame(() => {
          pending = false;
          updateCurrent();
        });
      };

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            // 到達は一方通行。戻すと「読んだ／まだ」が読み取れなくなる
            (entry.target as HTMLElement).dataset.reached = "true";
          }
          updateCurrent();
        },
        { rootMargin: "-18% 0px -28% 0px", threshold: [0, 0.4, 1] },
      );
      for (const item of items) observer.observe(item);

      window.addEventListener("scroll", onScroll, { passive: true });
      detachScroll = () => window.removeEventListener("scroll", onScroll);
      updateCurrent();
    };

    sync();
    motionQuery.addEventListener("change", sync);
    return () => {
      observer?.disconnect();
      detachScroll?.();
      motionQuery.removeEventListener("change", sync);
    };
  }, [selector]);

  return null;
}
