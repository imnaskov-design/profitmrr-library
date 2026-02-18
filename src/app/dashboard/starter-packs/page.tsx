import { createSupabaseServerClient } from "@/lib/supabase/server";

const starterImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAY2KNsRRxR0uxEEgSyoiEarYVqfS_VCfCQGiS0VFdLo34r6gzS8iO75pJMeLEt-2SJ49UdXXrN25Te4Ij1F014h7VK4CWRM4spP1R8zlWYZpVGcykUXhYzB3K28l_DIrwckuE9SXJUoUd7nifL5lQf1NDnWxC9aFFnoeIaxbzEqcT5dd6Yd28glhiGlhVo6CpO3QjM8gp-SCuRl-He2n1D7r9rr2u0JgEVhHBxQ_nvuwi6iEa296rm0-y0WcLKT-mT1LD_mIn4BQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA8JVBiHLKpR9NLOzKjyWbkPCfyg_zbKJgYphLxcOWsdUAllQgKjgoC2S5JytNFRxekmXoMHzSiAb-4oVkkUc0ad99-J_KZKC6jTLjZO6froVceZPx6oPbUeHlMXCeY6WsaFMNIGZ85GPhupERSqzO-w3SkLNXhdMG07LtIiY4Lfj__EFQK3QWQO1pO-zCmUpMUsa3O22M3FDN3mQlziZfs7pN_NnnoBc4zKK1nB7Izsee8xXYf5GMOaz67EylNik3Rf0VpvMygpw",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA4uiiuUe9xucP6rpWWEZlXBdo0QIzDKPh4jxgZTxIG2LnGRmweKIv9kQr8zxyMY5BWHAKVyrsuULWQHpcYrCMGU0xEzqOZDT7UuZ4nKHpLHgWz2YIV1G8thYssoZX-b5zQyyLzMPDqVtIoXNO33X9-9mKr7dDS1dR6t8bdi6USXvBzKr1qhiDUUQpjLP5RcJqKwiqe62US55qw5EBqBd4YvinCy0F_1XoroGOdGS7o9cxwGlBjU3pIxosE5rTdDCJaaFVOLsGylw",
];

export default async function StarterPacksPage() {
  const supabase = await createSupabaseServerClient();
  const { data: itemsRaw } = await supabase
    .from("library_items")
    .select("id, title, category, description, file_size_mb")
    .eq("starter_pack", true)
    .order("created_at", { ascending: false })
    .limit(12);

  const items = (itemsRaw ?? []).map((item, index) => ({
    ...item,
    imageUrl: starterImages[index % starterImages.length],
  }));

  return (
    <div className="space-y-10">
      <header className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <h2 className="text-4xl font-extrabold uppercase italic tracking-tight text-white">Starter Packs</h2>
          <p className="text-lg text-slate-400">Hand-curated bundles to launch your niche store in minutes.</p>
        </div>
        <div className="flex items-end gap-3">
          <div className="flex -space-x-3">
            <div className="h-10 w-10 rounded-full border-2 border-background-dark bg-slate-700"></div>
            <div className="h-10 w-10 rounded-full border-2 border-background-dark bg-slate-600"></div>
            <div className="h-10 w-10 rounded-full border-2 border-background-dark bg-slate-500"></div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background-dark bg-slate-800 text-[10px] font-bold text-white">+2.4k</div>
          </div>
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-primary/30 p-1 gold-glow glass-panel">
        <div className="flex flex-col overflow-hidden rounded-[14px] bg-gradient-to-br from-white/[0.04] to-transparent lg:flex-row">
          <div className="flex w-full flex-col justify-center space-y-6 p-10 lg:w-1/2">
            <div>
              <span className="mb-4 inline-block rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-widest text-background-dark">
                Featured Hero Pack
              </span>
              <h3 className="text-4xl font-black leading-tight text-white">
                Ultimate Etsy Reseller
                <br />
                <span className="text-primary">Starter Kit</span>
              </h3>
            </div>

            <div className="space-y-4">
              <p className="font-medium italic text-slate-300">What&apos;s Inside the Vault:</p>
              <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <li className="flex items-center gap-3 text-sm text-slate-200"><span className="material-symbols-outlined text-xl text-primary">check_circle</span>50+ Professional Planners</li>
                <li className="flex items-center gap-3 text-sm text-slate-200"><span className="material-symbols-outlined text-xl text-primary">check_circle</span>100+ High-Engagement Reels</li>
                <li className="flex items-center gap-3 text-sm text-slate-200"><span className="material-symbols-outlined text-xl text-primary">check_circle</span>Etsy SEO Master Guide</li>
                <li className="flex items-center gap-3 text-sm text-slate-200"><span className="material-symbols-outlined text-xl text-primary">check_circle</span>20+ Mockup Templates</li>
              </ul>
            </div>

            <div className="pt-4">
              <button className="flex items-center gap-3 rounded-xl bg-primary px-8 py-4 font-black text-background-dark shadow-[0_0_30px_rgba(249,189,11,0.3)] transition-transform hover:scale-[1.02] active:scale-95">
                <span className="material-symbols-outlined">download_for_offline</span>
                DOWNLOAD ENTIRE BUNDLE
              </button>
            </div>
          </div>

          <div
            className="relative min-h-[300px] w-full overflow-hidden bg-cover bg-center lg:w-1/2"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCCMyWnbUGk3iSqU0rZJAq0vhejUF6vUrdbAjaCT-1_foonwaQvQbm_6WXmQtGB2aFIlShkkhBz97j9E3tZjW7-p_hzWHki3Joe22DiKyqRDNUpVzs1FB_1de_G-FlvOoT8g-WeFMcrw3ZJyqZN5YYecunqknhQrQIgYRrbWtNUHg5J2fLO1kC_b2AobE9v--tTjWlm-iu3wS4Thxjq2RfeH3SjFDd69yyux_KdxKodz2j4EaJMt27ZYSII4rFm3EKBW1PwRULLlQ')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-background-dark/80 to-transparent lg:from-background-dark/40"></div>
            <div className="absolute bottom-6 right-6 rounded-lg border border-white/20 px-4 py-2 glass-panel">
              <p className="text-[10px] font-bold uppercase text-slate-400">Estimated Value</p>
              <p className="text-xl font-black text-white">$497.00</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="flex items-center gap-2 text-xl font-bold text-white">
            <span className="h-8 w-2 rounded-full bg-primary"></span>
            Niche-Specific Curated Packs
          </h4>
          <button className="flex items-center gap-1 text-sm font-bold text-primary hover:underline">
            View All Categories
            <span className="material-symbols-outlined text-lg">arrow_right_alt</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(items.length ? items : [{ id: "fallback-1", title: "The Faceless Wealth Pack", category: "Reels", description: "Dominate social media without showing your face. High-end aesthetic reels and strategy.", imageUrl: starterImages[0], file_size_mb: 0 }, { id: "fallback-2", title: "Health & Wellness Essentials", category: "Wellness", description: "Everything from meal trackers to yoga journals. High-demand evergreen niche.", imageUrl: starterImages[1], file_size_mb: 0 }, { id: "fallback-3", title: "Modern Home Printables", category: "Printables", description: "Abstract wall art and organizational binders for the modern minimalist home.", imageUrl: starterImages[2], file_size_mb: 0 }]).map((item) => (
            <article key={item.id} className="group flex flex-col overflow-hidden rounded-2xl glass-panel transition-all hover:border-primary/40">
              <div className="relative h-48 bg-cover bg-center" style={{ backgroundImage: `url('${item.imageUrl}')` }}>
                <div className="absolute right-4 top-4 rounded bg-primary px-2 py-1 text-[10px] font-black italic text-background-dark">NICHE PROVEN</div>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h5 className="mb-2 text-lg font-bold text-white transition-colors group-hover:text-primary">{item.title}</h5>
                <p className="mb-6 text-sm leading-relaxed text-slate-400">{item.description ?? "Curated bundle to help you launch quickly."}</p>

                <div className="mt-auto space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-500">
                    <span>{item.category}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-700"></span>
                    <span>{item.file_size_mb ? `${item.file_size_mb} MB` : "Bundle"}</span>
                  </div>
                  <a
                    href={`/api/download?id=${item.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 py-3 font-bold text-white transition-all hover:bg-primary hover:text-background-dark"
                  >
                    <span className="material-symbols-outlined text-lg">download</span>
                    One-Click Download
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/5 pt-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl border border-primary/20 border-dashed bg-primary/[0.02] p-6 glass-panel">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Total Market Value</p>
                <p className="text-2xl font-black tracking-tight text-slate-500 line-through">$1,250.00+</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium uppercase tracking-widest text-primary">Your Access</p>
              <p className="text-2xl font-black italic text-white">INCLUDED</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 to-transparent p-6 glass-panel">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-background-dark">
              <span className="material-symbols-outlined font-black">verified</span>
            </div>
            <div>
              <h6 className="font-bold text-white">Membership Leverage</h6>
              <p className="text-sm text-slate-400">Save thousands on inventory and focus purely on scaling your revenue.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

