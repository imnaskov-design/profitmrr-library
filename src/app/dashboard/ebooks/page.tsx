import Link from "next/link";

const ebookItems = [
  {
    id: "future-of-ai-design",
    title: "The Future of AI in Design",
    niche: "TECHNOLOGY",
    pages: 42,
    createdAt: "Jan 24",
    gradient: "from-indigo-600 to-purple-800",
  },
  {
    id: "mastering-digital-growth",
    title: "Mastering Digital Growth",
    niche: "MARKETING",
    pages: 15,
    createdAt: "Oct 22",
    gradient: "from-cyan-600 to-blue-800",
  },
  {
    id: "mindful-money-playbook",
    title: "Mindful Money Playbook",
    niche: "FINANCE",
    pages: 33,
    createdAt: "Feb 06",
    gradient: "from-emerald-600 to-teal-700",
  },
];

export default function EbooksVaultPage() {
  return (
    <div className="relative">
      <div className="fixed bottom-10 left-1/2 z-40 -translate-x-1/2 transition-all duration-300">
        <div className="flex items-center gap-8 rounded-3xl border border-primary/30 bg-black/80 px-8 py-5 glass-card gold-border-glow">
          <div className="flex items-center gap-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-black text-primary">
              {ebookItems.length}
            </span>
            <p className="whitespace-nowrap text-sm font-bold text-white">Items selected</p>
          </div>
          <div className="h-6 w-px bg-white/10"></div>
          <div className="flex items-center gap-4">
            <button className="text-xs font-black uppercase tracking-widest text-white/50 transition-colors hover:text-white">
              Deselect All
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-red-600">
              <span className="material-symbols-outlined text-sm">delete</span>
              Delete Selected
            </button>
          </div>
        </div>
      </div>

      <header className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <h1 className="mb-2 text-5xl font-black tracking-tight text-white">Your E-Books Vault</h1>
          <p className="text-lg font-medium text-white/50">
            Manage, preview, and export your AI-generated professional ebooks.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="min-w-[180px] rounded-2xl border border-white/5 px-6 py-4 glass-card">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Total Generated</p>
            <p className="mt-1 text-2xl font-black text-primary">124</p>
          </div>
          <div className="min-w-[180px] rounded-2xl border border-white/5 px-6 py-4 glass-card">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Storage Used</p>
            <p className="mt-1 text-2xl font-black text-primary">1.2 GB</p>
          </div>
        </div>
      </header>

      <div className="mb-10 flex flex-col items-center gap-3 rounded-3xl p-3 glass-card md:flex-row">
        <div className="relative w-full flex-1">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30">search</span>
          <input
            className="w-full rounded-2xl border-none bg-white/5 py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:ring-1 focus:ring-primary/50"
            placeholder="Search by title, niche or keywords..."
            type="text"
          />
        </div>

        <div className="flex w-full items-center gap-3 md:w-auto">
          <select className="min-w-[140px] cursor-pointer rounded-2xl border-none bg-white/5 px-6 py-4 text-sm font-bold text-white focus:ring-1 focus:ring-primary/50">
            <option>Niche: All</option>
            <option>Technology</option>
            <option>Marketing</option>
            <option>Lifestyle</option>
          </select>
          <select className="min-w-[140px] cursor-pointer rounded-2xl border-none bg-white/5 px-6 py-4 text-sm font-bold text-white focus:ring-1 focus:ring-primary/50">
            <option>Tone: Any</option>
            <option>Professional</option>
            <option>Creative</option>
          </select>
          <select className="min-w-[140px] cursor-pointer rounded-2xl border-none bg-white/5 px-6 py-4 text-sm font-bold text-white focus:ring-1 focus:ring-primary/50">
            <option>Status</option>
            <option>Ready</option>
            <option>Processing</option>
          </select>
          <div className="flex shrink-0 items-center rounded-2xl bg-white/5 p-1">
            <button className="flex size-11 items-center justify-center rounded-xl bg-primary text-background-dark shadow-lg">
              <span className="material-symbols-outlined">grid_view</span>
            </button>
            <button className="flex size-11 items-center justify-center rounded-xl text-white/40 transition-colors hover:text-white">
              <span className="material-symbols-outlined">list</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 pb-28 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/dashboard/ebooks/create"
          className="group relative flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-[2rem] border-2 border-dashed border-primary/30 bg-transparent transition-all hover:border-primary/60 hover:bg-primary/5"
        >
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-4xl">add</span>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-white">Create New Ebook</p>
            <p className="mt-1 max-w-[160px] text-xs text-white/40">
              Start your next AI-powered publication in seconds
            </p>
          </div>
        </Link>

        {ebookItems.map((item) => (
          <article
            key={item.id}
            className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/5 transition-all hover:border-primary/30 glass-card"
          >
            <div className="absolute left-6 top-6 z-30">
              <input id={`ebook-check-${item.id}`} type="checkbox" defaultChecked className="peer hidden" />
              <label
                htmlFor={`ebook-check-${item.id}`}
                className="flex size-6 cursor-pointer items-center justify-center rounded-lg border-2 border-white/20 bg-white/10 transition-all hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary"
              >
                <span className="material-symbols-outlined hidden text-sm font-black text-background-dark peer-checked:block">
                  check
                </span>
              </label>
            </div>

            <button className="absolute right-6 top-6 z-30 flex size-8 items-center justify-center rounded-full bg-black/40 text-white/60 opacity-0 transition-all hover:bg-white hover:text-red-500 group-hover:opacity-100">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <div className={`relative flex h-56 flex-col justify-end overflow-hidden bg-gradient-to-br p-8 ${item.gradient}`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]"></div>
              <div className="flex flex-col gap-3">
                <span className="relative z-10 w-fit rounded-lg bg-white/10 px-3 py-1.5 text-[10px] font-black tracking-wider text-white backdrop-blur-md">
                  {item.niche}
                </span>
                <h3 className="relative z-10 text-2xl font-black leading-tight text-white">{item.title}</h3>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs font-bold text-white/40">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">description</span>
                    {item.pages}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    {item.createdAt}
                  </span>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase text-primary">
                  READY
                </span>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-3">
                <a
                  href="#"
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-xs font-bold text-white/80 transition-all hover:bg-white/10"
                >
                  <span className="material-symbols-outlined text-sm text-primary">description</span>
                  DOCX
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-xs font-bold text-white/80 transition-all hover:bg-white/10"
                >
                  <span className="material-symbols-outlined text-sm text-primary">picture_as_pdf</span>
                  PDF
                </a>
              </div>

              <Link
                href={`/dashboard/ebooks/${item.id}`}
                className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-transparent py-3 text-xs font-bold text-white/80 transition-all hover:border-primary/40 hover:text-white"
              >
                <span className="material-symbols-outlined text-sm">visibility</span>
                Details
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

