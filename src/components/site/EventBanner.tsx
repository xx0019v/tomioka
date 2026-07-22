import { siteConfig } from "@/data/site";
import styles from "./EventBanner.module.css";

export function EventBanner() {
  if (!siteConfig.emergency.enabled) return null;

  return (
    <aside
      className={`${styles.banner} ${styles[siteConfig.emergency.tone]}`}
      aria-label="重要なお知らせ"
    >
      <strong>{siteConfig.emergency.title}</strong>
      <span>{siteConfig.emergency.message}</span>
    </aside>
  );
}
