import type { MetadataRoute } from "next";
import { withBasePath } from "@/lib/base-path";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "繭が遺した地図",
    short_name: "繭の地図",
    description: "富岡製糸場周辺商店街を巡るリアル謎解きイベント",
    start_url: withBasePath("/"),
    display: "standalone",
    background_color: "#f4f0e7",
    theme_color: "#0c241f",
    lang: "ja",
  };
}
