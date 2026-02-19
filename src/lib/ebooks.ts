import { z } from "zod";

import { getServerEnv } from "@/lib/env/server";
import {
  normalizeEbookJobStatus,
  normalizeEbookStatus,
  type EbookJobStatus,
  type EbookStatus,
} from "@/lib/subscription";

export const EBOOK_JOB_TYPE_VALUES = ["generate", "export", "rewrite_section", "regenerate_section"] as const;
export const EBOOK_JOB_STATUS_VALUES = ["queued", "running", "succeeded", "failed", "cancelled"] as const;
export const EBOOK_EXPORT_FORMAT_VALUES = ["pdf", "docx", "epub"] as const;
export const EBOOK_EXPORT_PROFILE_VALUES = ["us_letter", "a4"] as const;

export type EbookJobType = (typeof EBOOK_JOB_TYPE_VALUES)[number];
export type EbookJobStatusValue = (typeof EBOOK_JOB_STATUS_VALUES)[number];
export type EbookExportFormat = (typeof EBOOK_EXPORT_FORMAT_VALUES)[number];
export type EbookExportProfile = (typeof EBOOK_EXPORT_PROFILE_VALUES)[number];

export const createEbookJobSchema = z.object({
  idempotency_key: z.string().min(12).max(200),
  title: z.string().trim().max(200).optional(),
  niche: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(120),
  tone: z.string().trim().min(2).max(80),
  language: z.string().trim().min(2).max(80),
  target_page_count: z.coerce.number().int().min(10).max(300),
  uniqueness_mode: z.boolean().optional().default(false),
  preferred_profile: z.enum(EBOOK_EXPORT_PROFILE_VALUES).optional().default("us_letter"),
  preferred_formats: z.array(z.enum(EBOOK_EXPORT_FORMAT_VALUES)).min(1).max(3),
});

export type CreateEbookJobInput = z.infer<typeof createEbookJobSchema>;

export type EbookQuotaScope = "generation" | "ai_edit" | "export";
export type EbookQuotaPeriod = "daily" | "monthly";
export type EbookPlanTier = "starter" | "growth" | "scale";

export type EbookContentBlock = {
  type: "heading" | "paragraph" | "list_ordered" | "list_unordered" | "quote" | "callout" | "table" | "image_placeholder";
  text?: string;
  items?: string[];
  data?: Record<string, unknown>;
};

export type EbookSectionAst = {
  key: string;
  heading: string;
  blocks: EbookContentBlock[];
};

export type EbookChapterAst = {
  key: string;
  title: string;
  sections: EbookSectionAst[];
};

export type EbookDocumentAst = {
  meta: {
    title: string;
    niche: string;
    category: string;
    tone: string;
    language: string;
    target_page_count: number;
    uniqueness_mode: boolean;
    generated_at_iso: string;
  };
  chapters: EbookChapterAst[];
};

export type EbookPlanQuota = {
  daily: {
    generation: number;
    ai_edit: number;
    export_total: number;
    export_per_format: number;
  };
  monthly: {
    generation: number;
    ai_edit: number;
    export_total: number;
    export_per_format: number;
  };
  concurrency: {
    generation_jobs: number;
    export_jobs: number;
  };
};

export const EBOOK_PLAN_QUOTAS: Record<EbookPlanTier, EbookPlanQuota> = {
  starter: {
    daily: { generation: 3, ai_edit: 60, export_total: 15, export_per_format: 6 },
    monthly: { generation: 60, ai_edit: 900, export_total: 300, export_per_format: 120 },
    concurrency: { generation_jobs: 1, export_jobs: 2 },
  },
  growth: {
    daily: { generation: 10, ai_edit: 220, export_total: 45, export_per_format: 18 },
    monthly: { generation: 220, ai_edit: 3500, export_total: 1000, export_per_format: 360 },
    concurrency: { generation_jobs: 2, export_jobs: 4 },
  },
  scale: {
    daily: { generation: 25, ai_edit: 600, export_total: 120, export_per_format: 45 },
    monthly: { generation: 700, ai_edit: 12000, export_total: 3200, export_per_format: 1100 },
    concurrency: { generation_jobs: 4, export_jobs: 8 },
  },
};

export function normalizePlanTier(value: unknown): EbookPlanTier {
  if (value === "starter" || value === "growth" || value === "scale") {
    return value;
  }

  return "starter";
}

export function getEbookQuotaLimit(input: {
  planTier: EbookPlanTier;
  period: EbookQuotaPeriod;
  scope: EbookQuotaScope;
}): number {
  const quota = EBOOK_PLAN_QUOTAS[input.planTier];

  if (input.scope === "generation") {
    return input.period === "daily" ? quota.daily.generation : quota.monthly.generation;
  }

  if (input.scope === "ai_edit") {
    return input.period === "daily" ? quota.daily.ai_edit : quota.monthly.ai_edit;
  }

  return input.period === "daily" ? quota.daily.export_total : quota.monthly.export_total;
}

export function getEbookQuotaExceededCode(input: {
  scope: EbookQuotaScope;
  period: EbookQuotaPeriod;
}) {
  if (input.scope === "generation") {
    return input.period === "daily" ? "quota_generation_daily_exceeded" : "quota_generation_monthly_exceeded";
  }

  if (input.scope === "ai_edit") {
    return input.period === "daily" ? "quota_ai_edits_daily_exceeded" : "quota_ai_edits_monthly_exceeded";
  }

  return input.period === "daily" ? "quota_exports_daily_exceeded" : "quota_exports_monthly_exceeded";
}

export function buildVersionEtag(input: {
  versionId: string;
  anchorIso: string;
}) {
  return `${input.versionId}:${input.anchorIso}`;
}

export function getCurrentPeriodStart(period: EbookQuotaPeriod, now = new Date()) {
  const d = new Date(now);

  if (period === "daily") {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  }

  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

export function getNextPeriodStart(period: EbookQuotaPeriod, now = new Date()) {
  const d = new Date(now);

  if (period === "daily") {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1));
  }

  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
}

export function parsePreferredFormats(input: string | null): EbookExportFormat[] {
  if (!input) return ["pdf", "docx", "epub"];

  const set = new Set<EbookExportFormat>();
  for (const raw of input.split(",")) {
    const value = raw.trim().toLowerCase();
    if (value === "pdf" || value === "docx" || value === "epub") {
      set.add(value);
    }
  }

  if (!set.size) return ["pdf", "docx", "epub"];
  return [...set];
}

export function ensureIdempotencyKey(input: string | null | undefined) {
  const key = String(input ?? "").trim();
  if (!key || key.length < 12 || key.length > 200) {
    return null;
  }
  return key;
}

export function isKnownEbookJobStatus(value: unknown): value is EbookJobStatusValue {
  return (
    value === "queued" ||
    value === "running" ||
    value === "succeeded" ||
    value === "failed" ||
    value === "cancelled"
  );
}

export function isFreshJob(now: Date, createdAtIso: string | null | undefined) {
  if (!createdAtIso) return false;
  const createdAt = new Date(createdAtIso);
  if (Number.isNaN(createdAt.getTime())) return false;

  const ttlHours = getServerEnv().EBOOK_JOB_IDEMPOTENCY_TTL_HOURS;
  return now.getTime() - createdAt.getTime() <= ttlHours * 60 * 60 * 1000;
}

export type EbookJobRow = {
  id: string;
  ebook_id: string;
  user_id: string;
  idempotency_key: string;
  job_type: EbookJobType;
  status: EbookJobStatus;
  step: string | null;
  progress_pct: number | null;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
  finished_at: string | null;
};

export function coerceEbookJobRow(value: {
  id: string;
  ebook_id: string;
  user_id: string;
  idempotency_key: string;
  job_type: EbookJobType;
  status: unknown;
  step: string | null;
  progress_pct: number | null;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
  finished_at: string | null;
}): EbookJobRow {
  return {
    ...value,
    status: normalizeEbookJobStatus(value.status),
  };
}

export function mapEbookJobStatusBadgeClass(status: EbookJobStatus) {
  switch (status) {
    case "succeeded":
      return "text-emerald-300 bg-emerald-500/10 border-emerald-500/30";
    case "running":
      return "text-primary bg-primary/10 border-primary/30";
    case "failed":
      return "text-rose-300 bg-rose-500/10 border-rose-500/30";
    case "cancelled":
      return "text-zinc-300 bg-zinc-500/10 border-zinc-500/30";
    default:
      return "text-amber-300 bg-amber-500/10 border-amber-500/30";
  }
}

export function buildDraftAst(input: {
  title: string;
  niche: string;
  category: string;
  tone: string;
  language: string;
  targetPageCount: number;
  uniquenessMode: boolean;
}): EbookDocumentAst {
  const title = input.title.trim() || `${input.niche} Playbook`;

  const introSection: EbookSectionAst = {
    key: "ch1-sec1",
    heading: "Introduction",
    blocks: [
      {
        type: "paragraph",
        text: `This is your initial generated draft for ${input.niche}. Use quick polish tools to rewrite, expand, shorten, or regenerate sections before export.`,
      },
      {
        type: "callout",
        text: `Voice preset: ${input.tone}. Language: ${input.language}.`,
      },
    ],
  };

  const chapterOne: EbookChapterAst = {
    key: "chapter-1",
    title: "Core Framework",
    sections: [introSection],
  };

  return {
    meta: {
      title,
      niche: input.niche,
      category: input.category,
      tone: input.tone,
      language: input.language,
      target_page_count: input.targetPageCount,
      uniqueness_mode: input.uniquenessMode,
      generated_at_iso: new Date().toISOString(),
    },
    chapters: [chapterOne],
  };
}

export type EbookListRow = {
  id: string;
  title: string;
  niche: string | null;
  category: string | null;
  tone: string | null;
  language: string | null;
  status: EbookStatus;
  target_page_count: number | null;
  created_at: string;
};

export function coerceEbookListRow(value: {
  id: string;
  title: string | null;
  niche: string | null;
  category: string | null;
  tone: string | null;
  language: string | null;
  status: unknown;
  target_page_count: number | null;
  created_at: string;
}): EbookListRow {
  return {
    id: value.id,
    title: value.title?.trim() || "Untitled eBook",
    niche: value.niche,
    category: value.category,
    tone: value.tone,
    language: value.language,
    status: normalizeEbookStatus(value.status),
    target_page_count: value.target_page_count,
    created_at: value.created_at,
  };
}

export function formatEbookStatusLabel(status: EbookStatus) {
  switch (status) {
    case "ready":
      return "Ready";
    case "generating":
      return "Generating";
    case "failed":
      return "Failed";
    case "archived":
      return "Archived";
    default:
      return "Draft";
  }
}

export function formatEbookJobStatusLabel(status: EbookJobStatus) {
  switch (status) {
    case "queued":
      return "Queued";
    case "running":
      return "Running";
    case "succeeded":
      return "Succeeded";
    case "failed":
      return "Failed";
    default:
      return "Cancelled";
  }
}
