import { NextResponse } from "next/server";

import {
  buildFallbackExportHtml,
  buildFallbackExportText,
  buildR2ExportKey,
  persistFallbackExportToR2,
} from "@/lib/ebook-exports";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function getInternalJobSecret() {
  const configured = process.env.EBOOK_INTERNAL_JOB_SECRET?.trim();
  if (configured) return configured;

  if (process.env.NODE_ENV !== "production") {
    return "dev-only-ebook-job-secret";
  }

  return "";
}

export async function POST(req: Request) {
  const internalSecret = getInternalJobSecret();
  if (!internalSecret) {
    return NextResponse.json({ error: "Processing secret not configured." }, { status: 500 });
  }

  const headerSecret = req.headers.get("x-ebook-job-secret") ?? "";
  if (headerSecret !== internalSecret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | {
        job_id?: string;
      }
    | null;

  const jobId = String(body?.job_id ?? "").trim();
  if (!jobId) {
    return NextResponse.json({ error: "Missing job_id." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  const { data: job, error: jobErr } = await admin
    .from("ebook_jobs")
    .select("id, ebook_id, user_id, status, input_json, output_json")
    .eq("id", jobId)
    .eq("job_type", "export")
    .maybeSingle();

  if (jobErr || !job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  if (job.status === "succeeded") {
    return NextResponse.json({ ok: true, already_processed: true });
  }

  if (job.status !== "queued") {
    return NextResponse.json({ ok: true, skipped: true, status: job.status });
  }

  const nowIso = new Date().toISOString();
  const { data: claimedJob, error: claimErr } = await admin
    .from("ebook_jobs")
    .update({
      status: "running",
      step: "export_rendering",
      progress_pct: 30,
      started_at: nowIso,
    })
    .eq("id", job.id)
    .eq("status", "queued")
    .select("id")
    .maybeSingle();

  if (claimErr) {
    return NextResponse.json({ error: "Unable to claim export job." }, { status: 500 });
  }

  if (!claimedJob) {
    return NextResponse.json({ ok: true, skipped: true, status: "running" });
  }

  const input = (job.input_json ?? {}) as {
    profile?: "us_letter" | "a4";
    export_ids?: string[];
  };

  const exportIds = Array.isArray(input.export_ids) ? input.export_ids : [];
  const profile = input.profile === "a4" ? "a4" : "us_letter";

  if (!exportIds.length) {
    await admin
      .from("ebook_jobs")
      .update({
        status: "failed",
        step: "missing_exports",
        progress_pct: 100,
        error_code: "missing_exports",
        error_message: "No queued exports were found for this job.",
        finished_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    return NextResponse.json({ error: "No exports to process." }, { status: 500 });
  }

  const { data: exportRows, error: exportRowsErr } = await admin
    .from("ebook_exports")
    .select("id, format, ebook_version_id")
    .in("id", exportIds)
    .eq("ebook_id", job.ebook_id)
    .eq("user_id", job.user_id);

  if (exportRowsErr || !exportRows?.length) {
    await admin
      .from("ebook_jobs")
      .update({
        status: "failed",
        step: "load_exports_failed",
        progress_pct: 100,
        error_code: "load_exports_failed",
        error_message: "Unable to load queued exports for this job.",
        finished_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    return NextResponse.json({ error: "Unable to load exports." }, { status: 500 });
  }

  const renderingIso = new Date().toISOString();
  await admin
    .from("ebook_exports")
    .update({
      status: "rendering",
    })
    .in("id", exportRows.map((row) => row.id));

  await admin
    .from("ebook_jobs")
    .update({
      status: "running",
      step: "export_compiling",
      progress_pct: 60,
    })
    .eq("id", job.id);

  const ebookVersionId = String(exportRows[0]?.ebook_version_id ?? "").trim();

  const [{ data: ebook }, { data: version }, { data: sectionRows }] = await Promise.all([
    admin
      .from("ebooks")
      .select("id, title, niche, category, tone, language")
      .eq("id", job.ebook_id)
      .eq("user_id", job.user_id)
      .maybeSingle(),
    ebookVersionId
      ? admin
          .from("ebook_versions")
          .select("id, ebook_id, outline_json")
          .eq("id", ebookVersionId)
          .eq("ebook_id", job.ebook_id)
          .maybeSingle()
      : Promise.resolve({ data: null as { id: string; ebook_id: string; outline_json: unknown } | null }),
    ebookVersionId
      ? admin
          .from("ebook_sections")
          .select("chapter_index, section_index, heading, body_richtext")
          .eq("ebook_version_id", ebookVersionId)
          .order("chapter_index", { ascending: true })
          .order("section_index", { ascending: true })
      : Promise.resolve({ data: [] as Array<{ chapter_index: number; section_index: number; heading: string; body_richtext: unknown }> }),
  ]);

  if (!ebook || !version || !ebookVersionId) {
    await admin
      .from("ebook_jobs")
      .update({
        status: "failed",
        step: "export_source_missing",
        progress_pct: 100,
        error_code: "export_source_missing",
        error_message: "Unable to load eBook source for export rendering.",
        finished_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    return NextResponse.json({ error: "Unable to load source data for export." }, { status: 500 });
  }

  const chapterMap = new Map<number, { title: string; sections: Array<{ heading: string; text: string }> }>();

  const outlineChapters = Array.isArray((version.outline_json as { chapters?: unknown } | null)?.chapters)
    ? ((version.outline_json as { chapters: Array<{ title?: string }> }).chapters ?? [])
    : [];

  for (const section of sectionRows ?? []) {
    const chapterIndex = Math.max(1, Number(section.chapter_index ?? 1));
    if (!chapterMap.has(chapterIndex)) {
      const outlineTitle = String(outlineChapters[chapterIndex - 1]?.title ?? "").trim();
      chapterMap.set(chapterIndex, {
        title: outlineTitle || `Chapter ${chapterIndex}`,
        sections: [],
      });
    }

    const chapter = chapterMap.get(chapterIndex)!;
    const blocks = (section.body_richtext as { blocks?: Array<{ text?: string; items?: string[] }> } | null)?.blocks ?? [];
    const text = blocks
      .flatMap((block) => {
        if (Array.isArray(block?.items) && block.items.length > 0) {
          return block.items.map((item) => String(item ?? "").trim());
        }
        return String(block?.text ?? "").trim();
      })
      .filter(Boolean)
      .join("\n\n");

    chapter.sections.push({
      heading: String(section.heading ?? "Untitled section").trim() || "Untitled section",
      text: text || "(No content yet)",
    });
  }

  const compiledChapters = [...chapterMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, chapter]) => chapter);

  await admin
    .from("ebook_jobs")
    .update({
      status: "running",
      step: "export_finalizing",
      progress_pct: 80,
    })
    .eq("id", job.id);

  for (const row of exportRows) {
    const format = row.format as "pdf" | "docx" | "epub";
    const generatedAtIso = new Date().toISOString();

    const textPayload = buildFallbackExportText({
      title: String(ebook.title ?? "Untitled eBook").trim() || "Untitled eBook",
      niche: String(ebook.niche ?? "General").trim() || "General",
      category: String(ebook.category ?? "Guide").trim() || "Guide",
      tone: String(ebook.tone ?? "Professional").trim() || "Professional",
      language: String(ebook.language ?? "English").trim() || "English",
      profile,
      format,
      generatedAtIso,
      chapters: compiledChapters,
    });

    const htmlPayload = buildFallbackExportHtml({
      title: String(ebook.title ?? "Untitled eBook").trim() || "Untitled eBook",
      niche: String(ebook.niche ?? "General").trim() || "General",
      category: String(ebook.category ?? "Guide").trim() || "Guide",
      tone: String(ebook.tone ?? "Professional").trim() || "Professional",
      language: String(ebook.language ?? "English").trim() || "English",
      profile,
      format,
      generatedAtIso,
      chapters: compiledChapters,
    });

    const r2Key = buildR2ExportKey({
      ebookId: job.ebook_id,
      versionId: ebookVersionId,
      exportId: row.id,
      profile,
      format,
    });

    let fileSizeBytes = 0;
    try {
      const uploaded = await persistFallbackExportToR2({
        r2Key,
        format,
        textPayload,
        htmlPayload,
      });
      fileSizeBytes = uploaded.fileSizeBytes;
    } catch {
      await admin
        .from("ebook_exports")
        .update({
          status: "failed",
          ready_at: null,
        })
        .eq("id", row.id)
        .eq("user_id", job.user_id);

      await admin
        .from("ebook_jobs")
        .update({
          status: "failed",
          step: "export_render_failed",
          progress_pct: 100,
          error_code: "export_render_failed",
          error_message: `Failed to upload ${format.toUpperCase()} export payload.`,
          finished_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      return NextResponse.json({ error: "Failed to render export file." }, { status: 500 });
    }

    await admin
      .from("ebook_exports")
      .update({
        status: "ready",
        file_path: r2Key,
        file_size_bytes: fileSizeBytes,
        ready_at: renderingIso,
      })
      .eq("id", row.id)
      .eq("user_id", job.user_id);
  }

  const finishedIso = new Date().toISOString();

  await admin
    .from("ebook_jobs")
    .update({
      status: "succeeded",
      step: "exports_ready",
      progress_pct: 100,
      output_json: {
        ...(job.output_json ?? {}),
        export_ids: exportRows.map((r) => r.id),
      },
      finished_at: finishedIso,
    })
    .eq("id", job.id);

  return NextResponse.json({
    ok: true,
    job_id: job.id,
    ebook_id: job.ebook_id,
    export_ids: exportRows.map((row) => row.id),
  });
}

