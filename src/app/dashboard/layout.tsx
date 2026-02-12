import Link from "next/link";
import { redirect } from "next/navigation";

import type { SubscriptionStatus } from "@/lib/subscription";
import {
  getSubscriptionSummary,
  normalizeSubscriptionStatus,
} from "@/lib/subscription";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const navItems: Array<{ href: string; label: string }> = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/library", label: "Full Library" },
  { href: "/dashboard/new", label: "New This Month" },
  { href: "/dashboard/starter-packs", label: "Starter Packs" },
  { href: "/dashboard/training", label: "Training Hub" },
  { href: "/dashboard/downloads", label: "My Downloads" },
  { href: "/dashboard/requests", label: "Requests & Voting" },
  { href: "/dashboard/community", label: "Community" },
  { href: "/dashboard/account", label: "Account & Billing" },
  { href: "/dashboard/support", label: "Support" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  const status = normalizeSubscriptionStatus(profile?.status);
  const summary = getSubscriptionSummary({
    status,
    currentPeriodEnd: profile?.current_period_end ?? null,
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-zinc-200 bg-white md:flex">
          <div className="px-6 py-5">
            <Link
              href="/dashboard"
              className="text-sm font-semibold tracking-tight text-zinc-900"
            >
              ProfitMRR Library
            </Link>
            <p className="mt-1 text-xs text-zinc-500">Member dashboard</p>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 pb-6">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-zinc-200 px-6 py-4">
            <p className="text-xs text-zinc-500">Signed in as</p>
            <p className="mt-1 truncate text-sm font-medium text-zinc-900">
              {user.email ?? "(no email)"}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <Link
                href="/logout"
                className="inline-flex h-9 items-center justify-center rounded-xl bg-zinc-900 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800"
              >
                Log out
              </Link>

              {profile?.role === "admin" ? (
                <Link
                  href="/admin"
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-50"
                >
                  Admin
                </Link>
              ) : null}
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 md:max-w-none md:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold tracking-tight text-zinc-900 md:hidden"
                >
                  ProfitMRR
                </Link>
                <StatusPill status={status} />
                <p className="hidden text-sm text-zinc-600 md:block">
                  {summary.detail ?? ""}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {!summary.hasAccess ? (
                  <Link
                    href="/"
                    className="inline-flex h-9 items-center justify-center rounded-xl bg-zinc-900 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800"
                  >
                    Renew access
                  </Link>
                ) : null}

                <Link
                  href="/logout"
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-50 md:hidden"
                >
                  Log out
                </Link>
              </div>
            </div>

            {!summary.hasAccess ? (
              <div className="border-t border-zinc-100 bg-amber-50">
                <div className="mx-auto max-w-5xl px-4 py-3 text-xs text-amber-900 md:max-w-none md:px-6">
                  <span className="font-semibold">Access is inactive.</span> Downloads and member content
                  are locked until your subscription is active.
                </div>
              </div>
            ) : null}
          </header>

          <main className="mx-auto w-full max-w-5xl px-4 py-8 md:max-w-none md:px-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: SubscriptionStatus }) {
  const cfg: Record<SubscriptionStatus, { label: string; className: string }> = {
    active: {
      label: "Active",
      className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    },
    cancelled: {
      label: "Cancelled",
      className: "border-amber-200 bg-amber-50 text-amber-800",
    },
    expired: {
      label: "Expired",
      className: "border-red-200 bg-red-50 text-red-700",
    },
    inactive: {
      label: "Inactive",
      className: "border-zinc-200 bg-white text-zinc-700",
    },
  };

  const { label, className } = cfg[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}
