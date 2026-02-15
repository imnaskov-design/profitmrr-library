import Link from "next/link";
import { redirect } from "next/navigation";

import type { SubscriptionStatus } from "@/lib/subscription";
import {
  getSubscriptionSummary,
  normalizeSubscriptionStatus,
} from "@/lib/subscription";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Reveal } from "@/components/ui/StaggerReveal";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const navItems: Array<{ href: string; label: string; icon: React.ReactNode }> = [
  { 
    href: "/dashboard", 
    label: "Home",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  { 
    href: "/dashboard/library", 
    label: "Full Library",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  { 
    href: "/dashboard/new", 
    label: "New This Month",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  { 
    href: "/dashboard/starter-packs", 
    label: "Starter Packs",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
  { 
    href: "/dashboard/training", 
    label: "Training Hub",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    )
  },
  { 
    href: "/dashboard/downloads", 
    label: "My Downloads",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    )
  },
  { 
    href: "/dashboard/requests", 
    label: "Requests & Voting",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  { 
    href: "/dashboard/community", 
    label: "Community",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  { 
    href: "/dashboard/account", 
    label: "Account & Billing",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  { 
    href: "/dashboard/support", 
    label: "Support",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
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
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50">
      <div className="mx-auto flex">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-white/40 bg-white/80 backdrop-blur-xl md:flex">
          <div className="px-6 py-5">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-lg font-bold tracking-tight"
            >
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                ProfitMRR
              </span>
            </Link>
            <p className="mt-1 text-xs text-zinc-500">Member dashboard</p>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 pb-6">
            <ul className="space-y-1">
              {navItems.map((item, index) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-100/80 hover:text-zinc-900"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 transition-all group-hover:bg-indigo-100 group-hover:text-indigo-600">
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-zinc-200/60 px-6 py-4">
            <p className="text-xs text-zinc-400">Signed in as</p>
            <p className="mt-1 truncate text-sm font-medium text-zinc-700">
              {user.email ?? "(no email)"}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <Link
                href="/logout"
                className="inline-flex h-9 flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-3 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                Log out
              </Link>

              {profile?.role === "admin" ? (
                <Link
                  href="/admin"
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white/80 px-3 text-xs font-semibold text-zinc-700 backdrop-blur-sm transition-all hover:bg-white hover:border-zinc-300"
                >
                  Admin
                </Link>
              ) : null}
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 md:max-w-none md:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold tracking-tight text-zinc-900 md:hidden"
                >
                  ProfitMRR
                </Link>
                <StatusPill status={status} />
                <p className="hidden text-sm text-zinc-500 md:block">
                  {summary.detail ?? ""}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {!summary.hasAccess ? (
                  <Link
                    href="/"
                    className="inline-flex h-9 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-3 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40"
                  >
                    Renew access
                  </Link>
                ) : null}

                <Link
                  href="/logout"
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white/80 px-3 text-xs font-semibold text-zinc-700 backdrop-blur-sm transition-all hover:bg-white md:hidden"
                >
                  Log out
                </Link>
              </div>
            </div>

            {!summary.hasAccess ? (
              <div className="border-t border-amber-100/50 bg-amber-50/80 backdrop-blur-sm">
                <div className="mx-auto max-w-5xl px-4 py-3 text-xs text-amber-800 md:max-w-none md:px-6">
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
      className: "border-emerald-200/50 bg-emerald-50/80 text-emerald-700",
    },
    cancelled: {
      label: "Cancelled",
      className: "border-amber-200/50 bg-amber-50/80 text-amber-700",
    },
    expired: {
      label: "Expired",
      className: "border-red-200/50 bg-red-50/80 text-red-700",
    },
    inactive: {
      label: "Inactive",
      className: "border-zinc-200/50 bg-zinc-50/80 text-zinc-600",
    },
  };

  const { label, className } = cfg[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur-sm ${className}`}
    >
      {label}
    </span>
  );
}
