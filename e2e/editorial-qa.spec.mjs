import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.QA_BASE_URL ?? "http://127.0.0.1:3002";
const outputDir = path.join(
  process.cwd(),
  "docs/qa/2026-07-29-post-release-audit/final",
);

const routes = [
  { name: "home", path: "/", canonical: "https://mayu-no-chizu.cid-ac.com/" },
  { name: "map", path: "/map/", canonical: "https://mayu-no-chizu.cid-ac.com/map/" },
  {
    name: "information",
    path: "/information/",
    canonical: "https://mayu-no-chizu.cid-ac.com/information/",
  },
];

const viewports = [
  { width: 320, height: 568 },
  { width: 360, height: 800 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 393, height: 852 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

test.describe.configure({ mode: "serial" });
test.setTimeout(180_000);

test.beforeAll(async () => {
  await fs.mkdir(outputDir, { recursive: true });
});

test("three routes remain stable across the final viewport matrix", async ({ browser }) => {
  const results = [];

  for (const route of routes) {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport,
        deviceScaleFactor: 1,
        colorScheme: "light",
        hasTouch: viewport.width <= 430,
        isMobile: viewport.width <= 430,
      });
      const page = await context.newPage();
      const consoleErrors = [];
      const failedResponses = [];

      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });
      page.on("response", (response) => {
        if (response.status() >= 400) {
          failedResponses.push(`${response.status()} ${response.url()}`);
        }
      });

      await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle" });
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", route.canonical);
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", route.canonical);

      const audit = await page.evaluate(() => {
        const interactive = [...document.querySelectorAll("a, button")].filter((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return style.display !== "none" && rect.width > 0 && rect.height > 0;
        });

        return {
          overflow:
            document.documentElement.scrollWidth - document.documentElement.clientWidth,
          smallTargets: interactive
            .filter((element) => {
              const rect = element.getBoundingClientRect();
              return rect.width < 44 || rect.height < 44;
            })
            .map((element) => element.textContent?.trim() ?? ""),
          punctuatedLabels: interactive
            .map((element) => element.textContent?.trim() ?? "")
            .filter((label) => /[。、！？]$/.test(label)),
        };
      });

      expect(audit.overflow).toBe(0);
      expect(audit.smallTargets).toEqual([]);
      expect(audit.punctuatedLabels).toEqual([]);
      expect(consoleErrors).toEqual([]);
      expect(failedResponses).toEqual([]);

      await page.screenshot({
        path: path.join(
          outputDir,
          `${route.name}-${viewport.width}x${viewport.height}.jpg`,
        ),
        fullPage: true,
        quality: 82,
        type: "jpeg",
      });

      results.push({
        route: route.name,
        viewport: `${viewport.width}x${viewport.height}`,
        ...audit,
        consoleErrors: consoleErrors.length,
        failedResponses: failedResponses.length,
      });
      await context.close();
    }
  }

  await fs.writeFile(
    path.join(outputDir, "audit-results.json"),
    `${JSON.stringify(results, null, 2)}\n`,
  );
});

test("reduced motion preserves the complete announcement content", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  const audit = await page.evaluate(() => ({
    activeFields: [...document.querySelectorAll("[data-motion-ready]")].filter(
      (element) => element.getAttribute("data-active") === "true",
    ).length,
    infiniteAnimations: document
      .getAnimations()
      .filter((animation) => animation.effect?.getTiming().iterations === Infinity)
      .length,
    hiddenHeadings: [...document.querySelectorAll("h1, h2")].filter(
      (element) => getComputedStyle(element).visibility === "hidden",
    ).length,
  }));

  expect(audit.activeFields).toBe(0);
  expect(audit.infiniteAnimations).toBe(0);
  expect(audit.hiddenHeadings).toBe(0);
  await context.close();
});

test("official event access information stays consistent across routes", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();

  for (const route of ["/", "/information/"]) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    await expect(page.getByText("群馬県富岡市富岡1151-1", { exact: true })).toBeVisible();
    await expect(page.getByText("上信電鉄 上州富岡駅から徒歩約5分", { exact: true })).toBeVisible();
    await expect(page.getByText("群馬県富岡市富岡1430-1", { exact: true })).toHaveCount(0);
    await expect(page.getByText("上信電鉄 上州富岡駅から徒歩約10分", { exact: true })).toHaveCount(0);

    const mapLink = page.getByRole("link", { name: "Googleマップで開く" });
    await expect(mapLink).toHaveCount(1);
    const href = await mapLink.getAttribute("href");
    expect(decodeURIComponent(href ?? "")).toContain("お富ちゃん家 富岡市観光案内所 群馬県富岡市富岡1151-1");
  }

  await page.goto(`${baseUrl}/map/?spot=otomi-chan-ie`, { waitUntil: "networkidle" });
  const detail = page.locator("aside[aria-label='お富ちゃん家のスポット案内']");
  await expect(detail).toBeVisible();
  await expect(detail.getByText("群馬県富岡市富岡1151-1", { exact: true })).toBeVisible();
  await expect(detail.getByText("上信電鉄 上州富岡駅から徒歩約5分", { exact: true })).toBeVisible();
  const detailMapLink = detail.getByRole("link", { name: "Googleマップで開く" });
  const detailHref = await detailMapLink.getAttribute("href");
  expect(decodeURIComponent(detailHref ?? "")).toContain("群馬県富岡市富岡1151-1");

  await context.close();
});

test("hidden tabs pause every persistent decorative motion state", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  const routeMotion = page.locator("[data-motion-active]");
  await routeMotion.scrollIntoViewIfNeeded();
  await expect(routeMotion).toHaveAttribute("data-motion-active", "true");

  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });

  const hiddenState = await page.evaluate(() => ({
    activeFields: [...document.querySelectorAll("[data-motion-ready]")].filter(
      (element) => element.getAttribute("data-active") === "true",
    ).length,
    activeRoutes: [...document.querySelectorAll("[data-motion-active='true']")].length,
    activeMaps: [...document.querySelectorAll("[data-map-visible='true']")].length,
    activeHeroes: [...document.querySelectorAll("[data-in-view='true']")].length,
  }));

  expect(hiddenState).toEqual({
    activeFields: 0,
    activeRoutes: 0,
    activeMaps: 0,
    activeHeroes: 0,
  });
  await context.close();
});
