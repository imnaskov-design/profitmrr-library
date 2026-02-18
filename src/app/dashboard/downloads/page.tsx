import Link from "next/link";

import { getServerEnv } from "@/lib/env/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const thumbImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB2wl0B5zYUp7C1XfI0NQFFTNR3A9tta1jRxi1lqs9QrP59BDPjobxMlLriYiX1ODcE9mIXbH40PUMcNvC2SqjMdxSUNfqgosMfzYyzAbB1dsNfC78OxjP2o26rpMAphVT-1FgzTim-6hjFWcOYVVvkvqHLcnjnC5BIsnxv_z3Bxq_VbU8Shb6A_ozMOy2_gn_fkomDGJ2f6JnoRN0emKoDHT02gX56EPQ9YXgG02uR5LUC0CBoKSGl7PSJQy7DZnIRLjAsAdF_Og",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBoMXjXeCnI8zOqu-W8MdTT3or7j7DAjWP2dTXotytLXKd-X7FbjYKKziCPmvf4ihd2r7jtVrLP_ksbsanq3p6O2-FZHdvdxkOHf3d_0m3tEO1bWGj22a8M5K_XkAN-_6naLUCzoHIpAfriM1OPkiSixuoejuBqV3vS36w94kOZ80avCONJRnnUy8orzBlTee10--VMnBRIAO5SYgiQgYZxXmxS64Ykkgm2JJ3d9FpCmpXEPy9VKvBoRSXxkili0OgWLFnDcnRd8Q",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCk44tWnTqKQSX5lVA98Djn8ZiIApYnyJS9XXkWuLbaruNcF1SyYfnsK-sQBUI9XP58jmVORZ8bUd1e1e7KTKa9QTuGt_lQD-FVcilh-Dx1R6ntPhkgdP-8eAz2GHO3YMxZYoP3Xq2rmqnP-L3zDkXkEiokS5lW_XI1qQ7bPAlcAFfYT67VmIetf-PApk9hKtsV7i9UbK6ScjzrWXfk3vgn1pF_PZS-IS2jxfkU5S3UP4xyMqGXmgbR3NaSMZuCsIQmJaJkpM0K8w",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCHdJk0hTdei65-wSkKJ25pWRWLHHyPBtrFMGrshNpu3ONBPmnmKQ8VKj_r9PRrUvbiinmh3ZjB8uG_RHCUA95s6RcXi7Wmi88EBMYmWN-Xew7Ug31moZKaXubLVDHzgwflD6_kv7Dj46_sCBYtQQ-Jpy4Zm6lkkJH90GH7nxeKREyDOGRphjwu4QK_bpX83XTwVuQfY9eyQ_aU8uUTqbmKEzDJC9naFud6lFKJLs6IjSmLgS4fn9U77o7k77_LlfOEPy3mFroBJw",
];

export default async function MyDownloadsPage() {
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

  const { data: logsRaw } = userId
    ? await supabase
        .from("download_logs")
        .select("id, created_at, library_item:library_items ( id, title, category, file_size_mb )")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(128)
    : { data: [] };

  const logsSource = logsRaw ?? [];
  const logs = logsSource.map((row, index) => {
    const item = Array.isArray(row.library_item) ? row.library_item[0] : row.library_item;
    return {
      id: row.id,
      createdAt: row.created_at,
      item,
      imageUrl: thumbImages[index % thumbImages.length],
    };
  });

  const usedSafe = used ?? 0;
  const remaining = Math.max(0, limit - usedSafe);

  return (
    <div className="space-y-8">
      <header className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">My Downloads</h2>
            <p className="mt-1 text-sm text-white/50">
              Manage and track your <span className="font-bold text-primary">{logs.length || 0} digital assets</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white/80 transition-colors glass hover:bg-white/5">
              <span className="material-symbols-outlined text-sm">refresh</span>
              Sync List
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background-dark shadow-lg shadow-primary/10 transition-transform hover:scale-[1.02]">
              <span className="material-symbols-outlined text-sm">add_circle</span>
              Redeem Product
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex items-center gap-5 rounded-xl p-6 glass">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined">database</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">Storage Used</p>
              <p className="mt-0.5 text-xl font-bold text-white">{(logs.length * 0.05).toFixed(1)} GB <span className="text-sm font-medium text-white/30">/ 10 GB</span></p>
              <div className="mt-2 h-1 w-32 overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.round((logs.length / 128) * 100))}%` }}></div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5 rounded-xl p-6 glass">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined">workspace_premium</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">Licenses Issued</p>
              <p className="mt-0.5 text-xl font-bold text-white">{Math.max(1, logs.length)} Active</p>
              <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                <span className="material-symbols-outlined text-[10px]">trending_up</span>
                +12% this month
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 rounded-xl p-6 glass">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined">history</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">Recent Activity</p>
              <p className="mt-0.5 truncate text-sm font-bold text-white">{logs[0]?.item?.title ?? "No downloads yet"}</p>
              <p className="mt-1 text-[10px] italic text-white/30">{logs[0]?.createdAt ? "Downloaded recently" : "Waiting for first download"}</p>
            </div>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30">search</span>
            <input
              className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Search specific downloads, product names, or tags..."
              type="text"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white/70 glass hover:bg-white/5"><span className="material-symbols-outlined text-lg">calendar_month</span>Date Range</button>
            <button className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white/70 glass hover:bg-white/5"><span className="material-symbols-outlined text-lg">filter_list</span>All Categories</button>
          </div>
        </div>
      </section>

      <section className="space-y-4 pb-12">
        <div className="w-full overflow-hidden">
          <table className="w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                <th className="w-[40%] px-4 py-2">Product Information</th>
                <th className="px-4 py-2">Download Date</th>
                <th className="px-4 py-2">License</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {logs.length ? (
                logs.map((row, index) => {
                  const item = row.item;
                  const date = row.createdAt ? new Date(row.createdAt) : null;
                  const statusLabel = index % 3 === 0 ? "Update Available" : "Latest Version";
                  return (
                    <tr key={row.id} className="group bg-white/[0.01] transition-all hover:bg-white/[0.02]">
                      <td className="rounded-l-xl border-y border-l border-white/5 px-4 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative size-14 flex-shrink-0 overflow-hidden rounded-lg border border-white/10 bg-neutral-dark">
                            <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent"></div>
                            <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url('${row.imageUrl}')` }}></div>
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-white transition-colors group-hover:text-primary">{item?.title ?? "Deleted Item"}</p>
                            <p className="mt-1 text-[11px] text-white/30">{item?.category ?? "Unknown"} • {item?.file_size_mb ? `${item.file_size_mb} MB` : "Size —"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="border-y border-white/5 px-4 py-4">
                        <p className="font-medium text-white/70">{date ? date.toLocaleDateString() : "—"}</p>
                        <p className="text-[11px] text-white/30">{date ? date.toLocaleTimeString() : "—"}</p>
                      </td>
                      <td className="border-y border-white/5 px-4 py-4">
                        <span className="rounded border border-primary px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary">MRR</span>
                      </td>
                      <td className="border-y border-white/5 px-4 py-4">
                        {statusLabel === "Update Available" ? (
                          <span className="status-pulse pl-4 text-xs font-bold text-primary">Update Available</span>
                        ) : (
                          <span className="text-xs font-medium italic text-white/30">Latest Version</span>
                        )}
                      </td>
                      <td className="rounded-r-xl border-y border-r border-white/5 px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {item?.id ? (
                            <a
                              href={`/api/download?id=${item.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex size-9 items-center justify-center rounded-lg text-primary transition-all glass hover:bg-primary hover:text-background-dark"
                              title="Download"
                            >
                              <span className="material-symbols-outlined text-lg">download</span>
                            </a>
                          ) : (
                            <button disabled className="flex size-9 items-center justify-center rounded-lg text-white/30 glass">
                              <span className="material-symbols-outlined text-lg">block</span>
                            </button>
                          )}
                          <button className="h-9 rounded-lg px-3 text-[11px] font-bold uppercase tracking-wide text-white/70 transition-all glass hover:bg-white/10">
                            Certificate
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="rounded-xl border border-dashed border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-white/50">
                    No downloads yet. Browse the <Link href="/dashboard/library" className="font-semibold text-primary underline">library</Link> to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-xs font-medium text-white/20">Showing 1-{Math.min(10, logs.length)} of {logs.length || 0} products</p>
          <div className="flex gap-2">
            <button className="flex size-9 cursor-not-allowed items-center justify-center rounded-lg text-white/30 glass"><span className="material-symbols-outlined text-lg">chevron_left</span></button>
            <button className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-background-dark">1</button>
            <button className="flex size-9 items-center justify-center rounded-lg text-sm font-medium text-white/50 glass hover:bg-white/10">2</button>
            <button className="flex size-9 items-center justify-center rounded-lg text-sm font-medium text-white/50 glass hover:bg-white/10">3</button>
            <span className="flex size-9 items-center justify-center text-sm text-white/20">...</span>
            <button className="flex size-9 items-center justify-center rounded-lg text-white/50 glass hover:bg-white/10"><span className="material-symbols-outlined text-lg">chevron_right</span></button>
          </div>
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-white/70">
          Daily download limit: {limit} • Used: {usedSafe} • Remaining: {remaining}
        </div>
      </section>
    </div>
  );
}

