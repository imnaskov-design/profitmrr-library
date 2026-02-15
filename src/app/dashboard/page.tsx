import Link from "next/link";

import {
  getSubscriptionSummary,
  normalizeSubscriptionStatus,
} from "@/lib/subscription";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { StatCard } from "@/components/ui/StatCard";
import { StaggerReveal, Reveal } from "@/components/ui/StaggerReveal";

export default async function DashboardHomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id;

  const { data: profile } = userId
    ? await supabase
        .from("profiles")
        .select("status, current_period_end")
        .eq("user_id", userId)
        .maybeSingle()
    : { data: null };

  const summary = getSubscriptionSummary({
    status: normalizeSubscriptionStatus(profile?.status),
    currentPeriodEnd: profile?.current_period_end ?? null,
  });

  const [
    { count: totalProducts },
    { count: newThisMonth },
    { count: yourDownloads },
    { data: newItems },
  ] = userId
    ? await Promise.all([
        supabase.from("library_items").select("id", { count: "exact", head: true }),
        supabase
          .from("library_items")
          .select("id", { count: "exact", head: true })
          .eq("is_new", true),
        supabase
          .from("download_logs")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase
          .from("library_items")
          .select("id, title, category, description")
          .eq("is_new", true)
          .order("created_at", { ascending: false })
          .limit(4),
      ])
    : ([
        { count: 0 },
        { count: 0 },
        { count: 0 },
        { data: [] },
      ] as const);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Reveal delay={0}>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Welcome back
          </h1>
          <p className="text-sm text-zinc-500">
            Signed in as{" "}
            <span className="font-medium text-zinc-700">
              {user?.email ?? "(no email)"}
            </span>
          </p>
          <p className="text-sm text-zinc-500">
            Subscription: <span className="font-semibold text-zinc-900">{summary.title}</span>
            {summary.detail ? <span className="text-zinc-400"> — {summary.detail}</span> : null}
          </p>
        </div>
      </Reveal>

      {/* Subscription Alert */}
      {!summary.hasAccess ? (
        <Reveal delay={100}>
          <GlassCard className="border-amber-200/50 bg-amber-50/80">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-900">
                  Your subscription is not active.
                </p>
                <p className="mt-1 text-sm text-amber-800">
                  Downloads and member content are locked until your subscription is active.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/"
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Reactivate membership
                  </Link>
                  <Link
                    href="/dashboard/account"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-amber-200 bg-white/80 px-4 text-sm font-semibold text-amber-900 backdrop-blur-sm transition-all hover:bg-white"
                  >
                    Account & Billing
                  </Link>
                </div>
              </div>
            </div>
          </GlassCard>
        </Reveal>
      ) : null}

      {/* Stats Grid */}
      <StaggerReveal delay={150} stagger={80} className="grid gap-4 md:grid-cols-3">
        <StatCard 
          label="Total products" 
          value={totalProducts ?? 0} 
          delay={150}
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
        <StatCard 
          label="New this month" 
          value={newThisMonth ?? 0} 
          delay={230}
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <StatCard 
          label="Your downloads" 
          value={yourDownloads ?? 0} 
          delay={310}
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          }
        />
      </StaggerReveal>

      {/* Content Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* New This Month */}
        <Reveal delay={400} className="lg:col-span-2">
          <GlassCard padding="none" className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-100 p-5">
              <h2 className="text-base font-semibold text-zinc-900">New this month</h2>
              <Link
                href="/dashboard/new"
                className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
              >
                View all
              </Link>
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-2">
              {newItems && newItems.length ? (
                newItems.map((item, i) => (
                  <Link
                    key={item.id}
                    href={`/dashboard/library?q=${encodeURIComponent(item.title)}`}
                    className="group rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 transition-all hover:border-indigo-200 hover:bg-indigo-50/50"
                  >
                    <p className="text-sm font-semibold text-zinc-900 group-hover:text-indigo-700">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">{item.category}</p>
                    {item.description ? (
                      <p className="mt-2 text-sm text-zinc-600 line-clamp-2">
                        {item.description}
                      </p>
                    ) : null}
                  </Link>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-6 text-sm text-zinc-500 sm:col-span-2">
                  No releases have been marked as "New This Month" yet.
                </div>
              )}
            </div>
          </GlassCard>
        </Reveal>

        {/* Quick Actions */}
        <Reveal delay={500}>
          <GlassCard padding="none" className="overflow-hidden">
            <div className="border-b border-zinc-100 p-5">
              <h2 className="text-base font-semibold text-zinc-900">Quick actions</h2>
            </div>

            <div className="flex flex-col gap-2 p-5">
              <Link
                href="/dashboard/library"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                Browse Library
              </Link>
              <Link
                href="/dashboard/starter-packs"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white/80 px-4 text-sm font-semibold text-zinc-700 backdrop-blur-sm transition-all hover:bg-white hover:border-zinc-300"
              >
                Download Starter Pack
              </Link>
              <Link
                href="/dashboard/training"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white/80 px-4 text-sm font-semibold text-zinc-700 backdrop-blur-sm transition-all hover:bg-white hover:border-zinc-300"
              >
                Watch Training
              </Link>
            </div>

            <div className="border-t border-zinc-100 p-5">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs text-indigo-700">
                <p className="font-semibold">Fair-use policy</p>
                <p className="mt-1 text-indigo-600">
                  We enforce daily download limits to discourage dumping. Download what you need, when you need it.
                </p>
              </div>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </div>
  );
}
