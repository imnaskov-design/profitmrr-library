import Link from "next/link";

import { EmailCaptureCheckoutCta } from "@/components/EmailCaptureCheckoutCta";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { StaggerReveal, Reveal } from "@/components/ui/StaggerReveal";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background-dark font-display text-white">
      {/* Animated background spotlight */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] -z-10 rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-card border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-1.5 rounded-lg">
              <span className="material-symbols-outlined text-background-dark font-bold">account_balance_wallet</span>
            </div>
            <h1 className="text-xl font-800 tracking-tight text-white uppercase">Profit<span className="text-primary">MRR</span></h1>
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a className="text-sm font-semibold text-white/70 hover:text-primary transition-colors" href="#">Library</a>
            <a className="text-sm font-semibold text-white/70 hover:text-primary transition-colors" href="#">Monthly Drops</a>
            <a className="text-sm font-semibold text-white/70 hover:text-primary transition-colors" href="#">How It Works</a>
            <a className="text-sm font-semibold text-white/70 hover:text-primary transition-colors" href="#">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-bold text-white px-4 py-2 hover:text-primary transition-colors">
              Login
            </Link>
            <EmailCaptureCheckoutCta
              source="nav"
              buttonLabel="Join Now"
              buttonClassName="bg-primary hover:bg-primary/90 text-background-dark px-6 py-2.5 rounded-lg text-sm font-bold transition-all gold-glow"
            />
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-20 px-6 overflow-hidden spotlight">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col space-y-8 z-20">
              <Reveal delay={0}>
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 w-fit">
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary/80">900+ Ready-To-Sell Products • Unlimited Downloads • Monthly Drops</span>
                </div>
              </Reveal>
              
              <Reveal delay={100}>
                <h1 className="text-6xl lg:text-7xl font-800 leading-[1] tracking-tight text-white">
                  Access A Full <br/>
                  <span className="gold-gradient-text italic">Digital Product</span> <br/>
                  Empire
                </h1>
              </Reveal>
              
              <Reveal delay={200}>
                <p className="text-xl text-white/60 max-w-xl leading-relaxed">
                  Skip the creation process. Download high-converting digital assets, rebrand them as your own, and keep 100% of every sale you make.
                </p>
              </Reveal>
              
              <Reveal delay={300}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <EmailCaptureCheckoutCta 
                    source="hero"
                    buttonLabel="Access Full Products Library"
                    buttonClassName="bg-primary text-background-dark px-8 py-5 rounded-xl text-lg font-bold transition-all hover:scale-[1.02] gold-glow flex items-center justify-center gap-3"
                  />
                  <GlassButton 
                    variant="outline"
                    className="text-white px-8 py-5 rounded-xl text-lg font-bold border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                  >
                    See What's Inside
                  </GlassButton>
                </div>
              </Reveal>
              
              <Reveal delay={400}>
                <div className="flex flex-wrap items-center gap-8 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">bolt</span>
                    <span className="text-sm font-semibold text-white/80">Instant access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">payments</span>
                    <span className="text-sm font-semibold text-white/80">Keep 100% profit</span>
                  </div>
                </div>
              </Reveal>
            </div>
            
            {/* Hero Image/Dashboard */}
            <div className="relative lg:h-[700px] flex items-center justify-center z-10">
              <div className="relative w-full max-w-lg bg-surface rounded-2xl border border-white/10 p-4 shadow-2xl">
                <div className="w-full aspect-video bg-background-dark rounded-xl overflow-hidden border border-white/5">
                  <div className="w-full h-full bg-gradient-to-br from-surface to-background-dark flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="text-4xl font-800 text-primary mb-2">$127,450</div>
                      <div className="text-white/60 text-sm">Total Revenue Generated</div>
                      <div className="mt-4 flex justify-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                        <div className="h-2 w-2 rounded-full bg-primary/50"></div>
                        <div className="h-2 w-2 rounded-full bg-primary/30"></div>
                        <div className="h-2 w-2 rounded-full bg-primary/20"></div>
                        <div className="h-2 w-2 rounded-full bg-primary/10"></div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating product card 1 */}
                <div className="absolute -top-12 -right-16 glass-card p-4 rounded-2xl gold-glow border-primary/30 w-56 -rotate-3 transition-transform hover:rotate-0">
                  <div className="w-full h-32 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg mb-3 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-4xl">shopping_bag</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black uppercase text-primary">Best Seller</p>
                    <p className="text-[10px] text-white/50">MRR</p>
                  </div>
                </div>
                {/* Floating product card 2 */}
                <div className="absolute -bottom-10 -left-12 glass-card p-4 rounded-2xl border-white/10 w-52 rotate-6 transition-transform hover:rotate-0">
                  <div className="w-full h-28 bg-gradient-to-r from-violet-500/20 to-violet-500/10 rounded-lg mb-3 flex items-center justify-center">
                    <span className="material-symbols-outlined text-violet-400 text-3xl">videocam</span>
                  </div>
                  <p className="text-xs font-bold text-white">Viral Reels Bundle</p>
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] -z-10 rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <div className="bg-surface/50 border-y border-white/5 py-10 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <Reveal delay={0}>
                <div className="flex items-center gap-4 group">
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <span className="material-symbols-outlined">package_2</span>
                  </div>
                  <div>
                    <div className="text-2xl font-800 text-white">900+</div>
                    <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Product Bundles</div>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={100}>
                <div className="flex items-center gap-4 group">
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <span className="material-symbols-outlined">trending_up</span>
                  </div>
                  <div>
                    <div className="text-2xl font-800 text-white">2,700+</div>
                    <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Sales Generated</div>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={200}>
                <div className="flex items-center gap-4 group">
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <span className="material-symbols-outlined">star</span>
                  </div>
                  <div>
                    <div className="text-2xl font-800 text-white">4.9/5</div>
                    <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Star Ratings</div>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={300}>
                <div className="flex items-center gap-4 group">
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <span className="material-symbols-outlined">update</span>
                  </div>
                  <div>
                    <div className="text-2xl font-800 text-white">WEEKLY</div>
                    <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Updated Monthly</div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        {/* Trending Bundles Section */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row items-end justify-between gap-6">
            <div className="space-y-4">
              <h2 className="text-primary text-sm font-bold uppercase tracking-[0.2em]">Explore The Vault</h2>
              <h3 className="text-4xl lg:text-5xl font-800 text-white leading-tight">Trending Profit Bundles</h3>
            </div>
            <button className="flex items-center gap-2 text-white/60 hover:text-primary font-bold transition-all border-b border-transparent hover:border-primary pb-1">
              View All 900+ Products <span className="material-symbols-outlined">arrow_right_alt</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Etsy Proven Products",
                desc: "50+ High-Demand Templates",
                tags: ["MRR Included", "Hot"],
                color: "from-primary/20 to-primary/10"
              },
              {
                title: "High Profit Packs",
                desc: "Niche-Specific Solutions",
                tags: ["MRR Included"],
                color: "from-violet-500/20 to-violet-500/10"
              },
              {
                title: "Viral Reels Bundle",
                desc: "1,000+ Faceless Reels",
                tags: ["MRR Included", "Trending"],
                color: "from-blue-500/20 to-blue-500/10"
              },
              {
                title: "Mastery Kits",
                desc: "Complete Marketing Systems",
                tags: ["MRR Included"],
                color: "from-green-500/20 to-green-500/10"
              },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="group cursor-pointer">
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-6 border border-white/10">
                    <div className={`w-full h-full bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-white/30 text-6xl">inventory_2</span>
                    </div>
                    <div className="absolute top-4 left-4 flex gap-2">
                      {item.tags.map((tag, tagIndex) => (
                        <span 
                          key={tagIndex}
                          className={`text-[10px] font-black px-2 py-1 rounded tracking-tighter uppercase ${
                            tag === "Hot" || tag === "Trending" 
                              ? "bg-blue-500 text-white" 
                              : "bg-primary text-background-dark"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent opacity-60"></div>
                  </div>
                  <h4 className="text-white font-bold text-xl group-hover:text-primary transition-colors">{item.title}</h4>
                  <p className="text-white/50 text-sm mt-1">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* How It Works - 4 Steps */}
        <section className="py-24 px-6 bg-surface/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Reveal delay={0}>
                <h2 className="text-primary text-sm font-bold uppercase tracking-[0.2em] mb-4">The Workflow</h2>
              </Reveal>
              <Reveal delay={100}>
                <h3 className="text-4xl font-800 text-white">4 Steps To Your Empire</h3>
              </Reveal>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 border-t border-dashed border-white/10 -translate-y-1/2 hidden md:block"></div>
              
              {[
                { step: "1", title: "Join", desc: "Gain instant access to the entire vault." },
                { step: "2", title: "Download", desc: "Pick products from any trending niche." },
                { step: "3", title: "Upload", desc: "Set your price on Etsy, Shopify, or Stan Store." },
                { step: "4", title: "Profit", desc: "Keep 100% of every sale you generate." },
              ].map((item, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div className="relative bg-background-dark p-8 rounded-2xl border border-white/10 text-center">
                    <div className="size-16 rounded-full bg-primary text-background-dark flex items-center justify-center mx-auto mb-6 text-2xl font-black">{item.step}</div>
                    <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-sm text-white/50">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-24 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/5 rounded-3xl overflow-hidden border border-white/10">
              <div className="p-12 lg:p-20 bg-background-dark">
                <h4 className="text-red-500 font-bold mb-8 flex items-center gap-2">
                  <span className="material-symbols-outlined">cancel</span> The Old Way
                </h4>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4 text-white/60">
                    <span className="material-symbols-outlined text-red-500/50">remove</span>
                    <p>Spend weeks creating products from scratch</p>
                  </li>
                  <li className="flex items-start gap-4 text-white/60">
                    <span className="material-symbols-outlined text-red-500/50">remove</span>
                    <p>Pay $1,000+ to hire writers and designers</p>
                  </li>
                  <li className="flex items-start gap-4 text-white/60">
                    <span className="material-symbols-outlined text-red-500/50">remove</span>
                    <p>Limited niches and product options</p>
                  </li>
                  <li className="flex items-start gap-4 text-white/60">
                    <span className="material-symbols-outlined text-red-500/50">remove</span>
                    <p>Complex licensing legal hurdles</p>
                  </li>
                </ul>
              </div>
              <div className="p-12 lg:p-20 bg-primary/5 relative">
                <div className="absolute top-0 right-0 p-8">
                  <span className="material-symbols-outlined text-primary text-6xl opacity-20">verified</span>
                </div>
                <h4 className="text-primary font-bold mb-8 flex items-center gap-2">
                  <span className="material-symbols-outlined">check_circle</span> The ProfitMRR Way
                </h4>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4 text-white">
                    <span className="material-symbols-outlined text-primary">add</span>
                    <p>Instant access to 900+ ready-to-sell assets</p>
                  </li>
                  <li className="flex items-start gap-4 text-white">
                    <span className="material-symbols-outlined text-primary">add</span>
                    <p>One low membership fee for everything</p>
                  </li>
                  <li className="flex items-start gap-4 text-white">
                    <span className="material-symbols-outlined text-primary">add</span>
                    <p>Unlimited downloads across all niches</p>
                  </li>
                  <li className="flex items-start gap-4 text-white">
                    <span className="material-symbols-outlined text-primary">add</span>
                    <p>Pre-written legal MRR certificates included</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Release Calendar */}
        <section className="py-24 px-6 bg-surface/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
              <div className="space-y-4">
                <h2 className="text-primary text-sm font-bold uppercase tracking-[0.2em]">Always Fresh</h2>
                <h3 className="text-4xl font-800 text-white">Upcoming Release Calendar</h3>
              </div>
              <p className="text-white/40 max-w-sm">We add 20+ new premium products every single month to keep your store competitive.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { month: "MARCH", items: ["Faceless TikTok Mastery", "500+ Luxury Home Reels", "Email Marketing Templates"], active: true },
                { month: "APRIL", items: ["AI Art Generation Course", "Digital Planner Suite", "Podcast Script Kits"], active: false },
                { month: "MAY", items: ["Social Media Agency Pack", "SEO Blueprint 2024", "Canva Elements Library"], active: false },
              ].map((item, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div className="glass-card p-8 rounded-2xl border-white/10 group hover:border-primary/40 transition-all">
                    <div className={`font-black text-4xl mb-6 ${item.active ? 'text-primary' : 'text-white/40'}`}>{item.month}</div>
                    <ul className="space-y-4 text-white/70">
                      {item.items.map((listItem, j) => (
                        <li key={j} className="flex items-center gap-3">
                          <span className={`size-2 rounded-full ${item.active ? 'bg-primary' : 'bg-white/20'}`}></span>
                          {listItem}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: "gavel",
                title: "Sell Legally From Day 1",
                desc: "No copyright headaches. Every asset comes with a certified license that allows you to resell and keep the profit."
              },
              {
                icon: "art_track",
                title: "Ready-To-Post Sales Materials",
                desc: "We provide the thumbnails, sales copy, and ad creatives. Just download the assets and you're ready to market."
              },
              {
                icon: "rocket_launch",
                title: "Instant Business Launch",
                desc: "Why spend months in development? Select your niche, download our bundles, and go live in under 30 minutes."
              },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="space-y-6">
                  <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                  </div>
                  <h4 className="text-2xl font-bold text-white">{item.title}</h4>
                  <p className="text-white/50 leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-6 bg-surface/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Reveal delay={0}>
                <h2 className="text-primary text-sm font-bold uppercase tracking-[0.2em] mb-4">Success Stories</h2>
              </Reveal>
              <Reveal delay={100}>
                <h3 className="text-4xl font-800 text-white">What Our Resellers Are Earning</h3>
              </Reveal>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "Made my first $500 on Etsy within 4 days of joining. The Reels bundles are incredible quality and sell like crazy.",
                  name: "Sarah Jenkins",
                  role: "Etsy Seller"
                },
                {
                  quote: "Finally a platform that delivers real value. No more low-quality PLR. This stuff is actually high-end.",
                  name: "Marcus Thorne",
                  role: "Digital Entrepreneur"
                },
                {
                  quote: "The monthly drops keep my inventory fresh. My customers are always coming back for more new products.",
                  name: "Elena Rodriguez",
                  role: "Content Creator"
                },
              ].map((item, i) => (
                <Reveal key={i} delay={i * 100}>
                  <GlassCard className="p-8 rounded-2xl border-white/10">
                    <div className="flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                    <p className="text-white/80 italic mb-6">"{item.quote}"</p>
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{item.name}</div>
                        <div className="text-[10px] text-primary uppercase font-black">{item.role}</div>
                      </div>
                    </div>
                  </GlassCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6 relative">
          <div className="max-w-6xl mx-auto bg-primary rounded-[3rem] p-12 lg:p-24 text-center relative overflow-hidden gold-glow">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.3),_transparent)] pointer-events-none"></div>
            <div className="relative z-10 space-y-8">
              <h3 className="text-background-dark text-5xl lg:text-7xl font-900 tracking-tight leading-[1]">
                Start Selling Digital <br className="hidden sm:block"/> 
                Products This Week
              </h3>
              <p className="text-background-dark/80 text-xl font-semibold max-w-2xl mx-auto">
                Stop trading time for money. Build a scalable digital empire with 900+ products ready for you to resell right now.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <EmailCaptureCheckoutCta 
                  source="final"
                  buttonLabel="Get Instant Access Now"
                  buttonClassName="bg-background-dark text-white px-12 py-6 rounded-2xl text-xl font-black transition-all hover:scale-105 shadow-2xl flex items-center justify-center gap-3"
                />
              </div>
              <div className="flex items-center justify-center gap-6 pt-4 text-background-dark/60">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  <span className="text-xs font-bold uppercase">Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">event_repeat</span>
                  <span className="text-xs font-bold uppercase">Cancel Anytime</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background-dark border-t border-white/5 py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-1 rounded-lg">
                <span className="material-symbols-outlined text-background-dark text-sm font-bold">account_balance_wallet</span>
              </div>
              <h1 className="text-lg font-800 tracking-tight text-white uppercase">Profit<span className="text-primary">MRR</span></h1>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              The world's leading infrastructure for digital product resellers. Premium products, legal licensing, and high-conversion systems.
            </p>
          </div>
          
          <div>
            <h5 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Platform</h5>
            <ul className="space-y-4 text-white/40 text-sm">
              <li><a className="hover:text-primary transition-colors" href="#">Browse Library</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Monthly Drops</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">License Details</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Support Center</a></li>
            </ul>
          </div>
          
          <div>
            <h5 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Company</h5>
            <ul className="space-y-4 text-white/40 text-sm">
              <li><a className="hover:text-primary transition-colors" href="#">Affiliate Program</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Terms of Service</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h5 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Newsletter</h5>
            <p className="text-white/40 text-sm mb-6">Get notified when we drop new premium products.</p>
            <div className="flex gap-2">
              <input 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary w-full" 
                placeholder="Your email" 
                type="email"
              />
              <button className="bg-primary px-4 rounded-xl text-background-dark">
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto border-t border-white/5 mt-20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-white/30 text-[10px] uppercase tracking-[0.3em]">© {new Date().getFullYear()} ProfitMRR. All rights reserved.</p>
          <div className="flex gap-8">
            <a className="text-white/30 hover:text-white transition-colors" href="#"><span className="material-symbols-outlined text-xl">public</span></a>
            <a className="text-white/30 hover:text-white transition-colors" href="#"><span className="material-symbols-outlined text-xl">share</span></a>
            <a className="text-white/30 hover:text-white transition-colors" href="#"><span className="material-symbols-outlined text-xl">alternate_email</span></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
