import Link from "next/link";

import { EmailCaptureCheckoutCta } from "@/components/EmailCaptureCheckoutCta";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="sticky top-0 z-10 border-b border-zinc-200/60 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            ProfitMRR Library
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
            >
              Member login
            </Link>
            <EmailCaptureCheckoutCta
              source="nav"
              buttonLabel="Access The Full Library"
              buttonClassName="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800"
            />
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-zinc-50 via-white to-white" />
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
            <div>
              <p className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm">
                Built for Etsy buyers who want the smarter way to stock up.
              </p>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-zinc-900 md:text-5xl">
                Own an Entire Digital Product Empire — Without Creating Anything
              </h1>
              <p className="mt-5 text-lg leading-8 text-zinc-700">
                Instant access to a growing PLR &amp; MRR library you can resell and keep 100%
                profit — updated monthly.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <EmailCaptureCheckoutCta source="hero" />
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
                >
                  Already purchased? Create account
                </Link>
              </div>

              <div className="mt-6 flex flex-col gap-2 text-sm text-zinc-600">
                <p>
                  <span className="font-semibold text-zinc-900">$99.90/year</span>
                  {" "}
                  <span className="text-zinc-500">(less than $0.30/day)</span>
                </p>
                <p>
                  Includes: full library access, monthly drops, training, community access, and starter packs.
                </p>
                <p className="text-xs text-zinc-500">
                  Fair-use policy: download limits to protect creators and prevent dumping.
                </p>
              </div>
            </div>

            {/* Value card */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-zinc-900">What you get</h2>
              <ul className="mt-4 space-y-3 text-sm text-zinc-700">
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-zinc-900" />
                  <span>
                    <span className="font-medium text-zinc-900">Full PLR + MRR library</span> — ready-to-sell digital products.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-zinc-900" />
                  <span>
                    <span className="font-medium text-zinc-900">Resell rights</span> — keep 100% profit (see license/disclaimers per item).
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-zinc-900" />
                  <span>
                    <span className="font-medium text-zinc-900">Monthly drops</span> — new products added every month.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-zinc-900" />
                  <span>
                    <span className="font-medium text-zinc-900">Training hub</span> — simple guides to list, price, and sell.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-zinc-900" />
                  <span>
                    <span className="font-medium text-zinc-900">Community access</span> — share what’s working and request packs.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-zinc-900" />
                  <span>
                    <span className="font-medium text-zinc-900">Starter packs</span> — curated bundles to publish fast.
                  </span>
                </li>
              </ul>

              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
                <p className="font-semibold">Important disclaimers</p>
                <p className="mt-1">
                  This library provides PLR/MRR products with usage rights. Rights can vary by item — always
                  review the included license. No guaranteed income claims.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What's inside */}
        <section className="border-t border-zinc-100 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-2xl font-semibold tracking-tight">What’s inside</h2>
            <p className="mt-2 text-zinc-700">
              A growing set of product categories designed to help you publish consistently.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                "Ebooks",
                "Courses",
                "Canva Templates",
                "Planners",
                "Social Media Kits",
                "AI Prompts",
                "Marketing Bundles",
              ].map((name) => (
                <div
                  key={name}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-sm font-semibold text-zinc-900">{name}</p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Ready-to-use assets you can brand, list, and sell.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-zinc-100 bg-zinc-50">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Join",
                  desc: "Start your annual membership for $99.90/year (less than $0.30/day).",
                },
                {
                  title: "Access",
                  desc: "Browse the library, starter packs, and monthly drops from your dashboard.",
                },
                {
                  title: "Download & resell",
                  desc: "Download products, follow the included license, and sell on Etsy or beyond.",
                },
              ].map((step) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
                >
                  <p className="text-sm font-semibold text-zinc-900">{step.title}</p>
                  <p className="mt-2 text-sm text-zinc-700">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Monthly drops */}
        <section className="border-t border-zinc-100 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Monthly drops</h2>
                <p className="mt-3 text-zinc-700">
                  Your membership stays valuable because the library keeps growing. Every month we add new
                  products and fresh packs you can list quickly.
                </p>
                <p className="mt-3 text-sm text-zinc-600">
                  Cancel anytime — if you cancel, you keep access until the end of your current paid period.
                </p>
              </div>
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
                <p className="text-sm font-semibold text-zinc-900">Retention made simple</p>
                <ul className="mt-4 space-y-2 text-sm text-zinc-700">
                  <li>• New releases flagged “New This Month”</li>
                  <li>• Starter packs updated as the library grows</li>
                  <li>• Training modules to help you sell smarter</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Etsy bridge */}
        <section className="border-t border-zinc-100 bg-zinc-50">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-2xl font-semibold tracking-tight">For Etsy buyers</h2>
            <p className="mt-3 text-zinc-700">
              You found us from Etsy — here’s the smarter way.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-zinc-900">Stop buying one-by-one</p>
                <p className="mt-2 text-sm text-zinc-700">
                  Instead of spending $7–$39 repeatedly on individual products, unlock a full library you can
                  use across niches and seasons.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-zinc-900">Move faster</p>
                <p className="mt-2 text-sm text-zinc-700">
                  Grab a starter pack, list today, then keep building your shop with monthly drops and training.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-zinc-100 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                {
                  q: "Do I get PLR/MRR rights?",
                  a: "Yes — items are provided with usage rights. Rights can vary per item, so always review the included license. We do not provide legal advice.",
                },
                {
                  q: "Where can I sell these?",
                  a: "Most members sell on Etsy, Gumroad, Shopify, and other marketplaces. Follow each item’s license and platform policies.",
                },
                {
                  q: "How often do you add new products?",
                  a: "Monthly. New releases are highlighted in the dashboard under “New This Month”.",
                },
                {
                  q: "What happens if I cancel?",
                  a: "If you cancel, your access continues until the end of your current paid period. When your subscription is inactive/expired, downloads are revoked.",
                },
                {
                  q: "Is there a download limit?",
                  a: "Yes — we enforce a fair-use download limit per user/day to discourage dumping and protect the library.",
                },
                {
                  q: "Do you guarantee income?",
                  a: "No. We provide products and training, but results depend on your execution, niche, and market demand.",
                },
              ].map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                >
                  <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-900">
                    {item.q}
                  </summary>
                  <p className="mt-3 text-sm text-zinc-700">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-zinc-100 bg-zinc-50">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm md:p-10">
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
                Unlock the full library today
              </h2>
              <p className="mt-3 max-w-2xl text-zinc-700">
                One membership. A growing product library. Monthly drops. Training. Community.
                {" "}
                <span className="font-medium text-zinc-900">$99.90/year</span> — less than $0.30/day.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <EmailCaptureCheckoutCta source="final" />
                <p className="text-xs text-zinc-500">
                  Urgency-lite: join now so you don’t miss the next monthly drop.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500">© {new Date().getFullYear()} ProfitMRR Library</p>
          <div className="flex gap-4 text-xs">
            <Link href="/privacy" className="text-zinc-600 hover:text-zinc-900">
              Privacy
            </Link>
            <Link href="/terms" className="text-zinc-600 hover:text-zinc-900">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
