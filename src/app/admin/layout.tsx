import Link from "next/link";
import { redirect } from "next/navigation";

import { getAdminContext } from "@/lib/admin";

const navItems: Array<{ href: string; label: string }> = [
  { href: "/admin/overview", label: "Overview" },
  { href: "/admin/users", label: "Users (CRM)" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/library", label: "Library Manager" },
  { href: "/admin/releases", label: "Releases" },
  { href: "/admin/requests", label: "Requests & Moderation" },
  { href: "/admin/email-campaigns", label: "Email Campaigns" },
  { href: "/admin/support", label: "Support Tickets" },
  { href: "/admin/settings", label: "Settings" },
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
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-zinc-200 bg-white md:flex">
          <div className="px-6 py-5">
            <Link href="/admin/overview" className="text-sm font-semibold tracking-tight">
              ProfitMRR Admin
            </Link>
            <p className="mt-1 text-xs text-zinc-500">CRM + library management</p>
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

            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/dashboard"
                className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-50"
              >
                Member dashboard
              </Link>
              <Link
                href="/logout"
                className="inline-flex h-9 items-center justify-center rounded-xl bg-zinc-900 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800"
              >
                Log out
              </Link>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:max-w-none md:px-6">
              <div className="flex items-center gap-3">
                <Link href="/admin/overview" className="text-sm font-semibold md:hidden">
                  ProfitMRR Admin
                </Link>
                <span className="hidden text-xs text-zinc-500 md:inline">
                  Secure admin panel (role-gated)
                </span>
              </div>
              <div className="flex items-center gap-2 md:hidden">
                <Link
                  href="/dashboard"
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-50"
                >
                  Dashboard
                </Link>
                <Link
                  href="/logout"
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-zinc-900 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800"
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

