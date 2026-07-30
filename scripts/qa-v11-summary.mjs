import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const resultRoot = path.join(root, "docs/qa-v11/results");
const projects = ["chromium", "webkit"];
const categories = ["viewports", "silk-trail", "reduced-motion", "routes", "map"];

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

const results = {
  generatedAt: new Date().toISOString(),
  qaBaseUrl: process.env.QA_BASE_URL ?? "http://127.0.0.1:3002",
  projects: {},
};

for (const project of projects) {
  results.projects[project] = {};
  for (const category of categories) {
    const file = path.join(resultRoot, project, `${category}.json`);
    results.projects[project][category] = await readJson(file);
  }
}

await fs.writeFile(
  path.join(root, "docs/qa-v11/results.json"),
  `${JSON.stringify(results, null, 2)}\n`,
);

const lines = [
  "# v11 automated QA summary",
  "",
  `Generated: ${results.generatedAt}`,
  "",
  `QA base URL: \`${results.qaBaseUrl}\``,
  "",
  "| Project | Viewports | Layout/resource failures | Silk states | Reduce infinite | Map landscape overflow |",
  "| --- | ---: | ---: | ---: | ---: | ---: |",
];

for (const project of projects) {
  const result = results.projects[project];
  const layoutFailures = result.viewports.reduce(
    (total, viewport) =>
      total +
      viewport.overflow +
      viewport.smallTargets +
      viewport.wrappedButtons +
      viewport.probableOrphans +
      viewport.brokenImages +
      viewport.consoleErrors +
      viewport.pageErrors +
      viewport.failedRequests +
      viewport.badResponses,
    0,
  );
  lines.push(
    `| ${project} | ${result.viewports.length} | ${layoutFailures} | ${result["silk-trail"].states.length} | ${result["reduced-motion"].infinite} | ${result.map.landscapeOverflow} |`,
  );
}

lines.push("", "## SilkTrail scroll measurements", "");
for (const project of projects) {
  lines.push(`### ${project}`, "", "| Progress | stroke-dashoffset |", "| ---: | ---: |");
  for (const state of results.projects[project]["silk-trail"].states) {
    lines.push(`| ${state.progress} | ${state.dashoffset.toFixed(6)} |`);
  }
  const lifecycle = results.projects[project]["silk-trail"].lifecycle;
  lines.push(
    "",
    `Lifecycle request counts: burst ${lifecycle.beforeBurst} → ${lifecycle.afterBurst}; hidden ${lifecycle.hiddenStart}; restore ${lifecycle.restored}; idle ${lifecycle.idleAfterRestore}; persistent loops ${lifecycle.loopCount}.`,
    "",
  );
}

lines.push(
  "## Scope note",
  "",
  "This automated record covers emulated Chromium and Playwright WebKit. Physical iPhone, VoiceOver, Low Power Mode, thermal behavior, browser chrome, and real bfcache/app-switch behavior remain manual release gates.",
  "",
);

await fs.writeFile(path.join(root, "docs/qa-v11/summary.md"), `${lines.join("\n")}\n`);
console.log("wrote docs/qa-v11/results.json and docs/qa-v11/summary.md");
