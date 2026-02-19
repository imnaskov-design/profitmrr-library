import { NextResponse } from "next/server";
import { z } from "zod";

import {
  buildVersionEtag,
  getCurrentPeriodStart,
  getEbookQuotaExceededCode,
  getEbookQuotaLimit,
  getNextPeriodStart,
  normalizePlanTier,
} from "@/lib/ebooks";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  action: z.enum(["rewrite", "expand", "shorten", "tone_switch"]),
  version_etag: z.string().trim().min(8).max(300),
  tone_target: z.string().trim().max(80).optional(),
  constraints: z.array(z.string().trim().max(200)).max(12).optional(),
});

type Params = {
  id: string;
  sectionId: string;
};

function applyStubAction(input: {
  action: "rewrite" | "expand" | "shorten" | "tone_switch";
  source: string;
  toneTarget?: string;
}) {
  const src = input.source.trim();

  if (input.action === "expand") {
    return `${src}\n\nExpanded insight: add a concrete example and one implementation checklist item.`;
  }

  if (input.action === "shorten") {
    return src.length > 260 ? `${src.slice(0, 257)}...` : src;
  }

  if (input.action === "tone_switch") {
    const tone = input.toneTarget?.trim() || "Professional";
    return `[Tone: ${tone}] ${src}`;
  }

  return `${src}\n\nRewritten variation for clarity and flow.`;
}

function quotaError(input: {
  period: "daily" | "monthly";
  limit: number;
  used: number;
  resetsAt: Date;
}) {
  return NextResponse.json(
    {
      error: "Quota exceeded.",
      code: getEbookQuotaExceededCode({
        scope: "ai_edit",
        period: input.period,
      }),
      quota_type: "ai_edit",
      quota_period: input.period,
      quota_limit: input.limit,
      quota_used: input.used,
      resets_at_utc: input.resetsAt.toISOString(),
    },
    { status: 429 },
  );
}

async function enforceAiEditQuota(input: {
  admin: ReturnType<typeof createSupabaseAdminClient>;
  userId: string;
  planTier: ReturnType<typeof normalizePlanTier>;
}) {
  const now = new Date();

  for (const period of ["daily", "monthly"] as const) {
    const periodStart = getCurrentPeriodStart(period, now).toISOString();
    const limit = getEbookQuotaLimit({
      planTier: input.planTier,
      period,
      scope: "ai_edit",
    });

    const { data: counter } = await input.admin
      .from("ebook_usage_counters")
      .select("used_count")
      .eq("user_id", input.userId)
      .eq("scope", "ai_edit")
      .eq("period", period)
      .eq("period_start", periodStart)
      .maybeSingle();

    const used = counter?.used_count ?? 0;
    if (used + 1 > limit) {
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

async function incrementAiEditUsage(input: {
  admin: ReturnType<typeof createSupabaseAdminClient>;
  userId: string;
  planTier: ReturnType<typeof normalizePlanTier>;
}) {
  const now = new Date();

  for (const period of ["daily", "monthly"] as const) {
    const periodStart = getCurrentPeriodStart(period, now).toISOString();

    const { data: counter } = await input.admin
      .from("ebook_usage_counters")
      .select("used_count")
      .eq("user_id", input.userId)
      .eq("scope", "ai_edit")
      .eq("period", period)
      .eq("period_start", periodStart)
      .maybeSingle();

    const nextUsed = (counter?.used_count ?? 0) + 1;

    await input.admin.from("ebook_usage_counters").upsert(
      {
        user_id: input.userId,
        plan_tier: input.planTier,
        scope: "ai_edit",
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

export async function POST(
  req: Request,
  context: {
    params: Promise<Params>;
  },
) {
  const { id, sectionId } = await context.params;
  if (!id || !sectionId) {
    return NextResponse.json({ error: "Invalid route parameters." }, { status: 400 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const userMeta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const appMeta = (user.app_metadata ?? {}) as Record<string, unknown>;
  const planTier = normalizePlanTier(userMeta.plan_tier ?? appMeta.plan_tier);

  const quotaErr = await enforceAiEditQuota({
    admin,
    userId: user.id,
    planTier,
  });
  if (quotaErr) return quotaErr;

  const { data: ebook } = await supabase
    .from("ebooks")
    .select("id, user_id, active_version_id, updated_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!ebook?.active_version_id) {
    return NextResponse.json({ error: "eBook version not available." }, { status: 404 });
  }

  const expectedEtag = buildVersionEtag({
    versionId: ebook.active_version_id,
    anchorIso: ebook.updated_at,
  });

  if (parsed.data.version_etag !== expectedEtag) {
    return NextResponse.json(
      {
        error: "Version conflict. Refresh and retry.",
        code: "version_etag_conflict",
        expected_version_etag: expectedEtag,
      },
      { status: 409 },
    );
  }

  const { data: section } = await supabase
    .from("ebook_sections")
    .select("id, heading, body_richtext")
    .eq("id", sectionId)
    .eq("ebook_version_id", ebook.active_version_id)
    .maybeSingle();

  if (!section) {
    return NextResponse.json({ error: "Section not found." }, { status: 404 });
  }

  const sourceText =
    (section.body_richtext as { blocks?: Array<{ text?: string }> } | null)?.blocks
      ?.map((b) => b.text ?? "")
      .join("\n") ?? "";

  const revisedText = applyStubAction({
    action: parsed.data.action,
    source: sourceText || section.heading || "",
    toneTarget: parsed.data.tone_target,
  });

  const revisedRichtext = {
    blocks: [
      {
        type: "paragraph",
        text: revisedText,
      },
    ],
  };

  const { data: updated } = await supabase
    .from("ebook_sections")
    .update({
      body_richtext: revisedRichtext,
      word_count: revisedText.split(/\s+/).filter(Boolean).length,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sectionId)
    .eq("ebook_version_id", ebook.active_version_id)
    .select("id, heading, body_richtext, updated_at")
    .maybeSingle();

  await admin.from("ebook_edit_actions").insert({
    ebook_id: id,
    ebook_version_id: ebook.active_version_id,
    section_id: sectionId,
    user_id: user.id,
    action_type: parsed.data.action,
    before_text: sourceText,
    after_text: revisedText,
    metadata_json: {
      tone_target: parsed.data.tone_target ?? null,
      constraints: parsed.data.constraints ?? [],
      provider: "phase2_stub",
    },
  });

  const nextUpdatedAt = new Date().toISOString();
  await supabase
    .from("ebooks")
    .update({
      updated_at: nextUpdatedAt,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  const nextVersionEtag = buildVersionEtag({
    versionId: ebook.active_version_id,
    anchorIso: nextUpdatedAt,
  });

  await incrementAiEditUsage({
    admin,
    userId: user.id,
    planTier,
  });

  return NextResponse.json({
    revised_text: revisedText,
    diff_summary: {
      action: parsed.data.action,
      before_length: sourceText.length,
      after_length: revisedText.length,
    },
    tokens_used: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
      model: "phase2_stub",
    },
    version_etag: nextVersionEtag,
    updated_section: updated,
  });
}
