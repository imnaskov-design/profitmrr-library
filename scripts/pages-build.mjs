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
const assetsSrc = path.join(openNextDir, "assets");

const outDir = path.join(projectRoot, ".pages");
const workerDest = path.join(outDir, "_worker.js");
const workerMapDest = path.join(outDir, "_worker.js.map");

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

// Static assets (/_next/static, favicon, etc)
await cp(assetsSrc, outDir, { recursive: true });

// Pages Functions “advanced mode” entrypoint
await cp(workerSrc, workerDest);
if (existsSync(workerMapSrc)) {
  await cp(workerMapSrc, workerMapDest);
}

console.log(`[pages-build] Output ready: ${outDir}`);

