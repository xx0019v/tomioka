import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { gzipSync } from "node:zlib";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const outDir = path.join(root, "out");
const baselineFile = path.join(root, "docs/qa-threejs-baseline/metrics/build.json");
const compareMode = process.argv.includes("--compare");
const captureMode = process.env.THREEJS_CAPTURE_BASELINE === "1";
const officialUrl = "https://mayu-no-chizu.cid-ac.com/";
const legacyUrl = "https://xx0019v.github.io/tomioka";

async function filesBelow(directory, prefix = "") {
  const output = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const relative = path.join(prefix, entry.name);
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await filesBelow(absolute, relative)));
    else output.push({ relative, absolute });
  }
  return output;
}

const files = await filesBelow(outDir);
const rows = await Promise.all(
  files.map(async (file) => {
    const buffer = await fs.readFile(file.absolute);
    return {
      path: file.relative.split(path.sep).join("/"),
      bytes: buffer.byteLength,
      gzipBytes: /\.(?:js|css|html|json|xml|txt)$/.test(file.relative)
        ? gzipSync(buffer, { level: 9 }).byteLength
        : null,
    };
  }),
);

const textRows = rows.filter(({ path: file }) => /\.(?:html|js|json|txt|xml)$/i.test(file));
const textEntries = await Promise.all(
  textRows.map(async ({ path: file }) => ({ file, text: await fs.readFile(path.join(outDir, file), "utf8") })),
);
const indexHtml = textEntries.find(({ file }) => file === "index.html")?.text ?? "";
const robotsText = textEntries.find(({ file }) => file === "robots.txt")?.text ?? "";
const sitemapText = textEntries.find(({ file }) => file === "sitemap.xml")?.text ?? "";
const legacyMatches = textEntries
  .filter(({ text }) => text.includes(legacyUrl))
  .map(({ file }) => file);

function sum(filter, field = "bytes") {
  return rows.filter(({ path: file }) => filter.test(file)).reduce((total, row) => total + (row[field] ?? 0), 0);
}

const report = {
  schemaVersion: 1,
  commit: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  fileCount: rows.length,
  totalBytes: rows.reduce((total, row) => total + row.bytes, 0),
  javascript: {
    files: rows.filter(({ path: file }) => file.endsWith(".js")).length,
    bytes: sum(/\.js$/),
    gzipBytes: sum(/\.js$/, "gzipBytes"),
    largest: rows
      .filter(({ path: file }) => file.endsWith(".js"))
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 10),
  },
  css: { bytes: sum(/\.css$/), gzipBytes: sum(/\.css$/, "gzipBytes") },
  html: { files: rows.filter(({ path: file }) => file.endsWith(".html")).length, bytes: sum(/\.html$/) },
  images: { files: rows.filter(({ path: file }) => /\.(?:png|jpe?g|webp|avif|gif)$/i.test(file)).length, bytes: sum(/\.(?:png|jpe?g|webp|avif|gif)$/i) },
  sourceMaps: rows.filter(({ path: file }) => file.endsWith(".map")).length,
  requiredExports: {
    index: rows.some(({ path: file }) => file === "index.html"),
    map: rows.some(({ path: file }) => file === "map/index.html"),
    information: rows.some(({ path: file }) => file === "information/index.html"),
    notFound: rows.some(({ path: file }) => file === "404.html"),
    robots: rows.some(({ path: file }) => file === "robots.txt"),
    sitemap: rows.some(({ path: file }) => file === "sitemap.xml"),
    noJekyll: rows.some(({ path: file }) => file === ".nojekyll"),
  },
  officialUrlIntegrity: {
    officialUrl,
    canonical: indexHtml.includes(`<link rel="canonical" href="${officialUrl}"`),
    openGraph: indexHtml.includes(`<meta property="og:url" content="${officialUrl}"`),
    robotsSitemap: robotsText.includes(`${officialUrl}sitemap.xml`),
    sitemapHome: sitemapText.includes(`<loc>${officialUrl}</loc>`),
    legacyUrlMatches: legacyMatches,
  },
};

const serialized = `${JSON.stringify(report, null, 2)}\n`;
if (captureMode) {
  await fs.mkdir(path.dirname(baselineFile), { recursive: true });
  await fs.writeFile(baselineFile, serialized);
  process.stdout.write(`Captured build baseline: ${path.relative(root, baselineFile)}\n`);
} else {
  const output = path.join(root, "test-results/threejs-acceptance/build-metrics.json");
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, serialized);
  process.stdout.write(`Wrote current build metrics: ${path.relative(root, output)}\n`);
}

if (compareMode) {
  const baseline = JSON.parse(await fs.readFile(baselineFile, "utf8"));
  const failures = [];
  const check = (condition, message) => {
    if (!condition) failures.push(message);
  };
  check(report.javascript.gzipBytes <= baseline.javascript.gzipBytes + 250_000, "gzip JavaScript grew by more than 250 KB");
  check(report.totalBytes <= baseline.totalBytes + 2_000_000, "static export grew by more than 2 MB");
  check(report.html.bytes <= baseline.html.bytes + 50_000, "HTML grew by more than 50 KB");
  check(report.sourceMaps === 0, "production export contains source maps");
  check(Object.values(report.requiredExports).every(Boolean), "required exported route or .nojekyll is missing");
  check(
    Object.entries(report.officialUrlIntegrity)
      .filter(([key]) => !["officialUrl", "legacyUrlMatches"].includes(key))
      .every(([, value]) => value === true),
    "canonical, Open Graph, robots, or sitemap does not use the official URL",
  );
  check(report.officialUrlIntegrity.legacyUrlMatches.length === 0, "legacy GitHub Pages URL remains in the export");
  if (failures.length) {
    process.stderr.write(`${failures.map((failure) => `FAIL: ${failure}`).join("\n")}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write("PASS: build-size and export-integrity budgets\n");
  }
}
