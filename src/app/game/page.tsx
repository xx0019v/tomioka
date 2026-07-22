import type { Metadata } from "next";
import Link from "next/link";
import { GameProgressSummary } from "@/components/game/GameProgressSummary";
import { GameStartButton } from "@/components/game/GameStartButton";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getOrderedCheckpoints } from "@/data/checkpoints";
import styles from "../subpage.module.css";
import gameStyles from "./page.module.css";

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
      <main id="main-content" className={gameStyles.gameMain}>
        <section className={`${styles.compactHero} ${gameStyles.gameHero}`}>
          <div className={styles.heroInner}>
            <p className={styles.kicker}>調査員用ページ</p>
            <h1>街へ踏み出す前に</h1>
            <p className={styles.lead}>キットを受け取ったことを確認し、安全に注意して各地点を巡ってください。</p>
          </div>
        </section>

        <div className={`${styles.readingContent} ${gameStyles.ledger}`}>
          <div className={styles.checkpointHeader}>
            <GameProgressSummary />
            <p className={styles.notice}>問題は現地で確認します。検索だけでは解けません。周囲の実物をよく観察してください。</p>
          </div>

          <section className={`${styles.section} ${gameStyles.archiveSection}`} aria-labelledby="before-start">
            <h2 id="before-start">開始前の確認</h2>
            <ul className={styles.safetyList}>
              <li>お富ちゃん家で配布キットを受け取った。</li>
              <li>スマートフォンの充電と通信状態を確認した。</li>
              <li>飲み物と帽子を用意した。</li>
              <li>歩きながら画面を見ないことを確認した。</li>
            </ul>
            <GameStartButton className={styles.button} />
            <Link href="/map/?checkpoint=otomi-chan-ie" className={gameStyles.pickupLink}>まだキットを受け取っていない方へ — 受取場所を見る</Link>
          </section>

          <section className={`${styles.section} ${gameStyles.archiveSection}`} aria-labelledby="all-stops">
            <p className={gameStyles.folio}>巡回記録 / 5地点＋補助1地点</p>
            <h2 id="all-stops">4つの言葉を集める</h2>
            <p className={gameStyles.chapterLegend}>CP02だけは、岡重で手掛かりを確認した後、銀座まちなか交流館へ移動して解く連続調査です。</p>
            <ol className={`${styles.routeList} ${gameStyles.recordList}`}>
              {gameStops.map((checkpoint) => (
                <li key={checkpoint.id} className={checkpoint.role === "solve-annex" ? gameStyles.annexRecord : ""}>
                  <Link href={`/checkpoints/${checkpoint.slug}/`} className={`${styles.routeCard} ${gameStyles.recordCard}`}>
                    <span className={styles.routeNumber}>{checkpoint.shortName}</span>
                    <div>
                      <small className={gameStyles.stepLabel}>
                        {checkpoint.id === "cp2" ? "CP02 / STEP 1 — 手掛かりを読む" : checkpoint.role === "solve-annex" ? "CP02 / STEP 2 — 移動して解く" : `RECORD ${checkpoint.shortName}`}
                      </small>
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
            <Link href="/final/" className={styles.button}>最終記録を確認</Link>
          </div>
          <p className={gameStyles.finalNote}>正式な最終問題と判定条件は現在準備中です。未確定の答えは掲載していません。</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
