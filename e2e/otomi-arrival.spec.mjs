import { expect, test } from "@playwright/test";

const baseUrl = process.env.QA_BASE_URL ?? "http://localhost:3000";
const widths = [320, 360, 375, 390, 393, 430, 768, 1024, 1440];

test.setTimeout(120_000);

test("arrival stays stable across the nine-width matrix", async ({ browser }) => {
  for (const width of widths) {
    const context = await browser.newContext({
      viewport: { width, height: width < 700 ? 844 : 900 },
      hasTouch: width <= 430,
    });
    const page = await context.newPage();
    const errors = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    const arrival = page.locator("#access");
    await arrival.scrollIntoViewIfNeeded();
    await expect(arrival).toHaveAttribute("data-entered", "true");
    await expect(arrival.getByRole("heading", { name: "物語の入口は、お富ちゃん家" })).toBeVisible();

    const audit = await page.evaluate(() => {
      const actions = [...document.querySelectorAll("#access a, #access button")];
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        shortActions: actions
          .filter((action) => action.getBoundingClientRect().height < 48)
          .map((action) => action.textContent?.trim()),
        wrappedLinks: actions
          .filter((action) => action.tagName === "A" && getComputedStyle(action).whiteSpace !== "nowrap")
          .map((action) => action.textContent?.trim()),
      };
    });
    expect(audit.overflow).toBe(0);
    expect(audit.shortActions).toEqual([]);
    expect(audit.wrappedLinks).toEqual([]);
    expect(errors).toEqual([]);
    await context.close();
  }
});

test("kinu and map focus return contextual reception guidance", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  const arrival = page.locator("#access");
  await arrival.scrollIntoViewIfNeeded();

  const guide = arrival.locator("aside");
  await guide.getByRole("button", { name: "きぬにふれて次の受付案内を見る" }).click();
  await expect(guide).toContainText("上州富岡駅から");
  await arrival.getByRole("link", { name: /Googleマップで開く/ }).focus();
  await expect(guide).toContainText("場所を地図で確認できるよ");
});

test("reduced motion exposes the final state with no running arrival animation", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  const arrival = page.locator("#access");
  await arrival.scrollIntoViewIfNeeded();
  const motion = await arrival.evaluate((element) => ({
    opacity: getComputedStyle(element.querySelector("header")).opacity,
    active: element.getAttribute("data-active"),
    running: element.getAnimations({ subtree: true }).filter((animation) => animation.playState === "running").length,
  }));
  expect(motion).toEqual({ opacity: "1", active: "false", running: 0 });
  await context.close();
});
