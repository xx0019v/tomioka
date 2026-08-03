import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "map/", "information/"];
  return routes.map((route) => ({
    url: new URL(route, siteConfig.siteUrl).toString(),
    lastModified: new Date("2026-08-03"),
  }));
}
