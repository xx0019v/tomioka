import { test, expect, devices } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.QA_BASE_URL ?? "http://127.0.0.1:3002";
const outputDir = path.join(
  process.cwd(),
  "test-results/ios-qa",
);

test.describe.configure({ mode: "serial" });
test.setTimeout(120_000);

test.beforeAll(async () => {
  await fs.mkdir(outputDir, { recursive: true });
});

test("iPhone viewport renders remain stable", async ({ browser }) => {
  const deviceNames = [
    "iPhone SE",
    "iPhone 13",
    "iPhone 14 Pro",
    "iPhone 15 Pro",
    "iPhone 15 Pro Max",
  ];

  for (const deviceName of deviceNames) {
    const context = await browser.newContext({ ...devices[deviceName] });
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await expect(page.locator("h1")).toContainText("繭が遺した地図");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
    await page.screenshot({
      path: path.join(
        outputDir,
        `home-${deviceName.toLowerCase().replaceAll(" ", "-")}.png`,
      ),
      fullPage: true,
    });
    await context.close();
  }
});

test("map view mode, interaction mode, sheet gesture, and rotation work", async ({ browser }) => {
  const context = await browser.newContext({ ...devices["iPhone 15 Pro"] });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/map/`, { waitUntil: "networkidle" });

  const guide = page.locator("aside[aria-label='きぬの街歩き案内']");
  await guide.getByRole("button", { name: "きぬの案内を閉じる" }).first().click();
  await guide.getByRole("button", { name: "きぬの案内を開く" }).click();
  await expect(guide.locator("[role='status']")).toBeVisible();
  await guide.getByRole("button", { name: "きぬの案内を閉じる" }).first().click();

  await page.locator("section[aria-labelledby='map-heading']").scrollIntoViewIfNeeded();

  const enable = page.getByRole("button", { name: "地図を操作" });
  await expect(enable).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("[data-map-interaction='view']")).toBeVisible();
  await enable.click();
  const disable = page.getByRole("button", { name: "操作を終了" });
  await expect(disable).toHaveAttribute("aria-pressed", "true");
  await disable.click();
  await expect(enable).toHaveAttribute("aria-pressed", "false");

  await page.getByRole("button", { name: "街 アトリエ 街歩きスポット" }).click();
  const sheet = page.locator("aside[aria-label='アトリエのスポット案内']");
  await expect(sheet).toBeVisible();
  const handle = sheet.locator("article > div").first();
  const handleBox = await handle.boundingBox();
  expect(handleBox?.height).toBeGreaterThanOrEqual(44);
  const panelBox = await sheet.boundingBox();
  expect(panelBox.height).toBeLessThanOrEqual(
    Math.ceil((page.viewportSize()?.height ?? 0) * 0.7),
  );
  const googleMapsLink = sheet.getByRole("link", { name: "Googleマップで開く" });
  await googleMapsLink.scrollIntoViewIfNeeded();
  await expect(googleMapsLink).toHaveAttribute("href", /^https:\/\/www\.google\.com\/maps\//);
  await expect(googleMapsLink).toHaveAttribute("target", "_blank");
  await page.screenshot({
    path: path.join(outputDir, "map-sheet-iphone-15-pro.png"),
  });

  await handle.hover();
  await page.mouse.down();
  await page.mouse.move(
    handleBox.x + handleBox.width / 2,
    handleBox.y + 170,
    { steps: 8 },
  );
  await page.mouse.up();
  await expect(page).not.toHaveURL(/spot=/);
  await expect(page.getByRole("button", { name: "街 アトリエ 街歩きスポット" })).toBeVisible();

  await page.setViewportSize({ width: 852, height: 393 });
  await page.waitForTimeout(300);
  const landscapeOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(landscapeOverflow).toBe(0);
  await page.screenshot({
    path: path.join(outputDir, "map-landscape-iphone-15-pro.png"),
    fullPage: true,
  });
  await page.getByRole("link", { name: "繭が遺した地図 トップへ" }).click();
  await expect(page).toHaveURL(`${baseUrl}/`);
  await context.close();
});

test("geolocation grant and denial keep the map usable", async ({ browser }) => {
  const granted = await browser.newContext({
    ...devices["iPhone 15 Pro"],
    permissions: ["geolocation"],
    geolocation: { latitude: 36.2598, longitude: 138.8891 },
  });
  const grantedPage = await granted.newPage();
  await grantedPage.goto(`${baseUrl}/map/`, { waitUntil: "networkidle" });
  await grantedPage.getByRole("button", { name: "現在地を地図に表示する" }).click();
  await expect(grantedPage.locator(".map-user-dot")).toBeVisible();
  await granted.close();

  const denied = await browser.newContext({ ...devices["iPhone 15 Pro"] });
  const deniedPage = await denied.newPage();
  await deniedPage.goto(`${baseUrl}/map/`, { waitUntil: "networkidle" });
  await deniedPage.getByRole("button", { name: "現在地を地図に表示する" }).click();
  await expect(
    deniedPage.getByText("現在地を利用できません。スポット一覧から選べます。"),
  ).toBeVisible();
  await denied.close();
});

test("reduced motion removes permanent animation loops", async ({ browser }) => {
  const context = await browser.newContext({
    ...devices["iPhone 15 Pro"],
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  const motionState = await page.evaluate(() => ({
    activeFields: [...document.querySelectorAll("[data-motion-ready]")].filter(
      (element) => element.getAttribute("data-active") === "true",
    ).length,
    infiniteAnimations: document
      .getAnimations()
      .filter((animation) => animation.effect?.getTiming().iterations === Infinity).length,
  }));
  expect(motionState.activeFields).toBe(0);
  expect(motionState.infiniteAnimations).toBe(0);
  await page.screenshot({
    path: path.join(outputDir, "home-reduced-motion-iphone-15-pro.png"),
  });
  await context.close();
});
