import { expect, test } from "@playwright/test";
import {
  ACCEPTANCE_MODE,
  VIEWPORTS,
  createContext,
  installRuntimeProbe,
  observePageFailures,
  routeUrl,
  runtimeSnapshot,
} from "./helpers/threejs-qa.mjs";

test.describe.configure({ mode: "serial" });

test("pre-Three.js main baseline has no WebGL renderer or shader errors", async ({ browser, baseURL }) => {
  test.skip(ACCEPTANCE_MODE, "This assertion describes the pre-Three.js baseline only.");
  for (const viewport of [VIEWPORTS.mobile[2], VIEWPORTS.desktop[2]]) {
    const context = await createContext(browser, viewport, { reducedMotion: "no-preference" });
    const page = await context.newPage();
    await installRuntimeProbe(page);
    const failures = observePageFailures(page, baseURL);
    await page.goto(routeUrl(baseURL, "/"));
    await page.waitForTimeout(750);
    const snapshot = await runtimeSnapshot(page);
    expect(snapshot.hookPresent).toBe(false);
    expect(snapshot.webglCanvasCount).toBe(0);
    expect(failures.webglMessages).toEqual([]);
    await context.close();
  }
});

test("browser back and repeated route visits do not duplicate Canvas or renderer state", async ({ browser, baseURL }) => {
  const context = await createContext(browser, VIEWPORTS.desktop[1], { reducedMotion: "no-preference" });
  const page = await context.newPage();
  await installRuntimeProbe(page);
  const failures = observePageFailures(page, baseURL);
  await page.goto(routeUrl(baseURL, "/"));

  for (let visit = 0; visit < 3; visit += 1) {
    await page.locator("header").getByRole("link", { name: /街歩きマップ/ }).click();
    await expect(page).toHaveURL(/\/map\/$/);
    await expect(page.locator("main h1")).toBeVisible();
    await page.goBack({ waitUntil: "domcontentloaded" });
    await expect(page.locator("main h1")).toBeVisible();
  }

  await page.waitForTimeout(500);
  const snapshot = await runtimeSnapshot(page);
  expect(snapshot.webglCanvasCount).toBeLessThanOrEqual(1);
  expect(await page.locator("canvas[data-threejs-canvas]").count()).toBeLessThanOrEqual(1);
  if (ACCEPTANCE_MODE) {
    expect(snapshot.hook).toMatchObject({ rendererCount: 1, canvasCount: 1 });
  } else {
    expect(snapshot.hookPresent).toBe(false);
    expect(snapshot.webglCanvasCount).toBe(0);
  }
  expect(failures.consoleErrors).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.failedRequests).toEqual([]);
  expect(failures.badResponses).toEqual([]);
  await context.close();
});

test("acceptance hook reports one renderer/canvas and no duplicate initialization", async ({ browser, baseURL }) => {
  test.skip(!ACCEPTANCE_MODE, "Run with THREEJS_ACCEPTANCE=1 after the feature branch is available.");
  const context = await createContext(browser, VIEWPORTS.desktop[2], { reducedMotion: "no-preference" });
  const page = await context.newPage();
  await installRuntimeProbe(page);
  const failures = observePageFailures(page, baseURL);
  await page.goto(routeUrl(baseURL, "/"));
  await page.waitForFunction(() => Boolean(window.__THREEJS_QA__?.snapshot));
  const first = await runtimeSnapshot(page);
  expect(first.hookPresent).toBe(true);
  expect(first.hook).toMatchObject({
    version: 1,
    rendererCount: 1,
    canvasCount: 1,
    activeRafLoops: 1,
  });
  expect(first.webglCanvasCount).toBe(1);
  expect(first.hook.rendererInfo).toEqual(
    expect.objectContaining({
      calls: expect.any(Number),
      triangles: expect.any(Number),
      geometries: expect.any(Number),
      textures: expect.any(Number),
    }),
  );

  await page.evaluate(async () => {
    await window.__THREEJS_QA__.reinitialize();
    await window.__THREEJS_QA__.reinitialize();
  });
  const afterReinitialize = await runtimeSnapshot(page);
  expect(afterReinitialize.hook.rendererCount).toBe(1);
  expect(afterReinitialize.hook.canvasCount).toBe(1);
  expect(afterReinitialize.hook.activeRafLoops).toBe(1);
  expect(documentMarkers(afterReinitialize.hook)).toBe(0);
  expect(failures.consoleErrors).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.webglMessages).toEqual([]);
  await context.close();
});

test("dispose releases renderer resources, observers, listeners, RAF, ScrollTrigger, and canvas", async ({
  browser,
  baseURL,
}) => {
  test.skip(!ACCEPTANCE_MODE, "Run with THREEJS_ACCEPTANCE=1 after the feature branch is available.");
  const context = await createContext(browser, VIEWPORTS.desktop[2], { reducedMotion: "no-preference" });
  const page = await context.newPage();
  await page.goto(routeUrl(baseURL, "/"));
  await page.waitForFunction(() => Boolean(window.__THREEJS_QA__?.dispose));
  const before = await page.evaluate(() => window.__THREEJS_QA__.snapshot());
  expect(before.rendererCount).toBe(1);
  await page.evaluate(async () => window.__THREEJS_QA__.dispose());
  const disposed = await page.evaluate(() => window.__THREEJS_QA__.snapshot());
  expect(disposed).toMatchObject({
    rendererCount: 0,
    canvasCount: 0,
    activeRafLoops: 0,
    scrollTriggerCount: 0,
    resizeObserverCount: 0,
    intersectionObserverCount: 0,
    ownedEventListenerCount: 0,
    resources: { geometries: 0, materials: 0, textures: 0 },
  });
  expect(await page.locator("canvas[data-threejs-canvas]").count()).toBe(0);

  await page.evaluate(async () => window.__THREEJS_QA__.reinitialize());
  const restored = await page.evaluate(() => window.__THREEJS_QA__.snapshot());
  expect(restored.rendererCount).toBe(1);
  expect(restored.canvasCount).toBe(1);
  expect(restored.activeRafLoops).toBe(1);
  await context.close();
});

test("context loss preserves DOM, CTA, map route, and exposes a static fallback before restore", async ({
  browser,
  baseURL,
}) => {
  test.skip(!ACCEPTANCE_MODE, "Run with THREEJS_ACCEPTANCE=1 after the feature branch is available.");
  const context = await createContext(browser, VIEWPORTS.desktop[1], { reducedMotion: "no-preference" });
  const page = await context.newPage();
  await page.goto(routeUrl(baseURL, "/"));
  await page.waitForFunction(() => Boolean(window.__THREEJS_QA__?.loseContext));
  await page.evaluate(async () => window.__THREEJS_QA__.loseContext());
  await page.waitForFunction(() => window.__THREEJS_QA__.snapshot().contextState === "lost");
  const lost = await page.evaluate(() => window.__THREEJS_QA__.snapshot());
  expect(lost.activeRafLoops).toBe(0);
  expect(lost.fallbackVisible).toBe(true);
  await expect(page.locator("main h1")).toBeVisible();
  const cta = page.getByRole("link", { name: /参加案内を見る/ });
  await expect(cta).toBeVisible();
  await expect(cta).toBeEnabled();
  await page.goto(routeUrl(baseURL, "/map/"));
  await expect(page.locator(".leaflet-container")).toBeVisible();

  await page.goto(routeUrl(baseURL, "/"));
  await page.waitForFunction(() => Boolean(window.__THREEJS_QA__?.restoreContext));
  await page.evaluate(async () => window.__THREEJS_QA__.restoreContext());
  await page.waitForFunction(() => window.__THREEJS_QA__.snapshot().contextState === "ready");
  const restored = await page.evaluate(() => window.__THREEJS_QA__.snapshot());
  expect(restored.rendererCount).toBe(1);
  expect(restored.canvasCount).toBe(1);
  await context.close();
});

for (const scenario of [
  {
    name: "HIGH desktop",
    viewport: { width: 1440, height: 900 },
    dpr: 1.5,
    reducedMotion: "no-preference",
    hardwareConcurrency: 10,
    deviceMemory: 8,
    saveData: false,
    expected: "HIGH",
  },
  {
    name: "MEDIUM desktop",
    viewport: { width: 1024, height: 768 },
    dpr: 1,
    reducedMotion: "no-preference",
    hardwareConcurrency: 6,
    deviceMemory: 4,
    saveData: false,
    expected: "MEDIUM",
  },
  {
    name: "LOW touch mobile",
    viewport: { width: 390, height: 844 },
    dpr: 1,
    reducedMotion: "no-preference",
    hardwareConcurrency: 4,
    deviceMemory: 2,
    saveData: true,
    expected: "LOW",
  },
  {
    name: "STATIC reduced motion",
    viewport: { width: 390, height: 844 },
    dpr: 1,
    reducedMotion: "reduce",
    hardwareConcurrency: 8,
    deviceMemory: 8,
    saveData: false,
    expected: "STATIC",
  },
]) {
  test(`capability mode: ${scenario.name}`, async ({ browser, baseURL }) => {
    test.skip(!ACCEPTANCE_MODE, "Run with THREEJS_ACCEPTANCE=1 after the feature branch is available.");
    const context = await createContext(browser, scenario.viewport, {
      deviceScaleFactor: scenario.dpr,
      reducedMotion: scenario.reducedMotion,
      hasTouch: scenario.viewport.width <= 430,
      isMobile: scenario.viewport.width <= 430,
    });
    await context.addInitScript(
      ({ hardwareConcurrency, deviceMemory, saveData }) => {
        Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, value: hardwareConcurrency });
        Object.defineProperty(navigator, "deviceMemory", { configurable: true, value: deviceMemory });
        const connection = { saveData, effectiveType: saveData ? "2g" : "4g" };
        Object.defineProperty(navigator, "connection", { configurable: true, value: connection });
      },
      scenario,
    );
    const page = await context.newPage();
    await page.goto(routeUrl(baseURL, "/"));
    await page.waitForFunction(() => Boolean(window.__THREEJS_QA__?.snapshot));
    const snapshot = await page.evaluate(() => window.__THREEJS_QA__.snapshot());
    expect(snapshot.mode).toBe(scenario.expected);
    if (scenario.expected === "STATIC") {
      expect(snapshot.activeRafLoops).toBe(0);
      expect(snapshot.scrollTriggerCount).toBe(0);
      expect(snapshot.fallbackVisible).toBe(true);
    }
    await context.close();
  });
}

test("WebGL unavailable selects STATIC without removing semantic content", async ({ browser, baseURL }) => {
  test.skip(!ACCEPTANCE_MODE, "Run with THREEJS_ACCEPTANCE=1 after the feature branch is available.");
  const context = await createContext(browser, VIEWPORTS.desktop[2], { reducedMotion: "no-preference" });
  await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function disableWebgl(type, ...args) {
      if (/^webgl2?$|^experimental-webgl$/.test(String(type))) return null;
      return original.call(this, type, ...args);
    };
  });
  const page = await context.newPage();
  await page.goto(routeUrl(baseURL, "/"));
  await page.waitForFunction(() => Boolean(window.__THREEJS_QA__?.snapshot));
  const snapshot = await page.evaluate(() => window.__THREEJS_QA__.snapshot());
  expect(snapshot.mode).toBe("STATIC");
  expect(snapshot.rendererCount).toBe(0);
  expect(snapshot.activeRafLoops).toBe(0);
  expect(snapshot.fallbackVisible).toBe(true);
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.getByRole("link", { name: /参加案内を見る/ })).toBeEnabled();
  await context.close();
});

function documentMarkers(snapshot) {
  return snapshot.markers ?? 0;
}
