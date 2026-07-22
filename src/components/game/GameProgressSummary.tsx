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
  const progress = useMemo(() => {
    if (!snapshot) return { completed: [] as string[], persistence: "device" as const };
    try {
      const parsed = JSON.parse(snapshot) as { completed?: string[]; persistence?: "device" | "memory" };
      return {
        completed: Array.isArray(parsed.completed) ? parsed.completed : [],
        persistence: parsed.persistence ?? "device",
      };
    } catch {
      return { completed: [] as string[], persistence: "device" as const };
    }
  }, [snapshot]);

  const completed = progress.completed;

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
      {progress.persistence === "memory" && (
        <small className={styles.storageWarning}>端末へ保存できません。配布キットにも進捗を記録してください。</small>
      )}
    </div>
  );
}
