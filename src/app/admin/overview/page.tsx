import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatCard } from "@/components/ui/StatCard";
import { StaggerReveal, Reveal } from "@/components/ui/StaggerReveal";

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
      {/* Header */}
      <Reveal delay={0}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Overview
          </h1>
          <p className="mt-2 text-sm text-zinc-500">Key metrics for the last 7 days.</p>
        </div>
      </Reveal>

      {/* KPI Cards */}
      <StaggerReveal delay={100} stagger={80} className="grid gap-4 md:grid-cols-5">
        <StatCard 
          label="Active" 
          value={formatInt(active)} 
          delay={100}
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard 
          label="Cancelled" 
          value={formatInt(cancelled)} 
          delay={180}
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard 
          label="Expired" 
          value={formatInt(expired)} 
          delay={260}
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard 
          label="New (7d)" 
          value={formatInt(newLast7)} 
          delay={340}
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          }
        />
        <StatCard 
          label="Downloads (7d)" 
          value={formatInt(downloadsLast7)} 
          delay={420}
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          }
        />
      </StaggerReveal>

      {/* Content Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Top Categories */}
        <Reveal delay={500} className="lg:col-span-2">
          <GlassCard padding="none" className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-100 p-5">
              <h2 className="text-base font-semibold text-zinc-900">Top categories</h2>
              <p className="text-xs text-zinc-400">Based on downloads in the last 7 days</p>
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-2">
              {topCategories.length ? (
                topCategories.map(([cat, count]) => (
                  <div
                    key={cat}
                    className="group flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-3 transition-all hover:border-indigo-200 hover:bg-indigo-50/50"
                  >
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{cat}</p>
                      <p className="text-xs text-zinc-500">{count} downloads</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-6 text-sm text-zinc-500 sm:col-span-2">
                  Not enough data yet.
                </div>
              )}
            </div>
          </GlassCard>
        </Reveal>

        {/* Notes */}
        <Reveal delay={600}>
          <GlassCard padding="lg">
            <h2 className="text-base font-semibold text-zinc-900">Notes</h2>
            <ul className="mt-4 space-y-3 text-sm text-zinc-600">
              <li className="flex items-start gap-2">
                <span className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                Subscription status comes from Supabase profiles.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                LemonSqueezy webhooks update profiles.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                Downloads are rate-limited and logged.
              </li>
            </ul>
            <p className="mt-4 text-xs text-zinc-400">
              For scale, heavy aggregations will move into SQL views/functions.
            </p>
          </GlassCard>
        </Reveal>
      </div>
    </div>
  );
}
