import { expect, test } from "@playwright/test";

const baseUrl = process.env.QA_BASE_URL ?? "http://localhost:3000";
const productionUrl = "https://mayu-no-chizu.cid-ac.com/";
const matrix = [
  { width: 320, height: 568 },
  { width: 360, height: 800 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 393, height: 852 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];

const screenshotRounds = new Map([
  [320, "round-04-320x568-fixed"],
  [360, "round-02-360x800"],
  [390, "round-01-390x844"],
  [768, "round-05-768x1024"],
  [1024, "round-03-1024x768"],
  [1440, "round-06-1440x900"],
]);

test.setTimeout(180_000);

test("hero has no collisions across the release viewport matrix", async ({ browser }, testInfo) => {
  for (const viewport of matrix) {
    const context = await browser.newContext({
      viewport,
      hasTouch: viewport.width <= 430,
      locale: "ja-JP",
      timezoneId: "Asia/Tokyo",
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

    const response = await page.goto(baseUrl, { waitUntil: "networkidle" });
    expect(response?.status()).toBeLessThan(400);
    await page.locator("#hero-title").waitFor({ state: "visible" });
    await page.waitForTimeout(1_200);

    const audit = await page.evaluate(() => {
      const hero = document.querySelector('section[aria-labelledby="hero-title"]');
      if (!hero) throw new Error("hero not found");
      const selectors = [
        "#hero-title",
        'a[href="/information/"]',
        'a[href="/map/"]',
        "strong",
        'aside[aria-label="きぬの街歩き案内"]',
        'dl[aria-label="イベント基本情報"]',
      ];
      const elements = selectors.map((selector) => hero.querySelector(selector));
      const rect = (element) => {
        if (!element) return null;
        const bounds = element.getBoundingClientRect();
        return {
          left: bounds.left,
          top: bounds.top,
          right: bounds.right,
          bottom: bounds.bottom,
          width: bounds.width,
          height: bounds.height,
        };
      };
      const rects = elements.map(rect);
      const collision = (a, b) => {
        if (!a || !b) return 0;
        return (
          Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
          Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
        );
      };
      const collisions = rects.flatMap((a, index) =>
        rects
          .slice(index + 1)
          .map((b, offset) => ({
            pair: [selectors[index], selectors[index + offset + 1]],
            area: collision(a, b),
          }))
          .filter(({ area }) => area > 0),
      );
      const actions = [...hero.querySelectorAll("a, button")];
      const links = [...hero.querySelectorAll("a")];
      const guide = hero.querySelector('aside[aria-label="きぬの街歩き案内"]');
      const facts = hero.querySelector('dl[aria-label="イベント基本情報"]');
      const bottomNav = document.querySelector('nav[aria-label="ページ内ナビゲーション"]');
      const navRect = rect(bottomNav);
      const linkRects = links.map(rect);

      return {
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        collisions,
        wrappedLinks: links
          .filter((link) => link.scrollHeight > link.clientHeight + 1)
          .map((link) => link.textContent?.trim()),
        shortActions: actions
          .filter((action) => {
            const bounds = action.getBoundingClientRect();
            return bounds.width < 44 || bounds.height < 44;
          })
          .map((action) => action.getAttribute("aria-label") || action.textContent?.trim()),
        leadFontSize: Number.parseFloat(
          getComputedStyle(hero.querySelector("h1 + p + p")).fontSize,
        ),
        guideBottom: rect(guide)?.bottom ?? null,
        factsTop: rect(facts)?.top ?? null,
        shortViewportClearance:
          window.innerWidth === 320 && navRect
            ? Math.min(...linkRects.map((item) => navRect.top - item.bottom))
            : null,
      };
    });

    expect(audit.overflow).toBe(0);
    expect(audit.collisions).toEqual([]);
    expect(audit.wrappedLinks).toEqual([]);
    expect(audit.shortActions).toEqual([]);
    expect(audit.leadFontSize).toBeGreaterThanOrEqual(16);
    expect(audit.guideBottom).toBeLessThanOrEqual(audit.factsTop);
    if (viewport.width === 320) {
      expect(audit.shortViewportClearance).toBeGreaterThanOrEqual(8);
    }
    expect(consoleErrors).toEqual([]);
    expect(failedResponses).toEqual([]);

    if (testInfo.project.name === "chromium" && screenshotRounds.has(viewport.width)) {
      await page.screenshot({
        path: `docs/qa-hero-fix/${screenshotRounds.get(viewport.width)}.png`,
        fullPage: false,
        animations: "disabled",
      });
    }
    await context.close();
  }
});

test("landscape layout remains unobstructed", async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  const result = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    titleVisible: document.querySelector("#hero-title")?.getBoundingClientRect().height > 0,
  }));
  expect(result).toEqual({ overflow: 0, titleVisible: true });
});

test("reduced motion exposes the final hero with zero continuous animations", async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  const hero = page.locator('section[aria-labelledby="hero-title"]');
  const motion = await hero.evaluate((element) => ({
    running: element
      .getAnimations({ subtree: true })
      .filter((animation) => animation.playState === "running").length,
    titleOpacity: getComputedStyle(element.querySelector("#hero-title")).opacity,
    visibleText: element.textContent?.includes("繭が遺した"),
  }));
  expect(motion).toEqual({ running: 0, titleOpacity: "1", visibleText: true });
  if (testInfo.project.name === "chromium") {
    await page.screenshot({
      path: "docs/qa-hero-fix/reduced-motion-390x844.png",
      fullPage: false,
      animations: "disabled",
    });
  }
  await context.close();
});

test("production baseline screenshots document the original collision-prone structure", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "one browser is enough for baseline evidence");
  for (const viewport of [
    { width: 390, height: 844, name: "before-production-390x844" },
    { width: 1440, height: 900, name: "before-production-1440x900" },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(productionUrl, { waitUntil: "networkidle" });
    await page.waitForTimeout(1_200);
    await page.screenshot({
      path: `docs/qa-hero-fix/${viewport.name}.png`,
      fullPage: false,
      animations: "disabled",
    });
  }
});
