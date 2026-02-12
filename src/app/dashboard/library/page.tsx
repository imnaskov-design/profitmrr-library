import Link from "next/link";

import { getServerEnv } from "@/lib/env/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Full Library
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Search, filter, and download products from the full PLR + MRR library.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-700">
        <p className="font-semibold text-zinc-900">Download limit (fair-use)</p>
        <p className="mt-2">
          Downloads in the last 24h: <span className="font-semibold">{usedSafe}</span> / {limit}
          {" "}
          <span className="text-zinc-500">({remaining} remaining)</span>
        </p>
      </div>

      <form method="GET" className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-4 md:items-end">
        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-xs font-semibold text-zinc-700">Search</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search titles…"
            className="h-11 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-zinc-700">Category</span>
          <select
            name="category"
            defaultValue={category}
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-zinc-700">Sort</span>
          <select
            name="sort"
            defaultValue={sort}
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
          >
            <option value="new">New</option>
            <option value="az">A–Z</option>
          </select>
        </label>

        <div className="md:col-span-4">
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
          >
            Apply
          </button>
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items && items.length ? (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900">{item.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">{item.category}</p>
                </div>
                {item.is_new ? (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800">
                    New
                  </span>
                ) : null}
              </div>

              {item.description ? (
                <p className="mt-3 text-sm text-zinc-600">{item.description}</p>
              ) : null}

              {item.tags && item.tags.length ? (
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.tags.slice(0, 6).map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-700"
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
                    className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
                  >
                    Download
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white opacity-50"
                  >
                    Limit reached
                  </button>
                )}
                <Link
                  href="/dashboard/downloads"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
                >
                  History
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-sm text-zinc-600 sm:col-span-2 lg:col-span-3">
            No library items found. Seed your database with some items to see them here.
          </div>
        )}
      </div>
    </div>
  );
}

