"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { siteConfig } from "@/data/site";
import { hashAnswer } from "@/lib/answer";
import { AnalyticsEvent, trackEvent } from "@/lib/analytics";
import {
  getProgressServerSnapshot,
  getProgressSnapshot,
  subscribeProgress,
} from "@/lib/progress";
import { ShareActions } from "@/components/site/ShareActions";
import styles from "./FinalAnswerForm.module.css";

interface FinalAnswerFormProps {
  answerHashes: string[];
  clearMessage: string | null;
}

export function FinalAnswerForm({ answerHashes, clearMessage }: FinalAnswerFormProps) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<"idle" | "checking" | "incorrect" | "correct">("idle");
  const ready = answerHashes.length > 0;
  const progressSnapshot = useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    getProgressServerSnapshot,
  );
  const completedCount = useMemo(() => {
    if (!progressSnapshot) return 0;
    try {
      const parsed = JSON.parse(progressSnapshot) as { completed?: string[] };
      const completed = Array.isArray(parsed.completed) ? parsed.completed : [];
      return ["cp1", "annex", "cp3", "cp4"].filter((id) => completed.includes(id)).length;
    } catch {
      return 0;
    }
  }, [progressSnapshot]);

  useEffect(() => {
    trackEvent(AnalyticsEvent.FinalView);
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || !answer.trim()) return;
    setResult("checking");
    trackEvent(AnalyticsEvent.AnswerSubmit, { checkpoint_id: "final" });
    const digest = await hashAnswer(answer);
    const correct = answerHashes.includes(digest);
    setResult(correct ? "correct" : "incorrect");
    trackEvent(AnalyticsEvent.AnswerResult, {
      checkpoint_id: "final",
      result: correct ? "correct" : "incorrect",
    });
    if (correct) trackEvent(AnalyticsEvent.ClearView);
  }

  if (result === "correct") {
    return (
      <section className={styles.clear} aria-labelledby="clear-heading">
        <p className={styles.kicker}>調査完了</p>
        <h2 id="clear-heading">地図の意味が、今明かされた。</h2>
        <p>
          {clearMessage ??
            "繭が遺した記録は、あなたの手でひとつにつながった。お富ちゃん家へ戻り、調査完了を報告してください。"}
        </p>
        <div className={styles.clearMeta}>
          <span>ゴール</span>
          <strong>お富ちゃん家</strong>
        </div>
        <ShareActions
          text={`「${siteConfig.title}」をクリアしました！ #${siteConfig.hashtag}`}
          url={siteConfig.siteUrl}
        />
      </section>
    );
  }

  return (
    <section className={styles.panel} aria-labelledby="final-answer-heading">
      <div className={styles.progressNote}>
        <span>この端末に保存された完了記録</span>
        <strong>{completedCount} / 4</strong>
      </div>

      {ready ? (
        <form onSubmit={submit}>
          <h2 id="final-answer-heading">最終回答を入力</h2>
          <p className={styles.helper}>キーワードA-Dをすべて使って導いた答えを入力してください。</p>
          <label htmlFor="final-answer">最終回答</label>
          <input
            id="final-answer"
            name="final-answer"
            value={answer}
            onChange={(event) => {
              setAnswer(event.target.value);
              if (result !== "idle") setResult("idle");
            }}
            autoComplete="off"
            aria-describedby="final-result"
          />
          <button type="submit" disabled={!answer.trim() || result === "checking"}>
            {result === "checking" ? "確認中" : "最終回答を送る"}
          </button>
          <p id="final-result" className={styles.result} aria-live="polite">
            {result === "incorrect"
              ? "まだ記録の読み方が違うようだ。4つの言葉を、もう一度見直してください。"
              : ""}
          </p>
        </form>
      ) : (
        <div className={styles.pending}>
          <p className={styles.kicker}>最終回答</p>
          <h2 id="final-answer-heading">最終謎を準備中</h2>
          <p>最終謎と正解判定は、謎制作担当の確定データを受領後に有効になります。</p>
        </div>
      )}
    </section>
  );
}
