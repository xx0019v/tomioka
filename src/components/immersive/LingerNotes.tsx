"use client";

import { useEffect, useRef } from "react";
import styles from "./LingerNotes.module.css";

/**
 * 適応ペーシング。
 *
 * 街の形成シーンを「ゆっくり読み進める人」にだけ、路地名や余韻の断片が
 * 静かに浮かぶ。速く飛ばす人には出さない（要点だけで通り抜けられる）。
 *
 * 手がかり・答え・キーワードは一切出さない。出すのは公道の名と、
 * すでに本文にある物語のトーンに沿った短い余韻だけ。
 *
 * 仕組み:
 *  - スクロール速度を rAF で採取し、遅い（＝読んでいる）ときだけ data-linger を立てる
 *  - セクションが視界にある間だけ観測。外では止める
 *  - スクロール 1 回につき rAF 1 本。止まれば何も回らない
 *  - reduce では観測せず、最初から静かに見えている（動きを作らない）
 */

/** これ以下の速度（px/frame）なら「読んでいる」とみなす */
const SLOW_THRESHOLD = 7;
/** 浮かべ始めるまでの、遅さの継続確認（連続フレーム数） */
const LINGER_FRAMES = 8;

interface LingerNote {
  text: string;
  /** 版面上の位置（%）。地図図版の道沿いに散らす */
  top: number;
  left: number;
}

const NOTES: readonly LingerNote[] = [
  { text: "西銀座通り", top: 24, left: 16 },
  { text: "スズラン通り", top: 40, left: 70 },
  { text: "仲町通り", top: 66, left: 30 },
  { text: "この道を、よく歩いた", top: 54, left: 46 },
  { text: "甘いものを、口にすると", top: 32, left: 52 },
];

export function LingerNotes() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) {
      root.dataset.linger = "true";
      return;
    }

    let visible = false;
    let frame = 0;
    let lastY = window.scrollY;
    let slowCount = 0;

    const sample = () => {
      frame = 0;
      const y = window.scrollY;
      const velocity = Math.abs(y - lastY);
      lastY = y;
      if (velocity <= SLOW_THRESHOLD) {
        slowCount = Math.min(LINGER_FRAMES, slowCount + 1);
      } else {
        slowCount = 0;
      }
      root.dataset.linger = slowCount >= LINGER_FRAMES ? "true" : "false";
    };

    const onScroll = () => {
      if (!visible || frame) return;
      frame = requestAnimationFrame(sample);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        if (visible) {
          lastY = window.scrollY;
          slowCount = 0;
        } else if (frame) {
          cancelAnimationFrame(frame);
          frame = 0;
          root.dataset.linger = "false";
        }
      },
      { threshold: 0 },
    );
    io.observe(root);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.notes} data-linger="false" aria-hidden="true">
      {NOTES.map((note) => (
        <span
          key={note.text}
          className={styles.note}
          style={{ top: `${note.top}%`, left: `${note.left}%` }}
        >
          {note.text}
        </span>
      ))}
    </div>
  );
}
