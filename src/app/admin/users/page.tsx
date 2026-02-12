import Link from "next/link";

import { formatDateShort } from "@/lib/subscription";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const q = typeof searchParams?.q === "string" ? searchParams.q.trim() : "";
  const status = typeof searchParams?.status === "string" ? searchParams.status : "all";

  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("profiles")
    .select("user_id, email, status, current_period_end, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (q) query = query.ilike("email", `%${q}%`);
  if (status !== "all") query = query.eq("status", status);

  const { data: profiles } = await query;

  const userIds = (profiles ?? []).map((p) => p.user_id);
  const { data: logs } = userIds.length
    ? await supabase
        .from("download_logs")
        .select("user_id, created_at")
        .in("user_id", userIds)
        .order("created_at", { ascending: false })
        .limit(20000)
    : { data: [] };

  const totals = new Map<string, number>();
  const lastAt = new Map<string, string>();
  for (const row of logs ?? []) {
    totals.set(row.user_id, (totals.get(row.user_id) ?? 0) + 1);
    if (!lastAt.has(row.user_id)) lastAt.set(row.user_id, row.created_at);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Users</h1>
        <p className="mt-2 text-sm text-zinc-600">
          CRM overview. For large datasets we’ll move aggregations into SQL.
        </p>
      </div>

      <form
        method="GET"
        className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-4 md:items-end"
      >
        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-xs font-semibold text-zinc-700">Search email</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search email…"
            className="h-11 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-zinc-700">Status</span>
          <select
            name="status"
            defaultValue={status}
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>

        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
        >
          Apply
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-5 py-4">
          <p className="text-sm font-semibold text-zinc-900">Results</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs font-semibold text-zinc-600">
              <tr>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Period end</th>
                <th className="px-5 py-3">Downloads</th>
                <th className="px-5 py-3">Last download</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {(profiles ?? []).map((p) => (
                <tr key={p.user_id} className="hover:bg-zinc-50">
                  <td className="px-5 py-3 font-medium text-zinc-900">{p.email}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-700">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-zinc-700">
                    {formatDateShort(p.current_period_end) ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-zinc-700">
                    {(totals.get(p.user_id) ?? 0).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-zinc-700">
                    {formatDateShort(lastAt.get(p.user_id) ?? null) ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-zinc-700">
                    {formatDateShort(p.created_at) ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/users/${p.user_id}`}
                      className="text-sm font-semibold text-zinc-900 underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {!profiles?.length ? (
                <tr>
                  <td className="px-5 py-10 text-sm text-zinc-600" colSpan={7}>
                    No users found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

