import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.QA_BASE_URL ?? "http://127.0.0.1:3000";
const phase = process.env.TEACHER_QA_PHASE ?? "after";
const strict = phase === "after";
const outputDir = path.join(process.cwd(), "docs/qa-teacher-feedback", phase);

const viewports = [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

test.describe.configure({ mode: "serial" });
test.setTimeout(180_000);

test.beforeAll(async () => {
  await fs.mkdir(outputDir, { recursive: true });
});

async function settle(page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        scroll-behavior: auto !important;
      }
      * { caret-color: transparent !important; }
    `,
  });
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(
          [...document.images]
            .filter((image) => image.complete && image.naturalWidth > 0)
            .map((image) => image.decode?.().catch(() => undefined)),
        );
      });
      break;
    } catch (error) {
      if (attempt === 1 || !String(error).includes("Execution context was destroyed")) throw error;
      await page.waitForLoadState("domcontentloaded");
    }
  }
}

async function lineCount(locator) {
  return locator.evaluate((element) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const tops = new Set();
    while (walker.nextNode()) {
      const node = walker.currentNode;
      for (let index = 0; index < node.textContent.length; index += 1) {
        if (!node.textContent[index].trim()) continue;
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + 1);
        const rect = range.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) tops.add(Math.round(rect.top));
      }
    }
    return tops.size;
  });
}

async function auditHome(page) {
  return page.evaluate(() => {
    const howTo = document.querySelector("#how-to-play");
    const steps = howTo?.querySelector("ol");
    const line = steps ? getComputedStyle(steps, "::before") : null;
    const stepsRect = steps?.getBoundingClientRect();
    const howToRect = howTo?.getBoundingClientRect();
    const lineContainingLeft = getComputedStyle(steps).position === "static"
      ? howToRect?.left ?? 0
      : stepsRect?.left ?? 0;
    const lineX = line ? lineContainingLeft + Number.parseFloat(line.left) : null;
    const numberRects = [...(steps?.querySelectorAll("li > div:first-child > span") ?? [])]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          text: element.textContent,
          left: rect.left,
          right: rect.right,
          overlapsLine: lineX !== null && lineX >= rect.left && lineX <= rect.right,
        };
      });

    const arrivalRoute = document.querySelector("#access nav");
    const routeLineIntersections = [...(arrivalRoute?.querySelectorAll("li") ?? [])]
      .slice(0, -1)
      .map((item) => {
        const itemRect = item.getBoundingClientRect();
        const labelRect = item.querySelector("strong")?.getBoundingClientRect();
        const decoration = getComputedStyle(item, "::after");
        const lineY = itemRect.top + Number.parseFloat(decoration.top);
        const lineStart = itemRect.left + Number.parseFloat(decoration.left);
        const lineEnd = itemRect.right - Number.parseFloat(decoration.right);
        return Boolean(
          labelRect &&
          lineY >= labelRect.top &&
          lineY <= labelRect.bottom &&
          lineEnd >= labelRect.left &&
          lineStart <= labelRect.right,
        );
      });

    const japaneseUnits = [...document.querySelectorAll("[data-ja-unit]")].map((element) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const lineTops = new Set();
      while (walker.nextNode()) {
        const node = walker.currentNode;
        for (let index = 0; index < (node.textContent?.length ?? 0); index += 1) {
          if (!node.textContent?.[index]?.trim()) continue;
          const range = document.createRange();
          range.setStart(node, index);
          range.setEnd(node, index + 1);
          const rect = range.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) lineTops.add(Math.round(rect.top));
        }
      }
      const rect = element.getBoundingClientRect();
      return {
        unit: element.getAttribute("data-ja-unit"),
        text: element.textContent,
        lineCount: lineTops.size,
        insideViewport: rect.left >= -0.5 && rect.right <= innerWidth + 0.5,
      };
    });

    return {
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      stepNumberLineOverlaps: numberRects,
      routeLineIntersections,
      japaneseUnits,
      canonical: document.querySelector("link[rel='canonical']")?.href ?? null,
      openGraphUrl: document.querySelector("meta[property='og:url']")?.content ?? null,
      footerUrl: document.querySelector("footer a[href^='https://mayu-no-chizu.cid-ac.com']")?.href ?? null,
    };
  });
}

test("specified viewport matrix passes the six teacher-feedback gates", async ({ browser }, testInfo) => {
  const results = [];

  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 1,
      hasTouch: viewport.width <= 430,
      isMobile: viewport.width <= 430,
      locale: "ja-JP",
      timezoneId: "Asia/Tokyo",
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    await settle(page);
    const home = await auditHome(page);
    const facilityLines = {};
    if (viewport.width >= 1024) {
      for (const name of ["お富ちゃん家", "アトリエ", "岡重", "銀座まちなか交流館", "キリンヤ", "カフェドローム"]) {
        facilityLines[name] = await lineCount(page.getByText(name, { exact: true }).first());
      }
    }

    await page.goto(`${baseUrl}/map/`, { waitUntil: "domcontentloaded" });
    await settle(page);
    const mapSection = page.locator("section[aria-labelledby='map-heading']");
    await mapSection.scrollIntoViewIfNeeded();
    await expect(page.locator(".leaflet-container")).toBeVisible();
    const map = await page.evaluate(() => {
      const shell = document.querySelector("section[aria-labelledby='map-heading'] > div:nth-child(2)");
      const stage = shell?.firstElementChild;
      const panel = shell?.querySelector("aside");
      const shellRect = shell?.getBoundingClientRect();
      const stageRect = stage?.getBoundingClientRect();
      const panelRect = panel?.getBoundingClientRect();
      const markers = [...document.querySelectorAll(".map-marker-shell")].map((marker) => {
        const rect = marker.getBoundingClientRect();
        return {
          label: marker.getAttribute("aria-label"),
          latitude: Number(marker.getAttribute("data-latitude")),
          longitude: Number(marker.getAttribute("data-longitude")),
          width: rect.width,
          height: rect.height,
        };
      });
      return {
        overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
        shellHeight: shellRect?.height ?? 0,
        stageHeight: stageRect?.height ?? 0,
        panelHeight: panelRect?.height ?? 0,
        trailingGap: shellRect && panelRect ? Math.round(shellRect.bottom - panelRect.bottom) : null,
        panelPosition: panel ? getComputedStyle(panel).position : null,
        markers,
      };
    });

    results.push({ viewport: `${viewport.width}x${viewport.height}`, home, facilityLines, map });

    if (strict) {
      expect(home.overflow).toBeLessThanOrEqual(0);
      expect(map.overflow).toBeLessThanOrEqual(0);
      if (viewport.width <= 430) {
        expect(home.stepNumberLineOverlaps.every((item) => !item.overlapsLine)).toBe(true);
        expect(map.panelPosition).toBe("relative");
        expect(Math.abs(map.trailingGap ?? 999)).toBeLessThanOrEqual(1);
      }
      if (viewport.width >= 1024) {
        expect(Object.values(facilityLines).every((lines) => lines === 1)).toBe(true);
        expect(home.routeLineIntersections.every((value) => !value)).toBe(true);
      }
      expect(home.canonical).toBe("https://mayu-no-chizu.cid-ac.com/");
      expect(home.openGraphUrl).toBe("https://mayu-no-chizu.cid-ac.com/");
      expect(home.footerUrl).toBe("https://mayu-no-chizu.cid-ac.com/");
      if (viewport.width <= 430) {
        expect(home.japaneseUnits.length).toBeGreaterThanOrEqual(7);
        expect(home.japaneseUnits.every((unit) => unit.lineCount === 1 && unit.insideViewport)).toBe(true);
        expect(home.japaneseUnits.some((unit) => unit.unit === "永山 繭" && unit.text === "永山 繭")).toBe(true);
      }
      expect(map.markers).toHaveLength(6);
      expect(map.markers.every((marker) => marker.width === 56 && marker.height === 62)).toBe(true);
      expect(map.markers.find((marker) => marker.label?.startsWith("お富ちゃん家"))).toMatchObject({
        latitude: 36.2561208,
        longitude: 138.8914794,
      });
      expect(map.markers.find((marker) => marker.label?.startsWith("キリンヤ"))).toMatchObject({
        latitude: 36.25773372,
        longitude: 138.88893693,
      });
      expect(map.markers.find((marker) => marker.label?.startsWith("カフェドローム"))).toMatchObject({
        latitude: 36.255608,
        longitude: 138.889552,
      });
    }
    await context.close();
  }

  await fs.writeFile(
    path.join(outputDir, `report-${testInfo.project.name}.json`),
    JSON.stringify(results, null, 2),
  );
});

test("map marker tips remain on their geographic anchor throughout normal motion", async ({ browser }, testInfo) => {
  const results = [];
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
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
    await page.goto(`${baseUrl}/map/`, { waitUntil: "domcontentloaded" });
    await page.locator("section[aria-labelledby='map-heading']").scrollIntoViewIfNeeded();
    await expect(page.locator(".leaflet-container")).toBeVisible();
    await page.waitForFunction(() => document.querySelector("[data-map-visible='true'] .map-marker-glyph")?.getAnimations().length);

    const motion = await page.evaluate(async () => {
      const shell = document.querySelector("[data-map-visible='true'] .map-marker-shell");
      const marker = shell?.querySelector(".map-marker");
      const glyph = shell?.querySelector(".map-marker-glyph");
      const animation = glyph?.getAnimations().find((item) => item.animationName === "mapMarkerGlyphFloat");
      if (!shell || !marker || !glyph || !animation) return null;

      const duration = Number(animation.effect?.getComputedTiming().duration);
      animation.pause();
      const samples = [];
      for (const progress of [0, 0.999]) {
        animation.currentTime = duration * progress;
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const shellRect = shell.getBoundingClientRect();
        const markerRect = marker.getBoundingClientRect();
        const glyphRect = glyph.getBoundingClientRect();
        const tail = getComputedStyle(marker, "::after");
        const tipY = markerRect.bottom - Number.parseFloat(tail.bottom);
        samples.push({
          shellBottom: shellRect.bottom,
          markerBottom: markerRect.bottom,
          tipY,
          anchorError: Math.abs(tipY - shellRect.bottom),
          glyphTop: glyphRect.top,
        });
      }
      animation.play();
      return samples;
    });

    expect(motion).not.toBeNull();
    expect(Math.abs(motion[1].shellBottom - motion[0].shellBottom)).toBeLessThanOrEqual(0.1);
    expect(Math.abs(motion[1].markerBottom - motion[0].markerBottom)).toBeLessThanOrEqual(0.1);
    expect(Math.abs(motion[1].tipY - motion[0].tipY)).toBeLessThanOrEqual(0.1);
    expect(Math.max(...motion.map((sample) => sample.anchorError))).toBeLessThanOrEqual(0.25);
    expect(Math.abs(motion[1].glyphTop - motion[0].glyphTop)).toBeGreaterThanOrEqual(1.5);
    results.push({ viewport: `${viewport.width}x${viewport.height}`, samples: motion });
    await context.close();
  }
  await fs.writeFile(
    path.join(outputDir, `marker-motion-${testInfo.project.name}.json`),
    JSON.stringify(results, null, 2),
  );
});

test("mobile map list and detail reach their real scroll end", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
    locale: "ja-JP",
    timezoneId: "Asia/Tokyo",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/map/`, { waitUntil: "domcontentloaded" });
  await settle(page);
  const panel = page.locator("section[aria-labelledby='map-heading'] aside:not([data-placement])");
  await panel.scrollIntoViewIfNeeded();

  const listEnd = await panel.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
    return {
      position: getComputedStyle(element).position,
      remaining: element.scrollHeight - element.clientHeight - element.scrollTop,
    };
  });
  const lastSpot = page.getByRole("button", { name: /カフェドローム/ }).last();
  await lastSpot.scrollIntoViewIfNeeded();
  await lastSpot.click();
  await expect(page.getByRole("heading", { name: /CAFÉ DRÔME|カフェドローム/ })).toBeVisible();

  const detailEnd = await panel.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
    return {
      position: getComputedStyle(element).position,
      remaining: element.scrollHeight - element.clientHeight - element.scrollTop,
    };
  });
  await expect(panel.getByRole("link", { name: /Googleマップ/ })).toBeVisible();

  if (strict) {
    expect(listEnd.position).toBe("relative");
    expect(listEnd.remaining).toBeLessThanOrEqual(1);
    expect(detailEnd.position).toBe("absolute");
    expect(detailEnd.remaining).toBeLessThanOrEqual(1);
  }
  await context.close();
});

test("captures focused before-and-after evidence", async ({ browser }, testInfo) => {
  const shots = [
    { path: "/", width: 320, height: 568, selector: "#discover", name: "japanese-wrap-discover-mobile" },
    { path: "/", width: 320, height: 568, selector: "#story", name: "japanese-wrap-story-mobile" },
    { path: "/", width: 320, height: 568, selector: "#how-to-play", name: "japanese-wrap-how-to-mobile" },
    { path: "/", width: 375, height: 667, selector: "#how-to-play", name: "section-3-how-to-mobile" },
    { path: "/", width: 1440, height: 900, selector: "#route", name: "section-4-facilities-desktop" },
    { path: "/", width: 1440, height: 900, selector: "#access nav", name: "section-5-route-line-desktop" },
    { path: "/", width: 390, height: 844, selector: "footer", name: "section-6-url-mobile" },
    { path: "/map/", width: 390, height: 844, selector: "section[aria-labelledby='map-heading']", name: "map-mobile" },
    { path: "/map/", width: 1440, height: 900, selector: "section[aria-labelledby='map-heading']", name: "map-desktop" },
  ];

  for (const shot of shots) {
    const context = await browser.newContext({
      viewport: { width: shot.width, height: shot.height },
      deviceScaleFactor: 1,
      hasTouch: shot.width <= 430,
      isMobile: shot.width <= 430,
      locale: "ja-JP",
      timezoneId: "Asia/Tokyo",
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto(`${baseUrl}${shot.path}`, { waitUntil: "domcontentloaded" });
    await settle(page);
    const target = page.locator(shot.selector).first();
    await target.scrollIntoViewIfNeeded();
    await target.screenshot({
      path: path.join(outputDir, `${shot.name}__${shot.width}w__${testInfo.project.name}.png`),
      animations: "disabled",
      caret: "hide",
    });
    await context.close();
  }
});
