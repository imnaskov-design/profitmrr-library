const statCards = [
  { label: "Total Referrals", value: "124", change: "+12%", icon: "group" },
  { label: "Pending Commissions", value: "$1,240", change: "USD", icon: "pending_actions" },
  { label: "Paid Earnings", value: "$8,492", change: "USD", icon: "account_balance_wallet" },
  { label: "Conversion Rate", value: "4.2%", change: "Avg. 3.1%", icon: "target" },
];

const referrals = [
  {
    initials: "JS",
    name: "Julian Smith",
    email: "jsmith@enterprise.com",
    signUpDate: "May 14, 2024",
    plan: "Yearly Pro",
    earned: "$29.80",
    status: "Active",
    statusClass: "bg-emerald-500/10 text-emerald-400 border-emerald-400/20",
  },
  {
    initials: "MT",
    name: "Marcus Thorne",
    email: "m.thorne@agency.co",
    signUpDate: "May 12, 2024",
    plan: "Lifetime",
    earned: "$199.00",
    status: "Active",
    statusClass: "bg-emerald-500/10 text-emerald-400 border-emerald-400/20",
  },
  {
    initials: "EK",
    name: "Elena Kostas",
    email: "elena.k@digital.org",
    signUpDate: "May 09, 2024",
    plan: "Monthly Pro",
    earned: "$4.50",
    status: "Trialing",
    statusClass: "bg-amber-500/10 text-amber-400 border-amber-400/20",
  },
];

export default function ReferralsPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2 pt-2">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <span>Program</span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-slate-300">Referral Dashboard</span>
        </div>
        <h2 className="text-3xl font-black tracking-tight text-white">Referral Program</h2>
        <p className="text-sm font-medium text-slate-400">
          Invite fellow resellers and earn lifetime commissions.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <article key={stat.label} className="rounded-xl p-6 glass-card">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-lg">{stat.icon}</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-white">{stat.value}</h3>
              <span
                className={
                  stat.change.startsWith("+")
                    ? "text-xs font-bold text-emerald-400"
                    : "text-xs font-bold text-slate-500"
                }
              >
                {stat.change}
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="relative overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-8 gold-glow">
        <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h3 className="mb-2 text-xl font-bold text-white">Share Your Success</h3>
            <p className="mb-6 text-sm leading-relaxed text-slate-400">
              Use your unique link to invite colleagues. You&apos;ll receive
              <span className="px-1 font-bold text-primary">20% commission</span>
              for every payment they make, for life.
            </p>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex flex-1 items-center justify-between rounded-lg border border-border-dark bg-black/40 px-4 py-3">
                <code className="text-sm font-semibold text-primary">profitmrr.com/ref/alexsterling24</code>
                <button className="text-slate-500 transition-colors hover:text-white" type="button">
                  <span className="material-symbols-outlined text-lg">content_copy</span>
                </button>
              </div>
              <button
                className="whitespace-nowrap rounded-lg bg-primary px-6 py-3 font-bold text-background-dark shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                type="button"
              >
                Copy Link
              </button>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 lg:items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Quick Share</span>
            <div className="flex gap-3">
              <button
                className="flex size-10 items-center justify-center rounded-full border border-border-dark bg-white/5 text-slate-400 transition-all hover:border-sky-500/50 hover:text-sky-400"
                type="button"
              >
                <span className="text-xs font-black">X</span>
              </button>
              <button
                className="flex size-10 items-center justify-center rounded-full border border-border-dark bg-white/5 text-slate-400 transition-all hover:border-blue-600/50 hover:text-blue-500"
                type="button"
              >
                <span className="text-xs font-black">in</span>
              </button>
              <button
                className="flex size-10 items-center justify-center rounded-full border border-border-dark bg-white/5 text-slate-400 transition-all hover:border-blue-500/50 hover:text-blue-400"
                type="button"
              >
                <span className="text-xs font-black">f</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <article className="rounded-xl p-6 glass-card xl:col-span-2">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h4 className="text-lg font-bold text-white">Earnings Growth</h4>
              <p className="text-xs text-slate-500">Commissions earned over the last 6 months</p>
            </div>
            <div className="rounded border border-border-dark bg-white/5 px-3 py-1 text-[10px] font-bold text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-primary"></span>
                EARNINGS
              </span>
            </div>
          </div>

          <div className="relative h-64 w-full">
            <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 40">
              <defs>
                <linearGradient id="earnings-grad" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,193,7,0.2)" />
                  <stop offset="100%" stopColor="rgba(255,193,7,0)" />
                </linearGradient>
              </defs>
              <path d="M0,35 Q10,32 20,25 T40,15 T60,20 T80,8 T100,5 V40 H0 Z" fill="url(#earnings-grad)" />
              <path
                d="M0,35 Q10,32 20,25 T40,15 T60,20 T80,8 T100,5"
                fill="none"
                stroke="#FFC107"
                strokeWidth="0.6"
              />
            </svg>
            <div className="absolute bottom-0 left-0 flex w-full justify-between px-1 pt-4 text-[10px] font-bold text-slate-500">
              <span>MAY</span>
              <span>JUN</span>
              <span>JUL</span>
              <span>AUG</span>
              <span>SEP</span>
              <span>OCT</span>
            </div>
          </div>
        </article>

        <div className="space-y-6">
          <article className="rounded-xl p-6 glass-card">
            <h4 className="mb-6 font-bold text-white">Program Tiers</h4>
            <div className="space-y-4">
              <div className="rounded-lg border border-border-dark bg-white/5 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Basic Reseller</span>
                  <span className="rounded bg-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-300">10%</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full w-full bg-slate-600" />
                </div>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/10 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">Pro Reseller</span>
                  <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-bold text-background-dark">20%</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-primary/20">
                  <div className="h-full w-[65%] bg-primary" />
                </div>
                <p className="mt-2 text-[10px] font-medium text-primary/70">8 more referrals to reach Elite level</p>
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-primary">rocket</span>
              <div>
                <p className="mb-1 text-xs font-bold text-primary">Growth Perk</p>
                <p className="text-[11px] leading-normal text-slate-400">
                  Reach 200 referrals to unlock <strong>Direct Payouts</strong> to your local bank account.
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-white/5 bg-[#171717]">
        <header className="flex flex-col gap-4 border-b border-border-dark p-6 xl:flex-row xl:items-center xl:justify-between">
          <h4 className="font-bold text-white">Recent Referrals</h4>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                search
              </span>
              <input
                className="h-8 w-56 rounded-lg border border-border-dark bg-black/20 pl-9 pr-4 text-xs text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Search referrals..."
                type="text"
              />
            </div>
            <button className="text-xs font-medium text-slate-400 transition-colors hover:text-white" type="button">
              Export CSV
            </button>
          </div>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-dark bg-white/[0.02] text-[11px] uppercase tracking-widest text-slate-500">
                <th className="px-6 py-4 font-black">User</th>
                <th className="px-6 py-4 font-black">Sign-up Date</th>
                <th className="px-6 py-4 font-black">Plan Type</th>
                <th className="px-6 py-4 font-black">Total Earned</th>
                <th className="px-6 py-4 text-right font-black">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {referrals.map((referral) => (
                <tr key={referral.email} className="transition-colors hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded bg-gradient-to-br from-slate-700 to-slate-800 text-[10px] font-bold uppercase text-white">
                        {referral.initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{referral.name}</p>
                        <p className="text-[10px] text-slate-500">{referral.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-300">{referral.signUpDate}</td>
                  <td className="px-6 py-4">
                    <span className="rounded border border-border-dark bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-300">
                      {referral.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-primary">{referral.earned}</td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight ${referral.statusClass}`}
                    >
                      {referral.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

