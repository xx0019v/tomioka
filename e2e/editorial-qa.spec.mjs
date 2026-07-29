import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.QA_BASE_URL ?? "http://127.0.0.1:3002";
const outputDir = path.join(
  process.cwd(),
  "docs/qa/2026-07-29-editorial-v07/round3-production",
);

const routes = [
  { name: "home", path: "/" },
  { name: "map", path: "/map/" },
  { name: "information", path: "/information/" },
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
