"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./SilkVeilTransition.module.css";

/**
 * ページ間を絹布でつなぐ。
 *
 * 内部リンクを押すと、まず薄い絹布が画面を横切って覆い（cover）、
 * その裏で遷移し、着いた先で布がほどけて（unravel）新しい画面が現れる。
 *
 * 守っていること:
 *  - 遷移そのものを遅らせない。布は 520ms で渡りきる
 *  - 布は `pointer-events: none`。操作は一度も奪わない
 *  - 修飾キー・別タブ・外部リンク・ダウンロードは素通しする（ブラウザの挙動を壊さない）
 *  - reduce 指定では布を出さず、通常の遷移だけを行う
 *  - 遷移が失敗しても布は必ず片付く（保険のタイマーを持つ）
 */

const COVER_MS = 560;
const UNRAVEL_MS = 880;

type Phase = "idle" | "cover" | "unravel";

export function SilkVeilTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const pendingRef = useRef<string | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  // 着いた先で布をほどく
  useEffect(() => {
    if (pendingRef.current === null) return;
    if (pendingRef.current === pathname) return;
    pendingRef.current = null;
    setPhase("unravel");
    const id = window.setTimeout(() => setPhase("idle"), UNRAVEL_MS);
    timersRef.current.push(id);
  }, [pathname]);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const onClick = (event: MouseEvent) => {
      if (motionQuery.matches) return;
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;

      // next/link は anchor 自身に click を張る。捕捉フェーズで先に押さえないと
      // Link 側が先に遷移してしまい、布が一度も出ない。
      event.preventDefault();
      event.stopPropagation();
      clearTimers();
      pendingRef.current = window.location.pathname;
      setPhase("cover");

      // 布が渡りきってから遷移する。遷移が遅い場合でも布の裏で待つ
      const go = window.setTimeout(() => {
        router.push(url.pathname + url.search + url.hash);
      }, COVER_MS - 60);
      timersRef.current.push(go);

      // 保険: 遷移が起きなくても布は必ず片付ける
      const rescue = window.setTimeout(() => {
        if (pendingRef.current === null) return;
        pendingRef.current = null;
        setPhase("idle");
      }, 4000);
      timersRef.current.push(rescue);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router, clearTimers]);

  return (
    <div className={styles.veil} data-phase={phase} aria-hidden="true">
      <span className={`${styles.bolt} ${styles.bolt1}`} />
      <span className={`${styles.bolt} ${styles.bolt2}`} />
      <span className={`${styles.bolt} ${styles.bolt3}`} />
    </div>
  );
}
