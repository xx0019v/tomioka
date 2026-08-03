import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import {
  ACCEPTANCE_MODE,
  CAPTURE_BASELINE,
  VIEWPORTS,
  createContext,
  installRuntimeProbe,
  observePageFailures,
  routeUrl,
  runtimeSnapshot,
  writeJson,
} from "./helpers/threejs-qa.mjs";

test.describe.configure({ mode: "serial" });

for (const profile of [
  { name: "desktop-1440", viewport: VIEWPORTS.desktop[2] },
  { name: "mobile-390", viewport: VIEWPORTS.mobile[2] },
]) {
  test(`runtime performance baseline: ${profile.name}`, async ({ browser, baseURL }, testInfo) => {
    const context = await createContext(browser, profile.viewport, { reducedMotion: "no-preference" });
    const page = await context.newPage();
    await installRuntimeProbe(page);
    const failures = observePageFailures(page, baseURL);
    await page.goto(routeUrl(baseURL, "/"), { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);

    const frameTiming = await page.evaluate(async () => {
      const samples = [];
      const max = document.documentElement.scrollHeight - innerHeight;
      let previous = performance.now();
      for (let index = 0; index <= 90; index += 1) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const now = performance.now();
        samples.push(now - previous);
        previous = now;
        const progress = index <= 60 ? index / 60 : (90 - index) / 30;
        scrollTo(0, Math.max(0, Math.round(max * progress)));
      }
      samples.shift();
      const sorted = [...samples].sort((a, b) => a - b);
      return {
        sampleCount: samples.length,
        averageMs: samples.reduce((sum, value) => sum + value, 0) / samples.length,
        p95Ms: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
        worstMs: Math.max(...samples),
        over50Ms: samples.filter((value) => value > 50).length,
      };
    });
    await page.evaluate(() => scrollTo(0, 0));
    await page.keyboard.press("Tab");
    await page.waitForTimeout(100);

    const runtime = await runtimeSnapshot(page);
    const network = await page.evaluate(() => {
      const resources = performance.getEntriesByType("resource");
      return {
        resourceCount: resources.length,
        transferBytes: resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
        encodedBodyBytes: resources.reduce((sum, entry) => sum + (entry.encodedBodySize || 0), 0),
        scriptTransferBytes: resources
          .filter((entry) => entry.initiatorType === "script")
          .reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
        failedResourceEntries: resources.filter((entry) => entry.duration === 0 && entry.transferSize === 0).length,
      };
    });
    const report = {
      schemaVersion: 1,
      baselineCommit: "8a28087478cc858bc1e12908613947c5dad0234e",
      project: testInfo.project.name,
      profile: profile.name,
      viewport: profile.viewport,
      runtime,
      network,
      frameTiming,
      failures,
    };
    const baselinePath = `docs/qa-threejs-baseline/metrics/runtime-${testInfo.project.name}-${profile.name}.json`;
    if (CAPTURE_BASELINE) {
      await writeJson(baselinePath, report);
    } else {
      const baseline = JSON.parse(await fs.readFile(baselinePath, "utf8"));
      expect(network.transferBytes).toBeLessThanOrEqual(baseline.network.transferBytes * 1.2 + 100_000);
      expect(runtime.cls).toBeLessThanOrEqual(Math.max(0.1, baseline.runtime.cls + 0.02));
      if (baseline.runtime.lcpMs > 0 && runtime.lcpMs > 0) {
        expect(runtime.lcpMs).toBeLessThanOrEqual(baseline.runtime.lcpMs * 1.25 + 250);
      }
      expect(frameTiming.p95Ms).toBeLessThanOrEqual(Math.max(50, baseline.frameTiming.p95Ms * 1.35));
    }

    expect(failures.consoleErrors).toEqual([]);
    expect(failures.pageErrors).toEqual([]);
    expect(failures.failedRequests).toEqual([]);
    expect(failures.badResponses).toEqual([]);
    expect(failures.webglMessages).toEqual([]);
    const overflow = await page.evaluate(
      () => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);

    if (ACCEPTANCE_MODE) {
      expect(runtime.hookPresent).toBe(true);
      expect(runtime.hook.rendererCount).toBe(1);
      expect(runtime.hook.canvasCount).toBe(1);
      expect(runtime.webglCanvasCount).toBe(1);
      expect(runtime.hook.activeRafLoops).toBeLessThanOrEqual(1);
      expect(runtime.hook.offscreenDraws).toBe(0);
      expect(runtime.hook.rendererInfo.calls).toBeLessThanOrEqual(120);
      expect(runtime.hook.rendererInfo.textures).toBeLessThanOrEqual(16);
      expect(runtime.canvases.every(({ backingRatio }) => backingRatio <= 1.5 + 0.01)).toBe(true);
      const longTasks = runtime.longTasks;
      expect(longTasks.filter((duration) => duration > 200)).toEqual([]);
      expect(frameTiming.over50Ms).toBeLessThanOrEqual(profile.name.startsWith("mobile") ? 4 : 2);
    }
    await context.close();
  });
}

test("reduced motion performance has zero Three.js loops and drawing", async ({ browser, baseURL }) => {
  const context = await createContext(browser, VIEWPORTS.mobile[2], { reducedMotion: "reduce" });
  const page = await context.newPage();
  await installRuntimeProbe(page);
  await page.goto(routeUrl(baseURL, "/"));
  await page.waitForTimeout(500);
  const runtime = await runtimeSnapshot(page);
  expect(runtime.runningAnimations).toBe(0);
  expect(runtime.persistentAnimations).toBe(0);
  if (ACCEPTANCE_MODE) {
    expect(runtime.hook).toMatchObject({
      mode: "STATIC",
      activeRafLoops: 0,
      offscreenDraws: 0,
      scrollTriggerCount: 0,
    });
    expect(runtime.webglCanvasCount).toBe(0);
  }
  await context.close();
});
