/**
 * 仮キャラクターの会話仕様。
 *
 * 正式名称・設定・謎の内容は未確定。確定資料を受領するまでは、
 * このデータだけで史実、正解、ヒント本文を補完しないこと。
 */

export type GuideCharacterStatus = "provisional" | "approved";

export type GuideMoment =
  | "first-visit"
  | "return-visit"
  | "exploration-start"
  | "map-introduction"
  | "checkpoint-selected"
  | "checkpoint-discovered"
  | "information-pending"
  | "progress-updated"
  | "all-records-collected"
  | "loading"
  | "recoverable-error"
  | "blocking-error"
  | "hint-confirmation"
  | "clear-confirmed"
  | "manual-help";

export type GuideExpression =
  | "greeting"
  | "neutral"
  | "pointing"
  | "map-reading"
  | "discovery"
  | "thinking"
  | "pleased"
  | "concerned"
  | "caution"
  | "loading"
  | "clear";

export type GuideLivePriority = "off" | "polite" | "assertive";

export type GuideFrequency = "standard" | "reduced" | "manual";

export type GuideSafetyGuard =
  | "safe-static-copy"
  | "confirmed-checkpoint-data-only"
  | "confirmed-progress-event-only"
  | "confirmed-clear-event-only"
  | "user-request-only";

export type AutomaticDisplayRule =
  | "once-per-browser-session"
  | "once-per-checkpoint"
  | "once-per-progress-value"
  | "once-per-error-occurrence"
  | "while-state-is-active"
  | "never";

export interface GuideRedisplayPolicy {
  automatic: AutomaticDisplayRule;
  maxAutomaticDisplays: number;
  cooldownMs: number;
  manualReplay: boolean;
  resetWhen:
    | "new-browser-session"
    | "checkpoint-changed"
    | "progress-changed"
    | "error-resolved"
    | "manual-reset"
    | "never";
}

export interface GuideLine {
  id: string;
  moment: GuideMoment;
  expression: GuideExpression;
  text: string;
  priority: GuideLivePriority;
  dismissKey: string;
  redisplay: GuideRedisplayPolicy;
  guard: GuideSafetyGuard;
  frequency: readonly GuideFrequency[];
}

export interface GuideCharacterConfig {
  status: GuideCharacterStatus;
  workingName: string | null;
  roleLabel: string;
  identityDisclaimer: string;
  tone: {
    traits: readonly string[];
    sentenceRules: readonly string[];
    prohibited: readonly string[];
    maxCharactersPerLine: number;
  };
  frequency: {
    default: GuideFrequency;
    options: Readonly<Record<GuideFrequency, string>>;
    storageKey: string;
    historyStorageKey: string;
    dedupeWindowMs: number;
  };
  controls: {
    closeLabel: string;
    laterLabel: string;
    reduceLabel: string;
    manualLabel: string;
    restoreLabel: string;
  };
  accessibility: {
    characterAlt: string;
    bubbleLabel: string;
    defaultLivePriority: GuideLivePriority;
    focusRule: string;
    assertiveRule: string;
  };
  safety: {
    spoilerRule: string;
    unverifiedRule: string;
    interpolationAllowList: readonly string[];
  };
  lines: Readonly<Record<GuideMoment, GuideLine>>;
}

const oncePerSession: GuideRedisplayPolicy = {
  automatic: "once-per-browser-session",
  maxAutomaticDisplays: 1,
  cooldownMs: 0,
  manualReplay: true,
  resetWhen: "new-browser-session",
};

const manualOnly: GuideRedisplayPolicy = {
  automatic: "never",
  maxAutomaticDisplays: 0,
  cooldownMs: 0,
  manualReplay: true,
  resetWhen: "manual-reset",
};

export const guideCharacter = {
  status: "provisional",
  workingName: "繭標（まゆしるべ・仮）",
  roleLabel: "絹と記録の案内人（仮）",
  identityDisclaimer: "正式名称・設定は未承認です。案内役としてのみ仮運用します。",
  tone: {
    traits: ["知的", "静かな親しみ", "簡潔", "落ち着いた期待感"],
    sentenceRules: [
      "一度に一つの行動だけを案内する",
      "命令を重ねず、です・ます調を基本にする",
      "発見は喜ぶが、正解や物語の結論を示さない",
      "利用者を子ども扱いする語尾や擬音を使わない",
    ],
    prohibited: [
      "未提供の史実や施設情報の断定",
      "謎の答え・文字列・解法の示唆",
      "正式マスコットと誤認させる表現",
      "過度に幼い語尾や不安を煽る表現",
    ],
    maxCharactersPerLine: 45,
  },
  frequency: {
    default: "standard",
    options: {
      standard: "節目だけ自動で案内する",
      reduced: "エラーと重要な確認だけ案内する",
      manual: "呼び出したときだけ案内する",
    },
    storageKey: "mayu-no-chizu-guide-frequency-v1",
    historyStorageKey: "mayu-no-chizu-guide-history-v1",
    dedupeWindowMs: 30_000,
  },
  controls: {
    closeLabel: "閉じる",
    laterLabel: "後で見る",
    reduceLabel: "案内を減らす",
    manualLabel: "案内人を呼ぶ",
    restoreLabel: "案内を元に戻す",
  },
  accessibility: {
    characterAlt: "絹と記録の案内人（仮）",
    bubbleLabel: "案内人からのメッセージ",
    defaultLivePriority: "polite",
    focusRule: "自動表示ではフォーカスを移さず、操作後の確認画面だけ見出しへ移す。",
    assertiveRule: "主要操作を続けられないエラーだけassertiveで通知する。",
  },
  safety: {
    spoilerRule: "ヒント本文・答え・解法を台詞へ補間しない。確認後は既存の謎領域で表示する。",
    unverifiedRule: "未確認情報は断定せず、確認中であることと当日案内の優先だけを伝える。",
    interpolationAllowList: ["checkpointName", "completedCount", "remainingCount"],
  },
  lines: {
    "first-visit": {
      id: "guide-first-visit",
      moment: "first-visit",
      expression: "greeting",
      text: "記録が開きました。準備ができたら調査を始めましょう。",
      priority: "polite",
      dismissKey: "first-visit-v1",
      redisplay: oncePerSession,
      guard: "safe-static-copy",
      frequency: ["standard"],
    },
    "return-visit": {
      id: "guide-return-visit",
      moment: "return-visit",
      expression: "greeting",
      text: "おかえりなさい。前の記録から続けられます。",
      priority: "polite",
      dismissKey: "return-visit-v1",
      redisplay: oncePerSession,
      guard: "confirmed-progress-event-only",
      frequency: ["standard"],
    },
    "exploration-start": {
      id: "guide-exploration-start",
      moment: "exploration-start",
      expression: "pointing",
      text: "準備ができたら、地図から最初の地点を選びましょう。",
      priority: "polite",
      dismissKey: "exploration-start-v1",
      redisplay: oncePerSession,
      guard: "safe-static-copy",
      frequency: ["standard"],
    },
    "map-introduction": {
      id: "guide-map-introduction",
      moment: "map-introduction",
      expression: "map-reading",
      text: "地図の印を選ぶと、その地点の記録が開きます。",
      priority: "polite",
      dismissKey: "map-introduction-v1",
      redisplay: oncePerSession,
      guard: "safe-static-copy",
      frequency: ["standard"],
    },
    "checkpoint-selected": {
      id: "guide-checkpoint-selected",
      moment: "checkpoint-selected",
      expression: "map-reading",
      text: "{checkpointName}の記録です。現地の案内も確認してください。",
      priority: "polite",
      dismissKey: "checkpoint-selected-v1",
      redisplay: {
        automatic: "once-per-checkpoint",
        maxAutomaticDisplays: 1,
        cooldownMs: 0,
        manualReplay: true,
        resetWhen: "checkpoint-changed",
      },
      guard: "confirmed-checkpoint-data-only",
      frequency: ["standard"],
    },
    "checkpoint-discovered": {
      id: "guide-checkpoint-discovered",
      moment: "checkpoint-discovered",
      expression: "discovery",
      text: "新しい記録が加わりました。次の印へ進めます。",
      priority: "polite",
      dismissKey: "checkpoint-discovered-v1",
      redisplay: {
        automatic: "once-per-checkpoint",
        maxAutomaticDisplays: 1,
        cooldownMs: 0,
        manualReplay: false,
        resetWhen: "checkpoint-changed",
      },
      guard: "confirmed-progress-event-only",
      frequency: ["standard"],
    },
    "information-pending": {
      id: "guide-information-pending",
      moment: "information-pending",
      expression: "thinking",
      text: "この情報は現在確認中です。当日の案内を優先してください。",
      priority: "polite",
      dismissKey: "information-pending-v1",
      redisplay: {
        automatic: "once-per-checkpoint",
        maxAutomaticDisplays: 1,
        cooldownMs: 0,
        manualReplay: true,
        resetWhen: "checkpoint-changed",
      },
      guard: "confirmed-checkpoint-data-only",
      frequency: ["standard", "reduced"],
    },
    "progress-updated": {
      id: "guide-progress-updated",
      moment: "progress-updated",
      expression: "pleased",
      text: "記録は{completedCount}件。残り{remainingCount}件です。",
      priority: "polite",
      dismissKey: "progress-updated-v1",
      redisplay: {
        automatic: "once-per-progress-value",
        maxAutomaticDisplays: 1,
        cooldownMs: 0,
        manualReplay: true,
        resetWhen: "progress-changed",
      },
      guard: "confirmed-progress-event-only",
      frequency: ["standard"],
    },
    "all-records-collected": {
      id: "guide-all-records-collected",
      moment: "all-records-collected",
      expression: "pleased",
      text: "四つの記録がそろいました。最終記録を確認できます。",
      priority: "polite",
      dismissKey: "all-records-collected-v1",
      redisplay: {
        automatic: "once-per-progress-value",
        maxAutomaticDisplays: 1,
        cooldownMs: 0,
        manualReplay: true,
        resetWhen: "progress-changed",
      },
      guard: "confirmed-progress-event-only",
      frequency: ["standard", "reduced"],
    },
    loading: {
      id: "guide-loading",
      moment: "loading",
      expression: "loading",
      text: "記録を確認しています。少しだけお待ちください。",
      priority: "off",
      dismissKey: "loading-v1",
      redisplay: {
        automatic: "while-state-is-active",
        maxAutomaticDisplays: 1,
        cooldownMs: 1_000,
        manualReplay: false,
        resetWhen: "error-resolved",
      },
      guard: "safe-static-copy",
      frequency: ["standard"],
    },
    "recoverable-error": {
      id: "guide-recoverable-error",
      moment: "recoverable-error",
      expression: "concerned",
      text: "記録を読み込めません。地点一覧はそのまま使えます。",
      priority: "polite",
      dismissKey: "recoverable-error-v1",
      redisplay: {
        automatic: "once-per-error-occurrence",
        maxAutomaticDisplays: 1,
        cooldownMs: 30_000,
        manualReplay: true,
        resetWhen: "error-resolved",
      },
      guard: "safe-static-copy",
      frequency: ["standard", "reduced"],
    },
    "blocking-error": {
      id: "guide-blocking-error",
      moment: "blocking-error",
      expression: "caution",
      text: "操作を完了できませんでした。入力を残したまま再試行できます。",
      priority: "assertive",
      dismissKey: "blocking-error-v1",
      redisplay: {
        automatic: "once-per-error-occurrence",
        maxAutomaticDisplays: 1,
        cooldownMs: 30_000,
        manualReplay: true,
        resetWhen: "error-resolved",
      },
      guard: "safe-static-copy",
      frequency: ["standard", "reduced"],
    },
    "hint-confirmation": {
      id: "guide-hint-confirmation",
      moment: "hint-confirmation",
      expression: "thinking",
      text: "ヒントには手掛かりが含まれます。表示しますか。",
      priority: "off",
      dismissKey: "hint-confirmation-v1",
      redisplay: manualOnly,
      guard: "user-request-only",
      frequency: ["standard", "reduced", "manual"],
    },
    "clear-confirmed": {
      id: "guide-clear-confirmed",
      moment: "clear-confirmed",
      expression: "clear",
      text: "調査完了を確認しました。案内に沿ってゴールへ進んでください。",
      priority: "polite",
      dismissKey: "clear-confirmed-v1",
      redisplay: {
        automatic: "once-per-progress-value",
        maxAutomaticDisplays: 1,
        cooldownMs: 0,
        manualReplay: true,
        resetWhen: "progress-changed",
      },
      guard: "confirmed-clear-event-only",
      frequency: ["standard", "reduced"],
    },
    "manual-help": {
      id: "guide-manual-help",
      moment: "manual-help",
      expression: "neutral",
      text: "必要な案内を選んでください。重要な操作は画面にも表示されます。",
      priority: "off",
      dismissKey: "manual-help-v1",
      redisplay: manualOnly,
      guard: "user-request-only",
      frequency: ["standard", "reduced", "manual"],
    },
  },
} as const satisfies GuideCharacterConfig;

export function getGuideLine(moment: GuideMoment): GuideLine {
  return guideCharacter.lines[moment];
}

export function canAutoDisplayGuideLine(
  line: GuideLine,
  frequency: GuideFrequency,
): boolean {
  return line.redisplay.automatic !== "never" && line.frequency.includes(frequency);
}
