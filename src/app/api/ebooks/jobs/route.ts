import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import {
  coerceEbookJobRow,
  createEbookJobSchema,
  ensureIdempotencyKey,
  getCurrentPeriodStart,
  getEbookQuotaExceededCode,
  getEbookQuotaLimit,
  getNextPeriodStart,
  normalizePlanTier,
  type EbookQuotaPeriod,
} from "@/lib/ebooks";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getInternalJobSecret() {
  const configured = process.env.EBOOK_INTERNAL_JOB_SECRET?.trim();
  if (configured) return configured;

  if (process.env.NODE_ENV !== "production") {
    return "dev-only-ebook-job-secret";
  }

  return "";
}

function quotaError(input: {
  scope: "generation" | "ai_edit" | "export";
  period: EbookQuotaPeriod;
  limit: number;
  used: number;
  resetsAt: Date;
}) {
  return NextResponse.json(
    {
      error: "Quota exceeded.",
      code: getEbookQuotaExceededCode({
        scope: input.scope,
        period: input.period,
      }),
      quota_type: input.scope,
      quota_period: input.period,
      quota_limit: input.limit,
      quota_used: input.used,
      resets_at_utc: input.resetsAt.toISOString(),
    },
    { status: 429 },
  );
}

async function getCurrentUserId() {
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  const reqHeaders = await headers();

  const {
    data: { user: cookieUser },
  } = await supabase.auth.getUser();

  let resolvedUser = cookieUser;
  let useAdminDb = false;

  if (!resolvedUser?.id) {
    const authHeader = reqHeaders.get("authorization") ?? "";
    const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    const accessToken = bearerMatch?.[1]?.trim();

    if (accessToken) {
      const { data, error } = await admin.auth.getUser(accessToken);
      if (!error && data.user?.id) {
        resolvedUser = data.user;
        useAdminDb = true;
      }
    }
  }

  if (!resolvedUser?.id) return null;

  const userMeta = (resolvedUser.user_metadata ?? {}) as Record<string, unknown>;
  const appMeta = (resolvedUser.app_metadata ?? {}) as Record<string, unknown>;
  const planTier = normalizePlanTier(userMeta.plan_tier ?? appMeta.plan_tier);

  return {
    db: useAdminDb ? admin : supabase,
    admin,
    userId: resolvedUser.id,
    planTier,
  };
}

async function enforceGenerationQuota(input: {
  supabase: ReturnType<typeof createSupabaseAdminClient>;
  userId: string;
  planTier: ReturnType<typeof normalizePlanTier>;
}) {
  const now = new Date();
  const periods: EbookQuotaPeriod[] = ["daily", "monthly"];

  for (const period of periods) {
    const periodStart = getCurrentPeriodStart(period, now);
    const limit = getEbookQuotaLimit({
      planTier: input.planTier,
      period,
      scope: "generation",
    });

    const { data: counter } = await input.supabase
      .from("ebook_usage_counters")
      .select("used_count")
      .eq("user_id", input.userId)
      .eq("scope", "generation")
      .eq("period", period)
      .eq("period_start", periodStart.toISOString())
      .maybeSingle();

    const used = counter?.used_count ?? 0;
    if (used >= limit) {
      return quotaError({
        scope: "generation",
        period,
        limit,
        used,
        resetsAt: getNextPeriodStart(period, now),
      });
    }
  }

  return null;
}

async function incrementGenerationUsage(input: {
  supabase: ReturnType<typeof createSupabaseAdminClient>;
  userId: string;
  planTier: ReturnType<typeof normalizePlanTier>;
}) {
  const now = new Date();

  for (const period of ["daily", "monthly"] as const) {
    const periodStart = getCurrentPeriodStart(period, now).toISOString();

    const { data: counter } = await input.supabase
      .from("ebook_usage_counters")
      .select("used_count")
      .eq("user_id", input.userId)
      .eq("scope", "generation")
      .eq("period", period)
      .eq("period_start", periodStart)
      .maybeSingle();

    const nextUsed = (counter?.used_count ?? 0) + 1;

    await input.supabase.from("ebook_usage_counters").upsert(
      {
        user_id: input.userId,
        plan_tier: input.planTier,
        scope: "generation",
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

export async function POST(req: Request) {
  const reqHeaders = await headers();
  const auth = await getCurrentUserId();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = createEbookJobSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const input = parsed.data;
  const idempotencyKey = ensureIdempotencyKey(input.idempotency_key);
  if (!idempotencyKey) {
    return NextResponse.json({ error: "Invalid idempotency key." }, { status: 400 });
  }

  const { db, admin, userId, planTier } = auth;

  const { data: existing } = await db
    .from("ebook_jobs")
    .select("id, ebook_id, user_id, idempotency_key, job_type, status, step, progress_pct, error_code, error_message, created_at, finished_at")
    .eq("user_id", userId)
    .eq("idempotency_key", idempotencyKey)
    .eq("job_type", "generate")
    .maybeSingle();

  if (existing) {
    const row = coerceEbookJobRow(existing);
    return NextResponse.json({
      ebook_id: row.ebook_id,
      job_id: row.id,
      status: row.status,
      idempotent_replay: true,
    });
  }

  const quotaErr = await enforceGenerationQuota({ supabase: admin, userId, planTier });
  if (quotaErr) return quotaErr;

  const ebookId = randomUUID();
  const jobId = randomUUID();
  const nowIso = new Date().toISOString();

  const { error: ebookErr } = await db.from("ebooks").insert({
    id: ebookId,
    user_id: userId,
    title: input.title?.trim() || `${input.niche} Playbook`,
    niche: input.niche,
    category: input.category,
    language: input.language,
    tone: input.tone,
    target_page_count: input.target_page_count,
    uniqueness_mode: input.uniqueness_mode,
    status: "generating",
    created_at: nowIso,
    updated_at: nowIso,
  });

  if (ebookErr) {
    return NextResponse.json({ error: "Unable to create eBook." }, { status: 500 });
  }

  const { error: jobErr } = await db.from("ebook_jobs").insert({
    id: jobId,
    ebook_id: ebookId,
    user_id: userId,
    idempotency_key: idempotencyKey,
    job_type: "generate",
    status: "queued",
    step: "input_normalized",
    progress_pct: 5,
    input_json: {
      title: input.title?.trim() || `${input.niche} Playbook`,
      niche: input.niche,
      category: input.category,
      tone: input.tone,
      language: input.language,
      target_page_count: input.target_page_count,
      uniqueness_mode: input.uniqueness_mode,
      preferred_profile: input.preferred_profile,
      preferred_formats: input.preferred_formats,
      pipeline_version: "phase2",
    },
    created_at: nowIso,
  });

  if (jobErr) {
    await db.from("ebooks").delete().eq("id", ebookId).eq("user_id", userId);
    return NextResponse.json({ error: "Unable to create generation job." }, { status: 500 });
  }

  const { error: activateErr } = await db
    .from("ebooks")
    .update({
      active_job_id: jobId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ebookId)
    .eq("user_id", userId);

  if (activateErr) {
    return NextResponse.json({
      ebook_id: ebookId,
      job_id: jobId,
      status: "queued",
      step: "input_normalized",
      progress_pct: 5,
      warning: "eBook created but active pointers were not finalized.",
    });
  }

  await incrementGenerationUsage({
    supabase: admin,
    userId,
    planTier,
  });

  const host = reqHeaders.get("x-forwarded-host") ?? reqHeaders.get("host");
  const proto = reqHeaders.get("x-forwarded-proto") ?? "http";

  const internalSecret = getInternalJobSecret();

  let processingDispatched = false;

  if (host && internalSecret) {
    const processUrl = `${proto}://${host}/api/ebooks/jobs/process`;

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
    ebook_id: ebookId,
    job_id: jobId,
    status: "queued",
    step: "input_normalized",
    progress_pct: 5,
    processing_dispatched: processingDispatched,
    idempotent_replay: false,
  });
}
