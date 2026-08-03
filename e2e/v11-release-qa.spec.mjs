import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = (process.env.QA_BASE_URL ?? "http://127.0.0.1:3002").replace(/\/$/, "");

const viewports = [
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

const routes = ["/", "/information/", "/map/"];
// 装飾用の影・光沢にもstroke-dasharrayが付くため、実際に進捗属性を持つ芯だけを選ぶ。
const silkThreadSelector = "[data-silk-trail-thread]";
const evidenceDir = path.join(process.cwd(), "docs/qa-v11/results");

test.describe.configure({ mode: "serial" });
test.setTimeout(240_000);

async function writeEvidence(project, category, value) {
  const directory = path.join(evidenceDir, project);
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(
    path.join(directory, `${category}.json`),
    `${JSON.stringify(value, null, 2)}\n`,
  );
}

function observeFailures(page) {
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const badResponses = [];
  const origin = new URL(baseUrl).origin;

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => {
    const failure = request.failure()?.errorText ?? "unknown failure";
    const cancelledRouterPrefetch =
      request.resourceType() === "fetch" && failure.includes("ERR_ABORTED");
    if (new URL(request.url()).origin === origin && !cancelledRouterPrefetch) {
      failedRequests.push(`${request.resourceType()} ${failure} ${request.url()}`);
    }
  });
  page.on("response", (response) => {
    if (new URL(response.url()).origin === origin && response.status() >= 400) {
      badResponses.push(`${response.status()} ${response.url()}`);
    }
  });

  return { consoleErrors, pageErrors, failedRequests, badResponses };
}

async function waitForPageAssets(page) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.waitForLoadState("domcontentloaded");
    await page.locator("h1").waitFor({ state: "visible" });
    try {
      await page.evaluate(async () => {
        if (document.fonts?.ready) {
          await Promise.race([
            document.fonts.ready,
            new Promise((resolve) => setTimeout(resolve, 3_000)),
          ]);
        }
      });
      const images = page.locator("img");
      const imageCount = await images.count();
      for (let index = 0; index < imageCount; index += 1) {
        const image = images.nth(index);
        if (
          !(await image.evaluate(
            (element) =>
              new URL(element.currentSrc || element.src, location.href).origin === location.origin,
          ))
        ) {
          continue;
        }
        if (!(await image.isVisible())) continue;
        await image.scrollIntoViewIfNeeded();
        await expect
          .poll(() => image.evaluate((element) => element.naturalWidth), { timeout: 10_000 })
          .toBeGreaterThan(0);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(250);
      return;
    } catch (error) {
      if (!String(error).includes("Execution context was destroyed") || attempt === 2) throw error;
      await page.waitForTimeout(100);
    }
  }
}

async function auditLayout(page) {
  return page.evaluate(() => {
    const isVisible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== "none" &&
        style.visibility !== "hidden"
      );
    };

    const textLines = (element) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const tops = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.parentElement?.closest("[aria-hidden='true']")) continue;
        for (let index = 0; index < node.textContent.length; index += 1) {
          if (!node.textContent[index].trim()) continue;
          const range = document.createRange();
          range.setStart(node, index);
          range.setEnd(node, index + 1);
          const rect = range.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) tops.push(Math.round(rect.top));
        }
      }
      return [...new Set(tops)].sort((a, b) => a - b);
    };

    const interactive = [...document.querySelectorAll("a[href], button, [role='button']")]
      .filter(isVisible)
      .filter((element) => !element.closest(".leaflet-control-attribution"));

    const smallTargets = interactive
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width < 44 || rect.height < 44;
      })
      .map((element) => ({
        label:
          element.getAttribute("aria-label") ||
          element.textContent?.replace(/\s+/g, " ").trim() ||
          element.tagName,
        width: Math.round(element.getBoundingClientRect().width),
        height: Math.round(element.getBoundingClientRect().height),
      }));

    const wrappedButtons = interactive
      .filter((element) => !element.querySelector("small, h1, h2, h3, p"))
      .filter((element) => {
        const label = element.textContent?.replace(/\s+/g, " ").trim() ?? "";
        return label.length > 0 && label.length <= 32 && textLines(element).length > 1;
      })
      .map(
        (element) =>
          element.getAttribute("aria-label") ||
          element.textContent?.replace(/\s+/g, " ").trim() ||
          element.tagName,
      );

    const orphanCandidates = [...document.querySelectorAll("h1, h2, h3, main p")]
      .filter(isVisible)
      .filter((element) => {
        const text = element.textContent?.replace(/\s+/g, "").trim() ?? "";
        return text.length >= 8 && text.length <= 120;
      });

    const probableOrphans = orphanCandidates.flatMap((element) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const chars = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        for (let index = 0; index < node.textContent.length; index += 1) {
          const value = node.textContent[index];
          if (!value.trim()) continue;
          const range = document.createRange();
          range.setStart(node, index);
          range.setEnd(node, index + 1);
          const rect = range.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            chars.push({ value, top: Math.round(rect.top) });
          }
        }
      }
      const lines = new Map();
      for (const char of chars) {
        const line = lines.get(char.top) ?? [];
        line.push(char.value);
        lines.set(char.top, line);
      }
      if (lines.size < 2) return [];
      const last = [...lines.entries()].sort((a, b) => a[0] - b[0]).at(-1)?.[1] ?? [];
      return last.length <= 1
        ? [
            {
              text: element.textContent?.replace(/\s+/g, " ").trim().slice(0, 80),
              lastLine: last.join(""),
            },
          ]
        : [];
    });

    const brokenImages = [...document.images]
      .filter((image) => new URL(image.currentSrc || image.src, location.href).origin === location.origin)
      .filter((image) => image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src);

    return {
      overflow: Math.max(
        document.documentElement.scrollWidth,
        document.body?.scrollWidth ?? 0,
      ) - window.innerWidth,
      smallTargets,
      wrappedButtons,
      probableOrphans,
      brokenImages,
    };
  });
}

async function expectHealthyPage(audit, failures) {
  expect(audit.overflow).toBeLessThanOrEqual(0);
  expect(audit.smallTargets).toEqual([]);
  expect(audit.wrappedButtons).toEqual([]);
  expect(audit.probableOrphans).toEqual([]);
  expect(audit.brokenImages).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.failedRequests).toEqual([]);
  expect(failures.badResponses).toEqual([]);
}

test("all nine release viewports pass overflow, touch, wrapping, orphan, console, HTTP, and image gates", async ({
  browser,
}, testInfo) => {
  const results = [];
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 1,
      hasTouch: viewport.width <= 430,
      isMobile: viewport.width <= 430,
      locale: "ja-JP",
      timezoneId: "Asia/Tokyo",
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    const failures = observeFailures(page);

    await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    await waitForPageAssets(page);
    const audit = await auditLayout(page);
    await expectHealthyPage(audit, failures);
    results.push({
      viewport: `${viewport.width}x${viewport.height}`,
      overflow: audit.overflow,
      smallTargets: audit.smallTargets.length,
      wrappedButtons: audit.wrappedButtons.length,
      probableOrphans: audit.probableOrphans.length,
      brokenImages: audit.brokenImages.length,
      consoleErrors: failures.consoleErrors.length,
      pageErrors: failures.pageErrors.length,
      failedRequests: failures.failedRequests.length,
      badResponses: failures.badResponses.length,
    });
    await context.close();
  }
  await writeEvidence(testInfo.project.name, "viewports", results);
});

test("SilkTrail has five distinct scroll states and lifecycle events never create a second loop", async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await waitForPageAssets(page);
  await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });

  const thread = page.locator(silkThreadSelector).first();
  const trail = page.locator("[data-silk-trail]");
  await expect(thread).toHaveAttribute("data-progress", /\d/);
  await expect(trail).toHaveAttribute("data-loop-count", "0");

  const states = [];
  for (const percent of [0, 25, 50, 75, 100]) {
    await page.evaluate((ratio) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.round(max * ratio));
    }, percent / 100);
    await expect
      .poll(() => thread.getAttribute("data-progress"))
      .toBe((percent / 100).toFixed(3));
    states.push(
      await thread.evaluate((element) => ({
        progress: element.getAttribute("data-progress"),
        dashoffset: Number.parseFloat(element.style.strokeDashoffset),
      })),
    );
  }

  expect(new Set(states.map((state) => state.progress)).size).toBe(5);
  expect(new Set(states.map((state) => state.dashoffset.toFixed(3))).size).toBe(5);
  expect(states.map((state) => state.dashoffset)).toEqual(
    [...states.map((state) => state.dashoffset)].sort((a, b) => b - a),
  );

  await expect(trail).toHaveAttribute("data-frame-pending", "false");
  const beforeBurst = Number(await trail.getAttribute("data-request-count"));
  await page.evaluate(() => {
    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new Event("orientationchange"));
    window.dispatchEvent(new Event("orientationchange"));
    for (let index = 0; index < 2; index += 1) {
      const event = new Event("pageshow");
      Object.defineProperty(event, "persisted", { value: true });
      window.dispatchEvent(event);
    }
  });
  await expect(trail).toHaveAttribute("data-frame-pending", "false");
  await expect
    .poll(async () => Number(await trail.getAttribute("data-request-count")))
    .toBe(beforeBurst + 1);
  await expect(trail).toHaveAttribute("data-loop-count", "0");

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
  await expect(trail).toHaveAttribute("data-motion-active", "false");
  const hiddenCount = Number(await trail.getAttribute("data-request-count"));
  await page.evaluate(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, Math.round(max * 0.25));
  });
  await page.waitForTimeout(100);
  expect(Number(await trail.getAttribute("data-request-count"))).toBe(hiddenCount);

  await page.evaluate(() => {
    delete document.hidden;
    delete document.visibilityState;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(trail).toHaveAttribute("data-motion-active", "true");
  await expect
    .poll(async () => Number(await trail.getAttribute("data-request-count")))
    .toBe(hiddenCount + 1);
  await expect(trail).toHaveAttribute("data-frame-pending", "false");
  await page.waitForTimeout(250);
  const restoredCount = Number(await trail.getAttribute("data-request-count"));
  expect(restoredCount).toBe(hiddenCount + 1);
  await expect(trail).toHaveAttribute("data-loop-count", "0");

  await writeEvidence(testInfo.project.name, "silk-trail", {
    states,
    lifecycle: {
      beforeBurst,
      afterBurst: beforeBurst + 1,
      hiddenStart: hiddenCount,
      restored: restoredCount,
      idleAfterRestore: restoredCount,
      loopCount: 0,
    },
  });
  await context.close();
});

test("reduced motion has no infinite animation and leaves the complete silk thread visible", async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await waitForPageAssets(page);

  const reduced = await page.evaluate((selector) => {
    const thread = document.querySelector(selector);
    const trail = document.querySelector("[data-silk-trail]");
    const animations = document.getAnimations();
    return {
      mediaMatches: matchMedia("(prefers-reduced-motion: reduce)").matches,
      running: animations.filter((animation) => animation.playState === "running").length,
      infinite: animations.filter((animation) => {
        const iterations = animation.effect?.getTiming().iterations;
        return iterations === Infinity || Number(iterations) > 8;
      }).length,
      autoplayVideos: [...document.querySelectorAll("video")].filter((video) => !video.paused)
        .length,
      progress: thread?.getAttribute("data-progress"),
      dashoffset: Number.parseFloat(thread?.style.strokeDashoffset ?? "NaN"),
      motionActive: trail?.getAttribute("data-motion-active"),
      loopCount: trail?.getAttribute("data-loop-count"),
    };
  }, silkThreadSelector);

  expect(reduced).toEqual({
    mediaMatches: true,
    running: 0,
    infinite: 0,
    autoplayVideos: 0,
    progress: "1.000",
    dashoffset: 0,
    motionActive: "false",
    loopCount: "0",
  });
  await writeEvidence(testInfo.project.name, "reduced-motion", reduced);
  await context.close();
});

test("all primary routes have healthy local HTTP and image resources", async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const results = [];

  for (const route of routes) {
    const failures = observeFailures(page);
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    await waitForPageAssets(page);
    const audit = await auditLayout(page);
    expect(audit.brokenImages).toEqual([]);
    expect(failures.consoleErrors).toEqual([]);
    expect(failures.pageErrors).toEqual([]);
    expect(failures.failedRequests).toEqual([]);
    expect(failures.badResponses).toEqual([]);
    results.push({
      route,
      status: response?.status(),
      brokenImages: audit.brokenImages.length,
      consoleErrors: failures.consoleErrors.length,
      pageErrors: failures.pageErrors.length,
      failedRequests: failures.failedRequests.length,
      badResponses: failures.badResponses.length,
    });
  }
  await writeEvidence(testInfo.project.name, "routes", results);
  await context.close();
});

test("the primary touch map flow remains operable through mode, spot, history, and focus changes", async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    hasTouch: true,
    isMobile: true,
    permissions: ["geolocation"],
    geolocation: { latitude: 36.2598, longitude: 138.8891 },
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/map/`, { waitUntil: "domcontentloaded" });
  await page.locator("[data-map-interaction]").waitFor({ state: "visible" });

  const enable = page.getByRole("button", { name: "地図を操作" });
  await expect(enable).toHaveAttribute("aria-pressed", "false");
  await enable.click();
  const disable = page.getByRole("button", { name: "操作を終了" });
  await expect(disable).toHaveAttribute("aria-pressed", "true");
  await disable.click();
  await expect(enable).toHaveAttribute("aria-pressed", "false");

  const spotButton = page.getByRole("button", { name: "街 アトリエ 街歩きスポット" });
  await spotButton.click();
  await expect(page).toHaveURL(/spot=atelier/);
  const sheet = page.locator("aside[aria-label='アトリエのスポット案内']");
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole("link", { name: "Googleマップで開く" })).toHaveAttribute(
    "target",
    "_blank",
  );
  await page.keyboard.press("Escape");
  await expect(page).not.toHaveURL(/spot=/);
  await expect(spotButton).toBeFocused();

  await page.getByRole("button", { name: "現在地を地図に表示する" }).click();
  await expect(page.locator(".map-user-dot")).toBeVisible();

  await page.setViewportSize({ width: 852, height: 393 });
  await page.waitForTimeout(100);
  const landscapeOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(landscapeOverflow).toBeLessThanOrEqual(0);
  await writeEvidence(testInfo.project.name, "map", {
    interactionModeToggled: true,
    spotHistoryAndFocusRestored: true,
    geolocationMarkerVisible: true,
    landscapeOverflow,
  });
  await context.close();
});
