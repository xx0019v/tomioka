import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import process from "node:process";

const root = path.resolve(process.cwd(), process.env.QA_EXPORT_DIR ?? "out");
const basePath = (process.env.QA_BASE_PATH ?? "/tomioka").replace(/\/$/, "");
const port = Number(process.env.QA_PORT ?? 4173);
const host = process.env.QA_HOST ?? "127.0.0.1";
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};

function candidatePath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://${host}:${port}`).pathname);
  if (basePath && pathname !== basePath && !pathname.startsWith(`${basePath}/`)) return null;
  let relative = basePath ? pathname.slice(basePath.length) : pathname;
  relative = relative.replace(/^\/+/, "");
  if (!relative || relative.endsWith("/")) relative += "index.html";
  const absolute = path.resolve(root, relative);
  if (absolute !== root && !absolute.startsWith(`${root}${path.sep}`)) return null;
  return absolute;
}

const server = http.createServer(async (request, response) => {
  let file = candidatePath(request.url ?? "/");
  try {
    if (!file) throw new Error("outside base path");
    let stat = await fs.stat(file).catch(() => null);
    if (stat?.isDirectory()) {
      file = path.join(file, "index.html");
      stat = await fs.stat(file).catch(() => null);
    }
    if (!stat?.isFile()) {
      file = path.join(root, "404.html");
      response.statusCode = 404;
    }
    const body = await fs.readFile(file);
    response.setHeader("Content-Type", types[path.extname(file).toLowerCase()] ?? "application/octet-stream");
    response.setHeader("Cache-Control", "no-store");
    response.end(body);
  } catch {
    response.statusCode = 404;
    response.end("Not found");
  }
});

server.listen(port, host, () => {
  process.stdout.write(`Static export: http://${host}:${port}${basePath || "/"}\n`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
