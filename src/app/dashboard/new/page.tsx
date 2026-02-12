import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function NewThisMonthPage() {
  const supabase = await createSupabaseServerClient();
  const { data: items } = await supabase
    .from("library_items")
    .select("id, title, category, description, tags, file_size_mb, created_at")
    .eq("is_new", true)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          New This Month
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Fresh releases added this month (flagged as “New”).
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-700">
        <p className="font-semibold text-zinc-900">Release notes</p>
        <p className="mt-2">
          Notes will appear here once the admin adds a short update for this month.
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
              <div className="mt-4 flex items-center justify-between gap-3 text-xs text-zinc-500">
                <span>
                  {item.file_size_mb ? `${item.file_size_mb} MB` : "Size: —"}
                </span>
                <a
                  href={`/api/download?id=${item.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-zinc-900 underline"
                >
                  Download
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-sm text-zinc-600 sm:col-span-2 lg:col-span-3">
            Nothing has been marked as “New This Month” yet.
          </div>
        )}
      </div>
    </div>
  );
}

