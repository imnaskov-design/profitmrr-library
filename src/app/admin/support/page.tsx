import { redirect } from "next/navigation";

import { getAdminContext } from "@/lib/admin";
import { getSupabaseAdminEnv } from "@/lib/env/server";
import { formatDateShort } from "@/lib/subscription";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminSupportTicketsPage() {
  getSupabaseAdminEnv();

  const supabase = await createSupabaseServerClient();
  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("id, user_id, subject, message, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  async function updateStatus(formData: FormData) {
    "use server";
    const { isAdmin } = await getAdminContext();
    if (!isAdmin) redirect("/dashboard");

    const id = String(formData.get("id") ?? "");
    const status = String(formData.get("status") ?? "open");
    const admin = createSupabaseAdminClient();
    await admin.from("support_tickets").update({ status }).eq("id", id);
    redirect("/admin/support");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Support Tickets
        </h1>
        <p className="mt-2 text-sm text-zinc-600">Basic support queue.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-5 py-4">
          <p className="text-sm font-semibold text-zinc-900">Tickets</p>
        </div>

        <ul className="divide-y divide-zinc-100">
          {(tickets ?? []).map((t) => (
            <li key={t.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900">{t.subject}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {t.status} • {formatDateShort(t.created_at) ?? "—"}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600">{t.message}</p>
                  <p className="mt-2 text-xs text-zinc-500">User: {t.user_id}</p>
                </div>
                <form action={updateStatus} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={t.id} />
                  <select
                    name="status"
                    defaultValue={t.status}
                    className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
                  >
                    Save
                  </button>
                </form>
              </div>
            </li>
          ))}
          {!tickets?.length ? (
            <li className="px-5 py-10 text-sm text-zinc-600">No tickets yet.</li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}

