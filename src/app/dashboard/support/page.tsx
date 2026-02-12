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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Support</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Send a ticket and we’ll get back to you.
        </p>
      </div>

      {sent ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
          Ticket sent. We’ll reply as soon as possible.
        </div>
      ) : null}

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <form action={createTicket} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-zinc-900">Subject</span>
            <input
              name="subject"
              required
              className="h-11 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
              placeholder="Billing, access, downloads…"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-zinc-900">Message</span>
            <textarea
              name="message"
              required
              rows={6}
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
              placeholder="Tell us what’s going on…"
            />
          </label>

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
          >
            Send ticket
          </button>

          <p className="text-xs text-zinc-500">
            No income guarantees. Please include screenshots and the email you used at checkout when relevant.
          </p>
        </form>
      </div>
    </div>
  );
}

