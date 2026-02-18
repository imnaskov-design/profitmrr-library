import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const mainNavItems: Array<{
  href: string;
  label: string;
  icon: string;
  isActive?: boolean;
}> = [
  { href: "/dashboard", label: "Home", icon: "home", isActive: true },
  { href: "/dashboard/library", label: "Full Library", icon: "library_books" },
  { href: "/dashboard/new", label: "New This Month", icon: "new_releases" },
  { href: "/dashboard/starter-packs", label: "Starter Packs", icon: "package_2" },
  { href: "/dashboard/training", label: "Training Hub", icon: "school" },
  { href: "/dashboard/downloads", label: "My Downloads", icon: "download" },
];

const accountNavItems: Array<{ href: string; label: string; icon: string }> = [
  { href: "/dashboard/account", label: "Billing", icon: "credit_card" },
  { href: "/dashboard/support", label: "Support", icon: "support_agent" },
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

  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle();

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
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                item.isActive
                  ? "group flex items-center gap-4 rounded-xl bg-primary/10 px-4 py-3 text-primary transition-all"
                  : "group flex items-center gap-4 rounded-xl px-4 py-3 text-white/50 transition-all hover:bg-white/5 hover:text-white"
              }
            >
              <span
                className={
                  item.isActive
                    ? "material-symbols-outlined text-primary"
                    : "material-symbols-outlined text-primary/60 group-hover:text-primary"
                }
              >
                {item.icon}
              </span>
              <span className="text-sm font-bold">{item.label}</span>
            </Link>
          ))}

          <div className="pb-2 pt-6">
            <p className="px-4 text-[10px] font-black uppercase tracking-widest text-white/20">Account</p>
          </div>

          {accountNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-4 rounded-xl px-4 py-3 text-white/50 transition-all hover:bg-white/5 hover:text-white"
            >
              <span className="material-symbols-outlined text-primary/60 group-hover:text-primary">
                {item.icon}
              </span>
              <span className="text-sm font-bold">{item.label}</span>
            </Link>
          ))}

          {profile?.role === "admin" ? (
            <Link
              href="/admin"
              className="group flex items-center gap-4 rounded-xl px-4 py-3 text-white/50 transition-all hover:bg-white/5 hover:text-white"
            >
              <span className="material-symbols-outlined text-primary/60 group-hover:text-primary">
                admin_panel_settings
              </span>
              <span className="text-sm font-bold">Admin</span>
            </Link>
          ) : null}
        </nav>

        <div className="space-y-4 border-t border-white/5 p-6">
          <div className="px-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Signed in as</p>
            <p className="truncate text-xs font-bold text-white">{user.email ?? "(no email)"}</p>
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
