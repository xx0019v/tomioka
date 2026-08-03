import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * SILK STORY ARCHIVE リデザインの合格条件を機械で測る。
 *
 * 手で見て「良くなった」と言うのではなく、
 * 横スクロール量・タップ領域・ボタン内改行・本文サイズ・常時ループ数を数値で出す。
 */

const baseUrl = (process.env.QA_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const outputDir = path.join(process.cwd(), "docs/qa-silk-archive/report");

const widths = [320, 360, 375, 390, 393, 430, 768, 1024, 1440];
const routes = ["/", "/map/", "/information/"];

async function hydrated(page) {
  await page.waitForFunction(
    () => {
      const hero = document.querySelector('section[aria-labelledby="hero-title"]');
      // Hero が無いページ（/map, /information）は body の描画完了で判定する
      if (!hero) return document.readyState === "complete";
      return Boolean(hero.querySelector("canvas")?.style.width);
    },
    null,
    { timeout: 20000 },
  );
}

test("横スクロールが 9 画面幅すべてで発生しない", async ({ page }, testInfo) => {
  const failures = [];
  for (const route of routes) {
    await page.goto(baseUrl + route, { waitUntil: "load" });
    await hydrated(page);
    for (const width of widths) {
      await page.setViewportSize({ width, height: 844 });
      await page.waitForTimeout(320);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      if (overflow > 1) failures.push(`${route} ${width}px: +${overflow}px`);
    }
  }
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, `overflow-${testInfo.project.name}.json`),
    JSON.stringify({ widths, routes, failures }, null, 2),
    "utf8",
  );
  expect(failures, failures.join(" / ")).toHaveLength(0);
});

test("主要操作対象が 44px 以上で、ボタン内で改行しない", async ({ page }, testInfo) => {
  const report = [];
  for (const route of routes) {
    for (const width of [320, 390, 430]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(baseUrl + route, { waitUntil: "load" });
      await hydrated(page);
      await page.waitForTimeout(500);

      const result = await page.evaluate(() => {
        const small = [];
        const wrapped = [];
        const controls = [
          ...document.querySelectorAll('a[href], button, [role="button"]'),
        ];
        for (const el of controls) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          const style = getComputedStyle(el);
          if (style.visibility === "hidden" || style.display === "none") continue;
          const label = (el.textContent ?? "").trim().slice(0, 24);
          if (r.height < 44 || r.width < 44) {
            small.push(`${label || el.tagName} ${Math.round(r.width)}x${Math.round(r.height)}`);
          }
          // ボタン内改行: テキストノードの行数を、行の上端の種類数で数える
          const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          const tops = new Set();
          let node = walker.nextNode();
          while (node) {
            if ((node.textContent ?? "").trim()) {
              const range = document.createRange();
              range.selectNodeContents(node);
              for (const rect of range.getClientRects()) {
                if (rect.width > 0) tops.add(Math.round(rect.top));
              }
            }
            node = walker.nextNode();
          }
          // 1〜2px の差は同一行のインラインボックス差。4px 超を別行とみなす
          const lines = [...tops].sort((a, b) => a - b).reduce((acc, t) => {
            if (!acc.length || t - acc[acc.length - 1] > 4) acc.push(t);
            return acc;
          }, []);
          if (lines.length > 1 && !el.closest("[data-multiline-ok]")) {
            wrapped.push(`${label || el.tagName} (${lines.length}行)`);
          }
        }
        return { small, wrapped };
      });

      report.push({ route, width, ...result });
    }
  }
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, `controls-${testInfo.project.name}.json`),
    JSON.stringify(report, null, 2),
    "utf8",
  );

  const tooSmall = report.flatMap((r) => r.small.map((s) => `${r.route}@${r.width} ${s}`));
  expect(tooSmall, tooSmall.join(" / ")).toHaveLength(0);
});

test("本文が 16px を下回らない", async ({ page }, testInfo) => {
  const offenders = [];
  for (const route of routes) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(baseUrl + route, { waitUntil: "load" });
    await hydrated(page);
    const found = await page.evaluate(() => {
      const bad = [];
      for (const el of document.querySelectorAll("p, li, dd, blockquote")) {
        // 装飾（柱・ノンブル）は読ませる文章ではないので対象外
        if (el.closest('[aria-hidden="true"]')) continue;
        const text = (el.textContent ?? "").trim();
        // 本文とみなすのは 12 文字以上のまとまった文章だけ（ラベル・柱は対象外）
        if (text.length < 12) continue;
        const size = parseFloat(getComputedStyle(el).fontSize);
        if (size < 15.5) bad.push(`${size}px "${text.slice(0, 20)}"`);
      }
      return bad;
    });
    offenders.push(...found.map((f) => `${route} ${f}`));
  }
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, `type-size-${testInfo.project.name}.json`),
    JSON.stringify(offenders, null, 2),
    "utf8",
  );
  expect(offenders, offenders.join(" / ")).toHaveLength(0);
});

test("reduced-motion では常時ループが 0 になる", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  const results = [];
  for (const route of routes) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(baseUrl + route, { waitUntil: "load" });
    await page.waitForTimeout(3000);
    const loops = await page.evaluate(
      () =>
        document.getAnimations().filter((a) => {
          if (a.playState !== "running") return false;
          const iterations = a.effect?.getTiming?.().iterations ?? 1;
          return iterations === Infinity;
        }).length,
    );
    results.push({ route, loops });
  }
  await context.close();
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, `reduced-motion-${testInfo.project.name}.json`),
    JSON.stringify(results, null, 2),
    "utf8",
  );
  const bad = results.filter((r) => r.loops > 0);
  expect(bad, JSON.stringify(bad)).toHaveLength(0);
});

test("コンソールエラーと 400 以上の応答が出ない", async ({ page }, testInfo) => {
  const errors = [];
  const badResponses = [];
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    // dev サーバの HMR ソケットは本番に存在しない
    if (m.text().includes("webpack-hmr")) return;
    errors.push(m.text().slice(0, 200));
  });
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  page.on("response", (r) => {
    if (r.status() >= 400) badResponses.push(`${r.status()} ${r.url().slice(0, 120)}`);
  });

  for (const route of routes) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(baseUrl + route, { waitUntil: "load" });
    await hydrated(page);
    await page.waitForTimeout(2500);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1200);
  }

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, `console-${testInfo.project.name}.json`),
    JSON.stringify({ errors, badResponses }, null, 2),
    "utf8",
  );
  expect(errors, errors.join(" | ")).toHaveLength(0);
  expect(badResponses, badResponses.join(" | ")).toHaveLength(0);
});
