import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function StarterPacksPage() {
  const supabase = await createSupabaseServerClient();
  const { data: items } = await supabase
    .from("library_items")
    .select("id, title, category, description, file_size_mb")
    .eq("starter_pack", true)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Starter Packs
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Curated packs for beginners — publish faster with a “start here” bundle.
        </p>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-zinc-900">Start Here Pack</p>
        <p className="mt-2 text-sm text-zinc-600">
          The best place to begin. We’ll keep this pack simple and high-impact.
        </p>
        <p className="mt-3 text-xs text-zinc-500">
          Downloads are enabled next (R2 signed downloads + fair-use limits).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items && items.length ? (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-zinc-900">{item.title}</p>
              <p className="mt-1 text-xs text-zinc-500">{item.category}</p>
              {item.description ? (
                <p className="mt-3 text-sm text-zinc-600">{item.description}</p>
              ) : null}
              <div className="mt-4 text-xs text-zinc-500">
                {item.file_size_mb ? `${item.file_size_mb} MB` : "Size: —"}
              </div>
              <a
                href={`/api/download?id=${item.id}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
              >
                Download
              </a>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-sm text-zinc-600 sm:col-span-2 lg:col-span-3">
            No starter packs yet. Mark items with `starter_pack = true` to show them here.
          </div>
        )}
      </div>
    </div>
  );
}

