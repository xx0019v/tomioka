import { expect, test } from "@playwright/test";

/**
 * 主要導線が「実際に開く」ことを確認する。
 *
 * これが無かったせいで、絹布トランジションが router.push へ basePath 付きの
 * パスを渡し、本番（GitHub Pages）だけ /tomioka/tomioka/map へ飛ぶ不具合を
 * 出してしまった。ローカルは basePath が空なので再現しなかった。
 *
 * したがってこのテストは **basePath 付きの配信**に対して走らせる必要がある。
 *   QA_BASE_URL=https://xx0019v.github.io/tomioka npx playwright test e2e/navigation.spec.mjs
 * basePath 無しのローカルでも回るが、その場合この不具合は検出できない。
 */

const baseUrl = (process.env.QA_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** リンクを踏んで、実際に着いた URL を返す */
async function follow(page, hrefSuffix) {
  await page.goto(`${baseUrl}/`, { waitUntil: "load" });
  await page.waitForTimeout(2500);
  const link = page.locator(`a[href$="${hrefSuffix}"]`).first();
  await expect(link).toBeVisible();
  await link.click({ noWaitAfter: true });
  // 絹布の覆い(560ms)+遷移+ほどけ(880ms)を待ちきる
  await page.waitForTimeout(4000);
  return page.url();
}

const targets = [
  { name: "街歩きマップ", suffix: "/map/", expect: "/map" },
  { name: "開催情報", suffix: "/information/", expect: "/information" },
];

for (const target of targets) {
  test(`${target.name}へのリンクが開く`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));

    const landed = await follow(page, target.suffix);
    const url = new URL(landed);

    // 1. 目的のページに着いている
    expect(url.pathname, `landed on ${landed}`).toContain(target.expect);

    // 2. basePath が二重になっていない（本番だけで起きた不具合）
    const doubled = url.pathname.match(/\/tomioka\/tomioka(\/|$)/);
    expect(doubled, `basePath duplicated: ${url.pathname}`).toBeNull();

    // 3. 着いた先が実在する（404 ページではない）
    const heading = await page.evaluate(
      () => document.querySelector("h1, h2")?.textContent?.trim() ?? "",
    );
    expect(heading.length, "landed page has a heading").toBeGreaterThan(0);
    const notFound = await page.evaluate(() =>
      document.body.innerText.includes("該当の頁がありません"),
    );
    expect(notFound, "landed on the not-found page").toBe(false);

    expect(errors, errors.join(" | ")).toHaveLength(0);
  });
}

test("ヘッダーの主要リンクがすべて実在するページを指す", async ({ page }) => {
  await page.goto(`${baseUrl}/`, { waitUntil: "load" });
  await page.waitForTimeout(2000);

  const hrefs = await page.evaluate(() =>
    [...document.querySelectorAll("a[href]")]
      .map((a) => a.href)
      .filter((href) => href.startsWith(location.origin))
      .filter((href, index, all) => all.indexOf(href) === index),
  );

  const broken = [];
  for (const href of hrefs) {
    const response = await page.request.get(href);
    if (response.status() >= 400) broken.push(`${response.status()} ${href}`);
  }
  expect(broken, broken.join(" | ")).toHaveLength(0);
});
