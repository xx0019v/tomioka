import { defineConfig } from "@playwright/test";
import fs from "node:fs";

const baseURL = process.env.QA_BASE_URL ?? "http://127.0.0.1:4173/tomioka";
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const managesServer = !process.env.QA_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  timeout: 240_000,
  expect: { timeout: 15_000 },
  outputDir: "test-results/threejs-acceptance",
  snapshotPathTemplate:
    "{testDir}/../docs/qa-threejs-baseline/visual/{projectName}/{arg}{ext}",
  reporter: [["list"]],
  use: {
    baseURL,
    locale: "ja-JP",
    timezoneId: "Asia/Tokyo",
    deviceScaleFactor: 1,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: managesServer
    ? {
        command: "NEXT_PUBLIC_BASE_PATH=/tomioka npm run build && npm run qa:serve-export",
        url: baseURL,
        timeout: 180_000,
        reuseExistingServer: false,
        stdout: "pipe",
        stderr: "pipe",
      }
    : undefined,
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        launchOptions: fs.existsSync(chromePath) ? { executablePath: chromePath } : {},
      },
    },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
});
