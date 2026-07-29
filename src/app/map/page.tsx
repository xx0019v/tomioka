import type { Metadata } from "next";
import Image from "next/image";
import { GuideCharacter } from "@/components/guide/GuideCharacter";
import { ArtifactField } from "@/components/immersive/ArtifactField";
import { EventAreaMap } from "@/components/map/EventAreaMap";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { eventSpots } from "@/data/spots";
import { withBasePath } from "@/lib/base-path";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "富岡 街歩きマップ",
  description: "受付場所と富岡製糸場周辺のイベントエリア、休憩地点を確認できる街歩きマップ。",
};

export default function MapPage() {
  return (
    <div className={styles.page}>
      <SiteHeader />
      <main id="main-content">
        <section className={styles.hero}>
          <Image
            className={styles.heroImage}
            src={withBasePath("/images/route-thread.webp")}
            alt="富岡の街並みを絹糸で結んだ見取図"
            fill
            priority
            sizes="100vw"
          />
          <ArtifactField variant="map" />
          <div className={styles.heroInner}>
            <p className={styles.kicker}>物語を巡る街</p>
            <h1><span>富岡</span><span>街歩きマップ</span></h1>
            <p className={styles.lead}>受付と、街歩きの目印がわかります。</p>
          </div>
          <GuideCharacter lines={["地図の印を選ぶと", "場所と目印がわかるよ"]} />
        </section>

        <EventAreaMap spots={eventSpots} />
      </main>
      <SiteFooter />
    </div>
  );
}
