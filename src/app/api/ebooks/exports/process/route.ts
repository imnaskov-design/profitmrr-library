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

function fakeExportPath(input: {
  ebookId: string;
  format: "pdf" | "docx" | "epub";
  profile: "us_letter" | "a4";
}) {
  return `exports/ebooks/${input.ebookId}/${input.profile}/ebook.${input.format}`;
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
    .select("id, format")
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
      step: "export_finalizing",
      progress_pct: 80,
    })
    .eq("id", job.id);

  for (const row of exportRows) {
    const format = row.format as "pdf" | "docx" | "epub";

    await admin
      .from("ebook_exports")
      .update({
        status: "ready",
        file_path: fakeExportPath({
          ebookId: job.ebook_id,
          format,
          profile,
        }),
        file_size_bytes: 1024 * (format === "epub" ? 820 : format === "docx" ? 1200 : 1800),
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

