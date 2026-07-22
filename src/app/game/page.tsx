import type { Metadata } from "next";
import Link from "next/link";
import { GameProgressSummary } from "@/components/game/GameProgressSummary";
import { GameStartButton } from "@/components/game/GameStartButton";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getOrderedCheckpoints } from "@/data/checkpoints";
import styles from "../subpage.module.css";

export const metadata: Metadata = {
  title: "調査を始める",
  description: "キットを受け取った参加者向けのゲーム進行ページ。",
  robots: { index: false, follow: false },
};

export default function GamePage() {
  const gameStops = getOrderedCheckpoints().filter((checkpoint) => checkpoint.role !== "start-goal");

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main id="main-content">
        <section className={styles.compactHero}>
          <div className={styles.heroInner}>
            <p className={styles.kicker}>調査員用ページ</p>
            <h1>街へ踏み出す前に</h1>
            <p className={styles.lead}>キットを受け取ったことを確認し、安全に注意して各地点を巡ってください。</p>
          </div>
        </section>

        <div className={styles.readingContent}>
          <div className={styles.checkpointHeader}>
            <GameProgressSummary />
            <p className={styles.notice}>問題は現地で確認します。検索だけでは解けません。周囲の実物をよく観察してください。</p>
          </div>

          <section className={styles.section} aria-labelledby="before-start">
            <h2 id="before-start">開始前の確認</h2>
            <ul className={styles.safetyList}>
              <li>お富ちゃん家で配布キットを受け取った。</li>
              <li>スマートフォンの充電と通信状態を確認した。</li>
              <li>飲み物と帽子を用意した。</li>
              <li>歩きながら画面を見ないことを確認した。</li>
            </ul>
            <GameStartButton className={styles.button} />
          </section>

          <section className={styles.section} aria-labelledby="all-stops">
            <h2 id="all-stops">調査地点</h2>
            <ol className={styles.routeList}>
              {gameStops.map((checkpoint) => (
                <li key={checkpoint.id}>
                  <Link href={`/checkpoints/${checkpoint.slug}/`} className={styles.routeCard}>
                    <span className={styles.routeNumber}>{checkpoint.shortName}</span>
                    <div>
                      <strong>{checkpoint.name}</strong>
                      <small>{checkpoint.description}</small>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          <div className={styles.actions}>
            <Link href="/map/" className={styles.outlineButton}>全体マップ</Link>
            <Link href="/final/" className={styles.button}>最終回答へ</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
