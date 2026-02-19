import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { buildEbookUnauthorizedPayload, resolveEbookAuth } from "@/lib/ebooks-auth";
import { headers } from "next/headers";

const schema = z.object({
  instruction: z.string().trim().max(500).optional(),
  preserve_key_points: z.array(z.string().trim().max(200)).max(20).optional(),
});

type Params = {
  id: string;
  sectionId: string;
};

export async function POST(
  req: Request,
  context: {
    params: Promise<Params>;
  },
) {
  const reqHeaders = await headers();
  const { id, sectionId } = await context.params;
  if (!id || !sectionId) {
    return NextResponse.json({ error: "Invalid route parameters." }, { status: 400 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const auth = await resolveEbookAuth(req);
  if (!auth) {
    return NextResponse.json(buildEbookUnauthorizedPayload(req, "ebooks_regenerate_auth_missing_user"), { status: 401 });
  }

  const { db, userId } = auth;

  const { data: ebook } = await db
    .from("ebooks")
    .select("id, user_id, active_version_id")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (!ebook?.active_version_id) {
    return NextResponse.json({ error: "eBook version not available." }, { status: 404 });
  }

  const { data: section } = await db
    .from("ebook_sections")
    .select("id, heading")
    .eq("id", sectionId)
    .eq("ebook_version_id", ebook.active_version_id)
    .maybeSingle();

  if (!section) {
    return NextResponse.json({ error: "Section not found." }, { status: 404 });
  }

  const jobId = randomUUID();
  const nowIso = new Date().toISOString();

  const { error: jobErr } = await db.from("ebook_jobs").insert({
    id: jobId,
    ebook_id: id,
    user_id: userId,
    idempotency_key: `regen_${sectionId}_${Date.now()}`,
    job_type: "regenerate_section",
    status: "queued",
    step: "regenerate_queued",
    progress_pct: 5,
    input_json: {
      section_id: sectionId,
      instruction: parsed.data.instruction ?? null,
      preserve_key_points: parsed.data.preserve_key_points ?? [],
    },
    created_at: nowIso,
  });

  if (jobErr) {
    return NextResponse.json({ error: "Unable to create regenerate job." }, { status: 500 });
  }

  const host = reqHeaders.get("x-forwarded-host") ?? reqHeaders.get("host");
  const proto = reqHeaders.get("x-forwarded-proto") ?? "http";
  const internalSecret =
    process.env.EBOOK_INTERNAL_JOB_SECRET?.trim() || (process.env.NODE_ENV !== "production" ? "dev-only-ebook-job-secret" : "");
  let processingDispatched = false;

  if (host && internalSecret) {
    const processUrl = `${proto}://${host}/api/ebooks/jobs/regenerate-section/process`;

    void fetch(processUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-ebook-job-secret": internalSecret,
      },
      body: JSON.stringify({
        job_id: jobId,
      }),
    }).catch(() => null);

    processingDispatched = true;
  }

  return NextResponse.json({
    job_id: jobId,
    status: "queued",
    step: "regenerate_queued",
    progress_pct: 5,
    section_id: sectionId,
    section_heading: section.heading,
    processing_dispatched: processingDispatched,
  });
}
