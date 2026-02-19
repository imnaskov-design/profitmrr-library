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

const previewImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDCtgDHdOCsyExioLNqxkEIA34AIcoeY8lU5_51Jevo3lKsQyBfe5Jn_7RzGc-SstwSLZ4hxhol4_AEhjzj8Dmjq0QGIc9aGVuVt_h_tGiQQetlR9lT2w-2ukQs2e5HlD0wwNXGVkcX66zBGVEiYlcwx2Ug960wgNaQsDvAMmCuC0_ZZieydC6R_ToXdk8mvzSHhcxXe8R6GHf5cc4RNlnrG8eUX3jCP9NlspIrb80VWjsolJ7-Gffkz7TANIsoKjbMfDY1ayYmOQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAP8_2EJBAhvuUsQikf_kA_VzQoB_xFKm4vCmQ85EDBuqtDCAPEPvklkLzZow0TlrVqy6gC-XWayxqidWKqFprgzh2AdNy0Fb9j_L6A0YOlM2ON3boNPrWqQ1cRR0EFsfXBJ0BYlXpmICZfidpnRHIRSAVBnfvT-mjF6LiTNGTHKyXdwOZRkQmkPmHQbA_ZoG8jpmiccpayj9laUXcEiCK5dYnEXcIc7DFmci02t0P23BV3y_FHf0ZQrLQI9dTUuqI5lMgTTkGp8g",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAVm3HXPJzby3rig4g5a86ylTTXLVRBKHSXWBZlnaBPUE5H_Xfla--9UV5m2DNZK9RJnSWNtxsulhCABWSwHQ3YBr5Mg7IvlWvyWzu_vHnFFcR8KSBDqhJtYXdfG4FVTB0U7xiQsdaJQ6i92mgKMtokGiyiovdo1DEPXOO-8noDUTmZ6ayHzPfPcAe4fPULGbdLHoBKjpjKAuycZe_f6-LoKx3jts8Fg2nmbI1jNnXvWlpah3rG9h57g05oaUJwRozC_NyVFmK4_w",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBWbkpbItrfQcSUQi6IP9rvqrMGxhVoaqb2WMjBopx7CAIbehF0-BEFTr9swmEFZzjEyrPlVnZsepoqZlUJmSan5-XjJoCOZgojdixfc2Ik6EBh1NcL0GQrMO2lNKfNcyd2bqQspmvH2weOteck270vRPGamKblTfoIzHldO0xnQkbvatVUO_rpTfqWtOaTctc-1sqYlVrZku4WqvzKVkLgdUKiXD9oHP18-JTcwxjU4GIyXcHh33vO4-Sukn4l47xmPa_ECPVQUQ",
];

function asSingle(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function FullLibraryPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};

  const q = asSingle(resolvedSearchParams.q).trim();
  const category = asSingle(resolvedSearchParams.category) || "All";
  const sort = asSingle(resolvedSearchParams.sort) || "popular";

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id;
  const limit = getServerEnv().DOWNLOADS_PER_DAY_LIMIT;
  const sinceDate = new Date();
  sinceDate.setHours(sinceDate.getHours() - 24);
  const since = sinceDate.toISOString();
  const { count: used } = userId
    ? await supabase
        .from("download_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", since)
    : { count: 0 };

  let query = supabase
    .from("library_items")
    .select("id, title, category, description, tags, file_size_mb, is_new")
    .limit(48);

  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }

  if (category !== "All") {
    query = query.eq("category", category);
  }

  if (sort === "az") {
    query = query.order("title", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: itemsRaw } = await query;
  const itemsSource = itemsRaw ?? [];
  const items = itemsSource.map((item, index) => ({
    ...item,
    imageUrl: previewImages[index % previewImages.length],
    badge: item.is_new ? "NEW" : index % 2 === 0 ? "MRR" : "PLR",
  }));

  const totalShown = items.length;
  const usedSafe = used ?? 0;
  const remaining = Math.max(0, limit - usedSafe);

  return (
    <div className="relative">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full max-w-sm shrink-0 lg:w-72">
          <div className="rounded-2xl bg-background-dark/50 p-6 custom-scrollbar border border-primary/10">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Filters</h2>
              <Link href="/dashboard/library" className="text-xs font-bold text-primary hover:underline">
                Reset All
              </Link>
            </div>

            <div className="space-y-8">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-primary">storefront</span>
                    <span className="text-sm font-bold text-white">Etsy Proven</span>
                  </div>
                  <div className="h-5 w-9 rounded-full bg-primary"></div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Product Type</p>
                <div className="space-y-3 text-sm text-slate-300">
                  <label className="flex items-center gap-3"><input type="checkbox" defaultChecked className="rounded border-white/10 bg-white/5 text-primary" />E-books & Guides</label>
                  <label className="flex items-center gap-3"><input type="checkbox" className="rounded border-white/10 bg-white/5 text-primary" />Video Reels Library</label>
                  <label className="flex items-center gap-3"><input type="checkbox" defaultChecked className="rounded border-white/10 bg-white/5 text-primary" />Notion Templates</label>
                  <label className="flex items-center gap-3"><input type="checkbox" className="rounded border-white/10 bg-white/5 text-primary" />Digital Planners</label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Usage Rights</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" className="rounded-lg border border-primary bg-primary/10 py-2 text-xs font-bold text-primary">MRR</button>
                  <button type="button" className="rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-bold text-slate-400">PLR</button>
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Fair-use</p>
                <p className="text-xs text-white/60">
                  Last 24h downloads: <span className="font-bold text-white">{usedSafe}</span> / {limit} ({remaining} remaining)
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-8">
          <header className="space-y-5 border-b border-primary/5 pb-6">
            <form method="GET" className="flex flex-col gap-4 xl:flex-row xl:items-end">
              <div className="relative flex-1">
                <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Search 2,500+ premium digital products..."
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col">
                  <label className="mb-1 ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Category</label>
                  <select
                    name="category"
                    defaultValue={category}
                    className="h-12 min-w-[170px] rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Sort Results</label>
                  <select
                    name="sort"
                    defaultValue={sort}
                    className="h-12 min-w-[180px] rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="new">Recently Added</option>
                    <option value="az">A-Z</option>
                  </select>
                </div>

                <button className="h-12 rounded-lg bg-primary px-5 text-sm font-bold text-background-dark transition-transform hover:scale-[1.02]">
                  Search
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-extrabold text-white">Product Library</h3>
                <p className="text-sm text-slate-500">Showing {totalShown} premium digital products</p>
              </div>
              <div className="flex gap-2">
                <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary">CURATED</span>
                <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary">MRR READY</span>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {items.length ? (
              items.map((item) => (
                <article
                  key={item.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl glass-panel transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,193,5,0.15)]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-slate-800 to-background-dark p-6">
                    <div className="absolute left-4 top-4 z-10">
                      <span className="rounded-md bg-primary px-2 py-1 text-[10px] font-black text-background-dark shadow-lg">
                        {item.badge}
                      </span>
                    </div>
                    <div className="relative h-full w-full transition-transform duration-500 group-hover:scale-110">
                      <div className="absolute inset-0 rounded-full bg-primary/10 blur-3xl opacity-30"></div>
                      <img alt={item.title} className="relative z-0 h-full w-full rounded-lg object-cover drop-shadow-2xl" src={item.imageUrl} />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-primary">{item.category}</span>
                      <span className="text-[10px] text-slate-500">•</span>
                      <span className="text-[10px] font-bold text-slate-400">{item.is_new ? "NEW" : "TRENDING"}</span>
                    </div>

                    <h4 className="mb-2 line-clamp-2 font-bold leading-tight text-white">{item.title}</h4>
                    <p className="line-clamp-2 text-xs text-slate-400">
                      {item.description ?? "High-converting product with full rights included."}
                    </p>

                    <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4 text-xs">
                      <div className="flex flex-col">
                        <p className="text-[10px] font-bold text-slate-500">SIZE</p>
                        <p className="font-bold text-white">{item.file_size_mb ? `${item.file_size_mb} MB` : "—"}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-[10px] font-bold text-slate-500">RATING</p>
                        <p className="font-bold text-green-500">A+</p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <a
                        href={`/api/download?id=${item.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-black text-background-dark transition-all hover:brightness-110"
                      >
                        <span className="material-symbols-outlined text-sm">download</span>
                        DOWNLOAD
                      </a>
                      <Link
                        href={`/dashboard/library/${item.id}`}
                        className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/10"
                      >
                        PREVIEW
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-sm text-slate-400">
                No products matched your filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

