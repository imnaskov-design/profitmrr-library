import { NextResponse } from "next/server";

import { buildDraftAst } from "@/lib/ebooks";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function getInternalJobSecret() {
  const configured = process.env.EBOOK_INTERNAL_JOB_SECRET?.trim();
  if (configured) return configured;

  if (process.env.NODE_ENV !== "production") {
    return "dev-only-ebook-job-secret";
  }

  return "";
}

function toWordCount(text: string) {
  return text
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean).length;
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
    .select("id, ebook_id, user_id, status, input_json")
    .eq("id", jobId)
    .eq("job_type", "generate")
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

  const input = (job.input_json ?? {}) as Record<string, unknown>;
  const title = String(input.title ?? "Untitled eBook").trim() || "Untitled eBook";
  const niche = String(input.niche ?? "General").trim() || "General";
  const category = String(input.category ?? "Guide").trim() || "Guide";
  const tone = String(input.tone ?? "Professional").trim() || "Professional";
  const language = String(input.language ?? "English").trim() || "English";

  const targetPageCountRaw = Number(input.target_page_count ?? 40);
  const targetPageCount = Number.isFinite(targetPageCountRaw)
    ? Math.max(10, Math.min(300, Math.round(targetPageCountRaw)))
    : 40;

  const uniquenessMode = Boolean(input.uniqueness_mode);

  const nowIso = new Date().toISOString();

  const { data: claimedJob, error: claimErr } = await admin
    .from("ebook_jobs")
    .update({
      status: "running",
      step: "outline_generation",
      progress_pct: 25,
      started_at: nowIso,
    })
    .eq("id", job.id)
    .eq("status", "queued")
    .select("id")
    .maybeSingle();

  if (claimErr) {
    return NextResponse.json({ error: "Unable to claim job." }, { status: 500 });
  }

  if (!claimedJob) {
    return NextResponse.json({ ok: true, skipped: true, status: "running" });
  }

  const draftAst = buildDraftAst({
    title,
    niche,
    category,
    tone,
    language,
    targetPageCount,
    uniquenessMode,
  });

  const versionId = crypto.randomUUID();

  const { error: versionErr } = await admin.from("ebook_versions").insert({
    id: versionId,
    ebook_id: job.ebook_id,
    version_number: 1,
    source: "generated",
    content_json: draftAst,
    outline_json: {
      chapters: draftAst.chapters.map((chapter) => ({
        key: chapter.key,
        title: chapter.title,
        section_count: chapter.sections.length,
      })),
    },
    quality_score: 85,
    quality_report_json: {
      provider: "phase2_pipeline_stub",
      stage: "quality_scoring",
      checks: {
        headings: "pass",
        placeholders: "pass",
        duplicate_paragraphs: "pass",
      },
    },
    created_by: job.user_id,
    created_at: nowIso,
  });

  if (versionErr) {
    await admin
      .from("ebook_jobs")
      .update({
        status: "failed",
        step: "persist_version_failed",
        progress_pct: 100,
        error_code: "persist_version_failed",
        error_message: "Unable to persist generated draft version.",
        finished_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    await admin
      .from("ebooks")
      .update({
        status: "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", job.ebook_id)
      .eq("user_id", job.user_id);

    return NextResponse.json({ error: "Unable to persist version." }, { status: 500 });
  }

  await admin
    .from("ebook_jobs")
    .update({
      status: "running",
      step: "section_drafting",
      progress_pct: 70,
    })
    .eq("id", job.id);

  const sectionRows = draftAst.chapters.flatMap((chapter, chapterIndex) =>
    chapter.sections.map((section, sectionIndex) => {
      const text = section.blocks
        .map((b) => String(b.text ?? ""))
        .join(" ")
        .trim();

      return {
        ebook_version_id: versionId,
        chapter_index: chapterIndex + 1,
        section_index: sectionIndex + 1,
        section_key: section.key,
        heading: section.heading,
        body_richtext: {
          blocks: section.blocks,
        },
        word_count: toWordCount(text),
        est_page_span: 1,
        created_at: nowIso,
        updated_at: nowIso,
      };
    }),
  );

  if (sectionRows.length > 0) {
    const { error: sectionErr } = await admin.from("ebook_sections").insert(sectionRows);
    if (sectionErr) {
      await admin.from("ebook_versions").delete().eq("id", versionId).eq("ebook_id", job.ebook_id);

      await admin
        .from("ebook_jobs")
        .update({
          status: "failed",
          step: "persist_sections_failed",
          progress_pct: 100,
          error_code: "persist_sections_failed",
          error_message: "Unable to persist generated sections.",
          finished_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      await admin
        .from("ebooks")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.ebook_id)
        .eq("user_id", job.user_id);

      return NextResponse.json({ error: "Unable to persist sections." }, { status: 500 });
    }
  }

  const finishedIso = new Date().toISOString();

  await admin
    .from("ebooks")
    .update({
      status: "ready",
      active_version_id: versionId,
      updated_at: finishedIso,
    })
    .eq("id", job.ebook_id)
    .eq("user_id", job.user_id);

  await admin
    .from("ebook_jobs")
    .update({
      status: "succeeded",
      step: "draft_ready",
      progress_pct: 100,
      output_json: {
        active_version_id: versionId,
        sections_created: sectionRows.length,
        quality_score: 85,
      },
      finished_at: finishedIso,
    })
    .eq("id", job.id);

  return NextResponse.json({
    ok: true,
    job_id: job.id,
    ebook_id: job.ebook_id,
    active_version_id: versionId,
    sections_created: sectionRows.length,
  });
}

