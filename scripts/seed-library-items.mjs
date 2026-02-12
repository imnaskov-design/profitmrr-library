import fs from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

function usage() {
  // eslint-disable-next-line no-console
  console.log(`\nProfitMRR Library — Seed library_items from CSV\n\nUsage:\n  npm run seed:library -- <path-to-csv> [--dry-run]\n\nExamples:\n  npm run seed:library -- data/library_items.sample.csv\n  npm run seed:library -- data/library_items.sample.csv --dry-run\n\nCSV headers supported:\n  title, category, description, tags, r2_key, file_size_mb, is_new, starter_pack\n\nNotes:\n- tags can be separated by | or ; or , (comma-separated tags should be quoted).\n- r2_key should match the object key path in your private R2 bucket (no leading /).\n\nEnv vars required (service role is needed to bypass RLS for seeding):\n  NEXT_PUBLIC_SUPABASE_URL\n  SUPABASE_SERVICE_ROLE_KEY\n`);
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/g)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (!key) continue;
    if (process.env[key] != null && process.env[key] !== "") continue;

    // Strip quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function parseCsv(content) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  const normalized = content.replaceAll("\r\n", "\n").replaceAll("\r", "\n");

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];

    if (ch === '"') {
      if (inQuotes && normalized[i + 1] === '"') {
        field += '"';
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }

    if (!inQuotes && ch === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (!inQuotes && ch === "\n") {
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
      continue;
    }

    field += ch;
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function parseBool(value) {
  const v = String(value ?? "").trim().toLowerCase();
  if (!v) return false;
  return v === "1" || v === "true" || v === "yes" || v === "y" || v === "on";
}

function parseNumber(value) {
  const v = String(value ?? "").trim();
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseTags(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  const delimiter = raw.includes("|")
    ? "|"
    : raw.includes(";")
      ? ";"
      : raw.includes(",")
        ? ","
        : null;

  const parts = delimiter ? raw.split(delimiter) : [raw];
  const tags = parts
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 50);

  return tags.length ? tags : null;
}

function normalizeR2Key(value) {
  return String(value ?? "").trim().replace(/^\/+/, "");
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const csvPathArg = args.find((a) => !a.startsWith("--"));
  const csvPath = csvPathArg
    ? path.resolve(process.cwd(), csvPathArg)
    : path.resolve(process.cwd(), "data/library_items.sample.csv");

  // Load env from common local files if present.
  loadEnvFile(path.resolve(process.cwd(), ".env.local"));
  loadEnvFile(path.resolve(process.cwd(), ".dev.vars"));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRole) {
    // eslint-disable-next-line no-console
    console.error("Missing env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY");
    usage();
    process.exit(1);
  }

  if (!fs.existsSync(csvPath)) {
    // eslint-disable-next-line no-console
    console.error(`CSV not found: ${csvPath}`);
    usage();
    process.exit(1);
  }

  const csv = fs.readFileSync(csvPath, "utf8");
  const rows = parseCsv(csv).filter((r) => r.some((c) => String(c ?? "").trim() !== ""));
  if (rows.length < 2) {
    // eslint-disable-next-line no-console
    console.error("CSV must include a header row and at least 1 data row.");
    process.exit(1);
  }

  const header = rows[0].map((h) => String(h ?? "").trim());
  const indexOf = (name) => header.findIndex((h) => h.toLowerCase() === name.toLowerCase());

  const idxTitle = indexOf("title");
  const idxCategory = indexOf("category");
  const idxR2Key = indexOf("r2_key");

  if (idxTitle < 0 || idxCategory < 0 || idxR2Key < 0) {
    // eslint-disable-next-line no-console
    console.error("CSV is missing required headers: title, category, r2_key");
    process.exit(1);
  }

  const idxDesc = indexOf("description");
  const idxTags = indexOf("tags");
  const idxSize = indexOf("file_size_mb");
  const idxNew = indexOf("is_new");
  const idxStarter = indexOf("starter_pack");
  const idxId = indexOf("id");

  const parsed = [];
  const seenKeys = new Set();

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const title = String(r[idxTitle] ?? "").trim();
    const category = String(r[idxCategory] ?? "").trim();
    const r2Key = normalizeR2Key(r[idxR2Key]);

    if (!title || !category || !r2Key) continue;

    // De-dupe by r2_key (last row wins)
    if (seenKeys.has(r2Key)) {
      const existingIndex = parsed.findIndex((x) => x.r2_key === r2Key);
      if (existingIndex >= 0) parsed.splice(existingIndex, 1);
    }
    seenKeys.add(r2Key);

    const description = idxDesc >= 0 ? String(r[idxDesc] ?? "").trim() : "";
    const tagsRaw = idxTags >= 0 ? String(r[idxTags] ?? "").trim() : "";
    const sizeRaw = idxSize >= 0 ? r[idxSize] : null;
    const isNewRaw = idxNew >= 0 ? r[idxNew] : "";
    const starterRaw = idxStarter >= 0 ? r[idxStarter] : "";
    const idRaw = idxId >= 0 ? String(r[idxId] ?? "").trim() : "";

    parsed.push({
      id: idRaw || null,
      title,
      category,
      description: description || null,
      tags: parseTags(tagsRaw),
      r2_key: r2Key,
      file_size_mb: parseNumber(sizeRaw),
      is_new: parseBool(isNewRaw),
      starter_pack: parseBool(starterRaw),
    });
  }

  if (!parsed.length) {
    // eslint-disable-next-line no-console
    console.error("No valid rows found in CSV.");
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.log(`Parsed ${parsed.length} rows from CSV.`);

  if (dryRun) {
    // eslint-disable-next-line no-console
    console.log("Dry-run enabled. First 3 rows:");
    // eslint-disable-next-line no-console
    console.log(parsed.slice(0, 3));
    process.exit(0);
  }

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  // Build r2_key -> id map for idempotent seeding.
  const existing = new Map();
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("library_items")
      .select("id, r2_key")
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data?.length) break;
    for (const row of data) {
      if (row?.r2_key && row?.id) existing.set(String(row.r2_key), String(row.id));
    }
    if (data.length < pageSize) break;
  }

  let willInsert = 0;
  let willUpdate = 0;

  const toUpsert = parsed.map((row) => {
    const existingId = existing.get(row.r2_key);
    if (existingId) {
      willUpdate += 1;
      return { ...row, id: existingId };
    }

    willInsert += 1;
    return { ...row, id: row.id || crypto.randomUUID() };
  });

  // eslint-disable-next-line no-console
  console.log(`Upserting ${toUpsert.length} rows (insert: ${willInsert}, update: ${willUpdate})...`);

  const chunkSize = 500;
  for (let i = 0; i < toUpsert.length; i += chunkSize) {
    const chunk = toUpsert.slice(i, i + chunkSize);
    const { error } = await supabase.from("library_items").upsert(chunk, {
      onConflict: "id",
    });
    if (error) throw error;
    // eslint-disable-next-line no-console
    console.log(`  ✓ ${Math.min(i + chunkSize, toUpsert.length)}/${toUpsert.length}`);
  }

  // eslint-disable-next-line no-console
  console.log("Done.");
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

