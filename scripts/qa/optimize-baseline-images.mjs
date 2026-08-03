import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.join(process.cwd(), "docs/qa-threejs-baseline/visual");
const limit = 1_500_000;

async function visit(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await visit(absolute)));
    else if (entry.name.endsWith(".png")) files.push(absolute);
  }
  return files;
}

let optimized = 0;
for (const file of await visit(root)) {
  const before = await fs.stat(file);
  if (before.size <= limit) continue;
  const temporary = `${file}.qa-optimized.png`;
  await sharp(file)
    .png({ compressionLevel: 9, adaptiveFiltering: true, palette: true, quality: 100, dither: 0 })
    .toFile(temporary);
  const after = await fs.stat(temporary);
  if (after.size < before.size) {
    await fs.rename(temporary, file);
    process.stdout.write(`${path.relative(process.cwd(), file)}: ${before.size} -> ${after.size}\n`);
    optimized += 1;
  } else {
    await fs.unlink(temporary);
  }
}

process.stdout.write(`Optimized ${optimized} baseline image(s).\n`);
