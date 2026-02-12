import { redirect } from "next/navigation";

import { getAdminContext } from "@/lib/admin";
import { getSupabaseAdminEnv } from "@/lib/env/server";
import { formatDateShort } from "@/lib/subscription";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  getSupabaseAdminEnv();

  const status = typeof searchParams?.status === "string" ? searchParams.status : "all";

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("requests")
    .select("id, user_id, title, details, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (status !== "all") query = query.eq("status", status);
  const { data: items } = await query;

  async function updateStatus(formData: FormData) {
    "use server";
    const { isAdmin } = await getAdminContext();
    if (!isAdmin) redirect("/dashboard");

    const id = String(formData.get("id") ?? "");
    const newStatus = String(formData.get("status") ?? "");
    const admin = createSupabaseAdminClient();
    await admin.from("requests")
      .update({ status: newStatus })
      .eq("id", id);
    redirect("/admin/requests");
  }

  async function remove(formData: FormData) {
    "use server";
    const { isAdmin } = await getAdminContext();
    if (!isAdmin) redirect("/dashboard");

    const id = String(formData.get("id") ?? "");
    const admin = createSupabaseAdminClient();
    await admin.from("requests").delete().eq("id", id);
    redirect("/admin/requests");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Requests & Moderation
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Update request status or delete spam.
        </p>
      </div>

      <form
        method="GET"
        className="flex flex-wrap gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
      >
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-zinc-700">Status</span>
          <select
            name="status"
            defaultValue={status}
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="planned">Planned</option>
            <option value="released">Released</option>
            <option value="closed">Closed</option>
          </select>
        </label>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
        >
          Apply
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-5 py-4">
          <p className="text-sm font-semibold text-zinc-900">Requests</p>
        </div>

        <ul className="divide-y divide-zinc-100">
          {(items ?? []).map((r) => (
            <li key={r.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900">{r.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {r.status} • {formatDateShort(r.created_at) ?? "—"}
                  </p>
                  {r.details ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600">{r.details}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-zinc-500">User: {r.user_id}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <form action={updateStatus} className="flex gap-2">
                    <input type="hidden" name="id" value={r.id} />
                    <select
                      name="status"
                      defaultValue={r.status}
                      className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900"
                    >
                      <option value="open">Open</option>
                      <option value="planned">Planned</option>
                      <option value="released">Released</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button
                      type="submit"
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
                    >
                      Save
                    </button>
                  </form>

                  <form action={remove}>
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      type="submit"
                      className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
          {!items?.length ? (
            <li className="px-5 py-10 text-sm text-zinc-600">No requests yet.</li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}

