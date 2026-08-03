import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import {
  FACILITIES,
  OFFICIAL_URL,
  PIN_COORDINATES,
  VIEWPORTS,
  createContext,
  lineMap,
  observePageFailures,
  routeUrl,
  settlePage,
} from "./helpers/threejs-qa.mjs";

test.describe.configure({ mode: "serial" });

test("teacher gate 1: Section 3 numbers never intersect the vertical thread", async ({ browser, baseURL }) => {
  for (const viewport of VIEWPORTS.mobile) {
    const context = await createContext(browser, viewport);
    const page = await context.newPage();
    await page.goto(routeUrl(baseURL, "/"));
    await settlePage(page);
    const audit = await page.locator("#how-to-play").evaluate((section) => {
      const list = section.querySelector("ol");
      const listRect = list.getBoundingClientRect();
      const pseudo = getComputedStyle(list, "::before");
      const lineWidth = Number.parseFloat(pseudo.width) || 0;
      const lineLeft = listRect.left + (Number.parseFloat(pseudo.left) || 0);
      const lineRect = {
        left: lineLeft,
        right: lineLeft + lineWidth,
        top: listRect.top + (Number.parseFloat(pseudo.top) || 0),
        bottom: listRect.bottom - (Number.parseFloat(pseudo.bottom) || 0),
      };
      const intersects = (a, b) =>
        a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      const numbers = [...list.querySelectorAll("li > div:first-child > span")].map((number) => {
        const rect = number.getBoundingClientRect();
        return {
          text: number.textContent,
          rect: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom },
          lineIntersection: intersects(rect, lineRect),
        };
      });
      return {
        pseudoContent: pseudo.content,
        lineWidth,
        lineRect,
        numbers,
      };
    });
    expect(audit.pseudoContent).not.toBe("none");
    expect(audit.lineWidth).toBeGreaterThan(0);
    expect(audit.numbers.map((number) => number.text)).toEqual(["01", "02", "03"]);
    expect(audit.numbers.filter((number) => number.lineIntersection)).toEqual([]);
    const numbers = page.locator("#how-to-play ol li > div:first-child > span");
    for (let index = 0; index < (await numbers.count()); index += 1) {
      const number = numbers.nth(index);
      await number.scrollIntoViewIfNeeded();
      const unobscuredByGraphicLayer = await number.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return [0.2, 0.5, 0.8].every((ratio) => {
          const top = document.elementFromPoint(rect.left + rect.width * ratio, rect.top + rect.height / 2);
          return !top?.closest("canvas, svg");
        });
      });
      expect(unobscuredByGraphicLayer).toBe(true);
    }
    await context.close();
  }
});

test("teacher gate 2: all six facility names remain intact at desktop widths", async ({ browser, baseURL }) => {
  for (const viewport of VIEWPORTS.desktop) {
    const context = await createContext(browser, viewport);
    const page = await context.newPage();
    await page.goto(routeUrl(baseURL, "/"));
    await settlePage(page);
    for (const name of FACILITIES) {
      const locator = page.getByText(name, { exact: true }).first();
      await expect(locator).toBeVisible();
      const lines = await lineMap(locator);
      const geometry = await locator.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const parent = element.parentElement.getBoundingClientRect();
        return {
          fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
          insideCard: rect.left >= parent.left - 0.5 && rect.right <= parent.right + 0.5,
          scrollOverflow: element.scrollWidth - element.clientWidth,
        };
      });
      expect(lines).toHaveLength(1);
      expect(lines[0].text).toBe(name);
      expect(geometry.fontSize).toBeGreaterThanOrEqual(14);
      expect(geometry.insideCard).toBe(true);
      expect(geometry.scrollOverflow).toBeLessThanOrEqual(0);
    }
    await context.close();
  }
});

test("teacher gate 3: Section 5 route decoration never crosses guide text", async ({ browser, baseURL }) => {
  for (const viewport of VIEWPORTS.desktop.filter(({ width }) => width >= 1280)) {
    const context = await createContext(browser, viewport);
    const page = await context.newPage();
    await page.goto(routeUrl(baseURL, "/"));
    await settlePage(page);
    await page.locator("#access nav").scrollIntoViewIfNeeded();
    const results = await page.locator("#access nav").evaluate((nav) => {
      const intersects = (a, b) =>
        a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      return [...nav.querySelectorAll("li")].slice(0, -1).map((item) => {
        const itemRect = item.getBoundingClientRect();
        const label = item.querySelector("strong");
        const labelRect = label.getBoundingClientRect();
        const pseudo = getComputedStyle(item, "::after");
        const height = Number.parseFloat(pseudo.height) || 0;
        const top = itemRect.top + (Number.parseFloat(pseudo.top) || 0);
        const line = {
          left: itemRect.left + (Number.parseFloat(pseudo.left) || 0),
          right: itemRect.right - (Number.parseFloat(pseudo.right) || 0),
          top,
          bottom: top + height,
        };
        const center = { x: labelRect.left + labelRect.width / 2, y: labelRect.top + labelRect.height / 2 };
        const topmost = document.elementFromPoint(center.x, center.y);
        return {
          label: label.textContent,
          intersection: intersects(labelRect, line),
          unobscuredByGraphicLayer: !topmost?.closest("canvas, svg"),
          lineHeight: height,
        };
      });
    });
    expect(results).toHaveLength(3);
    expect(results.filter((result) => result.intersection)).toEqual([]);
    expect(results.filter((result) => !result.unobscuredByGraphicLayer)).toEqual([]);
    expect(results.every((result) => result.lineHeight > 0)).toBe(true);
    await context.close();
  }
});

test("teacher gate 4: official URL is consistent in rendered metadata, sharing, robots, and sitemap", async ({
  browser,
  baseURL,
}) => {
  const context = await createContext(browser, { width: 1440, height: 900 });
  const page = await context.newPage();
  for (const route of ["/", "/map/", "/information/"]) {
    await page.goto(routeUrl(baseURL, route));
    await settlePage(page);
    const expected = new URL(route.replace(/^\//, ""), OFFICIAL_URL).toString();
    await expect(page.locator("link[rel='canonical']")).toHaveAttribute("href", expected);
    await expect(page.locator("meta[property='og:url']")).toHaveAttribute("content", expected);
    await expect(page.locator("footer a", { hasText: OFFICIAL_URL })).toHaveAttribute("href", OFFICIAL_URL);
  }
  await page.goto(routeUrl(baseURL, "/"));
  const shares = await page.locator("#share a").evaluateAll((links) => links.map((link) => link.href));
  expect(shares).toHaveLength(2);
  expect(shares.every((href) => decodeURIComponent(href).includes(OFFICIAL_URL))).toBe(true);
  const robots = await (await context.request.get(routeUrl(baseURL, "/robots.txt"))).text();
  const sitemap = await (await context.request.get(routeUrl(baseURL, "/sitemap.xml"))).text();
  expect(robots).toContain(`${OFFICIAL_URL}sitemap.xml`);
  for (const expected of [OFFICIAL_URL, `${OFFICIAL_URL}map/`, `${OFFICIAL_URL}information/`]) {
    expect(sitemap).toContain(expected);
  }
  await context.close();
});

test("teacher gate 4 source contract contains no legacy deployment URL", async () => {
  const siteSource = await fs.readFile("src/data/site.ts", "utf8");
  expect(siteSource).toContain(`const officialSiteUrl = "${OFFICIAL_URL}"`);
  const relevantFiles = [
    "src/data/site.ts",
    "src/app/layout.tsx",
    "src/app/sitemap.ts",
    "src/app/robots.ts",
    "src/components/site/SiteFooter.tsx",
    "src/components/site/ShareActions.tsx",
  ];
  const source = (await Promise.all(relevantFiles.map((file) => fs.readFile(file, "utf8")))).join("\n");
  expect(source).not.toMatch(/xx0019v\.github\.io\/tomioka|vercel\.app|netlify\.app|mayu-no-chizu\.(?!cid-ac\.com)/i);
});

test("teacher gate 5: protected pin coordinates, anchor, and tip remain invariant", async ({ browser, baseURL }) => {
  const mapSource = await fs.readFile("src/components/map/EventAreaMap.tsx", "utf8");
  const markerCss = await fs.readFile("src/app/globals.css", "utf8");
  expect(mapSource).toMatch(/iconSize:\s*\[56,\s*62\][\s\S]*iconAnchor:\s*\[28,\s*62\]/);
  expect(markerCss).toMatch(/\.map-marker-glyph[\s\S]*animation:\s*mapMarkerGlyphFloat/);
  expect(markerCss).not.toMatch(/\.map-marker(?:-shell)?\s*\{[^}]*animation:/);

  for (const viewport of [VIEWPORTS.mobile[2], VIEWPORTS.desktop[2]]) {
    const context = await createContext(browser, viewport, { reducedMotion: "no-preference" });
    const page = await context.newPage();
    await page.goto(routeUrl(baseURL, "/map/"));
    await page.locator("section[aria-labelledby='map-heading']").scrollIntoViewIfNeeded();
    await expect(page.locator(".leaflet-container")).toBeVisible();
    await expect(page.locator("[data-map-visible='true']")).toBeVisible();
    const markers = await page.locator(".map-marker-shell").evaluateAll((elements) =>
      elements.map((element) => ({
        label: element.getAttribute("aria-label"),
        latitude: Number(element.getAttribute("data-latitude")),
        longitude: Number(element.getAttribute("data-longitude")),
      })),
    );
    for (const [name, expected] of Object.entries(PIN_COORDINATES)) {
      expect(markers.find(({ label }) => label?.startsWith(name))).toMatchObject(expected);
    }
    const samples = await page.locator(".map-marker-shell").first().evaluate(async (shell) => {
      const marker = shell.querySelector(".map-marker");
      const glyph = shell.querySelector(".map-marker-glyph");
      const animation = glyph.getAnimations()[0];
      if (!animation) return [];
      animation.pause();
      const duration = Number(animation.effect.getComputedTiming().duration);
      const output = [];
      for (const ratio of [0, 0.25, 0.5, 0.75, 0.999]) {
        animation.currentTime = duration * ratio;
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const shellRect = shell.getBoundingClientRect();
        const markerRect = marker.getBoundingClientRect();
        const tail = getComputedStyle(marker, "::after");
        output.push({
          shellBottom: shellRect.bottom,
          tipY: markerRect.bottom - (Number.parseFloat(tail.bottom) || 0),
        });
      }
      return output;
    });
    expect(samples).toHaveLength(5);
    expect(Math.max(...samples.map(({ shellBottom, tipY }) => Math.abs(shellBottom - tipY)))).toBeLessThanOrEqual(0.25);
    expect(Math.max(...samples.map(({ tipY }) => tipY)) - Math.min(...samples.map(({ tipY }) => tipY))).toBeLessThanOrEqual(0.1);
    await context.close();
  }
});

test("teacher gate 6: mobile map follows content height without hidden trailing space", async ({ browser, baseURL }) => {
  for (const viewport of VIEWPORTS.mobile) {
    const context = await createContext(browser, viewport);
    const page = await context.newPage();
    await page.goto(routeUrl(baseURL, "/map/"));
    await settlePage(page);
    const audit = await page.locator("section[aria-labelledby='map-heading']").evaluate((section) => {
      const shell = section.querySelector(":scope > div:nth-child(2)");
      const panel = shell.querySelector("aside:not([data-placement])");
      const shellRect = shell.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const style = getComputedStyle(shell);
      const panelStyle = getComputedStyle(panel);
      panel.scrollTop = panel.scrollHeight;
      return {
        overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
        trailingGap: shellRect.bottom - panelRect.bottom,
        panelEndRemaining: panel.scrollHeight - panel.clientHeight - panel.scrollTop,
        shellHeight: style.height,
        shellMinHeight: style.minHeight,
        panelPosition: panelStyle.position,
        negativeMargin: [style.marginBottom, panelStyle.marginBottom].some((value) => Number.parseFloat(value) < 0),
        nextOverlap: section.nextElementSibling
          ? section.getBoundingClientRect().bottom - section.nextElementSibling.getBoundingClientRect().top
          : 0,
      };
    });
    expect(audit.overflow).toBeLessThanOrEqual(0);
    expect(Math.abs(audit.trailingGap)).toBeLessThanOrEqual(1);
    expect(audit.panelEndRemaining).toBeLessThanOrEqual(1);
    expect(audit.panelPosition).toBe("relative");
    expect(audit.negativeMargin).toBe(false);
    expect(audit.nextOverlap).toBeLessThanOrEqual(1);
    await context.close();
  }
});

test("all primary routes remain free of console, request, HTTP, and horizontal-overflow failures", async ({
  browser,
  baseURL,
}) => {
  for (const viewport of [VIEWPORTS.mobile[0], VIEWPORTS.desktop[2]]) {
    const context = await createContext(browser, viewport);
    const page = await context.newPage();
    const failures = observePageFailures(page, baseURL);
    for (const route of ["/", "/map/", "/information/"]) {
      const response = await page.goto(routeUrl(baseURL, route));
      expect(response?.status()).toBe(200);
      await settlePage(page);
      const overflow = await page.evaluate(
        () => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    }
    expect(failures.consoleErrors).toEqual([]);
    expect(failures.pageErrors).toEqual([]);
    expect(failures.failedRequests).toEqual([]);
    expect(failures.badResponses).toEqual([]);
    await context.close();
  }
});
