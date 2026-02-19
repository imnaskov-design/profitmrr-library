"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type DashboardShellProps = {
  userEmail: string;
  isAdmin: boolean;
  children: React.ReactNode;
};

type NavItem = {
  href: string;
  label: string;
  icon: string;
  startsWith?: boolean;
};

const coreNavItems: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/dashboard/library", label: "Full Library", icon: "library_books", startsWith: true },
  { href: "/dashboard/starter-packs", label: "Starter Packs", icon: "package_2", startsWith: true },
  { href: "/dashboard/training", label: "Training Hub", icon: "school", startsWith: true },
  { href: "/dashboard/downloads", label: "My Downloads", icon: "download", startsWith: true },
  { href: "/dashboard/referrals", label: "Referral Program", icon: "share", startsWith: true },
];

const aiNavItems: NavItem[] = [
  { href: "/dashboard/ebooks", label: "Your E-Books Vault", icon: "library_books", startsWith: true },
  { href: "/dashboard/ebooks/create", label: "Create E-Books", icon: "auto_awesome", startsWith: true },
  { href: "/dashboard/planners", label: "Planners Vault", icon: "event_note", startsWith: true },
  { href: "/dashboard/planners/create", label: "Create Planners", icon: "calendar_month", startsWith: true },
];

const accountNavItems: NavItem[] = [
  { href: "/dashboard/account", label: "Billing", icon: "credit_card", startsWith: true },
  { href: "/dashboard/support", label: "Support", icon: "support_agent", startsWith: true },
];

function isActive(pathname: string, item: NavItem) {
  if (!item.startsWith) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(pathname, item);

  return (
    <Link
      href={item.href}
      className={
        active
          ? "group flex items-center gap-4 rounded-xl bg-primary/10 px-4 py-3 text-primary transition-all"
          : "group flex items-center gap-4 rounded-xl px-4 py-3 text-white/50 transition-all hover:bg-white/5 hover:text-white"
      }
    >
      <span
        className={
          active
            ? "material-symbols-outlined text-primary"
            : "material-symbols-outlined text-primary/60 group-hover:text-primary"
        }
      >
        {item.icon}
      </span>
      <span className="text-sm font-bold">{item.label}</span>
    </Link>
  );
}

export function DashboardShell({ userEmail, isAdmin, children }: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-background-dark font-display text-white">
      <aside className="hidden h-full w-72 shrink-0 flex-col border-r border-white/5 bg-sidebar md:flex">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-1.5">
              <span className="material-symbols-outlined font-bold text-background-dark">
                account_balance_wallet
              </span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-white uppercase">
              Profit<span className="text-primary">MRR</span>
            </h1>
          </div>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
            Member Dashboard
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4">
          {coreNavItems.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}

          <div className="pb-2 pt-6">
            <p className="px-4 text-[10px] font-black uppercase tracking-widest text-white/20">
              AI Tools
            </p>
          </div>

          {aiNavItems.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}

          <div className="pb-2 pt-6">
            <p className="px-4 text-[10px] font-black uppercase tracking-widest text-white/20">
              Account
            </p>
          </div>

          {accountNavItems.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}

          {isAdmin ? (
            <NavLink
              item={{ href: "/admin", label: "Admin", icon: "admin_panel_settings", startsWith: true }}
              pathname={pathname}
            />
          ) : null}
        </nav>

        <div className="space-y-4 border-t border-white/5 p-6">
          <div className="px-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Signed in as</p>
            <p className="truncate text-xs font-bold text-white">{userEmail || "(no email)"}</p>
          </div>

          <Link
            href="/logout"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-black text-background-dark transition-all hover:bg-primary/90 gold-glow"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Log out
          </Link>
        </div>
      </aside>

      <main className="relative flex-1 overflow-y-auto bg-background-dark">
        <div className="absolute right-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="mx-auto max-w-7xl p-8 lg:p-12">{children}</div>
      </main>
    </div>
  );
}

