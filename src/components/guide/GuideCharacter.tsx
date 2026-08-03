"use client";

import { useEffect, useRef, useState } from "react";
import { SilkwormMascot, type GuideExpression } from "./SilkwormMascot";
import styles from "./GuideCharacter.module.css";

export const GUIDE_STATES = [
  "idle",
  "breathing",
  "blinking",
  "looking-left",
  "looking-right",
  "guiding",
  "thinking",
  "locating",
  "success",
  "soft-warning",
  "resting",
] as const;

export type GuideState = (typeof GUIDE_STATES)[number];

export interface GuideReaction {
  lines: readonly [string, string?];
  expression: GuideExpression;
}

interface GuideCharacterProps {
  lines?: readonly [string, string?];
  expression?: GuideExpression;
  placement?: "map-hero" | "map-stage" | "information";
  initiallyOpen?: boolean;
  /** アプリ状態を姿勢へ集約する。未指定時は既存 expression から互換変換する。 */
  state?: GuideState;
  /** きぬに触れるたびに順に返す短い反応。答えやヒントは含めない。 */
  reactions?: readonly GuideReaction[];
}

const MESSAGE_ID = "kinu-guide-message";

/** 触れるたびに変わる反応。すべて2行以内・句点なし。 */
const DEFAULT_REACTIONS: readonly GuideReaction[] = [
  { lines: ["現在地を表示すると", "近い場所から歩けるよ"], expression: "pointing" },
  { lines: ["絹糸の先に", "街の記憶があるよ"], expression: "thinking" },
  { lines: ["受付はお富ちゃん家", "ここから歩きはじめよう"], expression: "greeting" },
  { lines: ["休める場所も", "地図に入れてあるよ"], expression: "pleased" },
  { lines: ["富岡の街を", "ゆっくり見てみよう"], expression: "discovery" },
];

/** 連打でアニメーションが重ならないための最小間隔 */
const REACTION_INTERVAL_MS = 220;
const BLINK_DURATION_MS = 180;

const stateForExpression: Record<GuideExpression, GuideState> = {
  greeting: "guiding",
  neutral: "breathing",
  pointing: "guiding",
  "map-reading": "thinking",
  discovery: "success",
  thinking: "thinking",
  pleased: "success",
  concerned: "soft-warning",
  caution: "soft-warning",
  loading: "resting",
  clear: "success",
  "looking-left": "looking-left",
  "looking-right": "looking-right",
  walking: "guiding",
};

export function GuideCharacter({
  lines = ["現在地を表示すると", "街歩きの目安になるよ"],
  expression = "map-reading",
  placement = "map-hero",
  initiallyOpen = true,
  state,
  reactions = DEFAULT_REACTIONS,
}: GuideCharacterProps) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [isVisible, setIsVisible] = useState(false);
  // step 0 = 最初の案内。1以降は触れるたびの反応を巡回する。
  const [step, setStep] = useState(0);
  const [reactTick, setReactTick] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const lastTapRef = useRef(0);
  const guideRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // 案内文が状況に応じて差し替わったら、触れて進めた反応を初期位置へ戻す。
  // レンダー中に前回値と比べて調整する（Reactの推奨パターン）。閉じている場合は勝手に開かない。
  const contextLine = lines[0];
  const [prevContextLine, setPrevContextLine] = useState(contextLine);
  if (contextLine !== prevContextLine) {
    setPrevContextLine(contextLine);
    setStep(0);
    setReactTick((tick) => tick + 1);
  }

  const current = step === 0 || reactions.length === 0 ? null : reactions[(step - 1) % reactions.length];
  const shownLines = current ? current.lines : lines;
  const shownExpression = current ? current.expression : expression;
  const requestedState = state ?? stateForExpression[shownExpression];
  const ambientState = requestedState === "idle" ? "breathing" : requestedState;
  const shownState: GuideState = !isVisible
    ? "resting"
    : isBlinking && ambientState === "breathing"
      ? "blinking"
      : ambientState;

  useEffect(() => {
    const guide = guideRef.current;
    if (!guide) return;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let intersecting = false;

    const updateVisible = () => {
      setIsVisible(!motionQuery.matches && !document.hidden && intersecting);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        intersecting = Boolean(entry?.isIntersecting);
        updateVisible();
      },
      { rootMargin: "8% 0px", threshold: 0.01 },
    );
    observer.observe(guide);
    motionQuery.addEventListener("change", updateVisible);
    document.addEventListener("visibilitychange", updateVisible);
    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", updateVisible);
      document.removeEventListener("visibilitychange", updateVisible);
    };
  }, []);

  /**
   * きぬは常時動かない。
   *
   * 旧実装は 3.5〜8 秒ごとに無条件で瞬きし続けていた（＝常時ループ）。
   * 案内役が理由もなく動き続けると、読者の視線がそこへ持っていかれ、
   * 本文とキャラクターが競合する。
   *
   * 今は「意味のある瞬間」にだけ一度反応する:
   *   - このセクションへ初めて入ってきたとき（一度だけ視線を動かす）
   *   - 触れられたとき（reactToGuide 側）
   *   - しばらく操作が無いとき（一度だけ。繰り返さない）
   */
  useEffect(() => {
    if (!isVisible) return;

    let disposed = false;
    const timers: number[] = [];

    const blinkOnce = () => {
      if (disposed || document.hidden) return;
      setIsBlinking(true);
      timers.push(
        window.setTimeout(() => {
          if (!disposed) setIsBlinking(false);
        }, BLINK_DURATION_MS),
      );
    };

    // 1. 画面に入ってきた合図として、一度だけ
    timers.push(window.setTimeout(blinkOnce, 620));

    // 2. しばらく操作が無ければ、一度だけ「まだここにいる」を返す。
    //    操作があるたびに数え直し、繰り返し反応はしない。
    let idleTimer = 0;
    let idleUsed = false;
    const restartIdle = () => {
      window.clearTimeout(idleTimer);
      if (idleUsed || disposed) return;
      idleTimer = window.setTimeout(() => {
        idleUsed = true;
        blinkOnce();
      }, 18000);
    };
    const activity = ["scroll", "pointerdown", "keydown"] as const;
    for (const type of activity) {
      window.addEventListener(type, restartIdle, { passive: true });
    }
    restartIdle();

    return () => {
      disposed = true;
      for (const id of timers) window.clearTimeout(id);
      window.clearTimeout(idleTimer);
      for (const type of activity) window.removeEventListener(type, restartIdle);
    };
  }, [isVisible]);

  function closeGuide() {
    setIsOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  /**
   * きぬに触れたとき。閉じていれば開き、開いていれば次の反応へ進む。
   * 連打時は最小間隔で間引くため、アニメーションが重なったりキューが溜まったりしない。
   */
  function tapGuide() {
    const now = Date.now();
    if (now - lastTapRef.current < REACTION_INTERVAL_MS) return;
    lastTapRef.current = now;

    setReactTick((tick) => tick + 1);
    if (!isOpen) {
      setIsOpen(true);
      return;
    }
    if (reactions.length > 0) setStep((value) => value + 1);
  }

  return (
    <aside
      ref={guideRef}
      className={styles.guide}
      data-placement={placement}
      data-active={isVisible}
      data-guide-state={shownState}
      aria-label="きぬの街歩き案内"
    >
      {isOpen && (
        <section id={MESSAGE_ID} className={styles.bubble} role="status">
          <div className={styles.label}>きぬ — 街歩き案内</div>
          <p>
            <span>{shownLines[0]}</span>
            {shownLines[1] && <span>{shownLines[1]}</span>}
          </p>
          <button type="button" className={styles.closeButton} onClick={closeGuide} aria-label="きぬの案内を閉じる">
            <span aria-hidden="true">×</span>
          </button>
        </section>
      )}
      <button
        ref={triggerRef}
        className={styles.characterButton}
        type="button"
        onClick={tapGuide}
        aria-expanded={isOpen}
        aria-controls={isOpen ? MESSAGE_ID : undefined}
        aria-label={isOpen ? "きぬにふれて次の案内を見る" : "きぬの案内を開く"}
      >
        <span
          className={styles.characterFrame}
          data-react={reactTick === 0 ? undefined : reactTick % 2}
          aria-hidden="true"
        >
          <SilkwormMascot expression={shownExpression} />
        </span>
        <span className={styles.callout} aria-hidden="true">{isOpen ? "案内中" : "きぬ"}</span>
      </button>
    </aside>
  );
}
