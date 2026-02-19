import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import {
  EBOOK_EXPORT_FORMAT_VALUES,
  EBOOK_EXPORT_PROFILE_VALUES,
  ensureIdempotencyKey,
  getCurrentPeriodStart,
  getEbookQuotaExceededCode,
  getEbookQuotaLimit,
  getNextPeriodStart,
  normalizePlanTier,
  type EbookQuotaPeriod,
} from "@/lib/ebooks";
import { buildEbookUnauthorizedPayload, resolveEbookAuth } from "@/lib/ebooks-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  formats: z.array(z.enum(EBOOK_EXPORT_FORMAT_VALUES)).min(1).max(3),
  profile: z.enum(EBOOK_EXPORT_PROFILE_VALUES),
  style_preset: z.string().trim().max(80).optional(),
  idempotency_key: z.string().trim().min(12).max(200).optional(),
});

type Params = {
  id: string;
};

function getInternalJobSecret() {
  const configured = process.env.EBOOK_INTERNAL_JOB_SECRET?.trim();
  if (configured) return configured;

  if (process.env.NODE_ENV !== "production") {
    return "dev-only-ebook-job-secret";
  }

  return "";
}

function quotaError(input: {
  period: EbookQuotaPeriod;
  limit: number;
  used: number;
  resetsAt: Date;
}) {
  return NextResponse.json(
    {
      error: "Quota exceeded.",
      code: getEbookQuotaExceededCode({
        scope: "export",
        period: input.period,
      }),
      quota_type: "export",
      quota_period: input.period,
      quota_limit: input.limit,
      quota_used: input.used,
      resets_at_utc: input.resetsAt.toISOString(),
    },
    { status: 429 },
  );
}

async function enforceExportQuota(input: {
  admin: ReturnType<typeof createSupabaseAdminClient>;
  userId: string;
  planTier: ReturnType<typeof normalizePlanTier>;
  requestedCount: number;
}) {
  const now = new Date();

  for (const period of ["daily", "monthly"] as const) {
    const periodStart = getCurrentPeriodStart(period, now).toISOString();
    const limit = getEbookQuotaLimit({
      planTier: input.planTier,
      period,
      scope: "export",
    });

    const { data: counter } = await input.admin
      .from("ebook_usage_counters")
      .select("used_count")
      .eq("user_id", input.userId)
      .eq("scope", "export")
      .eq("period", period)
      .eq("period_start", periodStart)
      .maybeSingle();

    const used = counter?.used_count ?? 0;
    if (used + input.requestedCount > limit) {
      return quotaError({
        period,
        limit,
        used,
        resetsAt: getNextPeriodStart(period, now),
      });
    }
  }

  return null;
}

async function incrementExportUsage(input: {
  admin: ReturnType<typeof createSupabaseAdminClient>;
  userId: string;
  planTier: ReturnType<typeof normalizePlanTier>;
  incrementBy: number;
}) {
  const now = new Date();

  for (const period of ["daily", "monthly"] as const) {
    const periodStart = getCurrentPeriodStart(period, now).toISOString();

    const { data: counter } = await input.admin
      .from("ebook_usage_counters")
      .select("used_count")
      .eq("user_id", input.userId)
      .eq("scope", "export")
      .eq("period", period)
      .eq("period_start", periodStart)
      .maybeSingle();

    const nextUsed = (counter?.used_count ?? 0) + input.incrementBy;

    await input.admin.from("ebook_usage_counters").upsert(
      {
        user_id: input.userId,
        plan_tier: input.planTier,
        scope: "export",
        period,
        period_start: periodStart,
        used_count: nextUsed,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,scope,period,period_start",
      },
    );
  }
}

export async function GET(
  req: Request,
  context: {
    params: Promise<Params>;
  },
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Invalid eBook id." }, { status: 400 });
  }

  const auth = await resolveEbookAuth(req);
  if (!auth) {
    return NextResponse.json(buildEbookUnauthorizedPayload(req, "ebooks_exports_auth_missing_user"), { status: 401 });
  }

  const { db, userId } = auth;

  const { data: rows, error } = await db
    .from("ebook_exports")
    .select("id, format, profile, status, style_preset, file_path, file_size_bytes, page_count, checksum_sha256, created_at, ready_at")
    .eq("ebook_id", id)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Unable to load exports." }, { status: 500 });
  }

  return NextResponse.json({ exports: rows ?? [] });
}

export async function POST(
  req: Request,
  context: {
    params: Promise<Params>;
  },
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Invalid eBook id." }, { status: 400 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const auth = await resolveEbookAuth(req);
  if (!auth) {
    return NextResponse.json(buildEbookUnauthorizedPayload(req, "ebooks_exports_auth_missing_user"), { status: 401 });
  }

  const { db, userId, planTier } = auth;
  const admin = createSupabaseAdminClient();

  const normalizedFormats = [...new Set(parsed.data.formats)];
  const requestedCount = normalizedFormats.length;
  if (requestedCount < 1) {
    return NextResponse.json({ error: "Select at least one format." }, { status: 400 });
  }

  const quotaErr = await enforceExportQuota({
    admin,
    userId,
    planTier,
    requestedCount,
  });
  if (quotaErr) return quotaErr;

  const { data: ebook } = await db
    .from("ebooks")
    .select("id, user_id, status, active_version_id")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (!ebook?.active_version_id) {
    return NextResponse.json({ error: "No active version found." }, { status: 404 });
  }

  if (ebook.status !== "ready") {
    return NextResponse.json({ error: "eBook is still processing. Try again after generation completes." }, { status: 409 });
  }

  const requestedKey = parsed.data.idempotency_key ? ensureIdempotencyKey(parsed.data.idempotency_key) : null;
  if (parsed.data.idempotency_key && !requestedKey) {
    return NextResponse.json({ error: "Invalid idempotency key." }, { status: 400 });
  }

  const idempotencyKey = requestedKey ?? `export_${randomUUID()}`;

  const { data: existingJob } = await db
    .from("ebook_jobs")
    .select("id, status, output_json")
    .eq("user_id", userId)
    .eq("ebook_id", id)
    .eq("job_type", "export")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (existingJob?.id) {
    const output = (existingJob.output_json ?? {}) as { export_ids?: string[] };
    return NextResponse.json({
      job_id: existingJob.id,
      export_ids: output.export_ids ?? [],
      status: existingJob.status,
      idempotent_replay: true,
    });
  }

  const nowIso = new Date().toISOString();
  const createdExportIds: string[] = [];
  const jobId = randomUUID();

  for (const fmt of normalizedFormats) {
    const payload = {
      id: randomUUID(),
      ebook_id: id,
      ebook_version_id: ebook.active_version_id,
      user_id: userId,
      format: fmt,
      profile: parsed.data.profile,
      style_preset: parsed.data.style_preset ?? "professional",
      status: "queued" as const,
      file_path: null,
      file_size_bytes: null,
      page_count: null,
      checksum_sha256: null,
      created_at: nowIso,
      ready_at: null,
    };

    const { data: upserted, error } = await db
      .from("ebook_exports")
      .upsert(payload, { onConflict: "ebook_id,ebook_version_id,format,profile" })
      .select("id")
      .single();

    if (error || !upserted?.id) {
      return NextResponse.json({ error: "Unable to queue exports." }, { status: 500 });
    }

    createdExportIds.push(upserted.id);
  }

  const { error: jobErr } = await db.from("ebook_jobs").insert({
    id: jobId,
    ebook_id: id,
    user_id: userId,
    idempotency_key: idempotencyKey,
    job_type: "export",
    status: "queued",
    step: "export_queued",
    progress_pct: 5,
    input_json: {
      ebook_version_id: ebook.active_version_id,
      formats: normalizedFormats,
      profile: parsed.data.profile,
      style_preset: parsed.data.style_preset ?? "professional",
      export_ids: createdExportIds,
    },
    output_json: {
      export_ids: createdExportIds,
    },
    created_at: nowIso,
  });

  if (jobErr) {
    return NextResponse.json({ error: "Unable to queue export job." }, { status: 500 });
  }

  await incrementExportUsage({
    admin,
    userId,
    planTier,
    incrementBy: requestedCount,
  });

  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const internalSecret = getInternalJobSecret();
  let processingDispatched = false;

  if (host && internalSecret) {
    const processUrl = `${proto}://${host}/api/ebooks/exports/process`;

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
    export_ids: createdExportIds,
    status: "queued",
    idempotent_replay: false,
    processing_dispatched: processingDispatched,
  });
}
