import { NextResponse } from "next/server";

import { coerceEbookJobRow } from "@/lib/ebooks";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Params = {
  jobId: string;
};

export async function GET(
  _req: Request,
  context: {
    params: Promise<Params>;
  },
) {
  const { jobId } = await context.params;
  if (!jobId) {
    return NextResponse.json({ error: "Invalid job id." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data: row, error } = await supabase
    .from("ebook_jobs")
    .select("id, ebook_id, user_id, idempotency_key, job_type, status, step, progress_pct, error_code, error_message, created_at, finished_at")
    .eq("id", jobId)
    .eq("user_id", user.id)
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
