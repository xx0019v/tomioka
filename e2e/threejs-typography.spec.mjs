import { expect, test } from "@playwright/test";
import {
  ACCEPTANCE_MODE,
  JAPANESE_UNITS,
  VIEWPORTS,
  createContext,
  lineMap,
  routeUrl,
  settlePage,
} from "./helpers/threejs-qa.mjs";

test.describe.configure({ mode: "serial" });

test("protected Japanese names and meaning units stay on one line at every mobile width", async ({
  browser,
  baseURL,
}) => {
  for (const viewport of VIEWPORTS.mobile) {
    const context = await createContext(browser, viewport);
    const page = await context.newPage();
    for (const route of ["/", "/information/"]) {
      await page.goto(routeUrl(baseURL, route));
      await settlePage(page);
      const units = page.locator("[data-ja-unit]");
      for (let index = 0; index < (await units.count()); index += 1) {
        const unit = units.nth(index);
        const lines = await lineMap(unit);
        const geometry = await unit.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return {
            label: element.getAttribute("data-ja-unit"),
            text: element.textContent,
            left: rect.left,
            right: rect.right,
            whiteSpace: getComputedStyle(element).whiteSpace,
          };
        });
        expect(lines, `${viewport.width}px ${route} ${geometry.label}`).toHaveLength(1);
        expect(geometry.text).toBe(geometry.label);
        expect(geometry.left).toBeGreaterThanOrEqual(-0.5);
        expect(geometry.right).toBeLessThanOrEqual(viewport.width + 0.5);
      }
    }

    await page.goto(routeUrl(baseURL, "/"));
    for (const text of JAPANESE_UNITS) {
      await expect(page.locator(`[data-ja-unit="${text}"]`).first()).toBeAttached();
    }
    await context.close();
  }
});

test("Japanese line starts and endings obey core kinsoku checks", async ({ browser, baseURL }) => {
  const forbiddenLineStart = /^[、。，．？！）」』】〕〉》〙〗〟’”ぁぃぅぇぉゃゅょっァィゥェォャュョッー]/;
  const forbiddenLineEnd = /[（「『【〔〈《〘〖〝‘“]$/;
  const isolatedParticle = /^(は|が|を|に|で|と|へ|も|の|や|か|ね|よ)$/;

  for (const viewport of VIEWPORTS.mobile) {
    const context = await createContext(browser, viewport);
    const page = await context.newPage();
    for (const route of ["/", "/information/"]) {
      await page.goto(routeUrl(baseURL, route));
      await settlePage(page);
      const candidates = page.locator("main h1, main h2, main h3, main p, main li, main blockquote");
      const violations = [];
      for (let index = 0; index < (await candidates.count()); index += 1) {
        const candidate = candidates.nth(index);
        if (!(await candidate.isVisible())) continue;
        const lines = await lineMap(candidate);
        for (const [lineIndex, line] of lines.entries()) {
          const text = line.text.trim();
          if (!text) continue;
          if (forbiddenLineStart.test(text)) violations.push({ type: "line-start", text, lineIndex });
          if (forbiddenLineEnd.test(text)) violations.push({ type: "line-end", text, lineIndex });
          if (isolatedParticle.test(text)) violations.push({ type: "isolated-particle", text, lineIndex });
        }
      }
      expect(violations, `${viewport.width}px ${route}`).toEqual([]);
    }
    await context.close();
  }
});

test("polite phrases and numeric units are audited, and nowrap is limited to short spans", async ({
  browser,
  baseURL,
}, testInfo) => {
  const baselinePhraseWarnings = [];
  for (const viewport of VIEWPORTS.mobile) {
    const context = await createContext(browser, viewport);
    const page = await context.newPage();
    for (const route of ["/", "/information/"]) {
      await page.goto(routeUrl(baseURL, route));
      await settlePage(page);
      const audit = await page.evaluate(() => {
        function chars(element) {
          const output = [];
          const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            const node = walker.currentNode;
            for (let index = 0; index < (node.textContent?.length ?? 0); index += 1) {
              const value = node.textContent[index];
              if (!value.trim()) continue;
              const range = document.createRange();
              range.setStart(node, index);
              range.setEnd(node, index + 1);
              const rect = range.getBoundingClientRect();
              if (rect.width && rect.height) output.push({ value, top: Math.round(rect.top) });
            }
          }
          return output;
        }

        const phraseSplits = [];
        const unitSplits = [];
        for (const element of document.querySelectorAll("main p, main li, main blockquote")) {
          if (!element.getClientRects().length) continue;
          const sequence = chars(element);
          const text = sequence.map(({ value }) => value).join("");
          // 「お楽しみ｜ください」の意味上許容される境界ではなく、
          // 監査指摘の「くだ｜さい」という敬語内部の分断を検出する。
          for (const phrase of ["ください"]) {
            let offset = text.indexOf(phrase);
            while (offset >= 0) {
              const tops = new Set(sequence.slice(offset, offset + phrase.length).map(({ top }) => top));
              if (tops.size > 1) phraseSplits.push({ phrase, text: text.slice(0, 80) });
              offset = text.indexOf(phrase, offset + phrase.length);
            }
          }
          for (const match of text.matchAll(/(?:約)?\d+(?:〜\d+)?(?:分|時間|km|m|円|月|日)/g)) {
            const tops = new Set(
              sequence.slice(match.index, match.index + match[0].length).map(({ top }) => top),
            );
            if (tops.size > 1) unitSplits.push({ unit: match[0], text: text.slice(0, 80) });
          }
        }

        const broadNowrap = [...document.querySelectorAll("main *")]
          .filter((element) => getComputedStyle(element).whiteSpace === "nowrap")
          .filter((element) => (element.textContent?.trim().length ?? 0) > 24)
          .map((element) => ({ tag: element.tagName, text: element.textContent.trim().slice(0, 60) }));

        return {
          phraseSplits,
          unitSplits,
          broadNowrap,
          overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
        };
      });
      if (ACCEPTANCE_MODE) {
        expect(audit.phraseSplits, `${viewport.width}px ${route}`).toEqual([]);
      } else {
        baselinePhraseWarnings.push(
          ...audit.phraseSplits.map((warning) => ({ viewport: viewport.width, route, ...warning })),
        );
      }
      expect(audit.unitSplits, `${viewport.width}px ${route}`).toEqual([]);
      expect(audit.broadNowrap, `${viewport.width}px ${route}`).toEqual([]);
      expect(audit.overflow).toBeLessThanOrEqual(0);
    }
    await context.close();
  }
  await testInfo.attach("pre-threejs-politeness-wrap-audit.json", {
    body: Buffer.from(JSON.stringify(baselinePhraseWarnings, null, 2)),
    contentType: "application/json",
  });
});
