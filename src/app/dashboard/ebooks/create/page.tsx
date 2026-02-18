import Link from "next/link";

export default function CreateEbooksPage() {
  return (
    <div className="relative">
      <header className="mb-12">
        <div className="mb-2 flex items-center gap-3">
          <h2 className="text-4xl font-[900] tracking-tight text-white">Create E-Books</h2>
          <span className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
            <span className="material-symbols-outlined text-xs">bolt</span>
            AI Powered
          </span>
        </div>
        <p className="font-medium text-white/40">
          Configure your AI engine to draft professional publications in seconds.
        </p>
      </header>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-7">
          <div className="relative overflow-hidden rounded-3xl border border-white/5 p-8 glass-card lg:p-10">
            <div className="absolute -right-20 -top-20 size-64 rounded-full bg-primary/5 blur-3xl"></div>
            <div className="relative z-10 space-y-8">
              <div>
                <h3 className="mb-6 text-2xl font-[900] text-white">Create New Ebook</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/40">
                      <span className="material-symbols-outlined text-sm text-primary">target</span>
                      Niche
                    </label>
                    <select className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary">
                      <option>Select Niche</option>
                      <option>Digital Marketing</option>
                      <option>Wealth Creation</option>
                      <option>Personal Branding</option>
                      <option>SaaS & Tech</option>
                      <option>Health & Fitness</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/40">
                      <span className="material-symbols-outlined text-sm text-primary">category</span>
                      Category
                    </label>
                    <select className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary">
                      <option>How-to Guide</option>
                      <option>Case Study</option>
                      <option>Checklist/Workbook</option>
                      <option>Manifesto</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-white/40">Tone & Voice</label>
                <div className="flex flex-wrap gap-3">
                  <button className="rounded-lg border border-primary bg-primary px-4 py-2 text-xs font-bold text-background-dark">Professional</button>
                  <button className="rounded-lg border border-white/5 bg-white/5 px-4 py-2 text-xs font-bold text-white/70 transition-all hover:border-primary/50">Bold</button>
                  <button className="rounded-lg border border-white/5 bg-white/5 px-4 py-2 text-xs font-bold text-white/70 transition-all hover:border-primary/50">Luxury</button>
                  <button className="rounded-lg border border-white/5 bg-white/5 px-4 py-2 text-xs font-bold text-white/70 transition-all hover:border-primary/50">Witty</button>
                  <button className="rounded-lg border border-white/5 bg-white/5 px-4 py-2 text-xs font-bold text-white/70 transition-all hover:border-primary/50">Academic</button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-widest text-white/40">Page Range</label>
                    <span className="text-xs font-black text-primary">25 — 50 pages</span>
                  </div>
                  <input type="range" min={10} max={100} defaultValue={40} className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-primary" />
                  <div className="flex justify-between text-[10px] font-bold uppercase text-white/20">
                    <span>Short</span>
                    <span>Medium</span>
                    <span>Long</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-white/40">Language</label>
                  <select className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary">
                    <option>English (US)</option>
                    <option>English (UK)</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <span className="material-symbols-outlined">auto_awesome_motion</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Uniqueness Mode</h4>
                    <p className="text-[11px] text-white/40">
                      AI will perform deep-web research for unique insights.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" defaultChecked className="peer sr-only" />
                  <div className="h-6 w-11 rounded-full bg-white/10 peer-checked:bg-primary after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              <Link
                href="/dashboard/ebooks/success"
                className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-5 text-lg font-black uppercase tracking-wider text-background-dark transition-all hover:bg-primary/90 gold-glow"
              >
                <span className="material-symbols-outlined text-2xl font-black">bolt</span>
                Generate Ebook
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-8 lg:col-span-5">
          <div className="rounded-3xl border border-white/5 p-8 glass-card">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="text-xl font-[900] text-white">Generation Status</h3>
              <span className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                <span className="size-1.5 animate-pulse rounded-full bg-primary"></span>
                Processing...
              </span>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary">
                    <span className="material-symbols-outlined text-lg font-bold text-background-dark">check</span>
                  </div>
                  <div className="h-12 w-[2px] bg-primary/30"></div>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Prompt validated</p>
                  <p className="text-xs text-white/40">Niche, tone, and language accepted.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <span className="material-symbols-outlined text-lg">sync</span>
                  </div>
                  <div className="h-12 w-[2px] bg-white/10"></div>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Drafting chapters</p>
                  <p className="text-xs text-white/40">Building core sections and examples.</p>
                </div>
              </div>

              <div className="flex gap-4 opacity-60">
                <div className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white/40">
                  <span className="material-symbols-outlined text-lg">auto_stories</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Formatting output</p>
                  <p className="text-xs text-white/40">Preparing DOCX and PDF exports.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 p-8 glass-card">
            <h4 className="mb-4 text-lg font-black text-white">Estimated Delivery</h4>
            <p className="text-sm text-white/50">
              Typical generation completes within <span className="font-bold text-primary">45-90 seconds</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

