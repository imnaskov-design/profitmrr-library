import Link from "next/link";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminReleasesPage() {
  const supabase = await createSupabaseServerClient();

  const { data: items } = await supabase
    .from("library_items")
    .select("id, title, category, is_new, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const newCount = (items ?? []).filter((i) => i.is_new).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Releases</h1>
        <p className="mt-2 text-sm text-zinc-600">
          “New This Month” is driven by the `library_items.is_new` flag.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-zinc-900">Current flags</p>
        <p className="mt-2 text-sm text-zinc-600">
          Items marked new: <span className="font-semibold text-zinc-900">{newCount}</span>
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          Edit items in Library Manager to mark/unmark new releases.
        </p>
        <div className="mt-4">
          <Link
            href="/admin/library"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
          >
            Open Library Manager
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-5 py-4">
          <p className="text-sm font-semibold text-zinc-900">Recent items</p>
        </div>
        <ul className="divide-y divide-zinc-100">
          {(items ?? []).slice(0, 20).map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900">{i.title}</p>
                <p className="mt-1 text-xs text-zinc-500">{i.category}</p>
              </div>
              {i.is_new ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
                  New
                </span>
              ) : (
                <span className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-700">
                  —
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

