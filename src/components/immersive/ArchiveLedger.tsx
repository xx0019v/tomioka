"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  getProgressServerSnapshot,
  getProgressSnapshot,
  subscribeProgress,
} from "@/lib/progress";
import styles from "./ArchiveLedger.module.css";

interface ArchiveRecord {
  id: string;
  slug: string;
  shortName: string;
  name: string;
  tags: string[];
}

const recordMarks = ["A", "B", "C", "D"] as const;

export function ArchiveLedger({ records }: { records: ArchiveRecord[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const snapshot = useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    getProgressServerSnapshot,
  );
  const completed = useMemo(() => {
    try {
      const parsed = JSON.parse(snapshot) as { completed?: string[] };
      return Array.isArray(parsed.completed) ? parsed.completed : [];
    } catch {
      return [];
    }
  }, [snapshot]);

  const active = records[activeIndex];
  if (!active) return null;

  const activeDiscovered = completed.includes(active.id);
  const completedCount = records.filter((record) => completed.includes(record.id)).length;

  return (
    <section className={styles.ledger} aria-labelledby="archive-ledger-heading">
      <div className={styles.binding} aria-hidden="true">
        <span style={{ "--active-record": activeIndex } as React.CSSProperties} />
      </div>

      <header className={styles.header}>
        <div>
          <p>調査台帳・四記録</p>
          <h3 id="archive-ledger-heading">未発見の記録を選ぶ</h3>
        </div>
        <p className={styles.count} aria-label={`${completedCount}件記録済み、全4件`}>
          <strong>{String(completedCount).padStart(2, "0")}</strong>
          <span>/ 04</span>
        </p>
      </header>

      <ol className={styles.tabs} aria-label="4つの調査記録">
        {records.map((record, index) => {
          const discovered = completed.includes(record.id);
          const selected = index === activeIndex;
          return (
            <li key={record.id}>
              <button
                type="button"
                className={selected ? styles.selected : ""}
                onClick={() => setActiveIndex(index)}
                aria-pressed={selected}
                aria-controls="archive-ledger-detail"
              >
                <span>{recordMarks[index] ?? String(index + 1)}</span>
                <small>{discovered ? "採録済み" : "未採録"}</small>
              </button>
            </li>
          );
        })}
      </ol>

      <article id="archive-ledger-detail" className={styles.detail} aria-live="polite">
        <div className={styles.recordMeta}>
          <span>記録 {recordMarks[activeIndex] ?? activeIndex + 1}</span>
          <strong data-discovered={activeDiscovered}>{activeDiscovered ? "採録済み" : "現地確認待ち"}</strong>
        </div>
        <div className={styles.detailCopy}>
          <p className={styles.locationCode}>{active.shortName} / TOMIOKA FIELD NOTE</p>
          <h4>{active.name}</h4>
          <p>
            {activeDiscovered
              ? "この地点の調査記録は保存されています。記録票から内容を確認できます。"
              : "現地の景色と配布キットを照合すると、この記録の内容が開きます。"}
          </p>
          <ul aria-label="地点の特徴">
            {active.tags.slice(0, 2).map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
        </div>
        <Link href={`/checkpoints/${active.slug}/`}>
          {activeDiscovered ? "記録票を開く" : "地点の手掛かりを見る"}
          <span aria-hidden="true">↗</span>
        </Link>
      </article>
    </section>
  );
}
