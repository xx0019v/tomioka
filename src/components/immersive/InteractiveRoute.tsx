"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./InteractiveRoute.module.css";

interface RoutePoint {
  id: string;
  slug: string;
  shortName: string;
  name: string;
  tags: string[];
}

export function InteractiveRoute({ points }: { points: RoutePoint[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = points[activeIndex];
  const positions = [8, 29, 50, 71, 92];

  return (
    <div className={styles.experience}>
      <div className={styles.visual} aria-hidden="true">
        <div className={styles.visualHeader}>
          <span>FIELD MAP / 05 POINTS</span>
          <span>36.25°N · 138.89°E</span>
        </div>
        <svg viewBox="0 0 100 56" role="presentation">
          <path className={styles.threadBase} d="M8 37 C22 7 35 50 50 25 S77 8 92 31" />
          <path
            className={styles.threadActive}
            d="M8 37 C22 7 35 50 50 25 S77 8 92 31"
            pathLength="100"
            style={{ strokeDasharray: `${activeIndex * 25 + 4} 100` }}
          />
          {positions.map((x, index) => {
            const y = [37, 20, 25, 15, 31][index];
            return (
              <g key={points[index]?.id ?? index} className={index <= activeIndex ? styles.reached : ""}>
                <circle cx={x} cy={y} r="3.4" />
                <circle className={styles.pulse} cx={x} cy={y} r="5.6" />
                <text x={x} y={y + 0.8} textAnchor="middle">{index === 0 ? "S" : index}</text>
              </g>
            );
          })}
        </svg>
        <div className={styles.activeCard}>
          <span>{active.shortName}</span>
          <div><small>現在の記録</small><strong>{active.name}</strong></div>
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
