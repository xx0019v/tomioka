import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const baselineRoot = path.join(root, "docs/qa-threejs-baseline");
const manifestPath = path.join(baselineRoot, "manifest.json");

async function visit(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await visit(absolute)));
    else if (absolute !== manifestPath) files.push(absolute);
  }
  return files;
}

const files = (await visit(baselineRoot)).sort();
const entries = await Promise.all(
  files.map(async (absolute) => {
    const content = await fs.readFile(absolute);
    return {
      path: path.relative(baselineRoot, absolute).split(path.sep).join("/"),
      bytes: content.byteLength,
      sha256: createHash("sha256").update(content).digest("hex"),
    };
  }),
);

const imageEntries = entries.filter(({ path: file }) => /\.(?:png|jpe?g)$/i.test(file));
const manifest = {
  schemaVersion: 1,
  baselineCommit: "8a28087478cc858bc1e12908613947c5dad0234e",
  files: entries.length,
  images: imageEntries.length,
  totalBytes: entries.reduce((sum, entry) => sum + entry.bytes, 0),
  largestImageBytes: Math.max(0, ...imageEntries.map(({ bytes }) => bytes)),
  entries,
};

await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(
  `Wrote ${path.relative(root, manifestPath)} (${manifest.files} files, ${manifest.images} images, ${manifest.totalBytes} bytes)\n`,
);
