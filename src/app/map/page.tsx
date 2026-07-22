import type { Metadata } from "next";
import Image from "next/image";
import { GuideCharacter } from "@/components/guide/GuideCharacter";
import { CheckpointMap } from "@/components/map/CheckpointMap";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getOrderedCheckpoints } from "@/data/checkpoints";
import { withBasePath } from "@/lib/base-path";
import styles from "./page.module.css";

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
            src={withBasePath("/images/route-thread.webp")}
            alt="4つの手がかりを絹糸で結んだ巡回記録"
            fill
            priority
            sizes="100vw"
          />
          <div className={styles.heroInner}>
            <p className={styles.kicker}>巡回案内</p>
            <h1><span>チェックポイント</span><span>マップ</span></h1>
            <p className={styles.lead}>スタートからゴールまでの順番と、各地点の住所を確認できます。</p>
          </div>
          <GuideCharacter placement="map-hero" />
        </section>

        <CheckpointMap checkpoints={checkpoints} />
      </main>
      <SiteFooter />
    </div>
  );
}
