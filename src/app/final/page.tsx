import type { Metadata } from "next";
import { FinalAnswerForm } from "@/components/game/FinalAnswerForm";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { finalPuzzle } from "@/data/puzzles";
import styles from "../subpage.module.css";

export const metadata: Metadata = {
  title: "最終回答",
  description: "4つのキーワードを使い、繭が遺した地図の最終回答を送信します。",
  robots: { index: false, follow: false },
};

export default function FinalPage() {
  const puzzleReady = Boolean(finalPuzzle.title && finalPuzzle.body);

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main id="main-content">
        <section className={styles.compactHero}>
          <div className={styles.heroInner}>
            <p className={styles.kicker}>最後の記録</p>
            <h1>4つの言葉を、ひとつに。</h1>
            <p className={styles.lead}>キーワードA-Dをすべて使い、繭が遺した地図の意味を導いてください。</p>
          </div>
        </section>

        <div className={styles.readingContent}>
          {puzzleReady && (
            <section className={styles.panel} aria-labelledby="final-puzzle-heading">
              <p className={styles.kicker}>最終謎</p>
              <h2 id="final-puzzle-heading">{finalPuzzle.title}</h2>
              <p>{finalPuzzle.body}</p>
            </section>
          )}
          <div className={puzzleReady ? styles.finalSpace : undefined}>
            <FinalAnswerForm
              answerHashes={finalPuzzle.answerHashes}
              clearMessage={finalPuzzle.clearMessage}
            />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
