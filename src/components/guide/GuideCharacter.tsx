"use client";

import { useEffect, useRef, useState } from "react";
import { SilkwormMascot, type GuideExpression } from "./SilkwormMascot";
import styles from "./GuideCharacter.module.css";

interface GuideCharacterProps {
  lines?: readonly [string, string?];
  expression?: GuideExpression;
  placement?: "map-hero" | "information";
  initiallyOpen?: boolean;
}

const MESSAGE_ID = "kinu-guide-message";

export function GuideCharacter({
  lines = ["現在地を表示すると", "街歩きの目安になるよ"],
  expression = "map-reading",
  placement = "map-hero",
  initiallyOpen = true,
}: GuideCharacterProps) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [isVisible, setIsVisible] = useState(false);
  const guideRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

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

  function closeGuide() {
    setIsOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <aside
      ref={guideRef}
      className={styles.guide}
      data-placement={placement}
      data-active={isVisible}
      aria-label="きぬの街歩き案内"
    >
      {isOpen && (
        <section id={MESSAGE_ID} className={styles.bubble} role="status">
          <div className={styles.label}>KINU / 街歩き案内</div>
          <p>
            <span>{lines[0]}</span>
            {lines[1] && <span>{lines[1]}</span>}
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
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls={isOpen ? MESSAGE_ID : undefined}
        aria-label={isOpen ? "きぬの案内を閉じる" : "きぬの案内を開く"}
      >
        <span className={styles.characterFrame} aria-hidden="true">
          <SilkwormMascot expression={expression} />
        </span>
        <span className={styles.callout} aria-hidden="true">{isOpen ? "案内中" : "きぬ"}</span>
      </button>
    </aside>
  );
}
