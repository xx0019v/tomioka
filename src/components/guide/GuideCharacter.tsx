"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import {
  getGuideLine,
  guideCharacter,
  type GuideExpression,
  type GuideFrequency,
  type GuideMoment,
} from "@/data/guide-character";
import { checkpoints } from "@/data/checkpoints";
import { finalPuzzle, getPuzzleByCheckpointId } from "@/data/puzzles";
import {
  getProgressServerSnapshot,
  getProgressSnapshot,
  subscribeProgress,
} from "@/lib/progress";
import { withBasePath } from "@/lib/base-path";
import styles from "./GuideCharacter.module.css";

const SESSION_KEY = "mayu-no-chizu-guide-session-v1";
const ARCHIVE_STORAGE_KEY = "mayu-no-chizu-archive-prelude-v1";
const ARCHIVE_COMPLETE_EVENT = "mayu-archive-prelude-complete";
const TOTAL_RECORDS = 4;
const MESSAGE_ID = "guide-character-message";

interface StoredSession {
  shown: string[];
}

interface ManualMessage {
  moment: GuideMoment;
  pathname: string;
}

interface GuideCharacterProps {
  placement?: "global" | "map-hero" | "archive-inline";
}

function readFrequency(): GuideFrequency {
  if (typeof window === "undefined") return guideCharacter.frequency.default;
  try {
    const value = window.localStorage.getItem(guideCharacter.frequency.storageKey);
    if (value === "standard" || value === "reduced" || value === "manual") return value;
  } catch {
    // Storage may be unavailable in private or restricted browsing contexts.
  }
  return guideCharacter.frequency.default;
}

function readSession(): StoredSession {
  if (typeof window === "undefined") return { shown: [] };
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) ?? "null") as StoredSession | null;
    if (stored && Array.isArray(stored.shown)) return stored;
  } catch {
    // Keep the guide usable in memory when sessionStorage is unavailable.
  }
  return { shown: [] };
}

function rememberShown(keys: string[]) {
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ shown: keys }));
  } catch {
    // A repeated message is less harmful than breaking the primary experience.
  }
}

function parseCompleted(snapshot: string): string[] {
  if (!snapshot) return [];
  try {
    const parsed = JSON.parse(snapshot) as { completed?: string[] };
    return Array.isArray(parsed.completed) ? parsed.completed : [];
  } catch {
    return [];
  }
}

function readArchiveReady() {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(ARCHIVE_STORAGE_KEY) === "complete";
  } catch {
    return false;
  }
}

function prefersStaticGuide() {
  if (typeof navigator === "undefined") return false;
  const connection = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  }).connection;
  return Boolean(
    connection?.saveData || connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g",
  );
}

function getRouteMoment(pathname: string, completed: string[]): GuideMoment {
  if (pathname.includes("/map")) return "map-introduction";
  if (pathname.includes("/game")) {
    return completed.length > 0 ? "return-visit" : "exploration-start";
  }
  if (pathname.includes("/checkpoints/")) return "checkpoint-selected";
  if (pathname.includes("/final")) {
    return completed.length >= TOTAL_RECORDS ? "all-records-collected" : "return-visit";
  }
  return completed.length > 0 ? "return-visit" : "first-visit";
}

function getContextMoment(pathname: string, completed: string[]): GuideMoment {
  if (completed.length >= TOTAL_RECORDS) return "all-records-collected";
  const checkpoint = getCheckpointName(pathname);
  const slug = pathname.match(/\/checkpoints\/([^/]+)/)?.[1];
  const checkpointId = checkpoints.find((item) => item.slug === slug)?.id;
  if (checkpoint && checkpointId && completed.includes(checkpointId)) return "checkpoint-discovered";
  if (checkpointId) {
    const puzzle = getPuzzleByCheckpointId(checkpointId);
    if (!puzzle?.problemTitle || !puzzle.problemBody || puzzle.answerHashes.length === 0) {
      return "information-pending";
    }
  }
  if (pathname.includes("/final") && (!finalPuzzle.title || finalPuzzle.answerHashes.length === 0)) {
    return "information-pending";
  }
  return getRouteMoment(pathname, completed);
}

function getCheckpointName(pathname: string): string | null {
  const slug = pathname.match(/\/checkpoints\/([^/]+)/)?.[1];
  if (!slug) return null;
  return checkpoints.find((checkpoint) => checkpoint.slug === slug)?.name ?? null;
}

function formatLine(text: string, pathname: string, completed: string[]) {
  const completedCount = Math.min(TOTAL_RECORDS, completed.length);
  return text
    .replace("{checkpointName}", getCheckpointName(pathname) ?? "この地点")
    .replace("{completedCount}", String(completedCount))
    .replace("{remainingCount}", String(Math.max(0, TOTAL_RECORDS - completedCount)));
}

function getGuideImage(expression: GuideExpression) {
  if (["discovery", "pleased", "clear"].includes(expression)) {
    return "/images/guide/kinu-guide-discovery.png";
  }
  if (["thinking", "map-reading", "concerned", "caution", "loading"].includes(expression)) {
    return "/images/guide/kinu-guide-thinking.png";
  }
  return "/images/guide/kinu-guide.png";
}

export function GuideCharacter({ placement = "global" }: GuideCharacterProps) {
  const pathname = usePathname();
  const progressSnapshot = useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    getProgressServerSnapshot,
  );
  const completed = useMemo(() => parseCompleted(progressSnapshot), [progressSnapshot]);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [frequency, setFrequency] = useState<GuideFrequency>(readFrequency);
  const [hiddenKeys, setHiddenKeys] = useState<string[]>(() => readSession().shown);
  const [manualMessage, setManualMessage] = useState<ManualMessage | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [archiveReady, setArchiveReady] = useState(readArchiveReady);
  const [staticGuide] = useState(prefersStaticGuide);
  const characterButtonRef = useRef<HTMLButtonElement>(null);
  const guideRef = useRef<HTMLElement>(null);
  const contextualMoment = getContextMoment(pathname, completed);
  const activeManualMessage = manualMessage?.pathname === pathname ? manualMessage : null;
  const moment = activeManualMessage?.moment ?? contextualMoment;

  const line = getGuideLine(moment);
  const message = formatLine(line.text, pathname, completed);
  const guideImageSrc = staticGuide
    ? "/images/guide/kinu-guide.png"
    : getGuideImage(line.expression);
  const expressionClass = styles[`expression-${line.expression}`] ?? "";
  const messageKey = `${line.dismissKey}:${getCheckpointName(pathname) ?? "global"}:${completed.length}`;
  const canAutoOpen = [
    "map-introduction",
    "checkpoint-discovered",
    "progress-updated",
    "all-records-collected",
    "recoverable-error",
    "blocking-error",
    "clear-confirmed",
  ].includes(contextualMoment);
  const isOpen = activeManualMessage !== null || (
    canAutoOpen && frequency === "standard" && !hiddenKeys.includes(messageKey)
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || !isOpen) return;
      if (!guideRef.current?.contains(document.activeElement)) return;
      setManualMessage(null);
      setHiddenKeys((current) => {
        const nextKeys = Array.from(new Set([...current, messageKey]));
        rememberShown(nextKeys);
        return nextKeys;
      });
      window.requestAnimationFrame(() => characterButtonRef.current?.focus());
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, messageKey]);

  useEffect(() => {
    function handleArchiveComplete() {
      setArchiveReady(true);
      setManualMessage({ moment: "first-visit", pathname: "/" });
    }
    window.addEventListener(ARCHIVE_COMPLETE_EVENT, handleArchiveComplete);
    return () => window.removeEventListener(ARCHIVE_COMPLETE_EVENT, handleArchiveComplete);
  }, []);

  function saveFrequency(next: GuideFrequency) {
    setFrequency(next);
    try {
      window.localStorage.setItem(guideCharacter.frequency.storageKey, next);
    } catch {
      // The control still works for the current view when persistence is unavailable.
    }
  }

  function reduceGuidance() {
    saveFrequency("manual");
    setManualMessage(null);
    const nextKeys = Array.from(new Set([...hiddenKeys, messageKey]));
    setHiddenKeys(nextKeys);
    rememberShown(nextKeys);
  }

  function restoreGuidance() {
    saveFrequency("standard");
  }

  function openGuide() {
    setManualMessage({ moment: contextualMoment, pathname });
  }

  function closeGuide() {
    setManualMessage(null);
    const nextKeys = Array.from(new Set([...hiddenKeys, messageKey]));
    setHiddenKeys(nextKeys);
    rememberShown(nextKeys);
    window.requestAnimationFrame(() => characterButtonRef.current?.focus());
  }

  if (!mounted || (pathname === "/" && !archiveReady)) return null;
  if (pathname === "/" && placement === "global") return null;
  if (pathname.includes("/map") && placement === "global") return null;

  return (
    <aside
      ref={guideRef}
      className={`${styles.guide} ${expressionClass}`}
      data-guide-frequency={frequency}
      data-static={staticGuide ? "true" : "false"}
      data-placement={placement}
      data-guide-route={pathname.includes("/map") ? "map" : pathname.includes("/checkpoints/") ? "checkpoint" : "default"}
      aria-label={guideCharacter.accessibility.bubbleLabel}
    >
      {isOpen && (
        <section
          id={MESSAGE_ID}
          className={styles.bubble}
          role={line.priority === "off" ? undefined : line.priority === "assertive" ? "alert" : "status"}
          aria-live={line.priority === "off" ? undefined : line.priority}
          aria-atomic="true"
        >
          <div className={styles.bubbleHeader}>
            <p>
              <span>FIELD GUIDE</span>
              {guideCharacter.workingName ?? guideCharacter.roleLabel}
            </p>
            <button
              className={styles.closeButton}
              type="button"
              onClick={closeGuide}
              aria-label={guideCharacter.controls.closeLabel}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <p className={styles.message}>{message}</p>
          <div className={styles.bubbleFooter}>
            <span>{String(Math.min(TOTAL_RECORDS, completed.length)).padStart(2, "0")} / 04</span>
            <div className={styles.bubbleActions}>
              <button type="button" onClick={closeGuide}>
                {guideCharacter.controls.laterLabel}
              </button>
              <button
                type="button"
                onClick={frequency === "manual" ? restoreGuidance : reduceGuidance}
              >
                {frequency === "manual"
                  ? guideCharacter.controls.restoreLabel
                  : guideCharacter.controls.reduceLabel}
              </button>
            </div>
          </div>
        </section>
      )}

      <button
        ref={characterButtonRef}
        className={styles.characterButton}
        type="button"
        onClick={isOpen ? closeGuide : openGuide}
        aria-expanded={isOpen}
        aria-controls={isOpen ? MESSAGE_ID : undefined}
        aria-label={isOpen ? guideCharacter.controls.closeLabel : guideCharacter.controls.manualLabel}
      >
        <span className={styles.thread} aria-hidden="true" />
        <span className={styles.characterFrame} aria-hidden="true">
          {imageFailed ? (
            <span className={styles.fallbackMark} />
          ) : (
            <Image
              src={withBasePath(guideImageSrc)}
              alt=""
              width="320"
              height="320"
              draggable="false"
              loading="eager"
              onError={() => setImageFailed(true)}
            />
          )}
        </span>
        <span className={styles.callout} aria-hidden="true">
          {isOpen ? "記録中" : "案内"}
        </span>
      </button>
    </aside>
  );
}
