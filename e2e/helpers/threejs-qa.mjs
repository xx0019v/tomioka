import fs from "node:fs/promises";
import path from "node:path";

export const OFFICIAL_URL = "https://mayu-no-chizu.cid-ac.com/";
export const ACCEPTANCE_MODE = process.env.THREEJS_ACCEPTANCE === "1";
export const CAPTURE_BASELINE = process.env.THREEJS_CAPTURE_BASELINE === "1";

export const VIEWPORTS = {
  mobile: [
    { width: 320, height: 568 },
    { width: 375, height: 667 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
  ],
  tablet: [{ width: 768, height: 1024 }],
  desktop: [
    { width: 1024, height: 768 },
    { width: 1280, height: 800 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ],
};

export const ROUTES = ["/", "/map/", "/information/"];

export const FACILITIES = [
  "お富ちゃん家",
  "アトリエ",
  "岡重",
  "銀座まちなか交流館",
  "キリンヤ",
  "カフェドローム",
];

export const PIN_COORDINATES = {
  お富ちゃん家: { latitude: 36.2561208, longitude: 138.8914794 },
  キリンヤ: { latitude: 36.25773372, longitude: 138.88893693 },
  カフェドローム: { latitude: 36.255608, longitude: 138.889552 },
};

export const JAPANESE_UNITS = [
  "永山 繭",
  "お富ちゃん家",
  "歩きながら、",
  "探し出してほしい。",
  "お越しください",
  "街歩き型の物語",
];

export function routeUrl(baseURL, route) {
  return new URL(route.replace(/^\//, ""), `${baseURL.replace(/\/$/, "")}/`).toString();
}

export async function createContext(browser, viewport, options = {}) {
  return browser.newContext({
    viewport,
    deviceScaleFactor: options.deviceScaleFactor ?? 1,
    hasTouch: options.hasTouch ?? viewport.width <= 430,
    isMobile: options.isMobile ?? viewport.width <= 430,
    locale: "ja-JP",
    timezoneId: "Asia/Tokyo",
    reducedMotion: options.reducedMotion ?? "reduce",
    ...options,
  });
}

export async function settlePage(page, { freezeMotion = true } = {}) {
  await page.waitForLoadState("domcontentloaded");
  await page.locator("main").waitFor({ state: "visible" });
  if (freezeMotion) {
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
          scroll-behavior: auto !important;
        }
        * { caret-color: transparent !important; }
        html { scrollbar-width: none !important; }
        ::-webkit-scrollbar { display: none !important; }
      `,
    });
  }
  await page.evaluate(async () => {
    const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
    if (document.fonts?.ready) await Promise.race([document.fonts.ready, delay(3_000)]);
    const step = Math.max(1, innerHeight);
    const initialHeight = document.documentElement.scrollHeight;
    const maxSteps = Math.min(40, Math.ceil(initialHeight / step));
    for (let index = 0; index <= maxSteps; index += 1) {
      const y = Math.min(initialHeight, index * step);
      scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    const images = [...document.images];
    await Promise.race([
      Promise.all(
        images.map((image) => {
          if (image.complete) return Promise.resolve();
          return new Promise((resolve) => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", resolve, { once: true });
          });
        }),
      ),
      delay(3_000),
    ]);
    await Promise.race([
      Promise.all(images.filter((image) => image.complete).map((image) => image.decode?.().catch(() => undefined))),
      delay(3_000),
    ]);
    for (const video of document.querySelectorAll("video")) video.pause();
    scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    scrollTo(0, 0);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

export function observePageFailures(page, baseURL) {
  const result = {
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
    badResponses: [],
    webglMessages: [],
  };
  const origin = new URL(baseURL).origin;
  page.on("console", (message) => {
    const text = message.text();
    if (message.type() === "error") result.consoleErrors.push(text);
    if (/webgl|shader|gl_invalid|context lost/i.test(text)) result.webglMessages.push(text);
  });
  page.on("pageerror", (error) => result.pageErrors.push(error.message));
  page.on("requestfailed", (request) => {
    const failure = request.failure()?.errorText ?? "unknown";
    const cancelledPrefetch = request.resourceType() === "fetch" && /ERR_ABORTED|cancelled/i.test(failure);
    if (new URL(request.url()).origin === origin && !cancelledPrefetch) {
      result.failedRequests.push(`${request.resourceType()} ${failure} ${request.url()}`);
    }
  });
  page.on("response", (response) => {
    if (new URL(response.url()).origin === origin && response.status() >= 400) {
      result.badResponses.push(`${response.status()} ${response.url()}`);
    }
  });
  return result;
}

export async function installRuntimeProbe(page) {
  await page.addInitScript(() => {
    const probe = {
      canvasContextRequests: [],
      webglContexts: 0,
      rafScheduled: 0,
      rafCancelled: 0,
      activeRafIds: new Set(),
      longTasks: [],
      layoutShifts: [],
      largestContentfulPaint: [],
      eventDurations: [],
    };

    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function qaGetContext(type, ...args) {
      const normalized = String(type).toLowerCase();
      probe.canvasContextRequests.push(normalized);
      const types = new Set((this.dataset.qaContextTypes ?? "").split(",").filter(Boolean));
      types.add(normalized);
      this.dataset.qaContextTypes = [...types].join(",");
      const context = originalGetContext.call(this, type, ...args);
      if (context && (normalized === "webgl" || normalized === "webgl2" || normalized === "experimental-webgl")) {
        probe.webglContexts += 1;
      }
      return context;
    };

    const originalRaf = window.requestAnimationFrame.bind(window);
    const originalCancel = window.cancelAnimationFrame.bind(window);
    window.requestAnimationFrame = (callback) => {
      let id = 0;
      id = originalRaf((time) => {
        probe.activeRafIds.delete(id);
        callback(time);
      });
      probe.rafScheduled += 1;
      probe.activeRafIds.add(id);
      return id;
    };
    window.cancelAnimationFrame = (id) => {
      probe.activeRafIds.delete(id);
      probe.rafCancelled += 1;
      originalCancel(id);
    };

    const observe = (type, target) => {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (type === "layout-shift" && !entry.hadRecentInput) target.push(entry.value);
            else if (type === "event") target.push(entry.duration);
            else if (type === "largest-contentful-paint") target.push(entry.startTime);
            else target.push(entry.duration);
          }
        });
        observer.observe({ type, buffered: true, durationThreshold: type === "event" ? 16 : undefined });
      } catch {}
    };
    observe("longtask", probe.longTasks);
    observe("layout-shift", probe.layoutShifts);
    observe("largest-contentful-paint", probe.largestContentfulPaint);
    observe("event", probe.eventDurations);

    Object.defineProperty(window, "__QA_RUNTIME_PROBE__", {
      configurable: false,
      enumerable: false,
      value: probe,
      writable: false,
    });
  });
}

export async function runtimeSnapshot(page) {
  return page.evaluate(() => {
    const probe = window.__QA_RUNTIME_PROBE__;
    const hook = window.__THREEJS_QA__;
    const canvases = [...document.querySelectorAll("canvas")].map((canvas) => {
      const rect = canvas.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        backingWidth: canvas.width,
        backingHeight: canvas.height,
        backingRatio: rect.width ? canvas.width / rect.width : 0,
        ariaHidden: canvas.getAttribute("aria-hidden"),
        pointerEvents: getComputedStyle(canvas).pointerEvents,
        webgl: /(^|,)(webgl2?|experimental-webgl)(,|$)/.test(canvas.dataset.qaContextTypes ?? ""),
      };
    });
    const animations = document.getAnimations();
    return {
      hookPresent: Boolean(hook),
      hook: hook?.snapshot?.() ?? null,
      canvasCount: canvases.length,
      webglCanvasCount: canvases.filter((canvas) => canvas.webgl).length,
      canvases,
      rafActiveCallbacks: probe?.activeRafIds?.size ?? null,
      rafScheduled: probe?.rafScheduled ?? null,
      rafCancelled: probe?.rafCancelled ?? null,
      runningAnimations: animations.filter((animation) => animation.playState === "running").length,
      persistentAnimations: animations.filter((animation) => {
        const iterations = animation.effect?.getTiming?.().iterations;
        return iterations === Infinity || Number(iterations) > 8;
      }).length,
      longTasks: probe?.longTasks ?? [],
      cls: (probe?.layoutShifts ?? []).reduce((sum, value) => sum + value, 0),
      lcpMs: Math.max(0, ...(probe?.largestContentfulPaint ?? [])),
      maxEventDurationMs: Math.max(0, ...(probe?.eventDurations ?? [])),
      memory: performance.memory
        ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
          }
        : null,
    };
  });
}

export async function lineMap(locator) {
  return locator.evaluate((element) => {
    const lines = new Map();
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
        if (!rect.width || !rect.height) continue;
        const key = Math.round(rect.top);
        lines.set(key, `${lines.get(key) ?? ""}${value}`);
      }
    }
    return [...lines.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([top, text]) => ({ top, text }));
  });
}

export async function writeJson(relativePath, value) {
  const destination = path.join(process.cwd(), relativePath);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, `${JSON.stringify(value, null, 2)}\n`);
}

export function padWidth(width) {
  return String(width).padStart(4, "0");
}
