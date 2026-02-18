import Link from "next/link";

export default function PlannerSuccessPage() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-3xl rounded-3xl border border-white/5 p-10 text-center glass-card md:p-14">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-primary/15 text-primary">
          <span className="material-symbols-outlined text-5xl">task_alt</span>
        </div>

        <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">Planner generated</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/50">
          Your new planner is now available in your vault with PDF and editable template outputs.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard/planners"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-7 text-xs font-black uppercase tracking-widest text-background-dark transition-all hover:bg-primary/90"
          >
            Go to vault
          </Link>
          <Link
            href="/dashboard/planners/create"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-7 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-white/10"
          >
            Generate another
          </Link>
        </div>
      </div>
    </div>
  );
}

