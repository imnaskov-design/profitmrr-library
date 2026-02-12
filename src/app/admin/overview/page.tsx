import { createSupabaseServerClient } from "@/lib/supabase/server";

function formatInt(value: number | null | undefined) {
  return (value ?? 0).toLocaleString();
}

export default async function AdminOverviewPage() {
  const supabase = await createSupabaseServerClient();

  const now = new Date();
  const since7 = new Date(now);
  since7.setDate(since7.getDate() - 7);
  const sinceIso = since7.toISOString();

  const [
    { count: active },
    { count: cancelled },
    { count: expired },
    { count: newLast7 },
    { count: downloadsLast7 },
    { data: recentDownloadCats },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("user_id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("profiles")
      .select("user_id", { count: "exact", head: true })
      .eq("status", "cancelled"),
    supabase
      .from("profiles")
      .select("user_id", { count: "exact", head: true })
      .eq("status", "expired"),
    supabase
      .from("profiles")
      .select("user_id", { count: "exact", head: true })
      .gte("created_at", sinceIso),
    supabase
      .from("download_logs")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sinceIso),
    supabase
      .from("download_logs")
      .select("id, library_item:library_items ( category )")
      .gte("created_at", sinceIso)
      .limit(5000),
  ]);

  const categoryCounts = new Map<string, number>();
  for (const row of recentDownloadCats ?? []) {
    const libraryItem = Array.isArray(row.library_item)
      ? row.library_item[0]
      : row.library_item;
    const cat = libraryItem?.category;
    if (!cat) continue;
    categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
  }

  const topCategories = Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Overview
        </h1>
        <p className="mt-2 text-sm text-zinc-600">Key metrics for the last 7 days.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <KpiCard label="Active" value={formatInt(active)} />
        <KpiCard label="Cancelled" value={formatInt(cancelled)} />
        <KpiCard label="Expired" value={formatInt(expired)} />
        <KpiCard label="New (7d)" value={formatInt(newLast7)} />
        <KpiCard label="Downloads (7d)" value={formatInt(downloadsLast7)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-zinc-900">Top categories</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Based on downloads in the last 7 days.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {topCategories.length ? (
              topCategories.map(([cat, count]) => (
                <div
                  key={cat}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-zinc-900">{cat}</p>
                  <p className="mt-1 text-xs text-zinc-600">{count} downloads</p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-600 sm:col-span-2">
                Not enough data yet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Notes</h2>
          <ul className="mt-4 space-y-2 text-sm text-zinc-700">
            <li>• Subscription status comes from Supabase profiles.</li>
            <li>• LemonSqueezy webhooks update `profiles` / `pending_subscriptions`.</li>
            <li>• Downloads are rate-limited and logged.</li>
          </ul>
          <p className="mt-4 text-xs text-zinc-500">
            For scale, heavy aggregations will move into SQL views/functions.
          </p>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">{value}</p>
    </div>
  );
}

