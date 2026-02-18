import Link from "next/link";

const plannerItems = [
  {
    id: "wellness-journal",
    title: "2024 Ultimate Wellness Journal",
    category: "Health & Fitness",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    id: "minimal-goal-setter",
    title: "Minimalist Goal Setter",
    category: "Productivity",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    id: "garden-home-organizer",
    title: "Garden & Home Organizer",
    category: "Lifestyle",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    id: "digital-finance-hub",
    title: "Digital Finance Hub",
    category: "Finance",
    gradient: "from-rose-500 to-pink-500",
  },
];

export default function PlannersVaultPage() {
  return (
    <div className="space-y-8">
      <header className="sticky top-0 z-30 flex items-center justify-between border-x-0 border-t-0 px-0 py-2">
        <div>
          <h2 className="text-3xl font-[900] tracking-tight text-white">Your Planners Vault</h2>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/40">
            Manage your digital planner assets
          </p>
        </div>
        <Link
          href="/dashboard/planners/create"
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black text-background-dark transition-all hover:scale-105 gold-glow"
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          NEW PLANNER
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="flex items-center gap-6 rounded-3xl p-6 glass-card">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <span className="material-symbols-outlined text-3xl text-primary">collections_bookmark</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Planners</p>
            <p className="text-3xl font-black text-white">128</p>
          </div>
        </div>

        <div className="flex items-center gap-6 rounded-3xl p-6 glass-card">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <span className="material-symbols-outlined text-3xl text-primary">trending_up</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Most Popular Niche</p>
            <p className="text-2xl font-black text-white">Wellness & Yoga</p>
          </div>
        </div>

        <div className="flex items-center gap-6 rounded-3xl p-6 glass-card md:col-span-2 lg:col-span-1">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <span className="material-symbols-outlined text-3xl text-primary">download</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Downloads</p>
            <p className="text-3xl font-black text-white">4,290</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-2xl p-4 glass-card">
        <div className="relative min-w-[300px] flex-1">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30">search</span>
          <input
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white focus:border-primary/50 focus:ring-0"
            placeholder="Search your vault..."
            type="text"
          />
        </div>

        <select className="min-w-[160px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-primary/50 focus:ring-0">
          <option>Planner Type</option>
          <option>Daily Planner</option>
          <option>Weekly Planner</option>
          <option>Fitness Tracker</option>
          <option>Finance Journal</option>
        </select>

        <select className="min-w-[160px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-primary/50 focus:ring-0">
          <option>Style</option>
          <option>Minimal</option>
          <option>Aesthetic</option>
          <option>Boho</option>
          <option>Professional</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 pb-24 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Link
          href="/dashboard/planners/create"
          className="group flex min-h-[310px] flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-primary/30 transition-all hover:border-primary/60 hover:bg-primary/5"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-3xl">add</span>
          </div>
          <div className="text-center">
            <p className="font-black text-white">Create Planner</p>
            <p className="mt-1 text-xs text-white/40">Launch your next planner product</p>
          </div>
        </Link>

        {plannerItems.map((item) => (
          <article
            key={item.id}
            className="group flex flex-col overflow-hidden rounded-3xl border border-white/5 transition-all hover:border-primary/30 glass-card"
          >
            <div className={`relative h-48 bg-gradient-to-br p-6 ${item.gradient}`}>
              <input
                type="checkbox"
                className="absolute left-4 top-4 size-5 cursor-pointer rounded border-white/30 bg-black/20 text-primary"
                defaultChecked
              />
              <button className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-lg bg-black/20 text-white transition-all hover:bg-black/40">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>

              <div className="absolute bottom-6 left-6 right-6">
                <div className="mb-2 w-fit rounded bg-primary px-2 py-1 text-[10px] font-black text-background-dark">
                  READY
                </div>
                <h3 className="text-xl font-black leading-tight text-white">{item.title}</h3>
                <p className="text-xs font-bold text-white/80">{item.category}</p>
              </div>
            </div>

            <div className="flex gap-2 p-4">
              <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold transition-all hover:bg-white/10">
                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                PDF
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold transition-all hover:bg-white/10">
                <span className="material-symbols-outlined text-sm">edit_note</span>
                CANVA
              </button>
            </div>

            <Link
              href={`/dashboard/planners/${item.id}`}
              className="mx-4 mb-4 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-transparent py-2.5 text-xs font-bold text-white/80 transition-all hover:border-primary/50 hover:text-white"
            >
              <span className="material-symbols-outlined text-sm">visibility</span>
              Details
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

