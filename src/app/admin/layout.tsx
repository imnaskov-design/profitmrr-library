import Link from "next/link";
import { redirect } from "next/navigation";

import { getAdminContext } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const navItems: Array<{ href: string; label: string; icon: React.ReactNode }> = [
  { 
    href: "/admin/overview", 
    label: "Overview",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )
  },
  { 
    href: "/admin/users", 
    label: "Users (CRM)",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  },
  { 
    href: "/admin/subscriptions", 
    label: "Subscriptions",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    )
  },
  { 
    href: "/admin/library", 
    label: "Library Manager",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
  { 
    href: "/admin/releases", 
    label: "Releases",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  { 
    href: "/admin/requests", 
    label: "Requests & Moderation",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  { 
    href: "/admin/email-campaigns", 
    label: "Email Campaigns",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
  { 
    href: "/admin/support", 
    label: "Support Tickets",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  },
  { 
    href: "/admin/settings", 
    label: "Settings",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin } = await getAdminContext();

  if (!user) {
    redirect("/login?next=/admin");
  }

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50">
      <div className="mx-auto flex">
        <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-white/40 bg-white/80 backdrop-blur-xl md:flex">
          <div className="px-6 py-5">
            <Link href="/admin/overview" className="flex items-center gap-2 text-lg font-bold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                ProfitMRR
              </span>
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Admin</span>
            </Link>
            <p className="mt-1 text-xs text-zinc-500">CRM + library management</p>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 pb-6">
            <ul className="space-y-1">
              {navItems.map((item) => (
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

            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/dashboard"
                className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white/80 px-3 text-xs font-semibold text-zinc-700 backdrop-blur-sm transition-all hover:bg-white hover:border-zinc-300"
              >
                Member dashboard
              </Link>
              <Link
                href="/logout"
                className="inline-flex h-9 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-3 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40"
              >
                Log out
              </Link>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:max-w-none md:px-6">
              <div className="flex items-center gap-3">
                <Link href="/admin/overview" className="text-sm font-semibold md:hidden">
                  ProfitMRR Admin
                </Link>
                <span className="hidden text-xs text-zinc-400 md:inline">
                  Secure admin panel (role-gated)
                </span>
              </div>
              <div className="flex items-center gap-2 md:hidden">
                <Link
                  href="/dashboard"
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white/80 px-3 text-xs font-semibold text-zinc-700 backdrop-blur-sm transition-all hover:bg-white"
                >
                  Dashboard
                </Link>
                <Link
                  href="/logout"
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-3 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40"
                >
                  Log out
                </Link>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-5xl px-4 py-8 md:max-w-none md:px-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
