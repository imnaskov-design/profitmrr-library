import { NextResponse } from "next/server";

import { coerceEbookJobRow } from "@/lib/ebooks";
import { buildEbookUnauthorizedPayload, resolveEbookAuth } from "@/lib/ebooks-auth";

type Params = {
  jobId: string;
};

export async function GET(
  req: Request,
  context: {
    params: Promise<Params>;
  },
) {
  const { jobId } = await context.params;
  if (!jobId) {
    return NextResponse.json({ error: "Invalid job id." }, { status: 400 });
  }

  const auth = await resolveEbookAuth(req);
  if (!auth) {
    return NextResponse.json(buildEbookUnauthorizedPayload(req, "ebooks_job_auth_missing_user"), { status: 401 });
  }

  const { db, userId } = auth;

  const { data: row, error } = await db
    .from("ebook_jobs")
    .select("id, ebook_id, user_id, idempotency_key, job_type, status, step, progress_pct, error_code, error_message, created_at, finished_at")
    .eq("id", jobId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !row) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  const job = coerceEbookJobRow(row);

  return NextResponse.json({
    job_id: job.id,
    ebook_id: job.ebook_id,
    status: job.status,
    step: job.step,
    progress_pct: job.progress_pct ?? 0,
    error_code: job.error_code,
    error_message: job.error_message,
    created_at: job.created_at,
    finished_at: job.finished_at,
  });
}
