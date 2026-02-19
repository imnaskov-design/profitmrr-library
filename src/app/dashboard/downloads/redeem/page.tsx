import Link from "next/link";

export default function RedeemProductPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 py-6">
      <header>
        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/40">My Downloads</p>
        <h1 className="text-4xl font-black tracking-tight text-white">Redeem product</h1>
        <p className="mt-2 text-sm text-white/50">
          Enter your product or redemption code to add purchased assets to your account.
        </p>
      </header>

      <div className="rounded-3xl border border-white/5 p-8 glass-card">
        <form className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-white/40" htmlFor="redeem-code">
              Redemption code
            </label>
            <input
              id="redeem-code"
              type="text"
              placeholder="PMRR-XXXX-XXXX"
              className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-white/30 focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-white/40" htmlFor="redeem-email">
              Purchase email
            </label>
            <input
              id="redeem-email"
              type="email"
              placeholder="you@example.com"
              className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-white/30 focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-7 text-xs font-black uppercase tracking-widest text-background-dark transition-all hover:bg-primary/90"
            >
              Redeem now
            </button>

            <Link
              href="/dashboard/downloads"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-7 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-white/10"
            >
              Back to downloads
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

