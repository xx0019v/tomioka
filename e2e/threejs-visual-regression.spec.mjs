import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  CAPTURE_BASELINE,
  ROUTES,
  VIEWPORTS,
  createContext,
  padWidth,
  routeUrl,
  settlePage,
  writeJson,
} from "./helpers/threejs-qa.mjs";

const allViewports = [...VIEWPORTS.mobile, ...VIEWPORTS.tablet, ...VIEWPORTS.desktop];
const routeNames = { "/": "home", "/map/": "map", "/information/": "information" };

test.describe.configure({ mode: "serial" });

test("capture full-page, reduced-motion, and 404 pre-Three.js evidence", async ({ browser, baseURL }, testInfo) => {
  test.skip(!CAPTURE_BASELINE, "Evidence capture is immutable during feature-branch audits.");
  testInfo.setTimeout(900_000);
  const root = path.join(process.cwd(), "docs/qa-threejs-baseline", "full", testInfo.project.name);
  await fs.mkdir(root, { recursive: true });

  for (const viewport of allViewports) {
    const context = await createContext(browser, viewport, { reducedMotion: "no-preference" });
    const page = await context.newPage();
    for (const route of ROUTES) {
      await page.goto(routeUrl(baseURL, route));
      await settlePage(page);
      const directory = path.join(root, routeNames[route]);
      await fs.mkdir(directory, { recursive: true });
      await page.screenshot({
        path: path.join(directory, `02-full__${padWidth(viewport.width)}w__light__normal.jpg`),
        fullPage: true,
        type: "jpeg",
        quality: 68,
        animations: "disabled",
        caret: "hide",
        scale: "css",
      });
    }
    await context.close();
  }

  for (const viewport of [VIEWPORTS.mobile[2], VIEWPORTS.desktop[2]]) {
    const context = await createContext(browser, viewport, { reducedMotion: "reduce" });
    const page = await context.newPage();
    for (const route of ROUTES) {
      await page.goto(routeUrl(baseURL, route));
      await settlePage(page);
      const directory = path.join(root, routeNames[route]);
      await fs.mkdir(directory, { recursive: true });
      await page.screenshot({
        path: path.join(directory, `02-full__${padWidth(viewport.width)}w__light__reduce.jpg`),
        fullPage: true,
        type: "jpeg",
        quality: 68,
        animations: "disabled",
        caret: "hide",
        scale: "css",
      });
    }
    await page.goto(routeUrl(baseURL, "/qa-not-found/"));
    await settlePage(page);
    const notFoundDir = path.join(root, "not-found");
    await fs.mkdir(notFoundDir, { recursive: true });
    await page.screenshot({
      path: path.join(notFoundDir, `06-error__${padWidth(viewport.width)}w__light__reduce.jpg`),
      fullPage: true,
      type: "jpeg",
      quality: 72,
      animations: "disabled",
      caret: "hide",
      scale: "css",
    });
    await context.close();
  }

  await writeJson(`docs/qa-threejs-baseline/env-${testInfo.project.name}.json`, {
    capturedAt: new Date().toISOString(),
    os: `${process.platform} ${process.arch}`,
    browser: `${testInfo.project.name} ${browser.version()}`,
    deviceScaleFactor: 1,
    locale: "ja-JP",
    timezone: "Asia/Tokyo",
    fontsWaited: true,
    imagesDecoded: true,
    commit: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
    requestedReferenceInBrief: "994f3b869a1960dc1b2c305b6fd5b0e9359514b9",
    actualLatestOriginMain: "8a28087478cc858bc1e12908613947c5dad0234e",
  });
});

test("focused perceptual regression baselines protect the teacher fixes and global chrome", async ({
  browser,
  baseURL,
}) => {
  const selectedState = process.env.THREEJS_VISUAL_STATE;
  const shots = [
    ...VIEWPORTS.mobile.map((viewport) => ({ route: "/", viewport, selector: "#how-to-play", name: "section-3" })),
    ...VIEWPORTS.desktop.map((viewport) => ({ route: "/", viewport, selector: "#route", name: "section-4" })),
    ...VIEWPORTS.desktop
      .filter(({ width }) => width >= 1280)
      .map((viewport) => ({ route: "/", viewport, selector: "#access nav", name: "section-5" })),
    ...[VIEWPORTS.mobile[2], VIEWPORTS.desktop[2]].flatMap((viewport) => [
      { route: "/", viewport, selector: "#share", name: "section-6" },
      { route: "/map/", viewport, selector: "section[aria-labelledby='map-heading']", name: "map" },
      { route: "/", viewport, selector: "#how-to-play a", name: "cta" },
      { route: "/", viewport, selector: "header", name: "header" },
      { route: "/", viewport, selector: "footer", name: "footer" },
    ]),
  ].filter((shot) => !selectedState || shot.name === selectedState);

  for (const shot of shots) {
    const context = await createContext(browser, shot.viewport, { reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(routeUrl(baseURL, shot.route));
    await settlePage(page);
    const target = page.locator(shot.selector).first();
    await target.scrollIntoViewIfNeeded();
    const masks = [page.locator("canvas"), page.locator(".leaflet-tile-pane")];
    await expect(target).toHaveScreenshot(
      `${shot.name}/${shot.name}__${padWidth(shot.viewport.width)}w__light__reduce.png`,
      {
        animations: "disabled",
        caret: "hide",
        scale: "css",
        mask: masks,
        maskColor: "#b8b8b8",
        threshold: 0.15,
        maxDiffPixelRatio: 0.015,
      },
    );
    await context.close();
  }

  for (const viewport of selectedState ? [] : [VIEWPORTS.mobile[2], VIEWPORTS.desktop[2]]) {
    const context = await createContext(browser, viewport, { reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(routeUrl(baseURL, "/qa-not-found/"));
    await settlePage(page);
    await expect(page.locator("main")).toHaveScreenshot(
      `not-found/not-found__${padWidth(viewport.width)}w__light__reduce.png`,
      {
        animations: "disabled",
        caret: "hide",
        scale: "css",
        threshold: 0.15,
        maxDiffPixelRatio: 0.01,
      },
    );
    await context.close();
  }
});
