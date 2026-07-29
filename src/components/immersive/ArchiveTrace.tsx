"use client";

import { useEffect, useState } from "react";
import styles from "./ArchiveTrace.module.css";

const chapters = [
  { id: "discover", label: "概要" },
  { id: "story", label: "物語" },
  { id: "how-to-play", label: "参加" },
  { id: "route", label: "街歩き" },
  { id: "access", label: "受付" },
  { id: "share", label: "共有" },
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
      <p><span>SECTION</span><strong>{String(activeIndex + 1).padStart(2, "0")}</strong></p>
      <ol>
        {chapters.map((chapter, index) => (
          <li key={chapter.id} className={index === activeIndex ? styles.active : ""}>
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
