import Link from "next/link";

type TrainingCard = {
  title: string;
  level: string;
  duration: string;
  category: string;
  teacher: string;
  image: string;
};

const trainingCards: TrainingCard[] = [
  {
    title: "The Faceless Content Engine: Setting Up for Success",
    level: "Beginner",
    duration: "12:45",
    category: "Marketing",
    teacher: "Jordan K.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAP8_2EJBAhvuUsQikf_kA_VzQoB_xFKm4vCmQ85EDBuqtDCAPEPvklkLzZow0TlrVqy6gC-XWayxqidWKqFprgzh2AdNy0Fb9j_L6A0YOlM2ON3boNPrWqQ1cRR0EFsfXBJ0BYlXpmICZfidpnRHIRSAVBnfvT-mjF6LiTNGTHKyXdwOZRkQmkPmHQbA_ZoG8jpmiccpayj9laUXcEiCK5dYnEXcIc7DFmci02t0P23BV3y_FHf0ZQrLQI9dTUuqI5lMgTTkGp8g",
  },
  {
    title: "SEO Secrets: How to Rank Your MRR Products on Page 1",
    level: "Intermediate",
    duration: "28:10",
    category: "Etsy",
    teacher: "Sarah M.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAVm3HXPJzby3rig4g5a86ylTTXLVRBKHSXWBZlnaBPUE5H_Xfla--9UV5m2DNZK9RJnSWNtxsulhCABWSwHQ3YBr5Mg7IvlWvyWzu_vHnFFcR8KSBDqhJtYXdfG4FVTB0U7xiQsdaJQ6i92mgKMtokGiyiovdo1DEPXOO-8noDUTmZ6ayHzPfPcAe4fPULGbdLHoBKjpjKAuycZe_f6-LoKx3jts8Fg2nmbI1jNnXvWlpah3rG9h57g05oaUJwRozC_NyVFmK4_w",
  },
  {
    title: "Building Your 24/7 Sales Bot with ManyChat",
    level: "Beginner",
    duration: "18:55",
    category: "Automation",
    teacher: "Alex R.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBWbkpbItrfQcSUQi6IP9rvqrMGxhVoaqb2WMjBopx7CAIbehF0-BEFTr9swmEFZzjEyrPlVnZsepoqZlUJmSan5-XjJoCOZgojdixfc2Ik6EBh1NcL0GQrMO2lNKfNcyd2bqQspmvH2weOteck270vRPGamKblTfoIzHldO0xnQkbvatVUO_rpTfqWtOaTctc-1sqYlVrZku4WqvzKVkLgdUKiXD9oHP18-JTcwxjU4GIyXcHh33vO4-Sukn4l47xmPa_ECPVQUQ",
  },
  {
    title: "The Psychology of Selling: High-Ticket Branding",
    level: "Advanced",
    duration: "42:15",
    category: "Branding",
    teacher: "Elena G.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDCtgDHdOCsyExioLNqxkEIA34AIcoeY8lU5_51Jevo3lKsQyBfe5Jn_7RzGc-SstwSLZ4hxhol4_AEhjzj8Dmjq0QGIc9aGVuVt_h_tGiQQetlR9lT2w-2ukQs2e5HlD0wwNXGVkcX66zBGVEiYlcwx2Ug960wgNaQsDvAMmCuC0_ZZieydC6R_ToXdk8mvzSHhcxXe8R6GHf5cc4RNlnrG8eUX3jCP9NlspIrb80VWjsolJ7-Gffkz7TANIsoKjbMfDY1ayYmOQ",
  },
];

export default function TrainingHubPage() {
  return (
    <div className="space-y-10">
      <section className="video-glow relative overflow-hidden rounded-3xl border border-primary/10 glass-panel">
        <img
          alt="Featured Course Background"
          className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-luminosity transition-transform duration-700 hover:scale-105"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCtgDHdOCsyExioLNqxkEIA34AIcoeY8lU5_51Jevo3lKsQyBfe5Jn_7RzGc-SstwSLZ4hxhol4_AEhjzj8Dmjq0QGIc9aGVuVt_h_tGiQQetlR9lT2w-2ukQs2e5HlD0wwNXGVkcX66zBGVEiYlcwx2Ug960wgNaQsDvAMmCuC0_ZZieydC6R_ToXdk8mvzSHhcxXe8R6GHf5cc4RNlnrG8eUX3jCP9NlspIrb80VWjsolJ7-Gffkz7TANIsoKjbMfDY1ayYmOQ"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/60 to-transparent" />

        <div className="relative z-10 flex flex-col justify-end p-10">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-md bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-widest text-background-dark">
              Quickstart Guide
            </span>
            <span className="flex items-center gap-1 rounded-md bg-white/10 px-3 py-1 text-[10px] font-bold text-white">
              <span className="material-symbols-outlined text-[14px]">timer</span>
              15 min
            </span>
          </div>

          <h2 className="mb-4 max-w-2xl text-4xl font-extrabold leading-tight text-white">
            Mastering the Resell Game:
            <br />
            Your 24-Hour Quickstart Guide
          </h2>

          <p className="mb-8 max-w-xl text-lg text-slate-400">
            Learn the core pillars of MRR success and launch your first digital storefront with our proven
            blueprint.
          </p>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
            <button className="flex items-center gap-3 rounded-2xl bg-primary px-8 py-4 text-sm font-black text-background-dark shadow-[0_10px_30px_rgba(255,193,5,0.3)] transition-all hover:scale-105">
              <span className="material-symbols-outlined">play_arrow</span>
              CONTINUE WATCHING
            </button>

            <div className="w-full max-w-md">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500">Your Progress</span>
                <span className="text-xs font-bold text-primary">65%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[65%] bg-primary shadow-[0_0_15px_rgba(255,193,5,0.6)]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xl font-bold text-white">
            <span className="material-symbols-outlined text-primary">sort</span>
            Browse by Category
          </h3>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-background-dark">All Lessons</button>
          <button className="rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-xs font-bold text-slate-300">Etsy Selling</button>
          <button className="rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-xs font-bold text-slate-300">Marketing Strategy</button>
          <button className="rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-xs font-bold text-slate-300">Branding & Identity</button>
          <button className="rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-xs font-bold text-slate-300">Faceless Reels</button>
          <button className="rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-xs font-bold text-slate-300">Automation & AI</button>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-extrabold text-white">Tutorial Library</h3>
            <p className="text-sm text-slate-500">Expand your knowledge with 120+ deep-dive modules</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-400"><span className="material-symbols-outlined">grid_view</span></button>
            <button className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-400"><span className="material-symbols-outlined">list</span></button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {trainingCards.map((card, index) => (
            <article key={card.title} className="group flex flex-col overflow-hidden rounded-2xl border border-white/5 glass-card transition-all hover:-translate-y-1">
              <div className="relative aspect-video overflow-hidden">
                <img alt={card.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" src={card.image} />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary text-background-dark">
                    <span className="material-symbols-outlined">play_arrow</span>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">{card.duration}</div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">{card.category}</span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <span className="material-symbols-outlined text-[12px]">signal_cellular_alt{index % 2 === 0 ? "" : "_2_bar"}</span>
                    {card.level}
                  </span>
                </div>

                <h4 className="mb-4 line-clamp-2 font-bold leading-tight text-white transition-colors group-hover:text-primary">{card.title}</h4>

                <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-full bg-slate-800">
                      <img className="h-full w-full rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDhYs04CVHZ1lrbjxE1dHZdh7d7JIhrR41xcKLoV1zR5Na-HnR7HjhKxA5j38-2UfYsPqzFJPGfDZk8q3dkw99WA8oCh0fszcFVcsYY9mGlxh93dPF4hq1BEs7Jw2OPrzE6j1zsWd2tY2YWAXJgXagCJJGptOnV70SqA8BXxydP6ZC2RgZncahqFsRC4-6d7aKrHBvgP9fmLyraz62VMNMvD02VtKtWBqOSg08Mg7d7B8UlZPRdCxr5ZOObP1Cb_lqSyKOSOrtWw" alt={card.teacher} />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">{card.teacher}</span>
                  </div>
                  <button className="text-slate-500 hover:text-primary">
                    <span className="material-symbols-outlined text-lg">bookmark</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="border-t border-white/5 py-12 text-center">
        <Link
          href="/dashboard/training"
          className="group inline-flex items-center gap-3 rounded-2xl border-2 border-primary/20 px-12 py-4 font-black text-primary transition-all hover:border-primary hover:bg-primary/5"
        >
          EXPLORE FULL CURRICULUM
          <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}

