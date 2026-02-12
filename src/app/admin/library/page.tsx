import Link from "next/link";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function AdminLibraryPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const q = typeof searchParams?.q === "string" ? searchParams.q.trim() : "";

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("library_items")
    .select(
      "id, title, category, is_new, starter_pack, r2_key, file_size_mb, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (q) query = query.ilike("title", `%${q}%`);

  const { data: items } = await query;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Library Manager
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Metadata only. Upload files to R2 separately, then paste the `r2_key` path.
          </p>
        </div>
        <Link
          href="/admin/library/new"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
        >
          New item
        </Link>
      </div>

      <form method="GET" className="flex gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search title…"
          className="h-11 flex-1 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
        />
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
        >
          Search
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-5 py-4">
          <p className="text-sm font-semibold text-zinc-900">Items</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs font-semibold text-zinc-600">
              <tr>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">New</th>
                <th className="px-5 py-3">Starter</th>
                <th className="px-5 py-3">r2_key</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {(items ?? []).map((i) => (
                <tr key={i.id} className="hover:bg-zinc-50">
                  <td className="px-5 py-3 font-medium text-zinc-900">{i.title}</td>
                  <td className="px-5 py-3 text-zinc-700">{i.category}</td>
                  <td className="px-5 py-3 text-zinc-700">{i.is_new ? "Yes" : "No"}</td>
                  <td className="px-5 py-3 text-zinc-700">{i.starter_pack ? "Yes" : "No"}</td>
                  <td className="px-5 py-3 text-xs text-zinc-600">{i.r2_key}</td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/library/${i.id}`}
                      className="text-sm font-semibold text-zinc-900 underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {!items?.length ? (
                <tr>
                  <td className="px-5 py-10 text-sm text-zinc-600" colSpan={6}>
                    No items.
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

