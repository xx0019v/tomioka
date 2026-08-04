"use client";

import { useSyncExternalStore } from "react";
import styles from "./SilkKnot.module.css";

/**
 * 「あなたの糸を残す」痕跡。
 *
 * 物語の結びで、来場者が糸を一結びすると、地図に自分だけの淡い灯りが残る。
 * 「見た」で終わらず「参加した」手触りを作る、静かな一手。
 *
 * プライバシー:
 *  - 保存するのは端末内 localStorage の結んだ日時だけ。個人情報は一切扱わない
 *  - サーバへ送らない。他人の灯りは出さない（＝自分の痕跡だけ）
 *  - 偽の緯度経度は持たせない。地図側の灯りは「あなたの結び」として添えるだけで、
 *    実在地点のふりをさせない
 *
 *  variant:
 *   - "offer": 結びの場面。糸を結ぶ所作と、結んだ後の余韻
 *   - "echo" : 街歩きマップ側。すでに結んでいれば、灯りを静かに添える
 */

const STORE_KEY = "mayu-no-chizu:knot";
const KNOT_EVENT = "mayu:knot";

function readKnot(): boolean {
  try {
    return Boolean(window.localStorage.getItem(STORE_KEY));
  } catch {
    return false;
  }
}

/** 結びの有無を SSR 安全に購読する（サーバでは常に false） */
function subscribeKnot(onChange: () => void) {
  window.addEventListener(KNOT_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(KNOT_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

interface SilkKnotProps {
  variant?: "offer" | "echo";
}

export function SilkKnot({ variant = "offer" }: SilkKnotProps) {
  // SSR ではサーバスナップショット false。クライアントで localStorage を読み直す
  const knotted = useSyncExternalStore(subscribeKnot, readKnot, () => false);

  const tie = () => {
    try {
      window.localStorage.setItem(STORE_KEY, new Date().toISOString());
    } catch {
      // 保存できなくても所作は成立させる（余韻は出す）
    }
    window.dispatchEvent(new Event(KNOT_EVENT));
  };

  // 街歩きマップ側: 結んでいなければ何も出さない
  if (variant === "echo") {
    if (!knotted) return null;
    return (
      <div className={styles.echo} aria-hidden="true">
        <span className={styles.light} />
        <span className={styles.echoLabel}>あなたの結び</span>
      </div>
    );
  }

  // 結びの場面
  return (
    <div className={styles.offer} data-knotted={knotted}>
      {knotted ? (
        <p className={styles.done}>
          <span className={styles.light} aria-hidden="true" />
          糸を結びました。地図に、あなたの灯りがひとつ。
        </p>
      ) : (
        <button type="button" className={styles.tieButton} onClick={tie}>
          <span className={styles.knotMark} aria-hidden="true" />
          この物語に、糸を一結び
        </button>
      )}
    </div>
  );
}
