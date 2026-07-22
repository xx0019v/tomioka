import type { MetadataRoute } from "next";
import { getRoutableCheckpoints } from "@/data/checkpoints";
import { siteConfig } from "@/data/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/map", "/information", "/game", "/final"];
  const pages = routes.map((route) => ({
    url: `${siteConfig.siteUrl}${route}`,
    lastModified: new Date("2026-07-22"),
  }));
  const checkpoints = getRoutableCheckpoints().map((checkpoint) => ({
    url: `${siteConfig.siteUrl}/checkpoints/${checkpoint.slug}`,
    lastModified: new Date("2026-07-22"),
  }));
  return [...pages, ...checkpoints];
}
