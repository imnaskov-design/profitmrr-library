import Link from "next/link";
import { redirect } from "next/navigation";

import { getAdminContext } from "@/lib/admin";
import { getSupabaseAdminEnv } from "@/lib/env/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function parseTags(input: string) {
  const tags = input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return tags.length ? tags : null;
}

export default function AdminLibraryNewPage() {
  getSupabaseAdminEnv();

  async function createItem(formData: FormData) {
    "use server";
    const { isAdmin } = await getAdminContext();
    if (!isAdmin) redirect("/dashboard");

    const title = String(formData.get("title") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const tagsRaw = String(formData.get("tags") ?? "");
    const r2Key = String(formData.get("r2_key") ?? "").trim();
    const fileSizeRaw = String(formData.get("file_size_mb") ?? "").trim();
    const isNew = formData.get("is_new") === "on";
    const starterPack = formData.get("starter_pack") === "on";

    if (!title || !category || !r2Key) {
      redirect("/admin/library/new");
    }

    const fileSize = fileSizeRaw ? Number(fileSizeRaw) : null;

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("library_items")
      .insert({
        title,
        category,
        description: description || null,
        tags: parseTags(tagsRaw),
        r2_key: r2Key.replace(/^\/+/, ""),
        file_size_mb: Number.isFinite(fileSize) ? fileSize : null,
        is_new: isNew,
        starter_pack: starterPack,
      })
      .select("id")
      .maybeSingle();

    if (error || !data?.id) {
      redirect("/admin/library/new");
    }

    redirect(`/admin/library/${data.id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            New library item
          </h1>
          <p className="mt-2 text-sm text-zinc-600">Metadata only (R2 upload is separate).</p>
        </div>
        <Link
          href="/admin/library"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
        >
          Back
        </Link>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <form action={createItem} className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-zinc-900">Title</span>
            <input
              name="title"
              required
              className="h-11 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-zinc-900">Category</span>
            <input
              name="category"
              required
              className="h-11 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
              placeholder="Ebooks, Courses, Canva Templates…"
            />
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm font-semibold text-zinc-900">Description</span>
            <textarea
              name="description"
              rows={4}
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
              placeholder="Short benefit-led description…"
            />
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm font-semibold text-zinc-900">Tags (comma-separated)</span>
            <input
              name="tags"
              className="h-11 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
              placeholder="planner, canva, productivity"
            />
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm font-semibold text-zinc-900">R2 key (path)</span>
            <input
              name="r2_key"
              required
              className="h-11 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
              placeholder="library/ebooks/your-file.zip"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-zinc-900">File size (MB)</span>
            <input
              name="file_size_mb"
              inputMode="decimal"
              className="h-11 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
              placeholder="12.5"
            />
          </label>

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input type="checkbox" name="is_new" className="h-4 w-4" />
              Mark as New This Month
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input type="checkbox" name="starter_pack" className="h-4 w-4" />
              Include in Starter Packs
            </label>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
            >
              Create item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

