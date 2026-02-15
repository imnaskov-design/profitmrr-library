import Link from "next/link";

import { getServerEnv } from "@/lib/env/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { StaggerReveal, Reveal } from "@/components/ui/StaggerReveal";

type SearchParams = { [key: string]: string | string[] | undefined };

const categories = [
  "All",
  "Ebooks",
  "Courses",
  "Canva Templates",
  "Planners",
  "Social Media Kits",
  "AI Prompts",
  "Marketing Bundles",
];

export default async function FullLibraryPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const q = typeof searchParams?.q === "string" ? searchParams.q.trim() : "";
  const category =
    typeof searchParams?.category === "string" ? searchParams.category : "All";
  const sort = typeof searchParams?.sort === "string" ? searchParams.sort : "new";

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const limit = getServerEnv().DOWNLOADS_PER_DAY_LIMIT;
  const now = new Date();
  const since = new Date(now);
  since.setHours(since.getHours() - 24);
  const sinceIso = since.toISOString();
  const { count: used } = user?.id
    ? await supabase
        .from("download_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", sinceIso)
    : { count: 0 };
  const usedSafe = used ?? 0;
  const remaining = Math.max(0, limit - usedSafe);

  let query = supabase
    .from("library_items")
    .select("id, title, category, description, tags, file_size_mb, is_new")
    .limit(50);

  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  if (category && category !== "All") {
    query = query.eq("category", category);
  }

  if (sort === "az") {
    query = query.order("title", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: items } = await query;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Reveal delay={0}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Full Library
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Search, filter, and download products from the full PLR + MRR library.
          </p>
        </div>
      </Reveal>

      {/* Download Limit */}
      <Reveal delay={100}>
        <GlassCard className="border-indigo-100/50 bg-indigo-50/50">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-indigo-900">Download limit (fair-use)</p>
              <p className="text-xs text-indigo-700">
                Downloads in the last 24h: <span className="font-semibold">{usedSafe}</span> / {limit}
                {" "}
                <span className="text-indigo-500">({remaining} remaining)</span>
              </p>
            </div>
          </div>
        </GlassCard>
      </Reveal>

      {/* Filters */}
      <Reveal delay={200}>
        <GlassCard padding="md" className="overflow-hidden">
          <form method="GET" className="grid gap-3 md:grid-cols-4 md:items-end">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-zinc-600">Search</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Search titles…"
                  className="h-11 w-full rounded-xl border border-zinc-200/60 bg-white/80 pl-10 pr-3 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-600">Category</label>
              <select
                name="category"
                defaultValue={category}
                className="h-11 w-full rounded-xl border border-zinc-200/60 bg-white/80 px-3 text-sm text-zinc-900 outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/20"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-600">Sort</label>
              <select
                name="sort"
                defaultValue={sort}
                className="h-11 w-full rounded-xl border border-zinc-200/60 bg-white/80 px-3 text-sm text-zinc-900 outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/20"
              >
                <option value="new">New</option>
                <option value="az">A–Z</option>
              </select>
            </div>

            <div className="md:col-span-4">
              <GlassButton
                type="submit"
                variant="primary"
                className="w-full md:w-auto"
              >
                Apply filters
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      </Reveal>

      {/* Items Grid */}
      <StaggerReveal delay={300} stagger={50} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items && items.length ? (
          items.map((item) => (
            <GlassCard key={item.id} hover padding="md" className="group">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900">{item.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">{item.category}</p>
                </div>
                {item.is_new ? (
                  <span className="flex-shrink-0 rounded-full border border-indigo-200/50 bg-indigo-50/80 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 backdrop-blur-sm">
                    New
                  </span>
                ) : null}
              </div>

              {item.description ? (
                <p className="mt-3 text-sm text-zinc-600 line-clamp-2">{item.description}</p>
              ) : null}

              {item.tags && item.tags.length ? (
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.tags.slice(0, 6).map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded-full border border-zinc-200/50 bg-white/60 px-2 py-0.5 text-[11px] font-medium text-zinc-600 backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-4 flex items-center justify-between gap-3 text-xs text-zinc-500">
                <span>
                  {item.file_size_mb ? `${item.file_size_mb} MB` : "Size: —"}
                </span>
                <span className="text-zinc-400">Secure (10-min link)</span>
              </div>

              <div className="mt-4 flex gap-2">
                {remaining > 0 ? (
                  <a
                    href={`/api/download?id=${item.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Download
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-zinc-200 px-4 text-sm font-semibold text-zinc-500"
                  >
                    Limit reached
                  </button>
                )}
                <Link
                  href="/dashboard/downloads"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200/60 bg-white/80 px-3 text-sm font-semibold text-zinc-700 backdrop-blur-sm transition-all hover:bg-white hover:border-zinc-300"
                >
                  History
                </Link>
              </div>
            </GlassCard>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-8 text-sm text-zinc-500 sm:col-span-2 lg:col-span-3">
            No library items found. Seed your database with some items to see them here.
          </div>
        )}
      </StaggerReveal>
    </div>
  );
}
