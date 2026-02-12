import Link from "next/link";

import { getServerEnv } from "@/lib/env/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function MyDownloadsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id;

  const limit = getServerEnv().DOWNLOADS_PER_DAY_LIMIT;
  const now = new Date();
  const since = new Date(now);
  since.setHours(since.getHours() - 24);
  const sinceIso = since.toISOString();
  const { count: used } = userId
    ? await supabase
        .from("download_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", sinceIso)
    : { count: 0 };
  const usedSafe = used ?? 0;
  const remaining = Math.max(0, limit - usedSafe);

  const { data: logs } = userId
    ? await supabase
        .from("download_logs")
        .select(
          "id, created_at, library_item:library_items ( id, title, category, file_size_mb )",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          My Downloads
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Your download history (re-downloads stay gated to your subscription).
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-700">
        <p className="font-semibold text-zinc-900">Fair-use</p>
        <p className="mt-2">
          We enforce daily download limits per user to discourage dumping. You’ll see a live limit indicator
          once downloads are enabled.
        </p>
        <p className="mt-2">
          Downloads in the last 24h: <span className="font-semibold">{usedSafe}</span> / {limit}
          {" "}
          <span className="text-zinc-500">({remaining} remaining)</span>
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-5 py-4">
          <p className="text-sm font-semibold text-zinc-900">History</p>
        </div>

        {logs && logs.length ? (
          <ul className="divide-y divide-zinc-100">
            {logs.map((row) => {
              const item = Array.isArray(row.library_item)
                ? row.library_item[0]
                : row.library_item;

              return (
                <li key={row.id} className="flex items-center justify-between gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900">
                      {item?.title ?? "(deleted item)"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">{item?.category ?? ""}</p>
                  </div>
                  {item?.id ? (
                    <a
                      href={`/api/download?id=${item.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center justify-center rounded-xl bg-zinc-900 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800"
                    >
                      Re-download
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex h-9 items-center justify-center rounded-xl bg-zinc-900 px-3 text-xs font-semibold text-white opacity-50"
                    >
                      Unavailable
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="px-5 py-10 text-sm text-zinc-600">
            No downloads yet. Browse the{" "}
            <Link href="/dashboard/library" className="font-semibold text-zinc-900 underline">
              library
            </Link>
            .
          </div>
        )}
      </div>
    </div>
  );
}

