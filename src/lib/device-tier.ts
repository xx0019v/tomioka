/**
 * 端末能力の検出と品質ティア決定。
 *
 * 「動くかどうか」ではなく「歩きながら使う端末を発熱させないか」を基準に落とす。
 * static は canvas を一切作らない（情報・CTA・地図は DOM 側で完全に成立する）。
 */

export type DeviceTier = "high" | "medium" | "low" | "static";

export interface TierBudget {
  dprMax: number;
  tubularSegments: number;
  radialSegments: number;
  particleCount: number;
  cocoonDetail: number;
  antialias: boolean;
}

/** performance-budget.md の表と一致させること */
export const TIER_BUDGET: Record<Exclude<DeviceTier, "static">, TierBudget> = {
  high: {
    dprMax: 1.75,
    tubularSegments: 220,
    radialSegments: 10,
    particleCount: 420,
    cocoonDetail: 3,
    antialias: true,
  },
  medium: {
    dprMax: 1.5,
    tubularSegments: 140,
    radialSegments: 8,
    particleCount: 240,
    cocoonDetail: 2,
    antialias: true,
  },
  low: {
    dprMax: 1.25,
    tubularSegments: 80,
    radialSegments: 6,
    particleCount: 110,
    cocoonDetail: 1,
    antialias: false,
  },
};

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ??
        canvas.getContext("webgl") ??
        canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

interface NetworkInformationLike {
  saveData?: boolean;
}

export function detectTier(): DeviceTier {
  if (typeof window === "undefined") return "static";

  // 動きで体調を崩す利用者がいる。ここは性能ではなく安全の判断。
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "static";

  const connection = (navigator as Navigator & { connection?: NetworkInformationLike })
    .connection;
  if (connection?.saveData) return "static";

  if (!hasWebGL()) return "static";

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const width = window.innerWidth;

  // 歩行中に使われる端末は、性能が出ていても low に留める（発熱と電池を優先）
  if (coarse || width < 768 || cores <= 4 || memory <= 2) return "low";
  if (width >= 1024 && cores >= 8 && memory >= 8) return "high";
  return "medium";
}
