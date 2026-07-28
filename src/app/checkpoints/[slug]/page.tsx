import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GameProgressSummary } from "@/components/game/GameProgressSummary";
import { PuzzleExperience } from "@/components/game/PuzzleExperience";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import {
  getCheckpointBySlug,
  getOrderedCheckpoints,
  getRoutableCheckpoints,
} from "@/data/checkpoints";
import { getPuzzleByCheckpointId } from "@/data/puzzles";
import styles from "../../subpage.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return getRoutableCheckpoints().map((checkpoint) => ({ slug: checkpoint.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const checkpoint = getCheckpointBySlug(slug);
  if (!checkpoint) return {};
  return {
    title: `${checkpoint.shortName} ${checkpoint.name}`,
    description: checkpoint.description,
    robots: { index: false, follow: false },
  };
}

export default async function CheckpointPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const checkpoint = getCheckpointBySlug(slug);
  if (!checkpoint) notFound();

  const route = getOrderedCheckpoints();
  const index = route.findIndex((item) => item.id === checkpoint.id);
  const previous = index > 0 ? route[index - 1] : null;
  const next = index < route.length - 1 ? route[index + 1] : null;
  const puzzle = getPuzzleByCheckpointId(checkpoint.id) ?? null;
  const isStart = checkpoint.role === "start-goal";

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main id="main-content">
        <section className={styles.compactHero}>
          <Image
            className={styles.heroImage}
            src={checkpoint.visualSrc}
            alt=""
            fill
            sizes="100vw"
            fetchPriority="high"
          />
          <div className={styles.heroInner}>
            <p className={styles.kicker}>{checkpoint.shortName} / 調査地点</p>
            <h1>{checkpoint.name}</h1>
            <p className={styles.lead}>{checkpoint.description}</p>
            <p className={styles.photoCredit}>
              <a href={checkpoint.visualSourceUrl} target="_blank" rel="noopener noreferrer">
                {checkpoint.visualCredit}
              </a>
            </p>
          </div>
        </section>

        <div className={styles.readingContent}>
          <header className={styles.checkpointHeader}>
            <GameProgressSummary />
            <ul className={styles.checkpointMeta} aria-label="地点情報">
              {checkpoint.tags.map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
          </header>

          <dl className={styles.locationPanel}>
            <div><dt>住所</dt><dd>{checkpoint.address}</dd></div>
            <div><dt>営業時間</dt><dd>{checkpoint.openingHours ?? "運営確認後に掲載"}</dd></div>
            {checkpoint.closedDays && <div><dt>休業情報</dt><dd>{checkpoint.closedDays}</dd></div>}
            <div><dt>情報確認</dt><dd>{checkpoint.sourceLabel}</dd></div>
          </dl>

          {checkpoint.notice && <p className={styles.notice}>{checkpoint.notice}</p>}

          <div className={styles.actions}>
            <a
              href={checkpoint.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.outlineButton}
            >Googleマップで開く</a>
            <Link href="/map/" className={styles.outlineButton}>全体マップ</Link>
          </div>

          <div className={styles.experienceSpace}>
            {isStart ? (
              <section className={styles.panel} aria-labelledby="start-record">
                <h2 id="start-record">調査を開始する</h2>
                <p>キットの内容と注意事項を確認したら、最初のチェックポイント「アトリエ」へ向かってください。</p>
                <div className={styles.actions}>
                  <Link href="/checkpoints/atelier/" className={styles.button}>アトリエへ進む</Link>
                </div>
              </section>
            ) : (
              <PuzzleExperience checkpointId={checkpoint.id} puzzle={puzzle} />
            )}
          </div>

          <nav className={styles.pageNav} aria-label="調査地点の移動">
            {previous ? (
              <Link href={`/checkpoints/${previous.slug}/`}>前：{previous.name}</Link>
            ) : <span />}
            {next ? (
              <Link href={`/checkpoints/${next.slug}/`}>次：{next.name}</Link>
            ) : (
              <Link href="/final/">最終回答へ</Link>
            )}
          </nav>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
