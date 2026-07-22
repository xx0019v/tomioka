"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  getProgressServerSnapshot,
  getProgressSnapshot,
  subscribeProgress,
} from "@/lib/progress";
import { SpatialRouteCanvas } from "./SpatialRouteCanvas";
import styles from "./InteractiveRoute.module.css";

interface RoutePoint {
  id: string;
  slug: string;
  shortName: string;
  name: string;
  tags: string[];
  latitude: number;
  longitude: number;
  role: "start-goal" | "checkpoint" | "solve-annex";
}

export function InteractiveRoute({ points }: { points: RoutePoint[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = points[activeIndex];
  const snapshot = useSyncExternalStore(subscribeProgress, getProgressSnapshot, getProgressServerSnapshot);
  const discoveredIds = useMemo(() => {
    try {
      const parsed = JSON.parse(snapshot) as { completed?: string[] };
      return Array.isArray(parsed.completed) ? parsed.completed : [];
    } catch {
      return [];
    }
  }, [snapshot]);
  const positions = normalizeForDiagram(points);
  const routePath = positions.map((point) => `${point.x},${point.y}`).join(" ");
  const routeProgress = points.length > 1 ? (activeIndex / (points.length - 1)) * 100 : 100;

  function selectSlug(slug: string) {
    const nextIndex = points.findIndex((point) => point.slug === slug);
    if (nextIndex >= 0) setActiveIndex(nextIndex);
  }

  return (
    <div className={styles.experience}>
      <div className={styles.visual}>
        <div className={styles.visualHeader}>
          <span>調査経路図 / 巡回5＋補助1</span>
          <span>実座標をもとにした概念図</span>
        </div>
        <svg viewBox="0 0 100 56" aria-hidden="true">
          <polyline className={styles.threadBase} points={routePath} />
          <polyline
            className={styles.threadActive}
            points={routePath}
            pathLength="100"
            style={{ strokeDasharray: `${routeProgress} 100` }}
          />
          {positions.map(({ x, y }, index) => {
            return (
              <g key={points[index]?.id ?? index} className={index <= activeIndex ? styles.reached : ""}>
                <circle cx={x} cy={y} r="3.4" />
                <circle className={styles.pulse} cx={x} cy={y} r="5.6" />
                <text x={x} y={y + 0.8} textAnchor="middle">{index === 0 ? "S" : index}</text>
              </g>
            );
          })}
        </svg>
        <SpatialRouteCanvas
          points={points}
          activeSlug={active.slug}
          discoveredIds={discoveredIds}
          onSelect={selectSlug}
        />
        <div className={styles.activeCard}>
          <span>{active.shortName}</span>
          <div>
            <small>{active.role === "solve-annex" ? "解答・休憩地点" : "選択中の記録"}</small>
            <strong>{active.name}</strong>
          </div>
        </div>
      </div>

      <ol className={styles.list}>
        {points.map((point, index) => (
          <li key={point.id} className={index === activeIndex ? styles.active : ""}>
            <Link
              href={`/checkpoints/${point.slug}/`}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onTouchStart={() => setActiveIndex(index)}
            >
              <span>{point.shortName}</span>
              <div><strong>{point.name}</strong><small>{point.tags.slice(0, 2).join(" / ")}</small></div>
              <i aria-hidden="true">↗</i>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

function normalizeForDiagram(points: RoutePoint[]) {
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
