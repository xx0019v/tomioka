import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getOrderedCheckpoints } from "@/data/checkpoints";
import styles from "../subpage.module.css";

export const metadata: Metadata = {
  title: "チェックポイントマップ",
  description: "繭が遺した地図の巡回順、各チェックポイントの住所とGoogleマップへのリンク。",
};

export default function MapPage() {
  const checkpoints = getOrderedCheckpoints();

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main id="main-content">
        <section className={styles.hero}>
          <Image
            className={styles.heroImage}
            src="/images/route-thread.webp"
            alt="4つの手がかりを絹糸で結んだ巡回記録"
            fill
            priority
            sizes="100vw"
          />
          <div className={styles.heroInner}>
            <p className={styles.kicker}>巡回案内</p>
            <h1>チェックポイントマップ</h1>
            <p className={styles.lead}>スタートからゴールまでの順番と、各地点の住所を確認できます。</p>
          </div>
        </section>

        <div className={styles.content}>
          <div className={styles.introGrid}>
            <div>
              <h2>地図より先に、順番を確認。</h2>
              <p>CP02は岡重で問題を確認した後、銀座まちなか交流館へ移動して解く2段階の設計です。</p>
              <p className={styles.notice}>店舗や歩行者の通行を妨げないよう、店先で長く立ち止まらないでください。</p>
            </div>
            <div className={styles.visual}>
              <Image
                src="/images/route-thread.webp"
                alt="4地点を結ぶ朱色の絹糸"
                fill
                sizes="(max-width: 780px) 100vw, 40vw"
              />
            </div>
          </div>

          <ol className={styles.routeList}>
            {checkpoints.map((checkpoint) => (
              <li key={checkpoint.id}>
                <article className={styles.routeCard}>
                  <span className={styles.routeNumber}>{checkpoint.shortName}</span>
                  <div>
                    <strong>{checkpoint.name}</strong>
                    <small>{checkpoint.address}</small>
                    <small>{checkpoint.openingHours ?? "営業時間は運営確認後に掲載"}</small>
                  </div>
                  <div className={styles.routeActions}>
                    <Link href={`/checkpoints/${checkpoint.slug}/`}>地点詳細</Link>
                    <a
                      href={checkpoint.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >Googleマップ</a>
                  </div>
                </article>
              </li>
            ))}
          </ol>

          <iframe
            className={styles.mapFrame}
            title="お富ちゃん家周辺のGoogleマップ"
            src="https://www.google.com/maps?q=%E3%81%8A%E5%AF%8C%E3%81%A1%E3%82%83%E3%82%93%E5%AE%B6%20%E7%BE%A4%E9%A6%AC%E7%9C%8C%E5%AF%8C%E5%B2%A1%E5%B8%82%E5%AF%8C%E5%B2%A11430-1&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <p className={styles.sourceNote}>住所と営業時間は公開情報をもとに整理しています。イベント当日の案内を優先してください。</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
