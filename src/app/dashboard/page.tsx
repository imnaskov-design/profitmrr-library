import Link from "next/link";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const fallbackImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAhlFw32ysjW8gJ-_8cK-6nqqY1RVoioJGVudPH5VSdW2G8ylsWm1PQebmR2ExzwPVdNzvh3ZT0KrhwGhi2YhpaXsoilphesNkGMS-emyUdOFual7nuu-5YL3w2rE105VLGEt6k_4krKU2Z-HhM7S379CuQg4oo8XM8jT9eV_ZGnbT3-GQAV_tTihCEoIcvaDbR9nofLYS2N5VT0wR21b8caC-b8bTODXNSeOcfI13pgTpRiupFPUywlWCBAvix3HcmnSiJoDDfkg",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD25huSL4v1j8pjE0YocysTTCYOF7mcXQrreD562MpjO0PsLVdEGZgYEpppsg5q6-RpNDeCbabumSRqAJg0s8FLlqJrfiUSjz5OuGSw5NJxRZLmf9TzqBw_B--KhhKYB4h1KU86p-GrABztmzOjw-irq-2RI-wBTYJHuRB_Hq2UbDjlb_euSebOhGkv7QkRypzCWUODT_qU2yB3A3FIm2WN6jPtnpxrzfXweV0OEre6VEBTwWft2pBelCMWctzbqEACgBQaxfr2SA",
];

export default async function DashboardHomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id;

  const [{ count: totalProducts }, { count: yourDownloads }, { data: latestItemsRaw }] = userId
    ? await Promise.all([
        supabase.from("library_items").select("id", { count: "exact", head: true }),
        supabase
          .from("download_logs")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase
          .from("library_items")
          .select("id, title, category, description")
          .order("created_at", { ascending: false })
          .limit(2),
      ])
    : ([{ count: 0 }, { count: 0 }, { data: [] }] as const);

  const latestItems = (latestItemsRaw ?? []).map((item, index) => ({
    ...item,
    imageUrl: fallbackImages[index % fallbackImages.length],
  }));

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        <header className="mb-1 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h2 className="text-4xl font-900 tracking-tight text-white">Welcome back</h2>
              <span className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                <span className="size-1.5 rounded-full bg-primary"></span>
                Active
              </span>
            </div>
            <p className="font-medium text-white/40">
              Signed in as <span className="font-bold text-white/80">{user?.email ?? "(no email)"}</span>
            </p>
          </div>
        </header>

        <div className="group relative overflow-hidden rounded-3xl glass-card p-8 gold-border-glow">
          <div className="absolute -right-12 -top-12 size-48 rounded-full bg-primary/10 blur-3xl transition-all group-hover:bg-primary/20"></div>
          <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-4xl">verified</span>
            </div>
            <div className="flex-1">
              <h3 className="mb-2 text-xl font-900 text-white">Your subscription is active</h3>
              <p className="text-sm leading-relaxed text-white/50">
                You have full access to the digital empire. Browse the library and download any product to
                start your business today.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3">
              <Link
                href="/dashboard/account"
                className="rounded-xl bg-primary px-6 py-3 text-center text-xs font-black uppercase tracking-widest text-background-dark transition-all hover:bg-primary/90"
              >
                Manage Membership
              </Link>
              <Link
                href="/dashboard/account"
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-center text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-white/10"
              >
                Account & Billing
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-3xl border-white/5 glass-card p-8 transition-all hover:border-primary/20">
            <div className="mb-4 flex items-center justify-between">
              <span className="material-symbols-outlined text-3xl text-primary">inventory_2</span>
            </div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-white/40">Total Products</p>
            <h4 className="text-4xl font-900 text-white">{totalProducts ?? 0}</h4>
          </div>

          <div className="rounded-3xl border-white/5 glass-card p-8 transition-all hover:border-primary/20">
            <div className="mb-4 flex items-center justify-between">
              <span className="material-symbols-outlined text-3xl text-primary">download_done</span>
            </div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-white/40">Your Downloads</p>
            <h4 className="text-4xl font-900 text-white">{yourDownloads ?? 0}</h4>
          </div>

          <div className="rounded-3xl border-white/5 glass-card p-8 transition-all hover:border-primary/20">
            <div className="mb-4 flex items-center justify-between">
              <span className="material-symbols-outlined text-3xl text-primary">auto_awesome</span>
            </div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-white/40">AI Vaults</p>
            <h4 className="text-4xl font-900 text-white">2</h4>
          </div>
        </div>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-900 text-white">Latest in the vault</h3>
            <Link href="/dashboard/library" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {latestItems.length ? (
              latestItems.map((item) => (
                <Link key={item.id} href={`/dashboard/library?q=${encodeURIComponent(item.title)}`} className="group cursor-pointer">
                  <div className="overflow-hidden rounded-2xl border-white/10 glass-card transition-all hover:border-primary/30">
                    <div className="relative aspect-video">
                      <img
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        src={item.imageUrl}
                      />
                      <div className="absolute left-4 top-4">
                        <span className="rounded bg-primary px-2 py-1 text-[10px] font-black uppercase tracking-tighter text-background-dark">
                          Gold MRR
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-5">
                      <div>
                        <h4 className="font-bold text-white transition-colors group-hover:text-primary">{item.title}</h4>
                        <p className="mt-1 text-xs text-white/40">
                          {item.category}
                          {item.description ? ` • ${item.description}` : ""}
                        </p>
                      </div>
                      <span className="flex size-10 items-center justify-center rounded-full bg-white/5 text-white transition-all hover:bg-primary hover:text-background-dark">
                        <span className="material-symbols-outlined text-xl">download</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-white/50 md:col-span-2">
                No products have been added to your vault yet.
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="space-y-8">
        <div className="rounded-3xl border-white/5 glass-card p-8">
          <h3 className="mb-6 text-xl font-900 text-white">Quick actions</h3>
          <div className="space-y-4">
            <Link
              href="/dashboard/library"
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-6 py-4 text-sm font-black uppercase tracking-widest text-background-dark transition-all hover:bg-primary/90 gold-glow"
            >
              <span className="material-symbols-outlined">explore</span>
              Browse Library
            </Link>

            <Link
              href="/dashboard/ebooks/create"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-bold text-white transition-all hover:bg-white/10"
            >
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
              Create E-Book
            </Link>

            <Link
              href="/dashboard/planners/create"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-bold text-white transition-all hover:bg-white/10"
            >
              <span className="material-symbols-outlined text-primary">calendar_month</span>
              Create Planner
            </Link>
          </div>

          <div className="mt-8 rounded-xl border border-primary/10 bg-primary/5 p-4">
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-primary">Fair-use policy</p>
            <p className="text-[11px] leading-relaxed text-white/50">
              We enforce download limits to discourage dumping. Download what you need, when you need it.
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border-white/5 glass-card p-8">
          <div className="mb-6 flex items-center gap-4">
            <span className="material-symbols-outlined text-primary">gavel</span>
            <h3 className="text-lg font-bold text-white">Your Licenses</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
              <span className="material-symbols-outlined text-xl text-primary">verified</span>
              <span className="text-xs font-medium text-white/70">Master Resell Rights (MRR)</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
              <span className="material-symbols-outlined text-xl text-primary">verified</span>
              <span className="text-xs font-medium text-white/70">Private Label Rights (PLR)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

