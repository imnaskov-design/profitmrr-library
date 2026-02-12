import Link from "next/link";

import {
  getSubscriptionSummary,
  normalizeSubscriptionStatus,
} from "@/lib/subscription";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Welcome back
        </h1>
        <p className="text-sm text-zinc-600">
          Signed in as{" "}
          <span className="font-medium text-zinc-900">
            {user?.email ?? "(no email)"}
          </span>
        </p>
        <p className="text-sm text-zinc-600">
          Subscription: <span className="font-semibold text-zinc-900">{summary.title}</span>
          {summary.detail ? <span className="text-zinc-500"> — {summary.detail}</span> : null}
        </p>
      </div>

      {!summary.hasAccess ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-900">
            Your subscription is not active.
          </p>
          <p className="mt-1 text-sm text-amber-800">
            Downloads and member content are locked until your subscription is active.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
            >
              Reactivate membership
            </Link>
            <Link
              href="/dashboard/account"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-amber-200 bg-white px-4 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
            >
              Account & Billing
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total products" value={totalProducts ?? 0} />
        <StatCard label="New this month" value={newThisMonth ?? 0} />
        <StatCard label="Your downloads" value={yourDownloads ?? 0} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-zinc-900">New this month</h2>
            <Link
              href="/dashboard/new"
              className="text-xs font-medium text-zinc-700 underline hover:text-zinc-900"
            >
              View all
            </Link>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {newItems && newItems.length ? (
              newItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-zinc-200 bg-white p-4"
                >
                  <p className="text-sm font-semibold text-zinc-900">{item.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">{item.category}</p>
                  {item.description ? (
                    <p className="mt-2 text-sm text-zinc-600">{item.description}</p>
                  ) : null}
                  <div className="mt-3">
                    <Link
                      href={`/dashboard/library?q=${encodeURIComponent(item.title)}`}
                      className="text-xs font-semibold text-zinc-900 underline"
                    >
                      Find in library
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-600 sm:col-span-2">
                No releases have been marked as “New This Month” yet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Quick actions</h2>

          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/dashboard/library"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
            >
              Browse Library
            </Link>
            <Link
              href="/dashboard/starter-packs"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
            >
              Download Starter Pack
            </Link>
            <Link
              href="/dashboard/training"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
            >
              Watch Training
            </Link>
          </div>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-600">
            <p className="font-semibold text-zinc-900">Fair-use</p>
            <p className="mt-1">
              We enforce daily download limits to discourage dumping. Download what you need, when you need it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
