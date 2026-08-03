"use client";

import { useEffect, useState } from "react";
import styles from "./ArchiveTrace.module.css";

/** primary: スマートフォンの下部ナビゲーションに残す項目 */
const chapters = [
  { id: "discover", label: "概要", primary: true },
  { id: "story", label: "物語", primary: true },
  { id: "how-to-play", label: "参加", primary: true },
  { id: "route", label: "街歩き", primary: true },
  { id: "access", label: "受付", primary: true },
  { id: "share", label: "共有", primary: false },
] as const;

export function ArchiveTrace() {
  const [activeId, setActiveId] = useState<string>(chapters[0].id);

  useEffect(() => {
    const sections = chapters
      .map((chapter) => document.getElementById(chapter.id))
      .filter((section): section is HTMLElement => Boolean(section));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveId(visible.target.id);
      },
      { rootMargin: "-18% 0px -62%", threshold: [0, 0.12, 0.36] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const activeIndex = Math.max(0, chapters.findIndex((chapter) => chapter.id === activeId));

  return (
    <nav className={styles.trace} aria-label="ページ内ナビゲーション">
      <p><span>頁</span><strong>{["壱", "弐", "参", "肆", "伍", "陸", "漆", "捌"][activeIndex] ?? String(activeIndex + 1)}</strong></p>
      <ol>
        {chapters.map((chapter, index) => (
          <li
            key={chapter.id}
            className={index === activeIndex ? styles.active : ""}
            data-primary={chapter.primary ? "true" : "false"}
          >
            <a
              href={`#${chapter.id}`}
              aria-label={`${chapter.label}へ移動`}
              aria-current={chapter.id === activeId ? "location" : undefined}
            >
              <span aria-hidden="true" />
              <span>{chapter.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
