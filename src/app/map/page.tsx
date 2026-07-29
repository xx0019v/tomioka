import type { Metadata } from "next";
import Image from "next/image";
import { GuideCharacter } from "@/components/guide/GuideCharacter";
import { ArtifactField } from "@/components/immersive/ArtifactField";
import { EventAreaMap } from "@/components/map/EventAreaMap";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { siteConfig } from "@/data/site";
import { eventSpots } from "@/data/spots";
import { withBasePath } from "@/lib/base-path";
import styles from "./page.module.css";

const mapDescription = "受付場所と富岡製糸場周辺のイベントエリア、休憩地点を確認できる街歩きマップ。";
const mapUrl = `${siteConfig.siteUrl.replace(/\/$/, "")}/map/`;

export const metadata: Metadata = {
  title: "富岡 街歩きマップ",
  description: mapDescription,
  alternates: { canonical: mapUrl },
  openGraph: {
    title: "富岡 街歩きマップ｜繭が遺した地図",
    description: mapDescription,
    url: mapUrl,
    siteName: "繭が遺した地図",
    locale: "ja_JP",
    type: "website",
  },
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
            <div className={styles.heroCopy}>
              <p className={styles.kicker}>FIELD MAP / TOMIOKA</p>
              <h1><span>富岡の街を、</span><span>絹糸でたどる</span></h1>
              <p className={styles.lead}>受付、街歩きの目印、休憩地点を地図で確認できます。</p>
            </div>
            <dl className={styles.heroLedger} aria-label="街歩きマップの概要">
              <div><dt>AREA</dt><dd>富岡製糸場周辺</dd></div>
              <div><dt>DATE</dt><dd>{siteConfig.eventDate}</dd></div>
              <div><dt>SPOTS</dt><dd>{eventSpots.length}地点</dd></div>
            </dl>
          </div>
          <GuideCharacter lines={["地図の印を選ぶと", "場所と目印がわかるよ"]} />
        </section>

        <EventAreaMap spots={eventSpots} />
      </main>
      <SiteFooter />
    </div>
  );
}
