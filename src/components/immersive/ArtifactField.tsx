"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { withBasePath } from "@/lib/base-path";
import styles from "./ArtifactField.module.css";

export type ArtifactFieldVariant =
  | "hero"
  | "discover"
  | "story"
  | "howto"
  | "route"
  | "access"
  | "share"
  | "map"
  | "information";

type ArtifactFocus =
  | "mulberry"
  | "bobbin"
  | "brick"
  | "archive"
  | "root"
  | "crate"
  | "wheel";

interface ArtifactFieldProps {
  variant: ArtifactFieldVariant;
  className?: string;
}

const assets = {
  mulberry: {
    src: "/images/artifacts/mulberry-berries.webp",
    width: 1200,
    height: 800,
  },
  bobbin: {
    src: "/images/artifacts/silk-bobbin-cocoons.webp",
    width: 900,
    height: 900,
  },
  brick: {
    src: "/images/artifacts/brick-machine-fragments.webp",
    width: 1200,
    height: 800,
  },
  archive: {
    src: "/images/artifacts/archive-evidence.webp",
    width: 1100,
    height: 847,
  },
  root: {
    src: "/images/artifacts/root-curb-ground.webp",
    width: 1400,
    height: 700,
  },
  crate: {
    src: "/images/artifacts/silk-sample-crate.webp",
    width: 1100,
    height: 847,
  },
  wheel: {
    src: "/images/artifacts/reeling-machine-wheel.webp",
    width: 1400,
    height: 934,
  },
} satisfies Record<ArtifactFocus, { src: string; width: number; height: number }>;

const variantAssets: Record<ArtifactFieldVariant, ArtifactFocus[]> = {
  hero: ["mulberry", "wheel", "bobbin"],
  discover: ["archive", "bobbin"],
  story: ["crate", "archive"],
  howto: ["bobbin", "wheel", "brick"],
  route: ["root", "wheel", "archive"],
  access: ["crate", "mulberry"],
  share: ["bobbin"],
  map: ["root", "wheel", "mulberry"],
  information: ["archive", "brick"],
};

const silkPaths: Record<ArtifactFieldVariant, string> = {
  hero: "M -8 76 C 18 72, 28 42, 48 48 S 72 78, 108 39",
  discover: "M -6 40 C 24 18, 33 64, 56 51 S 78 18, 106 31",
  story: "M -4 84 C 22 66, 35 74, 50 48 S 75 32, 105 16",
  howto: "M -8 18 C 17 15, 25 54, 43 54 S 66 31, 108 75",
  route: "M -8 72 C 18 55, 33 86, 51 57 S 76 20, 108 35",
  access: "M -6 24 C 20 38, 34 18, 56 48 S 78 76, 106 61",
  share: "M -8 72 C 23 72, 35 36, 58 48 S 82 62, 108 29",
  map: "M -7 77 C 18 63, 32 25, 50 44 S 75 80, 108 32",
  information: "M -7 66 C 22 76, 29 31, 51 39 S 79 72, 107 24",
};

export function ArtifactField({ variant, className = "" }: ArtifactFieldProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(variant === "hero");
  const [active, setActive] = useState(false);
  const selectedAssets = variantAssets[variant];

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    if (variant === "hero") return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) {
      const frame = window.requestAnimationFrame(() => setRevealed(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const bounds = field.getBoundingClientRect();
    if (bounds.top < window.innerHeight * 0.92 && bounds.bottom > 0) {
      const frame = window.requestAnimationFrame(() => setRevealed(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setRevealed(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );
    observer.observe(field);
    return () => observer.disconnect();
  }, [variant]);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | null = null;
    let intersecting = false;

    const updateActive = () => {
      setActive(!motionQuery.matches && !document.hidden && intersecting);
    };

    const sync = () => {
      observer?.disconnect();
      observer = null;

      if (motionQuery.matches) {
        intersecting = false;
        setActive(false);
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          intersecting = Boolean(entry?.isIntersecting);
          updateActive();
        },
        { rootMargin: "12% 0px 12% 0px", threshold: 0.01 },
      );
      observer.observe(field);
    };

    sync();
    motionQuery.addEventListener("change", sync);
    document.addEventListener("visibilitychange", updateActive);
    return () => {
      observer?.disconnect();
      motionQuery.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", updateActive);
    };
  }, []);

  return (
    <div
      ref={fieldRef}
      className={`${styles.field} ${className}`}
      data-variant={variant}
      data-motion-ready="true"
      data-revealed={revealed}
      data-active={active}
      aria-hidden="true"
    >
      <span className={styles.atmosphere} />
      <span className={`${styles.mote} ${styles.mote1}`} />
      <span className={`${styles.mote} ${styles.mote2}`} />
      <span className={`${styles.mote} ${styles.mote3}`} />
      <svg
        className={styles.silkGuide}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        focusable="false"
      >
        <path className={styles.silkShadow} d={silkPaths[variant]} pathLength="1" />
        <path className={styles.silkLine} d={silkPaths[variant]} pathLength="1" />
        <path className={styles.silkGlint} d={silkPaths[variant]} pathLength="1" />
        <circle className={styles.silkNode} cx="52" cy="48" r="0.7" />
      </svg>
      {selectedAssets.map((assetName, index) => {
        const asset = assets[assetName];
        return (
          <Image
            key={`${assetName}-${index}`}
            className={`${styles.item} ${styles[assetName]} ${styles[`slot${index + 1}`]}`}
            src={withBasePath(asset.src)}
            alt=""
            width={asset.width}
            height={asset.height}
            sizes="(max-width: 680px) 82vw, 42vw"
            loading={variant === "hero" ? "eager" : "lazy"}
          />
        );
      })}
    </div>
  );
}
