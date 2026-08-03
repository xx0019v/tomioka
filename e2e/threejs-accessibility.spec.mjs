import { expect, test } from "@playwright/test";
import {
  ACCEPTANCE_MODE,
  ROUTES,
  VIEWPORTS,
  createContext,
  routeUrl,
  settlePage,
} from "./helpers/threejs-qa.mjs";

test.describe.configure({ mode: "serial" });

test("semantic DOM, language, heading hierarchy, labels, and non-canvas content remain available", async ({
  browser,
  baseURL,
}) => {
  const context = await createContext(browser, VIEWPORTS.desktop[1]);
  const page = await context.newPage();
  for (const route of ROUTES) {
    await page.goto(routeUrl(baseURL, route));
    await settlePage(page);
    const audit = await page.evaluate(() => {
      const headings = [...document.querySelectorAll("main h1, main h2, main h3")].map((heading) => ({
        level: Number(heading.tagName.slice(1)),
        text: heading.textContent.trim(),
      }));
      const skipped = headings.filter(
        (heading, index) => index > 0 && heading.level > headings[index - 1].level + 1,
      );
      const unlabeled = [...document.querySelectorAll("a[href], button, [role='button']")]
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        })
        .filter(
          (element) =>
            !(element.getAttribute("aria-label") || element.getAttribute("aria-labelledby") || element.textContent.trim()),
        ).length;
      return {
        language: document.documentElement.lang,
        h1Count: headings.filter(({ level }) => level === 1).length,
        skipped,
        unlabeled,
        mainTextLength: document.querySelector("main")?.innerText.trim().length ?? 0,
      };
    });
    expect(audit.language).toBe("ja");
    expect(audit.h1Count).toBe(1);
    expect(audit.skipped).toEqual([]);
    expect(audit.unlabeled).toBe(0);
    expect(audit.mainTextLength).toBeGreaterThan(100);
  }
  await context.close();
});

test("keyboard Enter, Space, Escape, focus ring, and focus restoration work", async ({ browser, baseURL }) => {
  const context = await createContext(browser, { width: 390, height: 844 });
  const page = await context.newPage();
  await page.goto(routeUrl(baseURL, "/"));
  await page.keyboard.press("Tab");
  const firstFocus = await page.evaluate(() => ({
    text: document.activeElement?.textContent?.trim(),
    outlineWidth: getComputedStyle(document.activeElement).outlineWidth,
  }));
  expect(firstFocus.text).toContain("本文へ移動");
  expect(Number.parseFloat(firstFocus.outlineWidth)).toBeGreaterThan(0);
  await page.locator("a.skip-link").press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  await page.evaluate(() => {
    document.activeElement?.blur();
    scrollTo(0, 0);
  });
  await page.keyboard.press("Space");
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);

  await page.goto(routeUrl(baseURL, "/map/"));
  const mapStage = page.locator("[data-map-interaction]");
  await mapStage.waitFor({ state: "visible" });
  await expect(page.locator(".leaflet-container")).toBeVisible();
  const enable = mapStage.getByRole("button", { name: "地図を操作", exact: true });
  await enable.scrollIntoViewIfNeeded();
  await expect(enable).toBeEnabled();
  await enable.focus();
  await enable.press("Enter");
  const disable = mapStage.getByRole("button", { name: "操作を終了", exact: true });
  await expect(disable).toHaveAttribute("aria-pressed", "true");
  await disable.press("Enter");
  await expect(enable).toHaveAttribute("aria-pressed", "false");

  const spot = page.getByRole("button", { name: "街 アトリエ 街歩きスポット" });
  await spot.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("aside[aria-label='アトリエのスポット案内']")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(spot).toBeFocused();
  await context.close();
});

test("reduced motion has no persistent motion and loses no text, links, or headings", async ({ browser, baseURL }) => {
  const collect = async (reducedMotion) => {
    const context = await createContext(browser, VIEWPORTS.mobile[2], { reducedMotion });
    const page = await context.newPage();
    await page.goto(routeUrl(baseURL, "/"));
    await page.waitForTimeout(500);
    const result = await page.evaluate(() => {
      const visible = (element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
      };
      const animations = document.getAnimations();
      return {
        reduce: matchMedia("(prefers-reduced-motion: reduce)").matches,
        text: document.querySelector("main").innerText.replace(/\s+/g, " ").trim(),
        headings: [...document.querySelectorAll("main h1, main h2, main h3")].filter(visible).map((el) => el.textContent.trim()),
        links: [...document.querySelectorAll("main a")].filter(visible).map((el) => el.textContent.trim()),
        running: animations.filter((animation) => animation.playState === "running").length,
        persistent: animations.filter((animation) => {
          const iterations = animation.effect?.getTiming?.().iterations;
          return iterations === Infinity || Number(iterations) > 8;
        }).length,
        autoplayVideos: [...document.querySelectorAll("video")].filter((video) => !video.paused).length,
        hook: window.__THREEJS_QA__?.snapshot?.() ?? null,
      };
    });
    await context.close();
    return result;
  };

  const normal = await collect("no-preference");
  const reduced = await collect("reduce");
  expect(reduced.reduce).toBe(true);
  expect(reduced.text).toBe(normal.text);
  expect(reduced.headings).toEqual(normal.headings);
  expect(reduced.links).toEqual(normal.links);
  expect(reduced.running).toBe(0);
  expect(reduced.persistent).toBe(0);
  expect(reduced.autoplayVideos).toBe(0);
  if (ACCEPTANCE_MODE) {
    expect(reduced.hook).toMatchObject({
      mode: "STATIC",
      activeRafLoops: 0,
      scrollTriggerCount: 0,
      fallbackVisible: true,
    });
  }
});

test("canvas is decorative, unfocusable, and does not own the information or input layer", async ({ browser, baseURL }) => {
  test.skip(!ACCEPTANCE_MODE, "Canvas requirements apply after Three.js is present.");
  const context = await createContext(browser, VIEWPORTS.desktop[2], { reducedMotion: "no-preference" });
  const page = await context.newPage();
  await page.goto(routeUrl(baseURL, "/"));
  const canvases = page.locator("canvas[data-threejs-canvas]");
  await expect(canvases).toHaveCount(1);
  const audit = await canvases.first().evaluate((canvas) => ({
    ariaHidden: canvas.getAttribute("aria-hidden"),
    role: canvas.getAttribute("role"),
    tabIndex: canvas.tabIndex,
    pointerEvents: getComputedStyle(canvas).pointerEvents,
  }));
  expect(audit.ariaHidden).toBe("true");
  expect(audit.role === null || audit.role === "presentation").toBe(true);
  expect(audit.tabIndex).toBe(-1);
  expect(audit.pointerEvents).toBe("none");
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.getByRole("link", { name: /参加案内を見る/ })).toBeEnabled();
  await context.close();
});

test("mobile interactive controls provide a 44px target without relying on color alone", async ({ browser, baseURL }) => {
  for (const viewport of VIEWPORTS.mobile) {
    const context = await createContext(browser, viewport);
    const page = await context.newPage();
    await page.goto(routeUrl(baseURL, "/map/"));
    await settlePage(page);
    const audit = await page.evaluate(() => {
      const controls = [...document.querySelectorAll("main a[href], main button, main [role='button']")].filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      return controls.map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          label: element.getAttribute("aria-label") || element.textContent.trim().slice(0, 50),
          width: rect.width,
          height: rect.height,
          stateExposed:
            !element.matches("[aria-pressed], [aria-expanded], [aria-current]") ||
            Boolean(
              element.getAttribute("aria-pressed") ??
                element.getAttribute("aria-expanded") ??
                element.getAttribute("aria-current"),
            ),
        };
      });
    });
    expect(audit.filter(({ width, height }) => width < 44 || height < 44)).toEqual([]);
    expect(audit.filter(({ stateExposed }) => !stateExposed)).toEqual([]);
    await context.close();
  }
});
