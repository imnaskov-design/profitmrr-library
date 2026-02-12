import Link from "next/link";

import { formatDateShort } from "@/lib/subscription";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const status = typeof searchParams?.status === "string" ? searchParams.status : "all";

  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("profiles")
    .select("user_id, email, status, current_period_end, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (status !== "all") query = query.eq("status", status);

  const { data: rows } = await query;

  const exportHref = `/api/admin/subscriptions/export${status !== "all" ? `?status=${encodeURIComponent(status)}` : ""}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Subscriptions
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Source of truth: `profiles.status` + `current_period_end`.
          </p>
        </div>
        <a
          href={exportHref}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
        >
          Export CSV
        </a>
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
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
            <option value="inactive">Inactive</option>
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
          <p className="text-sm font-semibold text-zinc-900">Results</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs font-semibold text-zinc-600">
              <tr>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Period end</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {(rows ?? []).map((r) => (
                <tr key={r.user_id} className="hover:bg-zinc-50">
                  <td className="px-5 py-3 font-medium text-zinc-900">{r.email}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-700">
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-zinc-700">
                    {formatDateShort(r.current_period_end) ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-zinc-700">{formatDateShort(r.created_at) ?? "—"}</td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/users/${r.user_id}`}
                      className="text-sm font-semibold text-zinc-900 underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {!rows?.length ? (
                <tr>
                  <td className="px-5 py-10 text-sm text-zinc-600" colSpan={5}>
                    No rows.
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

