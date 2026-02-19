"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { formatDateShort, type EbookStatus } from "@/lib/subscription";

type RouteParams = {
  id: string;
};

type EbookDetailsPayload = {
  ebook: {
    id: string;
    title: string | null;
    niche: string | null;
    tone: string | null;
    status: "draft" | "generating" | "ready" | "failed" | "archived";
    target_page_count: number | null;
    created_at: string;
    active_version_id: string | null;
    active_job_id: string | null;
  } | null;
  active_job: {
    id: string;
    status: "queued" | "running" | "succeeded" | "failed" | "cancelled";
    step: string | null;
    progress_pct: number | null;
  } | null;
  exports: Array<{
    id: string;
    format: "pdf" | "docx" | "epub";
    profile: "us_letter" | "a4";
    status: "queued" | "rendering" | "ready" | "failed";
    created_at: string;
  }>;
};

function makeIdempotencyKey(prefix: "export") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

function titleFromId(id: string) {
  return id
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatEbookStatusLabel(status: EbookStatus) {
  switch (status) {
    case "generating":
      return "Generating";
    case "ready":
      return "Ready";
    case "failed":
      return "Failed";
    case "archived":
      return "Archived";
    default:
      return "Draft";
  }
}

export default function EbookDetailsPage({ params }: { params: RouteParams }) {
  const ebookId = params.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queueingFormat, setQueueingFormat] = useState<"pdf" | "docx" | "epub" | null>(null);
  const [payload, setPayload] = useState<EbookDetailsPayload | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [ebookRes, exportsRes] = await Promise.all([
      fetch(`/api/ebooks/${ebookId}/editor`, { method: "GET", cache: "no-store" }),
      fetch(`/api/ebooks/${ebookId}/exports`, { method: "GET", cache: "no-store" }),
    ]);

    const ebookData = (await ebookRes.json().catch(() => null)) as
      | {
          error?: string;
          ebook?: EbookDetailsPayload["ebook"];
        }
      | null;

    const exportsData = (await exportsRes.json().catch(() => null)) as
      | {
          error?: string;
          exports?: EbookDetailsPayload["exports"];
        }
      | null;

    if (!ebookRes.ok || !ebookData?.ebook) {
      setError(ebookData?.error ?? "Unable to load eBook details.");
      setLoading(false);
      return;
    }

    let activeJob: EbookDetailsPayload["active_job"] = null;
    if (ebookData.ebook.active_job_id) {
      const jobRes = await fetch(`/api/ebooks/jobs/${ebookData.ebook.active_job_id}`, {
        method: "GET",
        cache: "no-store",
      });
      const jobData = (await jobRes.json().catch(() => null)) as
        | {
            job_id?: string;
            status?: "queued" | "running" | "succeeded" | "failed" | "cancelled";
            step?: string | null;
            progress_pct?: number | null;
          }
        | null;

      if (jobRes.ok && jobData?.job_id) {
        activeJob = {
          id: jobData.job_id,
          status: jobData.status ?? "queued",
          step: jobData.step ?? null,
          progress_pct: jobData.progress_pct ?? 0,
        };
      }
    }

    setPayload({
      ebook: ebookData.ebook,
      active_job: activeJob,
      exports: exportsRes.ok ? exportsData?.exports ?? [] : [],
    });

    setLoading(false);
  }, [ebookId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!payload?.ebook || payload.ebook.status !== "generating") return;

    const timer = setInterval(() => {
      void load();
    }, 2500);

    return () => clearInterval(timer);
  }, [payload?.ebook?.status, load]);

  const readyExports = useMemo(() => {
    return (payload?.exports ?? []).filter((row) => row.status === "ready");
  }, [payload?.exports]);

  const isGenerating = payload?.ebook?.status === "generating";
  const title = payload?.ebook?.title?.trim() || titleFromId(ebookId) || "E-Book Details";

  async function queueExport(format: "pdf" | "docx" | "epub") {
    setQueueingFormat(format);
    setError(null);

    const res = await fetch(`/api/ebooks/${ebookId}/exports`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        formats: [format],
        profile: "us_letter",
        style_preset: "professional",
        idempotency_key: makeIdempotencyKey("export"),
      }),
    });

    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    if (!res.ok) {
      setError(data?.error ?? "Unable to queue export.");
      setQueueingFormat(null);
      return;
    }

    setQueueingFormat(null);
    await load();
  }

  if (loading) {
    return <div className="text-sm text-white/60">Loading eBook details...</div>;
  }

  if (!payload?.ebook) {
    return <div className="text-sm text-rose-300">{error ?? "Unable to load eBook details."}</div>;
  }

  const createdLabel = formatDateShort(payload.ebook.created_at) ?? "—";
  const statusLabel = formatEbookStatusLabel(payload.ebook.status);
  const pageCount = payload.ebook.target_page_count ?? "—";
  const tone = payload.ebook.tone ?? "—";
  const niche = (payload.ebook.niche ?? "GENERAL").toUpperCase();

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/40">E-Books Vault</p>
          <h1 className="text-4xl font-black tracking-tight text-white">{title}</h1>
          <p className="mt-2 text-sm text-white/50">Preview details, export files, and manage this ebook asset.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {payload.ebook.active_version_id ? (
            <Link
              href={`/dashboard/ebooks/${ebookId}/edit`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black uppercase tracking-widest text-background-dark transition-all hover:bg-primary/90"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Quick polish
            </Link>
          ) : (
            <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white/40">
              <span className="material-symbols-outlined text-sm">edit</span>
              Quick polish
            </span>
          )}

          <Link
            href="/dashboard/ebooks"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to vault
          </Link>
        </div>
      </header>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="overflow-hidden rounded-3xl border border-white/5 glass-card">
            <div className="relative h-[420px] bg-gradient-to-br from-indigo-600 to-purple-800 p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]"></div>
              <span className="relative z-10 inline-flex rounded-lg bg-white/10 px-3 py-1.5 text-[10px] font-black tracking-wider text-white">
                {niche}
              </span>
              <div className="absolute bottom-8 left-8 right-8">
                <h2 className="text-3xl font-black leading-tight text-white">{title}</h2>
                <p className="mt-2 text-sm text-white/80">AI-generated premium publication for digital sellers.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-7">
          {isGenerating ? (
            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-8 glass-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-white">Generation in progress</h3>
                  <p className="mt-1 text-sm text-white/60">Your eBook is being drafted in stages.</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary">
                  <span className="size-1.5 animate-pulse rounded-full bg-current"></span>
                  {payload.active_job?.status ?? "queued"}
                </span>
              </div>
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-xs text-white/50">
                  <span>{payload.active_job?.step ?? "input_normalized"}</span>
                  <span>{payload.active_job?.progress_pct ?? 0}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${Math.max(5, Math.min(100, payload.active_job?.progress_pct ?? 0))}%` }}
                  />
                </div>
              </div>
            </div>
          ) : null}

          <div className="rounded-3xl border border-white/5 p-8 glass-card">
            <h3 className="mb-6 text-xl font-black text-white">Overview</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Status</p>
                <p className="mt-1 font-bold text-primary">{statusLabel}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Pages</p>
                <p className="mt-1 font-bold text-white">{pageCount}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Tone</p>
                <p className="mt-1 font-bold text-white">{tone}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Created</p>
                <p className="mt-1 font-bold text-white">{createdLabel}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 p-8 glass-card">
            <h3 className="mb-6 text-xl font-black text-white">Export files</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => void queueExport("docx")}
                disabled={isGenerating || queueingFormat !== null}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-xs font-bold text-white/80 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm text-primary">upload_file</span>
                {queueingFormat === "docx" ? "Queueing..." : "Queue DOCX"}
              </button>
              <button
                disabled={!readyExports.some((r) => r.format === "docx")}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-xs font-bold text-white/80 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm text-primary">description</span>
                Download DOCX
              </button>

              <button
                type="button"
                onClick={() => void queueExport("pdf")}
                disabled={isGenerating || queueingFormat !== null}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-xs font-bold text-white/80 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm text-primary">upload_file</span>
                {queueingFormat === "pdf" ? "Queueing..." : "Queue PDF"}
              </button>
              <button
                disabled={!readyExports.some((r) => r.format === "pdf")}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-xs font-bold text-white/80 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm text-primary">picture_as_pdf</span>
                Download PDF
              </button>
            </div>
            <p className="mt-4 text-xs text-white/50">
              Ready exports: {readyExports.length} / {(payload.exports ?? []).length}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

