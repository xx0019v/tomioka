import { expect, test } from "@playwright/test";
import {
  ACCEPTANCE_MODE,
  VIEWPORTS,
  createContext,
  routeUrl,
  settlePage,
} from "./helpers/threejs-qa.mjs";

test.describe.configure({ mode: "serial" });

test("desktop scroll remains native, reversible, complete, and CTA-accessible", async ({ browser, baseURL }) => {
  for (const viewport of VIEWPORTS.desktop) {
    const context = await createContext(browser, viewport, { reducedMotion: "no-preference", hasTouch: false, isMobile: false });
    const page = await context.newPage();
    await page.goto(routeUrl(baseURL, "/"));
    await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
    const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    expect(maxScroll).toBeGreaterThan(viewport.height);

    await page.evaluate(() => scrollTo(0, 0));
    await page.mouse.wheel(0, 720);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);

    const positions = [];
    for (const ratio of [0, 0.25, 0.75, 1, 0.5, 0]) {
      await page.evaluate((value) => {
        const max = document.documentElement.scrollHeight - innerHeight;
        scrollTo(0, Math.round(max * value));
      }, ratio);
      await page.waitForTimeout(40);
      positions.push(await page.evaluate(() => scrollY));
    }
    expect(positions[0]).toBe(0);
    expect(positions[3]).toBeGreaterThanOrEqual(maxScroll - 2);
    expect(positions.at(-1)).toBe(0);

    for (const heading of await page.locator("main h1, main h2").all()) {
      await heading.scrollIntoViewIfNeeded();
      await expect(heading).toBeVisible();
    }

    const pinAudit = await page.evaluate(() => ({
      count: document.querySelectorAll(".pin-spacer").length,
      tooLong: [...document.querySelectorAll(".pin-spacer")].filter(
        (element) => element.getBoundingClientRect().height > innerHeight * 4,
      ).length,
      markers: document.querySelectorAll(".gsap-marker-start, .gsap-marker-end").length,
    }));
    expect(pinAudit.tooLong).toBe(0);
    expect(pinAudit.markers).toBe(0);

    const cta = page.getByRole("link", { name: /参加案内を見る/ });
    await cta.scrollIntoViewIfNeeded();
    await expect(cta).toBeVisible();
    await expect(cta).toBeEnabled();
    await cta.click({ trial: true });

    const canvasAudit = await page.locator("canvas").evaluateAll((canvases) =>
      canvases.map((canvas) => ({
        ariaHidden: canvas.getAttribute("aria-hidden"),
        pointerEvents: getComputedStyle(canvas).pointerEvents,
        zIndex: getComputedStyle(canvas).zIndex,
      })),
    );
    if (ACCEPTANCE_MODE) {
      expect(canvasAudit.every(({ ariaHidden }) => ariaHidden === "true")).toBe(true);
      expect(canvasAudit.every(({ pointerEvents }) => pointerEvents === "none")).toBe(true);
    }

    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight * 0.55));
    const beforeReload = await page.evaluate(() => scrollY);
    await page.reload({ waitUntil: "domcontentloaded" });
    const afterReload = await page.evaluate(() => ({
      scrollY,
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      canvasCount: document.querySelectorAll("canvas[data-threejs-canvas]").length,
    }));
    expect(beforeReload).toBeGreaterThan(0);
    expect(afterReload.overflow).toBeLessThanOrEqual(0);
    expect(afterReload.canvasCount).toBeLessThanOrEqual(1);
    if (ACCEPTANCE_MODE) {
      expect(afterReload.scrollY).toBeGreaterThan(0);
    }
    await context.close();
  }
});

test("mobile page has no long pin, horizontal overflow, canvas input capture, or viewport-gap regression", async ({
  browser,
  baseURL,
}) => {
  for (const viewport of VIEWPORTS.mobile) {
    const context = await createContext(browser, viewport, { reducedMotion: "no-preference" });
    const page = await context.newPage();
    await page.goto(routeUrl(baseURL, "/"));
    await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
    const audit = await page.evaluate(() => {
      const canvases = [...document.querySelectorAll("canvas")].map((canvas) => ({
        pointerEvents: getComputedStyle(canvas).pointerEvents,
        ariaHidden: canvas.getAttribute("aria-hidden"),
      }));
      const primaryTargets = [...document.querySelectorAll("main a, main button")]
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        })
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return { label: element.textContent.trim().slice(0, 40), width: rect.width, height: rect.height };
        });
      return {
        overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
        longPins: [...document.querySelectorAll(".pin-spacer")].filter(
          (element) => element.getBoundingClientRect().height > innerHeight * 1.5,
        ).length,
        canvases,
        smallTargets: primaryTargets.filter(({ width, height }) => width < 44 || height < 44),
        viewportMeta: document.querySelector("meta[name='viewport']")?.content ?? "",
      };
    });
    expect(audit.overflow).toBeLessThanOrEqual(0);
    expect(audit.longPins).toBe(0);
    expect(audit.smallTargets).toEqual([]);
    expect(audit.viewportMeta).toContain("viewport-fit=cover");
    if (ACCEPTANCE_MODE) {
      expect(audit.canvases.every(({ pointerEvents }) => pointerEvents === "none")).toBe(true);
      expect(audit.canvases.every(({ ariaHidden }) => ariaHidden === "true")).toBe(true);
    }

    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollHeight - innerHeight - scrollY))
      .toBeLessThanOrEqual(2);
    const bottom = await page.evaluate(() => ({
      remaining: document.documentElement.scrollHeight - innerHeight - scrollY,
      bodyBottom: document.body.getBoundingClientRect().bottom,
      viewportBottom: innerHeight,
    }));
    expect(bottom.remaining).toBeLessThanOrEqual(2);
    expect(bottom.bodyBottom).toBeLessThanOrEqual(bottom.viewportBottom + 2);

    await page.setViewportSize({ width: viewport.height, height: viewport.width });
    await page.waitForTimeout(120);
    const landscape = await page.evaluate(() => ({
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      blankAfterBody: innerHeight - document.body.getBoundingClientRect().bottom,
    }));
    expect(landscape.overflow).toBeLessThanOrEqual(0);
    expect(landscape.blankAfterBody).toBeLessThanOrEqual(1);
    await context.close();
  }
});

test("touch map keeps page scroll and explicit map panning as separate input modes", async ({ browser, baseURL }, testInfo) => {
  for (const viewport of VIEWPORTS.mobile) {
    const context = await createContext(browser, viewport, { reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(routeUrl(baseURL, "/map/"));
    await settlePage(page);
    const map = page.locator(".leaflet-container");
    await map.scrollIntoViewIfNeeded();
    const enable = page.getByRole("button", { name: "地図を操作" });
    await expect(enable).toBeEnabled();
    await expect(enable).toHaveAttribute("aria-pressed", "false");
    expect(await map.evaluate((element) => getComputedStyle(element).pointerEvents)).toBe("none");

    const beforePageScroll = await page.evaluate(() => scrollY);
    if (testInfo.project.name === "webkit") {
      await page.evaluate(() => scrollBy(0, 240));
    } else {
      await page.mouse.wheel(0, 240);
    }
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(beforePageScroll);

    await enable.click();
    const disable = page.getByRole("button", { name: "操作を終了" });
    await expect(disable).toHaveAttribute("aria-pressed", "true");
    expect(await map.evaluate((element) => getComputedStyle(element).pointerEvents)).not.toBe("none");
    const pageScrollBeforePan = await page.evaluate(() => scrollY);
    if (testInfo.project.name === "webkit") {
      expect(await map.evaluate((element) => getComputedStyle(element).touchAction)).toMatch(/none|pan-/);
    } else {
      const box = await map.boundingBox();
      await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.5);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.5, { steps: 5 });
      await page.mouse.up();
    }
    expect(await page.evaluate(() => scrollY)).toBe(pageScrollBeforePan);
    const firstMarker = page.locator(".map-marker-shell").first();
    await firstMarker.click();
    await expect(page.locator("aside[aria-label*='スポット案内']")).toBeVisible();
    await page.keyboard.press("Escape");
    await disable.click();
    await expect(enable).toHaveAttribute("aria-pressed", "false");
    await context.close();
  }
});
