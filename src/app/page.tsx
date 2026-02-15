import Link from "next/link";

import { EmailCaptureCheckoutCta } from "@/components/EmailCaptureCheckoutCta";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { StaggerReveal, Reveal } from "@/components/ui/StaggerReveal";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] h-[80%] w-[60%] rounded-full bg-indigo-100/50 blur-3xl animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] h-[50%] w-[40%] rounded-full bg-violet-100/50 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute -bottom-[20%] left-[20%] h-[40%] w-[40%] rounded-full bg-indigo-50/50 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Reveal delay={0}>
            <Link href="/" className="text-lg font-bold tracking-tight text-zinc-900">
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                ProfitMRR
              </span>{" "}
              Library
            </Link>
          </Reveal>
          <div className="flex items-center gap-3">
            <Reveal delay={100}>
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
              >
                Member login
              </Link>
            </Reveal>
            <Reveal delay={200}>
              <EmailCaptureCheckoutCta
                source="nav"
                buttonLabel="Access The Full Library"
                buttonClassName="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              />
            </Reveal>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
          <div className="mx-auto max-w-6xl px-4">
            <StaggerReveal delay={100} stagger={80} className="grid gap-10 md:grid-cols-2 md:items-center">
              <div className="text-center md:text-left">
                <Reveal delay={100}>
                  <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 shadow-sm">
                    <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
                    Built for Etsy sellers who want the smarter way
                  </span>
                </Reveal>
                
                <Reveal delay={200}>
                  <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900 md:text-5xl lg:text-6xl">
                    Own an Entire{" "}
                    <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-600 bg-clip-text text-transparent">
                      Digital Product Empire
                    </span>{" "}
                    — Without Creating Anything
                  </h1>
                </Reveal>
                
                <Reveal delay={300}>
                  <p className="mt-5 text-lg leading-8 text-zinc-600 md:text-xl">
                    Instant access to a growing PLR & MRR library you can resell and keep 100% profit — updated monthly.
                  </p>
                </Reveal>

                <Reveal delay={400}>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center md:justify-start">
                    <EmailCaptureCheckoutCta 
                      source="hero"
                      buttonClassName="h-12 px-6 text-base font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    />
                    <Link
                      href="/register"
                      className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white/80 px-6 text-base font-semibold text-zinc-700 backdrop-blur-sm transition-all hover:bg-white hover:border-zinc-300 hover:shadow-lg"
                    >
                      Already purchased? Create account
                    </Link>
                  </div>
                </Reveal>

                <Reveal delay={500}>
                  <div className="mt-6 flex flex-col gap-2 text-sm text-zinc-500">
                    <p>
                      <span className="font-semibold text-zinc-900">$99.90/year</span>
                      {" "}
                      <span className="text-zinc-400">(less than $0.30/day)</span>
                    </p>
                    <p className="text-xs">
                      Includes: full library access, monthly drops, training, community, and starter packs.
                    </p>
                  </div>
                </Reveal>
              </div>

              {/* Value card - right side */}
              <Reveal delay={300} className="hidden md:block">
                <GlassCard hover glow padding="lg" className="relative overflow-hidden">
                  {/* Decorative gradient */}
                  <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-200 to-violet-200 blur-2xl" />
                  
                  <h2 className="relative text-lg font-semibold text-zinc-900">What you get</h2>
                  <ul className="relative mt-4 space-y-4">
                    {[
                      { title: "Full PLR + MRR library", desc: "Ready-to-sell digital products." },
                      { title: "Resell rights", desc: "Keep 100% profit per item." },
                      { title: "Monthly drops", desc: "New products added every month." },
                      { title: "Training hub", desc: "Simple guides to list, price, and sell." },
                      { title: "Community access", desc: "Share what's working, request packs." },
                      { title: "Starter packs", desc: "Curated bundles to publish fast." },
                    ].map((item, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <span>
                          <span className="font-medium text-zinc-900">{item.title}</span>
                          <span className="text-zinc-500"> — {item.desc}</span>
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="relative mt-6 rounded-xl border border-amber-200/50 bg-amber-50/80 p-4 text-sm leading-5 text-amber-900 backdrop-blur-sm">
                    <p className="font-semibold">Important disclaimers</p>
                    <p className="mt-1 text-amber-800">
                      This library provides PLR/MRR products with usage rights. Rights vary by item — always review the included license. No guaranteed income.
                    </p>
                  </div>
                </GlassCard>
              </Reveal>
            </StaggerReveal>
          </div>
        </section>

        {/* What's inside */}
        <section className="border-t border-zinc-100 bg-white/50 py-16 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal delay={0}>
              <h2 className="text-center text-3xl font-bold tracking-tight text-zinc-900">What's inside</h2>
              <p className="mt-2 text-center text-zinc-600">
                A growing set of product categories designed to help you publish consistently.
              </p>
            </Reveal>

            <StaggerReveal delay={100} stagger={60} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: "Ebooks", desc: "Ready-to-use assets you can brand, list, and sell." },
                { name: "Courses", desc: "Complete digital courses with PLR rights." },
                { name: "Canva Templates", desc: "Beautiful templates ready for customization." },
                { name: "Planners", desc: "Printable and digital planners for any niche." },
                { name: "Social Media Kits", desc: "Engaging content packs for your channels." },
                { name: "AI Prompts", desc: "Curated prompts for maximum AI output." },
                { name: "Marketing Bundles", desc: "Ready-made campaigns to boost sales." },
              ].map((item) => (
                <GlassCard key={item.name} hover padding="md" className="group">
                  <p className="text-base font-semibold text-zinc-900">{item.name}</p>
                  <p className="mt-1 text-sm text-zinc-600">{item.desc}</p>
                  <div className="mt-3 flex items-center text-sm font-medium text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100">
                    Explore category
                    <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </GlassCard>
              ))}
            </StaggerReveal>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-zinc-100 bg-gradient-to-b from-zinc-50 to-white py-16">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal delay={0}>
              <h2 className="text-center text-3xl font-bold tracking-tight text-zinc-900">How it works</h2>
            </Reveal>

            <StaggerReveal delay={100} stagger={100} className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Join",
                  desc: "Start your annual membership for $99.90/year (less than $0.30/day).",
                  icon: (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  )
                },
                {
                  step: "02",
                  title: "Access",
                  desc: "Browse the library, starter packs, and monthly drops from your dashboard.",
                  icon: (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  )
                },
                {
                  step: "03",
                  title: "Download & Resell",
                  desc: "Download products, follow the included license, and sell on Etsy or beyond.",
                  icon: (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  )
                },
              ].map((item) => (
                <GlassCard key={item.step} hover padding="lg" className="relative">
                  <div className="absolute -top-3 -left-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30">
                    {item.icon}
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-indigo-600">{item.step}</p>
                    <p className="mt-2 text-lg font-semibold text-zinc-900">{item.title}</p>
                    <p className="mt-2 text-sm text-zinc-600">{item.desc}</p>
                  </div>
                </GlassCard>
              ))}
            </StaggerReveal>
          </div>
        </section>

        {/* Monthly drops */}
        <section className="border-t border-zinc-100 bg-white py-16">
          <div className="mx-auto max-w-6xl px-4">
            <StaggerReveal delay={0} className="grid gap-10 md:grid-cols-2 md:items-center">
              <div>
                <Reveal delay={100}>
                  <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Monthly drops</h2>
                </Reveal>
                <Reveal delay={200}>
                  <p className="mt-3 text-zinc-600">
                    Your membership stays valuable because the library keeps growing. Every month we add new products and fresh packs you can list quickly.
                  </p>
                </Reveal>
                <Reveal delay={300}>
                  <p className="mt-3 text-sm text-zinc-500">
                    Cancel anytime — if you cancel, you keep access until the end of your current paid period.
                  </p>
                </Reveal>
              </div>
              <Reveal delay={300}>
                <GlassCard padding="lg" className="relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-violet-200 to-indigo-200 blur-2xl" />
                  <p className="relative text-base font-semibold text-zinc-900">Retention made simple</p>
                  <ul className="relative mt-4 space-y-3 text-sm text-zinc-700">
                    {[
                      'New releases flagged "New This Month"',
                      'Starter packs updated as the library grows',
                      'Training modules to help you sell smarter',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                          <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </Reveal>
            </StaggerReveal>
          </div>
        </section>

        {/* For Etsy buyers */}
        <section className="border-t border-zinc-100 bg-gradient-to-b from-zinc-50 to-white py-16">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal delay={0}>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900">For Etsy buyers</h2>
              <p className="mt-3 text-zinc-600">
                You found us from Etsy — here's the smarter way.
              </p>
            </Reveal>

            <StaggerReveal delay={100} stagger={100} className="mt-8 grid gap-4 md:grid-cols-2">
              <GlassCard hover padding="lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="mt-4 text-base font-semibold text-zinc-900">Stop buying one-by-one</p>
                <p className="mt-2 text-sm text-zinc-600">
                  Instead of spending $7–$39 repeatedly on individual products, unlock a full library you can use across niches and seasons.
                </p>
              </GlassCard>

              <GlassCard hover padding="lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="mt-4 text-base font-semibold text-zinc-900">Move faster</p>
                <p className="mt-2 text-sm text-zinc-600">
                  Grab a starter pack, list today, then keep building your shop with monthly drops and training.
                </p>
              </GlassCard>
            </StaggerReveal>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-zinc-100 bg-white py-16">
          <div className="mx-auto max-w-3xl px-4">
            <Reveal delay={0}>
              <h2 className="text-center text-3xl font-bold tracking-tight text-zinc-900">Frequently Asked Questions</h2>
            </Reveal>

            <div className="mt-8 space-y-3">
              {[
                {
                  q: "Do I get PLR/MRR rights?",
                  a: "Yes — items are provided with usage rights. Rights can vary per item, so always review the included license. We do not provide legal advice."
                },
                {
                  q: "Where can I sell these?",
                  a: "Most members sell on Etsy, Gumroad, Shopify, and other marketplaces. Follow each item's license and platform policies."
                },
                {
                  q: "How often do you add new products?",
                  a: "Monthly. New releases are highlighted in the dashboard under \"New This Month\"."
                },
                {
                  q: "What happens if I cancel?",
                  a: "If you cancel, your access continues until the end of your current paid period. When your subscription is inactive/expired, downloads are revoked."
                },
                {
                  q: "Is there a download limit?",
                  a: "Yes — we enforce a fair-use download limit per user/day to discourage dumping and protect the library."
                },
                {
                  q: "Do you guarantee income?",
                  a: "No. We provide products and training, but results depend on your execution, niche, and market demand."
                },
              ].map((item, i) => (
                <GlassCard key={i} padding="none" className="overflow-hidden">
                  <details className="group">
                    <summary className="flex cursor-pointer items-center justify-between p-5 font-medium text-zinc-900 list-none">
                      {item.q}
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-transform group-open:rotate-180">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-sm text-zinc-600">
                      {item.a}
                    </div>
                  </details>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-zinc-100 bg-gradient-to-b from-white to-indigo-50/30 py-16">
          <div className="mx-auto max-w-3xl px-4">
            <GlassCard padding="lg" glow className="text-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-indigo-200/30 blur-3xl" />
              <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-violet-200/30 blur-3xl" />
              
              <div className="relative">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                  Unlock the full library today
                </h2>
                <p className="mt-3 max-w-xl text-zinc-600 mx-auto">
                  One membership. A growing product library. Monthly drops. Training. Community.
                  {" "}
                  <span className="font-semibold text-zinc-900">$99.90/year</span> — less than $0.30/day.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
                  <EmailCaptureCheckoutCta 
                    source="final"
                    buttonClassName="h-12 px-6 text-base font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  />
                </div>
                <p className="mt-4 text-xs text-zinc-400">
                  Urgency-lite: join now so you don't miss the next monthly drop.
                </p>
              </div>
            </GlassCard>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-400">© {new Date().getFullYear()} ProfitMRR Library</p>
          <div className="flex gap-4 text-xs">
            <Link href="/privacy" className="text-zinc-500 transition-colors hover:text-zinc-900">
              Privacy
            </Link>
            <Link href="/terms" className="text-zinc-500 transition-colors hover:text-zinc-900">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
