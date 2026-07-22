"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getProgressServerSnapshot,
  getProgressSnapshot,
  subscribeProgress,
} from "@/lib/progress";
import styles from "./GameProgressSummary.module.css";

const checkpointIds = ["cp1", "annex", "cp3", "cp4"];

export function GameProgressSummary() {
  const snapshot = useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    getProgressServerSnapshot,
  );
  const completed = useMemo(() => {
    if (!snapshot) return [] as string[];
    try {
      const parsed = JSON.parse(snapshot) as { completed?: string[] };
      return Array.isArray(parsed.completed) ? parsed.completed : [];
    } catch {
      return [] as string[];
    }
  }, [snapshot]);

  const count = checkpointIds.filter((id) => completed.includes(id)).length;

  return (
    <div className={styles.progress} aria-label={`進捗 ${count}件完了、全4件`}>
      <span>調査進捗</span>
      <strong>{count} / 4</strong>
      <div className={styles.marks} aria-hidden="true">
        {checkpointIds.map((id) => (
          <i key={id} className={completed.includes(id) ? styles.done : ""} />
        ))}
      </div>
    </div>
  );
}
