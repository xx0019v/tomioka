"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./ArchivePrelude.module.css";

const STORAGE_KEY = "mayu-no-chizu-archive-prelude-v1";
const COMPLETE_EVENT = "mayu-archive-prelude-complete";
const OPENING_DURATION_MS = 360;

type PreludeState = "checking" | "sealed" | "opening" | "opened" | "skipped" | "returning";
type CompletionReason = "opened" | "skipped" | "returning";

interface ArchivePreludeProps {
  onComplete?: (reason: CompletionReason) => void;
}

let completedInMemory = false;

function rememberCompletion(): void {
  completedInMemory = true;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, "complete");
  } catch {
    // Storage can be unavailable in privacy modes. The experience must still continue.
  }
}

function notifyCompletion(): void {
  window.dispatchEvent(new Event(COMPLETE_EVENT));
}

function wasCompleted(): boolean {
  if (completedInMemory) return true;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "complete";
  } catch {
    return false;
  }
}

export function ArchivePrelude({ onComplete }: ArchivePreludeProps) {
  const headingId = useId();
  const [state, setState] = useState<PreludeState>("sealed");
  const statusRef = useRef<HTMLParagraphElement>(null);
  const timerRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const syncTimer = window.setTimeout(() => {
      if (wasCompleted()) {
        setState("returning");
        onCompleteRef.current?.("returning");
        return;
      }
    }, 0);
    return () => window.clearTimeout(syncTimer);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (state !== "opened" && state !== "skipped") return;
    window.requestAnimationFrame(() => statusRef.current?.focus());
  }, [state]);

  function openRecord() {
    if (state !== "sealed") return;
    rememberCompletion();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setState("opened");
      notifyCompletion();
      onCompleteRef.current?.("opened");
      return;
    }

    setState("opening");
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setState("opened");
      notifyCompletion();
      onCompleteRef.current?.("opened");
    }, OPENING_DURATION_MS);
  }

  function skipPrelude() {
    if (state !== "sealed") return;
    rememberCompletion();
    setState("skipped");
    notifyCompletion();
    onCompleteRef.current?.("skipped");
  }

  if (state === "checking" || state === "returning") return null;

  if (state === "opened" || state === "skipped") {
    return (
      <div className={styles.completed} role="status">
        <span className={styles.completedMark} aria-hidden="true">記</span>
        <p ref={statusRef} tabIndex={-1}>
          <strong>{state === "opened" ? "研究記録を開きました。" : "開封演出を省略しました。"}</strong>
          <span>このまま調査を開始できます。</span>
        </p>
      </div>
    );
  }

  const opening = state === "opening";

  return (
    <aside
      className={`${styles.prelude} ${opening ? styles.opening : ""}`}
      aria-labelledby={headingId}
      aria-busy={opening}
    >
      <div className={styles.archiveNumber} aria-hidden="true">
        <span>調査記録</span>
        <strong>記録票</strong>
      </div>

      <div className={styles.copy}>
        <p className={styles.overline}>富岡・街路調査資料</p>
        <h2 id={headingId}>封じられた記録を開く</h2>
        <p>絹糸が示す地点をたどり、街に残された四つの言葉を集めてください。</p>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.openButton} onClick={openRecord} disabled={opening}>
          <span>{opening ? "記録を開いています…" : "記録を開く"}</span>
          <span aria-hidden="true">→</span>
        </button>
        <button type="button" className={styles.skipButton} onClick={skipPrelude} disabled={opening}>
          演出を省略
        </button>
      </div>

      <span className={styles.thread} aria-hidden="true" />
      <span className={styles.seal} aria-hidden="true">繭</span>
    </aside>
  );
}
