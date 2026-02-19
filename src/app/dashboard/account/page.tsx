import Link from "next/link";

import {
  getSubscriptionSummary,
  normalizeSubscriptionStatus,
} from "@/lib/subscription";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AccountBillingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user?.id
    ? await supabase
        .from("profiles")
        .select("status, current_period_end")
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  const summary = getSubscriptionSummary({
    status: normalizeSubscriptionStatus(profile?.status),
    currentPeriodEnd: profile?.current_period_end ?? null,
  });

  return (
    <div className="space-y-8">
      <header className="space-y-2 border-b border-border-dark pb-6">
        <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
          <span>Settings</span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-slate-300">Account & Billing</span>
        </div>
        <h2 className="text-3xl font-black tracking-tight text-white">Account & Billing</h2>

        <div className="mt-6 flex flex-wrap gap-8 border-b border-border-dark">
          <button className="pb-4 text-sm font-bold text-slate-500">Profile</button>
          <button className="relative pb-4 text-sm font-bold text-primary">
            Subscription & Billing
            <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary"></span>
          </button>
          <button className="pb-4 text-sm font-bold text-slate-500">Security</button>
          <button className="pb-4 text-sm font-bold text-slate-500">Notifications</button>
        </div>
      </header>

      <section>
        <div className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-xl p-8 md:flex-row glass-card gold-glow">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="z-10 flex-1">
            <span className="mb-4 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
              Premium Status
            </span>
            <h3 className="mb-2 text-2xl font-bold text-white">{summary.title === "Active" ? "Yearly Professional" : "Starter Access"}</h3>
            <p className="mb-6 max-w-md text-sm leading-relaxed text-slate-400">
              You are currently on the professional reseller tier. Your plan includes unlimited digital listings and priority support.
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">$149</span>
              <span className="font-medium text-slate-500">/ year</span>
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-primary/80">
              <span className="material-symbols-outlined text-sm">event_repeat</span>
              {summary.detail ?? "Next renewal pending"}
            </p>
          </div>

          <div className="z-10 flex w-full shrink-0 flex-col gap-3 md:w-auto">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-bold text-background-dark shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
            >
              <span className="material-symbols-outlined text-sm">rocket_launch</span>
              Upgrade to Lifetime
            </Link>
            <button className="text-xs font-semibold text-slate-500 underline underline-offset-4 transition-colors hover:text-red-400">
              Cancel Subscription
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="rounded-xl p-6 glass-card">
            <div className="mb-6 flex items-center justify-between">
              <h4 className="flex items-center gap-2 font-bold text-white">
                <span className="material-symbols-outlined text-primary">credit_card</span>
                Payment Method
              </h4>
              <button className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit
              </button>
            </div>

            <div className="flex items-center gap-4 rounded-lg border border-border-dark bg-white/5 p-4">
              <div className="flex h-8 w-12 items-center justify-center rounded border border-slate-700 bg-slate-800">
                <span className="text-xs font-black tracking-widest text-white">VISA</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Visa ending in 4242</p>
                <p className="text-xs font-medium text-slate-500">Expiry 12/26 • Default</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl glass-card">
            <div className="flex items-center justify-between border-b border-border-dark p-6">
              <h4 className="font-bold text-white">Billing History</h4>
              <button className="text-xs font-medium text-slate-400 hover:text-white">View All</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border-dark text-[11px] font-black uppercase tracking-widest text-slate-500">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark">
                  {["Oct 12, 2023", "Oct 12, 2022", "Oct 12, 2021"].map((date, idx) => (
                    <tr key={date} className="group transition-colors hover:bg-white/5">
                      <td className="px-6 py-4 text-sm text-slate-300">{date}</td>
                      <td className="px-6 py-4 text-sm font-bold text-white">${idx === 2 ? "99.00" : "149.00"}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter text-green-500">
                          <span className="h-1 w-1 rounded-full bg-green-500"></span>
                          Paid
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 transition-colors group-hover:text-primary">
                          <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl p-6 glass-card">
            <h4 className="mb-6 font-bold text-white">Quick Profile</h4>
            <form className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Full Name</label>
                <input className="w-full rounded-lg border border-border-dark bg-[#121212] text-sm text-white focus:border-primary focus:ring-primary" defaultValue="Alex Sterling" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Email Address</label>
                <input className="w-full rounded-lg border border-border-dark bg-[#121212] text-sm text-white focus:border-primary focus:ring-primary" defaultValue={user?.email ?? "alex@profitmrr.com"} />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Timezone</label>
                <select className="w-full rounded-lg border border-border-dark bg-[#121212] text-sm text-white focus:border-primary focus:ring-primary">
                  <option>Eastern Time (US & Canada)</option>
                  <option>Pacific Time (US & Canada)</option>
                  <option>GMT / UTC</option>
                  <option>Central European Time</option>
                </select>
              </div>
              <button className="mt-2 w-full rounded-lg border border-border-dark bg-white/5 py-3 text-sm font-bold text-white transition-all hover:bg-white/10" type="button">
                Update Profile (coming soon)
              </button>
            </form>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-primary">info</span>
              <div>
                <p className="mb-1 text-xs font-bold text-primary">Billing Tip</p>
                <p className="text-[11px] leading-normal text-slate-400">
                  Switch to a <strong>Lifetime Plan</strong> before your renewal to lock current pricing and avoid future increases.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

