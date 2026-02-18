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

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default async function FullLibraryPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const q = asSingle(searchParams?.q).trim();
  const category = asSingle(searchParams?.category) || "All";
  const sort = asSingle(searchParams?.sort) || "popular";
  const preview = asSingle(searchParams?.preview);

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

  const previewId = isUuid(preview) ? preview : "";
  const previewFromList = previewId ? items.find((item) => item.id === previewId) : undefined;

  const { data: previewFromDb } = previewId
    ? await supabase
        .from("library_items")
        .select("id, title, category, description, file_size_mb")
        .eq("id", previewId)
        .maybeSingle()
    : { data: null };

  const previewItem = previewFromList
    ? {
        ...previewFromList,
        description:
          previewFromList.description ??
          "Dominate your niche with this high-fidelity asset pack. Everything needed to publish quickly and launch professionally.",
      }
    : previewFromDb
      ? {
          ...previewFromDb,
          imageUrl: previewImages[0],
          badge: "MRR",
          is_new: false,
          tags: [],
        }
      : null;

  const baseParams = new URLSearchParams();
  if (q) baseParams.set("q", q);
  if (category && category !== "All") baseParams.set("category", category);
  if (sort && sort !== "popular") baseParams.set("sort", sort);

  const baseHref = `/dashboard/library${baseParams.toString() ? `?${baseParams.toString()}` : ""}`;

  const buildPreviewHref = (id: string) => {
    const params = new URLSearchParams(baseParams);
    params.set("preview", id);
    return `/dashboard/library?${params.toString()}`;
  };

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
                        href={buildPreviewHref(item.id)}
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

      {previewItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md md:p-12">
          <Link href={baseHref} className="absolute right-8 top-8 z-[60] text-slate-400 transition-colors hover:text-white">
            <span className="material-symbols-outlined text-3xl">close</span>
          </Link>

          <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-primary/20 bg-card-dark modal-glow md:flex-row">
            <div className="flex w-full flex-col items-center justify-center gap-6 border-b border-white/5 bg-gradient-to-br from-slate-900 to-black p-8 md:w-1/2 md:border-b-0 md:border-r">
              <div className="group/main relative aspect-[4/5] w-full">
                <div className="absolute inset-0 rounded-full bg-primary/5 blur-3xl"></div>
                <img
                  alt={previewItem.title}
                  className="relative z-10 h-full w-full rounded-lg object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.5)]"
                  src={previewItem.imageUrl}
                />
                <button className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-2.5 text-xs font-bold text-white opacity-0 backdrop-blur-md transition-all group-hover/main:opacity-100 hover:bg-white/20">
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  Preview Inside
                </button>
              </div>
            </div>

            <div className="flex w-full flex-col overflow-y-auto p-8 custom-scrollbar md:w-1/2 md:p-12">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <span className="rounded-md bg-primary px-3 py-1 text-[10px] font-black tracking-wider text-background-dark">MRR INCLUDED</span>
                  <span className="flex items-center gap-1 rounded-md border border-green-500/20 bg-green-500/10 px-3 py-1 text-[10px] font-black tracking-wider text-green-500">
                    <span className="material-symbols-outlined text-[12px]">verified</span>
                    ETSY PROVEN
                  </span>
                </div>
                <h2 className="text-3xl font-extrabold leading-tight text-white md:text-4xl">{previewItem.title}</h2>
              </div>

              <div className="my-8 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">Category</p>
                  <p className="text-xl font-bold text-primary">{previewItem.category}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">File Size</p>
                  <p className="text-xl font-bold text-primary">{previewItem.file_size_mb ? `${previewItem.file_size_mb} MB` : "Included"}</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="leading-relaxed text-slate-300">
                  {previewItem.description ??
                    "Dominate your niche with this high-fidelity product. Includes commercial rights and one-click access for immediate launch."}
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm font-semibold text-slate-200"><span className="material-symbols-outlined text-lg text-primary">check_circle</span>Full Resell Rights (MRR)</li>
                  <li className="flex items-center gap-3 text-sm font-semibold text-slate-200"><span className="material-symbols-outlined text-lg text-primary">check_circle</span>Commercial License Included</li>
                  <li className="flex items-center gap-3 text-sm font-semibold text-slate-200"><span className="material-symbols-outlined text-lg text-primary">check_circle</span>Instant One-Click Download</li>
                </ul>
              </div>

              <div className="mt-auto flex flex-col gap-3 pt-10">
                <a
                  href={`/api/download?id=${previewItem.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-black text-background-dark transition-all hover:scale-[1.01] hover:brightness-110 active:scale-95"
                >
                  <span className="material-symbols-outlined font-bold">download</span>
                  DOWNLOAD NOW
                </a>
                <Link
                  href="/dashboard/downloads"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-4 text-sm font-bold text-white transition-all hover:bg-white/10"
                >
                  <span className="material-symbols-outlined text-lg">add_to_drive</span>
                  Add to My Downloads
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

