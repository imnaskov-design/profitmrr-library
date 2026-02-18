import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function SupportPage({
  searchParams,
}: {
  searchParams?: { sent?: string };
}) {
  const sent = searchParams?.sent === "1";

  async function createTicket(formData: FormData) {
    "use server";

    const subject = String(formData.get("subject") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (!subject || !message) {
      redirect("/dashboard/support?sent=0");
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login?next=/dashboard/support");
    }

    await supabase.from("support_tickets").insert({
      user_id: user.id,
      subject,
      message,
    });

    redirect("/dashboard/support?sent=1");
  }

  return (
    <div className="space-y-12">
      <header className="space-y-8 pt-6 text-center">
        <div className="space-y-2">
          <h2 className="text-4xl font-extrabold tracking-tight text-white">Support Center</h2>
          <p className="text-lg text-slate-400">How can we help your business grow today?</p>
        </div>

        <div className="group relative mx-auto max-w-2xl">
          <div className="pointer-events-none absolute inset-y-0 left-5 flex items-center">
            <span className="material-symbols-outlined text-2xl text-primary">search</span>
          </div>
          <input
            className="w-full rounded-2xl border border-primary/20 bg-white py-5 pl-14 pr-6 text-lg text-slate-900 shadow-2xl transition-all placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-primary dark:bg-surface-dark/40 dark:text-white"
            placeholder="Search for help articles, license questions..."
            type="text"
          />
        </div>
      </header>

      <section>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: "key", title: "Licensing FAQ", desc: "Manage your keys and reseller rights." },
            { icon: "build", title: "Technical Support", desc: "Get help with API and integrations." },
            { icon: "payments", title: "Billing Questions", desc: "Invoices, payouts, and subscriptions." },
            { icon: "trending_up", title: "Reseller Tips", desc: "Marketing strategies to scale fast." },
          ].map((item) => (
            <article key={item.title} className="group cursor-pointer rounded-xl p-6 transition-all glass gold-glow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary">
                <span className="material-symbols-outlined text-primary group-hover:text-background-dark">{item.icon}</span>
              </div>
              <h3 className="mb-1 text-lg font-bold">{item.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="flex items-center gap-2 text-2xl font-bold">
          <span className="material-symbols-outlined text-primary">auto_awesome</span>
          Featured Questions
        </h3>

        <div className="space-y-3">
          {[
            "How do I rebrand products for my own store?",
            "Where can I find my master license keys?",
            "Can I update my payout frequency to weekly?",
            "What is the policy for reselling to non-EU customers?",
          ].map((question) => (
            <div key={question} className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/5 dark:bg-surface-dark">
              <button className="group flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{question}</span>
                <span className="material-symbols-outlined text-primary transition-transform group-hover:rotate-90">add</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col justify-between rounded-2xl border-l-4 border-l-primary p-8 glass">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-primary">forum</span>
              <h3 className="text-xl font-bold">Live Chat</h3>
            </div>
            <p className="mb-6 leading-relaxed text-slate-500 dark:text-slate-400">
              Chat with our expert reseller success team in real-time. We&apos;re here to solve immediate issues.
            </p>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-500">
              <span className="size-2 animate-pulse rounded-full bg-emerald-500"></span>
              Response: ~5 mins
            </span>
            <Link
              href="/dashboard/community"
              className="rounded-lg bg-primary px-6 py-2.5 font-bold text-background-dark transition-transform hover:scale-105"
            >
              Start Chat
            </Link>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border-l-4 border-l-slate-600 p-8 glass">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-primary">confirmation_number</span>
              <h3 className="text-xl font-bold">Submit a Ticket</h3>
            </div>
            <p className="mb-6 leading-relaxed text-slate-500 dark:text-slate-400">
              For complex integrations or billing disputes, open a formal support ticket with our team.
            </p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Response: &lt; 24 hrs</span>
            <a
              href="#direct-ticket"
              className="rounded-lg bg-slate-200 px-6 py-2.5 font-bold text-slate-900 transition-all hover:bg-white dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            >
              Open Ticket
            </a>
          </div>
        </div>
      </section>

      <section>
        <div className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-2xl border border-[#5865F2]/30 bg-[#5865F2]/10 p-8 md:flex-row">
          <div className="flex items-center gap-6">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-[#5865F2] text-white shadow-xl">
              <span className="material-symbols-outlined">forum</span>
            </div>
            <div>
              <h4 className="text-xl font-bold">ProfitMRR Discord Community</h4>
              <p className="text-slate-500 dark:text-slate-400">Network with 5,000+ top resellers in real-time.</p>
            </div>
          </div>
          <Link
            href="/dashboard/community"
            className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-[#5865F2] px-8 py-3 font-bold text-white shadow-lg transition-all hover:bg-[#4752C4]"
          >
            Join Community
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </Link>
        </div>
      </section>

      <section id="direct-ticket" className="rounded-2xl p-8 glass">
        <h4 className="mb-4 text-lg font-bold text-white">Send a direct support ticket</h4>

        {sent ? (
          <div className="mb-5 rounded-xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Ticket sent. We&apos;ll reply as soon as possible.
          </div>
        ) : null}

        <form action={createTicket} className="grid gap-4">
          <input
            name="subject"
            required
            placeholder="Billing, access, downloads…"
            className="h-12 rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-white/30 focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <textarea
            name="message"
            required
            rows={5}
            placeholder="Tell us what’s going on…"
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <button className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-background-dark transition-all hover:bg-primary/90">
            Send ticket
          </button>
        </form>
      </section>
    </div>
  );
}

