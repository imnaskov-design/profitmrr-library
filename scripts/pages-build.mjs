import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");
const openNextDir = path.join(projectRoot, ".open-next");

const workerSrc = path.join(openNextDir, "worker.js");
const workerMapSrc = path.join(openNextDir, "worker.js.map");

const outDir = path.join(projectRoot, ".pages");
const workerDest = path.join(outDir, "_worker.js");
const workerMapDest = path.join(outDir, "_worker.js.map");

const requiredPaths = [
  "assets",
  "cloudflare",
  "middleware",
  "server-functions",
  ".build",
];

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

// Copy all OpenNext runtime dependencies that _worker.js imports.
for (const relPath of requiredPaths) {
  const src = path.join(openNextDir, relPath);
  if (!existsSync(src)) continue;

  const dest = path.join(outDir, relPath);
  await cp(src, dest, { recursive: true });
}

// Pages Functions “advanced mode” entrypoint
await cp(workerSrc, workerDest);
if (existsSync(workerMapSrc)) {
  await cp(workerMapSrc, workerMapDest);
}

console.log(`[pages-build] Output ready: ${outDir}`);

