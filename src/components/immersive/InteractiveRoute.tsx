"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { EventSpot } from "@/data/spots";
import { withBasePath } from "@/lib/base-path";
import styles from "./InteractiveRoute.module.css";

const routeArtifacts = [
  "/images/artifacts/mulberry-berries.webp",
  "/images/artifacts/silk-bobbin-cocoons.webp",
  "/images/artifacts/reeling-machine-wheel.webp",
  "/images/artifacts/archive-evidence.webp",
  "/images/artifacts/silk-sample-crate.webp",
  "/images/artifacts/root-curb-ground.webp",
] as const;

export function InteractiveRoute({ points }: { points: EventSpot[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = points[activeIndex];
  const positions = normalizeForDiagram(points);
  const routePath = positions.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className={styles.experience}>
      <div className={styles.visual}>
        <div className={styles.visualHeader}>
          <span>EVENT AREA / TOMIOKA</span>
          <span>実座標をもとにした街の見取図</span>
        </div>
        <svg viewBox="0 0 100 56" aria-hidden="true">
          <polyline className={styles.threadBase} points={routePath} />
          <polyline
            className={styles.threadActive}
            points={routePath}
            pathLength="100"
            style={{ strokeDasharray: "100 100" }}
          />
          {positions.map(({ x, y }, index) => {
            return (
              <g key={points[index]?.id ?? index} className={index === activeIndex ? styles.reached : ""}>
                <circle cx={x} cy={y} r="3.4" />
                <circle className={styles.pulse} cx={x} cy={y} r="5.6" />
                <text x={x} y={y + 0.8} textAnchor="middle">{points[index]?.marker}</text>
              </g>
            );
          })}
        </svg>
        <div
          className={styles.artifactStage}
          aria-hidden="true"
        >
          <Image
            key={activeIndex}
            className={styles.activeArtifact}
            src={withBasePath(routeArtifacts[activeIndex] ?? routeArtifacts[0])}
            alt=""
            width={300}
            height={220}
            sizes="(max-width: 680px) 58vw, 28vw"
          />
          <span className={styles.artifactIndex}>{active.categoryLabel}</span>
        </div>
        <div className={styles.activeCard} aria-live="polite" aria-atomic="true">
          <span>{active.marker}</span>
          <div>
            <small>{active.categoryLabel}</small>
            <strong>{active.name}</strong>
          </div>
          <Link href={`/map/?spot=${active.slug}`} className={styles.openRecord}>
            マップで見る <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>

      <ol className={styles.list}>
        {points.map((point, index) => (
          <li key={point.id} className={index === activeIndex ? styles.active : ""}>
            <button
              type="button"
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onClick={() => setActiveIndex(index)}
              aria-pressed={index === activeIndex}
              aria-label={`${point.name}を街の見取図で確認`}
            >
              <span>{point.marker}</span>
              <div><strong>{point.name}</strong><small>{point.tags.slice(0, 2).join(" / ")}</small></div>
              <i aria-hidden="true">見る</i>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function normalizeForDiagram(points: EventSpot[]) {
  const lats = points.map((point) => point.latitude);
  const lngs = points.map((point) => point.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return points.map((point) => ({
    x: 8 + ((point.longitude - minLng) / Math.max(maxLng - minLng, 0.000001)) * 84,
    y: 8 + (1 - (point.latitude - minLat) / Math.max(maxLat - minLat, 0.000001)) * 40,
  }));
}
