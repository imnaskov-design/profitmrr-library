"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type JobStatus = "idle" | "queued" | "running" | "succeeded" | "failed" | "cancelled";
type Profile = "us_letter" | "a4";
type Format = "pdf" | "docx" | "epub";

const nicheOptions = ["Digital Marketing", "Wealth Creation", "Personal Branding", "SaaS & Tech", "Health & Fitness"];
const categoryOptions = ["How-to Guide", "Case Study", "Checklist/Workbook", "Manifesto"];
const toneOptions = ["Professional", "Bold", "Luxury", "Witty", "Academic"];
const languageOptions = ["English (US)", "English (UK)", "Spanish", "French"];

function makeIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `ebook_${crypto.randomUUID()}`;
  }

  return `ebook_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

function toJobStatus(value: unknown): JobStatus {
  if (value === "queued" || value === "running" || value === "succeeded" || value === "failed" || value === "cancelled") {
    return value;
  }

  return "queued";
}

function statusClass(status: JobStatus) {
  if (status === "succeeded") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  if (status === "failed" || status === "cancelled") return "border-rose-500/30 bg-rose-500/10 text-rose-300";
  return "border-primary/30 bg-primary/10 text-primary";
}

export default function CreateEbooksPage() {
  const router = useRouter();

  const [niche, setNiche] = useState(nicheOptions[0]);
  const [category, setCategory] = useState(categoryOptions[0]);
  const [tone, setTone] = useState(toneOptions[0]);
  const [language, setLanguage] = useState(languageOptions[0]);
  const [targetPageCount, setTargetPageCount] = useState(40);
  const [profile, setProfile] = useState<Profile>("us_letter");
  const [uniquenessMode, setUniquenessMode] = useState(true);
  const [formats, setFormats] = useState<Record<Format, boolean>>({ pdf: true, docx: true, epub: true });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus>("idle");
  const [jobId, setJobId] = useState<string | null>(null);
  const [ebookId, setEbookId] = useState<string | null>(null);

  const selectedFormats = useMemo(() => {
    const out: Format[] = [];
    if (formats.pdf) out.push("pdf");
    if (formats.docx) out.push("docx");
    if (formats.epub) out.push("epub");
    return out;
  }, [formats]);

  const pageRangeLabel = useMemo(() => {
    const min = Math.max(10, targetPageCount - 12);
    const max = targetPageCount + 10;
    return `${min} — ${max} pages`;
  }, [targetPageCount]);

  useEffect(() => {
    if (!jobId) return;
    if (jobStatus === "succeeded" || jobStatus === "failed" || jobStatus === "cancelled") return;

    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/ebooks/jobs/${jobId}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) return;
        const data = (await res.json().catch(() => null)) as
          | {
              status?: string;
              ebook_id?: string;
              error_message?: string;
            }
          | null;

        const status = toJobStatus(data?.status);
        setJobStatus(status);
        if (data?.ebook_id) setEbookId(data.ebook_id);

        if (status === "succeeded" && data?.ebook_id) {
          clearInterval(timer);
          setLoading(false);
          router.push(`/dashboard/ebooks/${data.ebook_id}`);
          return;
        }

        if (status === "failed" || status === "cancelled") {
          clearInterval(timer);
          setLoading(false);
          setError(data?.error_message ?? "Generation failed. Please try again.");
        }
      } catch {
        // Ignore transient polling failures.
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [jobId, jobStatus, router]);

  async function resolveAccessTokenForGenerate() {
    const supabase = await createSupabaseBrowserClient();

    const {
      data: { session: initialSession },
    } = await supabase.auth.getSession();

    if (initialSession?.access_token) {
      return {
        supabase,
        accessToken: initialSession.access_token,
      };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return {
        supabase,
        accessToken: null,
      };
    }

    const { data: refreshed } = await supabase.auth.refreshSession();
    if (refreshed.session?.access_token) {
      return {
        supabase,
        accessToken: refreshed.session.access_token,
      };
    }

    const {
      data: { session: recoveredSession },
    } = await supabase.auth.getSession();

    return {
      supabase,
      accessToken: recoveredSession?.access_token ?? null,
    };
  }

  async function postCreateJob(input: {
    payload: {
      idempotency_key: string;
      title: string;
      niche: string;
      category: string;
      tone: string;
      language: string;
      target_page_count: number;
      uniqueness_mode: boolean;
      preferred_profile: Profile;
      preferred_formats: Format[];
    };
    accessToken: string | null;
  }) {
    const res = await fetch("/api/ebooks/jobs", {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        ...(input.accessToken
          ? {
              authorization: `Bearer ${input.accessToken}`,
            }
          : null),
      },
      body: JSON.stringify(input.payload),
    });

    const data = (await res.json().catch(() => null)) as
      | {
          error?: string;
          code?: string;
          job_id?: string;
          ebook_id?: string;
          status?: string;
        }
      | null;

    return { res, data };
  }

  async function onGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!selectedFormats.length) {
      setError("Select at least one export format.");
      return;
    }

    setLoading(true);
    setJobStatus("queued");

    const payload = {
      idempotency_key: makeIdempotencyKey(),
      title: `${niche} Playbook`,
      niche,
      category,
      tone,
      language,
      target_page_count: targetPageCount,
      uniqueness_mode: uniquenessMode,
      preferred_profile: profile,
      preferred_formats: selectedFormats,
    };

    const authContext = await resolveAccessTokenForGenerate();
    if (!authContext.accessToken) {
      setLoading(false);
      setJobStatus("failed");
      setError("Session expired. Please log in again and retry.");
      return;
    }

    let { res, data } = await postCreateJob({
      payload,
      accessToken: authContext.accessToken,
    });

    // One-time recovery for edge cases where auth cookies/token rotate between
    // submit and API request handling.
    if (res.status === 401) {
      const { data: refreshed } = await authContext.supabase.auth.refreshSession();
      const retryToken = refreshed.session?.access_token ?? null;

      if (retryToken) {
        const retried = await postCreateJob({
          payload,
          accessToken: retryToken,
        });
        res = retried.res;
        data = retried.data;
      }
    }

    if (!res.ok) {
      setLoading(false);
      setJobStatus("failed");
      setError(data?.error ?? "Unable to generate eBook right now.");
      return;
    }

    if (data?.job_id) setJobId(data.job_id);
    if (data?.ebook_id) setEbookId(data.ebook_id);

    const nextStatus = toJobStatus(data?.status);
    setJobStatus(nextStatus);

    if (nextStatus === "succeeded" && data?.ebook_id) {
      setLoading(false);
      router.push(`/dashboard/ebooks/${data.ebook_id}`);
      return;
    }

    if (nextStatus === "failed" || nextStatus === "cancelled") {
      setLoading(false);
    }
  }

  const promptDone = jobStatus !== "idle";
  const draftingActive = jobStatus === "queued" || jobStatus === "running";
  const draftingDone = jobStatus === "succeeded";
  const outputDone = jobStatus === "succeeded";
  const outputActive = jobStatus === "running";

  const statusLabel =
    jobStatus === "idle"
      ? "Waiting"
      : jobStatus === "queued"
        ? "Queued"
        : jobStatus === "running"
          ? "Processing"
          : jobStatus === "succeeded"
            ? "Completed"
            : jobStatus === "failed"
              ? "Failed"
              : "Cancelled";

  return (
    <div className="relative">
      <header className="mb-12">
        <div className="mb-2 flex items-center gap-3">
          <h2 className="text-4xl font-[900] tracking-tight text-white">Create E-Books</h2>
          <span className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
            <span className="material-symbols-outlined text-xs">bolt</span>
            AI Powered
          </span>
        </div>
        <p className="font-medium text-white/40">
          Configure your AI engine to draft professional publications in seconds.
        </p>
      </header>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-7">
          <form onSubmit={onGenerate} className="relative overflow-hidden rounded-3xl border border-white/5 p-8 glass-card lg:p-10">
            <div className="absolute -right-20 -top-20 size-64 rounded-full bg-primary/5 blur-3xl"></div>
            <div className="relative z-10 space-y-8">
              <div>
                <h3 className="mb-6 text-2xl font-[900] text-white">Create New Ebook</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/40">
                      <span className="material-symbols-outlined text-sm text-primary">target</span>
                      Niche
                    </label>
                    <select
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                      {nicheOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/40">
                      <span className="material-symbols-outlined text-sm text-primary">category</span>
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                      {categoryOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-white/40">Tone & Voice</label>
                <div className="flex flex-wrap gap-3">
                  {toneOptions.map((item) => {
                    const active = tone === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setTone(item)}
                        className={
                          active
                            ? "rounded-lg border border-primary bg-primary px-4 py-2 text-xs font-bold text-background-dark"
                            : "rounded-lg border border-white/5 bg-white/5 px-4 py-2 text-xs font-bold text-white/70 transition-all hover:border-primary/50"
                        }
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="space-y-4 md:col-span-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-widest text-white/40">Page Range</label>
                    <span className="text-xs font-black text-primary">{pageRangeLabel}</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={targetPageCount}
                    onChange={(e) => setTargetPageCount(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-primary"
                  />
                  <div className="flex justify-between text-[10px] font-bold uppercase text-white/20">
                    <span>Short</span>
                    <span>Medium</span>
                    <span>Long</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-white/40">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    {languageOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-white/40">Print Profile</label>
                  <select
                    value={profile}
                    onChange={(e) => setProfile(e.target.value as Profile)}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="us_letter">US Letter</option>
                    <option value="a4">A4</option>
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <label className="mb-3 block text-xs font-black uppercase tracking-widest text-white/40">Export Formats</label>
                <div className="flex flex-wrap gap-3">
                  {(["pdf", "docx", "epub"] as const).map((fmt) => {
                    const active = formats[fmt];
                    return (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setFormats((prev) => ({ ...prev, [fmt]: !prev[fmt] }))}
                        className={
                          active
                            ? "rounded-lg border border-primary bg-primary px-4 py-2 text-xs font-bold uppercase text-background-dark"
                            : "rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-xs font-bold uppercase text-white/70"
                        }
                      >
                        {fmt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <span className="material-symbols-outlined">auto_awesome_motion</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Uniqueness Mode</h4>
                    <p className="text-[11px] text-white/40">AI performs deeper synthesis for more unique positioning.</p>
                  </div>
                </div>

                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={uniquenessMode}
                    onChange={(e) => setUniquenessMode(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-white/10 peer-checked:bg-primary after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              {error ? <p className="text-sm text-rose-300">{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-5 text-lg font-black uppercase tracking-wider text-background-dark transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70 gold-glow"
              >
                <span className="material-symbols-outlined text-2xl font-black">bolt</span>
                {loading ? "Generating..." : "Generate Ebook"}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-8 lg:col-span-5">
          <div className="rounded-3xl border border-white/5 p-8 glass-card">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="text-xl font-[900] text-white">Generation Status</h3>
              <span
                className={`flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${statusClass(
                  jobStatus,
                )}`}
              >
                <span className="size-1.5 animate-pulse rounded-full bg-current"></span>
                {statusLabel}
              </span>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`flex size-8 items-center justify-center rounded-full ${promptDone ? "bg-primary" : "bg-white/10 text-white/40"}`}>
                    <span className="material-symbols-outlined text-lg font-bold text-background-dark">check</span>
                  </div>
                  <div className={`h-12 w-[2px] ${promptDone ? "bg-primary/30" : "bg-white/10"}`}></div>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Prompt validated</p>
                  <p className="text-xs text-white/40">Niche, tone, language, profile, and formats accepted.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex size-8 items-center justify-center rounded-full ${
                      draftingDone ? "bg-primary" : draftingActive ? "bg-primary/20 text-primary" : "bg-white/10 text-white/40"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">sync</span>
                  </div>
                  <div className={`h-12 w-[2px] ${draftingDone ? "bg-primary/30" : "bg-white/10"}`}></div>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Drafting chapters</p>
                  <p className="text-xs text-white/40">Building initial structure and section copy.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div
                  className={`flex size-8 items-center justify-center rounded-full ${
                    outputDone ? "bg-primary" : outputActive ? "bg-primary/20 text-primary" : "bg-white/10 text-white/40"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">auto_stories</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Preparing outputs</p>
                  <p className="text-xs text-white/40">Finalizing draft and preparing exports metadata.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 p-8 glass-card">
            <h4 className="mb-4 text-lg font-black text-white">Estimated Delivery</h4>
            <p className="text-sm text-white/50">
              Typical generation completes within <span className="font-bold text-primary">30-90 seconds</span>.
            </p>
            {ebookId ? <p className="mt-3 text-xs text-white/40">eBook ID: {ebookId}</p> : null}
            {jobId ? <p className="mt-1 text-xs text-white/40">Job ID: {jobId}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

