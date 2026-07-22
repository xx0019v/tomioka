"use client";

import { useEffect, useMemo, useState } from "react";
import type { PuzzleDefinition } from "@/data/puzzles";
import { hashAnswer } from "@/lib/answer";
import { AnalyticsEvent, trackEvent } from "@/lib/analytics";
import { completeCheckpoint } from "@/lib/progress";
import styles from "./PuzzleExperience.module.css";

interface PuzzleExperienceProps {
  checkpointId: string;
  puzzle: PuzzleDefinition | null;
}

type Result = "idle" | "checking" | "correct" | "incorrect" | "error";

export function PuzzleExperience({ checkpointId, puzzle }: PuzzleExperienceProps) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<Result>("idle");
  const [openedHints, setOpenedHints] = useState<number[]>([]);
  const isReady = Boolean(
    puzzle?.problemTitle &&
      puzzle.problemBody &&
      puzzle.answerHashes.length > 0,
  );
  const resultId = `${checkpointId}-answer-result`;

  useEffect(() => {
    trackEvent(AnalyticsEvent.CheckpointView, { checkpoint_id: checkpointId });
  }, [checkpointId]);

  const statusMessage = useMemo(() => {
    if (result === "correct") return "正解。キットに得られた言葉を記録せよ。";
    if (result === "incorrect") return "記録と現地の様子を、もう一度見直してください。";
    if (result === "error") return "判定処理を完了できませんでした。入力は残っています。通信状態を確認して、もう一度お試しください。";
    return "";
  }, [result]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!puzzle || !isReady || !answer.trim()) return;

    setResult("checking");
    trackEvent(AnalyticsEvent.AnswerSubmit, { checkpoint_id: checkpointId });
    try {
      const digest = await hashAnswer(answer);
      const correct = puzzle.answerHashes.includes(digest);
      setResult(correct ? "correct" : "incorrect");
      trackEvent(AnalyticsEvent.AnswerResult, {
        checkpoint_id: checkpointId,
        result: correct ? "correct" : "incorrect",
      });

      if (correct) {
        completeCheckpoint(checkpointId);
        trackEvent(AnalyticsEvent.CheckpointComplete, {
          checkpoint_id: checkpointId,
        });
      }
    } catch {
      setResult("error");
    }
  }

  function toggleHint(index: number) {
    setOpenedHints((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index],
    );
    if (!openedHints.includes(index)) {
      trackEvent(AnalyticsEvent.HintOpen, {
        checkpoint_id: checkpointId,
        hint_level: index + 1,
      });
    }
  }

  if (!puzzle) {
    return (
      <section className={styles.pending} aria-labelledby="puzzle-status">
        <h2 id="puzzle-status">調査資料を確認中</h2>
        <p>この地点の謎データは、謎制作担当の最終確認後に公開されます。</p>
      </section>
    );
  }

  return (
    <div className={styles.experience}>
      <section className={styles.introduction} aria-labelledby="record-heading">
        <p className={styles.kicker}>繭の調査記録</p>
        <h2 id="record-heading">この場所に遺された記録</h2>
        <p>{puzzle.introduction}</p>
      </section>

      <section className={styles.problem} aria-labelledby="problem-heading">
        {isReady ? (
          <>
            <p className={styles.kicker}>問題</p>
            <h2 id="problem-heading">{puzzle.problemTitle}</h2>
            <p className={styles.problemBody}>{puzzle.problemBody}</p>
            <form className={styles.form} onSubmit={handleSubmit}>
              <label htmlFor={`${checkpointId}-answer`}>答え</label>
              <p className={styles.helper}>ひらがな・カタカナ・全角半角の違いは自動で整えます。</p>
              <div className={styles.answerRow}>
                <input
                  id={`${checkpointId}-answer`}
                  name="answer"
                  value={answer}
                  onChange={(event) => {
                    setAnswer(event.target.value);
                    if (result !== "idle") setResult("idle");
                  }}
                  aria-describedby={resultId}
                  autoComplete="off"
                  inputMode="text"
                  disabled={result === "checking" || result === "correct"}
                />
                <button
                  type="submit"
                  disabled={!answer.trim() || result === "checking" || result === "correct"}
                >
                  {result === "checking" ? "確認中" : "回答する"}
                </button>
              </div>
              <p
                id={resultId}
                className={`${styles.result} ${result === "correct" ? styles.correct : ""}`}
                aria-live="polite"
              >
                {statusMessage}
              </p>
            </form>
          </>
        ) : (
          <div className={styles.pending}>
            <p className={styles.kicker}>問題</p>
            <h2 id="problem-heading">調査資料を準備中</h2>
            <p>問題文・正解判定・ヒントは、謎制作担当から確定データを受領後に有効になります。</p>
          </div>
        )}
      </section>

      <section className={styles.hints} aria-labelledby="hint-heading">
        <h2 id="hint-heading">行き詰まったとき</h2>
        {puzzle.hints.length > 0 ? (
          <ol>
            {puzzle.hints.map((hint, index) => {
              const open = openedHints.includes(index);
              return (
                <li key={`${checkpointId}-hint-${index + 1}`}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => toggleHint(index)}
                  >
                    ヒント{index + 1}を{open ? "閉じる" : "見る"}
                  </button>
                  {open && <p>{hint}</p>}
                </li>
              );
            })}
          </ol>
        ) : (
          <p className={styles.helper}>ヒントは謎制作担当の確認後に掲載されます。</p>
        )}
      </section>
    </div>
  );
}
