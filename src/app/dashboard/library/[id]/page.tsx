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

export default async function ProductPreviewPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const title = titleFromId(id) || "Mastering MRR: The Ultimate 2024 Digital Guide";

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/40">Product Preview</p>
          <h1 className="text-4xl font-black tracking-tight text-white">{title}</h1>
        </div>
        <Link
          href="/dashboard/library"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to library
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <div className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-card-dark p-8 modal-glow">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
              <div className="absolute inset-0 rounded-full bg-primary/5 blur-3xl"></div>
              <img
                alt="Mastering MRR Mockup"
                className="relative z-10 h-full w-full rounded-xl object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.5)]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCtgDHdOCsyExioLNqxkEIA34AIcoeY8lU5_51Jevo3lKsQyBfe5Jn_7RzGc-SstwSLZ4hxhol4_AEhjzj8Dmjq0QGIc9aGVuVt_h_tGiQQetlR9lT2w-2ukQs2e5HlD0wwNXGVkcX66zBGVEiYlcwx2Ug960wgNaQsDvAMmCuC0_ZZieydC6R_ToXdk8mvzSHhcxXe8R6GHf5cc4RNlnrG8eUX3jCP9NlspIrb80VWjsolJ7-Gffkz7TANIsoKjbMfDY1ayYmOQ"
              />
            </div>

            <div className="mt-6 flex items-center justify-center gap-3 overflow-x-auto pb-1">
              {[
                "https://lh3.googleusercontent.com/aida-public/AB6AXuDCtgDHdOCsyExioLNqxkEIA34AIcoeY8lU5_51Jevo3lKsQyBfe5Jn_7RzGc-SstwSLZ4hxhol4_AEhjzj8Dmjq0QGIc9aGVuVt_h_tGiQQetlR9lT2w-2ukQs2e5HlD0wwNXGVkcX66zBGVEiYlcwx2Ug960wgNaQsDvAMmCuC0_ZZieydC6R_ToXdk8mvzSHhcxXe8R6GHf5cc4RNlnrG8eUX3jCP9NlspIrb80VWjsolJ7-Gffkz7TANIsoKjbMfDY1ayYmOQ",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAVm3HXPJzby3rig4g5a86ylTTXLVRBKHSXWBZlnaBPUE5H_Xfla--9UV5m2DNZK9RJnSWNtxsulhCABWSwHQ3YBr5Mg7IvlWvyWzu_vHnFFcR8KSBDqhJtYXdfG4FVTB0U7xiQsdaJQ6i92mgKMtokGiyiovdo1DEPXOO-8noDUTmZ6ayHzPfPcAe4fPULGbdLHoBKjpjKAuycZe_f6-LoKx3jts8Fg2nmbI1jNnXvWlpah3rG9h57g05oaUJwRozC_NyVFmK4_w",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAP8_2EJBAhvuUsQikf_kA_VzQoB_xFKm4vCmQ85EDBuqtDCAPEPvklkLzZow0TlrVqy6gC-XWayxqidWKqFprgzh2AdNy0Fb9j_L6A0YOlM2ON3boNPrWqQ1cRR0EFsfXBJ0BYlXpmICZfidpnRHIRSAVBnfvT-mjF6LiTNGTHKyXdwOZRkQmkPmHQbA_ZoG8jpmiccpayj9laUXcEiCK5dYnEXcIc7DFmci02t0P23BV3y_FHf0ZQrLQI9dTUuqI5lMgTTkGp8g",
              ].map((thumb, index) => (
                <button
                  key={thumb}
                  className={`size-16 shrink-0 rounded-lg border p-1 transition-colors ${
                    index === 0 ? "border-primary bg-white/5" : "border-white/10 bg-white/5 hover:border-primary/50"
                  }`}
                >
                  <img alt={`Thumbnail ${index + 1}`} className="h-full w-full rounded object-cover" src={thumb} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-6">
          <div className="rounded-3xl border border-white/5 p-8 glass-card">
            <div className="mb-4 flex gap-2">
              <span className="rounded-md bg-primary px-3 py-1 text-[10px] font-black tracking-wider text-background-dark">
                MRR INCLUDED
              </span>
              <span className="flex items-center gap-1 rounded-md border border-green-500/20 bg-green-500/10 px-3 py-1 text-[10px] font-black tracking-wider text-green-400">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                ETSY PROVEN
              </span>
            </div>

            <h2 className="text-3xl font-extrabold leading-tight text-white md:text-4xl">{title}</h2>

            <div className="my-8 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Downloads</p>
                <p className="mt-1 text-xl font-black text-white">12,482</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Avg Profit</p>
                <p className="mt-1 text-xl font-black text-emerald-400">$2,400+</p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-white/60">
              High-converting digital guide with complete chapters, templates, and rights documentation so you can
              list and sell immediately.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-black uppercase tracking-widest text-background-dark transition-all hover:bg-primary/90">
                <span className="material-symbols-outlined text-sm">download</span>
                Download now
              </button>
              <button className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-white/10">
                <span className="material-symbols-outlined text-sm">favorite</span>
                Save to favorites
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 p-8 glass-card">
            <h3 className="mb-4 text-lg font-black text-white">What&apos;s included</h3>
            <ul className="space-y-2 text-sm text-white/65">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-primary">check_circle</span>
                Editable source files
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-primary">check_circle</span>
                Resale rights certificate
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-primary">check_circle</span>
                Product mockups and listing copy
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

