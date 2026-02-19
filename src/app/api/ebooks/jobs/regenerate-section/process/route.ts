import { NextResponse } from "next/server";

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

  const body = (await req.json().catch(() => null)) as { job_id?: string } | null;
  const jobId = String(body?.job_id ?? "").trim();
  if (!jobId) {
    return NextResponse.json({ error: "Missing job_id." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  const { data: job, error: jobErr } = await admin
    .from("ebook_jobs")
    .select("id, ebook_id, user_id, status, input_json")
    .eq("id", jobId)
    .eq("job_type", "regenerate_section")
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
      step: "regenerate_running",
      progress_pct: 35,
      started_at: nowIso,
    })
    .eq("id", job.id)
    .eq("status", "queued")
    .select("id")
    .maybeSingle();

  if (claimErr) {
    return NextResponse.json({ error: "Unable to claim regenerate job." }, { status: 500 });
  }

  if (!claimedJob) {
    return NextResponse.json({ ok: true, skipped: true, status: "running" });
  }

  const input = (job.input_json ?? {}) as {
    section_id?: string;
    instruction?: string | null;
    preserve_key_points?: string[];
  };

  const sectionId = String(input.section_id ?? "").trim();
  if (!sectionId) {
    await admin
      .from("ebook_jobs")
      .update({
        status: "failed",
        step: "missing_section_id",
        progress_pct: 100,
        error_code: "missing_section_id",
        error_message: "Section id is missing in regenerate job input.",
        finished_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    return NextResponse.json({ error: "Missing section id." }, { status: 400 });
  }

  const { data: ebook } = await admin
    .from("ebooks")
    .select("id, user_id, active_version_id")
    .eq("id", job.ebook_id)
    .eq("user_id", job.user_id)
    .maybeSingle();

  if (!ebook?.active_version_id) {
    await admin
      .from("ebook_jobs")
      .update({
        status: "failed",
        step: "ebook_version_missing",
        progress_pct: 100,
        error_code: "ebook_version_missing",
        error_message: "Active eBook version not found.",
        finished_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    return NextResponse.json({ error: "Active eBook version not found." }, { status: 404 });
  }

  const { data: section } = await admin
    .from("ebook_sections")
    .select("id, heading, body_richtext")
    .eq("id", sectionId)
    .eq("ebook_version_id", ebook.active_version_id)
    .maybeSingle();

  if (!section) {
    await admin
      .from("ebook_jobs")
      .update({
        status: "failed",
        step: "section_not_found",
        progress_pct: 100,
        error_code: "section_not_found",
        error_message: "Section not found for active version.",
        finished_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    return NextResponse.json({ error: "Section not found." }, { status: 404 });
  }

  const sourceText =
    (section.body_richtext as { blocks?: Array<{ text?: string }> } | null)?.blocks
      ?.map((b) => b.text ?? "")
      .join("\n")
      .trim() ?? "";

  const instruction = String(input.instruction ?? "").trim();
  const keyPoints = Array.isArray(input.preserve_key_points)
    ? input.preserve_key_points.map((p) => String(p).trim()).filter(Boolean)
    : [];

  const regenerated = [
    sourceText || section.heading || "Section",
    "",
    `Regenerated variation: ${instruction || "improved clarity, stronger flow, and richer examples"}.`,
    keyPoints.length ? `Key points preserved: ${keyPoints.join("; ")}.` : null,
  ]
    .filter((chunk): chunk is string => !!chunk)
    .join("\n");

  const nextUpdatedAt = new Date().toISOString();

  const { error: updateSectionErr } = await admin
    .from("ebook_sections")
    .update({
      body_richtext: {
        blocks: [
          {
            type: "paragraph",
            text: regenerated,
          },
        ],
      },
      word_count: toWordCount(regenerated),
      updated_at: nextUpdatedAt,
    })
    .eq("id", sectionId)
    .eq("ebook_version_id", ebook.active_version_id);

  if (updateSectionErr) {
    await admin
      .from("ebook_jobs")
      .update({
        status: "failed",
        step: "section_update_failed",
        progress_pct: 100,
        error_code: "section_update_failed",
        error_message: "Unable to persist regenerated section.",
        finished_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    return NextResponse.json({ error: "Unable to persist regenerated section." }, { status: 500 });
  }

  await admin
    .from("ebooks")
    .update({
      updated_at: nextUpdatedAt,
    })
    .eq("id", ebook.id)
    .eq("user_id", job.user_id);

  await admin
    .from("ebook_jobs")
    .update({
      status: "succeeded",
      step: "regenerate_completed",
      progress_pct: 100,
      output_json: {
        section_id: sectionId,
        provider: "phase2_stub",
      },
      finished_at: new Date().toISOString(),
    })
    .eq("id", job.id);

  return NextResponse.json({
    ok: true,
    job_id: job.id,
    ebook_id: ebook.id,
    section_id: sectionId,
  });
}

