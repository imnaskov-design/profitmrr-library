import Link from "next/link";

import { formatDateShort } from "@/lib/subscription";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { Reveal } from "@/components/ui/StaggerReveal";

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
      {/* Header */}
      <Reveal delay={0}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Users</h1>
          <p className="mt-1 text-sm text-zinc-500">
            CRM overview. For large datasets we&apos;ll move aggregations into SQL.
          </p>
        </div>
      </Reveal>

      {/* Filters */}
      <Reveal delay={100}>
        <GlassCard padding="md" className="overflow-hidden">
          <form
            method="GET"
            className="grid gap-3 md:grid-cols-4 md:items-end"
          >
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-zinc-600">Search email</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Search email…"
                  className="h-11 w-full rounded-xl border border-zinc-200/60 bg-white/80 pl-10 pr-3 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-600">Status</label>
              <select
                name="status"
                defaultValue={status}
                className="h-11 w-full rounded-xl border border-zinc-200/60 bg-white/80 px-3 text-sm text-zinc-900 outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/20"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <GlassButton type="submit" variant="primary" className="w-full md:w-auto">
              Apply
            </GlassButton>
          </form>
        </GlassCard>
      </Reveal>

      {/* Data Table */}
      <Reveal delay={200}>
        <GlassCard padding="none" className="overflow-hidden">
          <div className="border-b border-zinc-100 bg-zinc-50/50 px-5 py-4">
            <p className="text-sm font-semibold text-zinc-900">Results</p>
            <p className="text-xs text-zinc-500">{profiles?.length ?? 0} users found</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-zinc-50/80 text-xs font-semibold text-zinc-500">
                <tr>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Period end</th>
                  <th className="px-5 py-3.5">Downloads</th>
                  <th className="px-5 py-3.5">Last download</th>
                  <th className="px-5 py-3.5">Created</th>
                  <th className="px-5 py-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {(profiles ?? []).map((p) => (
                  <tr key={p.user_id} className="group transition-colors hover:bg-zinc-50/80">
                    <td className="px-5 py-3.5 font-medium text-zinc-900">{p.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`
                        inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur-sm
                        ${p.status === 'active' ? 'border-emerald-200/50 bg-emerald-50/80 text-emerald-700' : ''}
                        ${p.status === 'cancelled' ? 'border-amber-200/50 bg-amber-50/80 text-amber-700' : ''}
                        ${p.status === 'expired' ? 'border-red-200/50 bg-red-50/80 text-red-700' : ''}
                        ${p.status === 'inactive' ? 'border-zinc-200/50 bg-zinc-50/80 text-zinc-600' : ''}
                      `}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600">
                      {formatDateShort(p.current_period_end) ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600">
                      {(totals.get(p.user_id) ?? 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600">
                      {formatDateShort(lastAt.get(p.user_id) ?? null) ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600">
                      {formatDateShort(p.created_at) ?? "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/users/${p.user_id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
                      >
                        View
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
                {!profiles?.length ? (
                  <tr>
                    <td className="px-5 py-10 text-center text-sm text-zinc-500" colSpan={7}>
                      No users found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </Reveal>
    </div>
  );
}
