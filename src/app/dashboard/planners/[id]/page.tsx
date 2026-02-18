import Link from "next/link";

type Params = {
  id: string;
};

function titleFromId(id: string) {
  return id
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function PlannerDetailsPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const title = titleFromId(id) || "Planner Details";

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/40">Planners Vault</p>
          <h1 className="text-4xl font-black tracking-tight text-white">{title}</h1>
          <p className="mt-2 text-sm text-white/50">Review planner details, formats, and editability status.</p>
        </div>
        <Link
          href="/dashboard/planners"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to vault
        </Link>
      </header>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="overflow-hidden rounded-3xl border border-white/5 glass-card">
            <div className="relative h-[420px] bg-gradient-to-br from-amber-400 to-orange-500 p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]"></div>
              <span className="relative z-10 inline-flex rounded-lg bg-primary px-3 py-1.5 text-[10px] font-black tracking-wider text-background-dark">
                READY
              </span>
              <div className="absolute bottom-8 left-8 right-8">
                <h2 className="text-3xl font-black leading-tight text-white">{title}</h2>
                <p className="mt-2 text-sm text-white/80">Editable planner pack with print-ready exports.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-3xl border border-white/5 p-8 glass-card">
            <h3 className="mb-6 text-xl font-black text-white">Overview</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Category</p>
                <p className="mt-1 font-bold text-white">Productivity</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Pages</p>
                <p className="mt-1 font-bold text-white">120</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Style</p>
                <p className="mt-1 font-bold text-white">Minimalist</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Created</p>
                <p className="mt-1 font-bold text-white">Jan 28</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 p-8 glass-card">
            <h3 className="mb-6 text-xl font-black text-white">Download formats</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <button className="flex items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-xs font-bold text-white/80 transition-all hover:bg-white/10">
                <span className="material-symbols-outlined text-sm text-primary">picture_as_pdf</span>
                Download PDF
              </button>
              <button className="flex items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-xs font-bold text-white/80 transition-all hover:bg-white/10">
                <span className="material-symbols-outlined text-sm text-primary">edit_note</span>
                Open Canva
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 p-8 glass-card">
            <h3 className="mb-3 text-xl font-black text-white">Notes</h3>
            <p className="text-sm leading-relaxed text-white/60">
              This planner includes reusable section structures and can be rebranded for resale under your
              active rights package.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

