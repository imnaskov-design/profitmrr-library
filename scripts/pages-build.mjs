import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
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
const wranglerTomlPath = path.join(projectRoot, "wrangler.toml");
const assetsDir = path.join(openNextDir, "assets");

const requiredPaths = [
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

// Copy OpenNext static assets into .pages root (not .pages/assets) so they
// are served at /_next/* and /favicon.ico paths.
if (existsSync(assetsDir)) {
  const assetEntries = await readdir(assetsDir);
  for (const entry of assetEntries) {
    await cp(path.join(assetsDir, entry), path.join(outDir, entry), {
      recursive: true,
    });
  }
  console.log(`[pages-build] Copied assets entries: ${assetEntries.join(", ")}`);
}

// Pages Functions “advanced mode” entrypoint
await cp(workerSrc, workerDest);
if (existsSync(workerMapSrc)) {
  await cp(workerMapSrc, workerMapDest);
}

// Generate wrangler.toml only at build time so Cloudflare upload step can use
// node compatibility flags without breaking build-time env injection.
const wranglerToml = `name = "profitmrr-library"
pages_build_output_dir = ".pages"
compatibility_date = "2026-02-12"
compatibility_flags = ["nodejs_compat", "global_fetch_strictly_public"]
`;

await writeFile(wranglerTomlPath, wranglerToml, "utf8");

console.log(`[pages-build] Output ready: ${outDir}`);
console.log(`[pages-build] Generated runtime config: ${wranglerTomlPath}`);

