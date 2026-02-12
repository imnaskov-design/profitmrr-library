import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getAdminContext } from "@/lib/admin";
import { getSupabaseAdminEnv } from "@/lib/env/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function parseTags(input: string) {
  const tags = input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return tags.length ? tags : null;
}

export default async function AdminLibraryEditPage({
  params,
}: {
  params: { id: string };
}) {
  getSupabaseAdminEnv();

  const { isAdmin } = await getAdminContext();
  if (!isAdmin) redirect("/dashboard");

  const supabase = await createSupabaseServerClient();
  const { data: item } = await supabase
    .from("library_items")
    .select(
      "id, title, category, description, tags, r2_key, file_size_mb, is_new, starter_pack",
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!item) notFound();

  async function save(formData: FormData) {
    "use server";
    const { isAdmin } = await getAdminContext();
    if (!isAdmin) redirect("/dashboard");

    const itemId = String(formData.get("id") ?? "");
    const title = String(formData.get("title") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const tagsRaw = String(formData.get("tags") ?? "");
    const r2Key = String(formData.get("r2_key") ?? "").trim();
    const fileSizeRaw = String(formData.get("file_size_mb") ?? "").trim();
    const isNew = formData.get("is_new") === "on";
    const starterPack = formData.get("starter_pack") === "on";

    const fileSize = fileSizeRaw ? Number(fileSizeRaw) : null;
    const admin = createSupabaseAdminClient();

    await admin
      .from("library_items")
      .update({
        title,
        category,
        description: description || null,
        tags: parseTags(tagsRaw),
        r2_key: r2Key.replace(/^\/+/, ""),
        file_size_mb: Number.isFinite(fileSize) ? fileSize : null,
        is_new: isNew,
        starter_pack: starterPack,
      })
      .eq("id", itemId);

    redirect(`/admin/library/${itemId}`);
  }

  async function remove(formData: FormData) {
    "use server";
    const { isAdmin } = await getAdminContext();
    if (!isAdmin) redirect("/dashboard");

    const itemId = String(formData.get("id") ?? "");
    const admin = createSupabaseAdminClient();
    await admin.from("library_items").delete().eq("id", itemId);
    redirect("/admin/library");
  }

  const tagsString = item.tags?.join(", ") ?? "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Edit item</h1>
          <p className="mt-2 text-sm text-zinc-600">{item.title}</p>
        </div>
        <Link
          href="/admin/library"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
        >
          Back
        </Link>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <form action={save} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="id" value={item.id} />

          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-zinc-900">Title</span>
            <input
              name="title"
              required
              defaultValue={item.title}
              className="h-11 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-zinc-900">Category</span>
            <input
              name="category"
              required
              defaultValue={item.category}
              className="h-11 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
            />
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm font-semibold text-zinc-900">Description</span>
            <textarea
              name="description"
              rows={4}
              defaultValue={item.description ?? ""}
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
            />
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm font-semibold text-zinc-900">Tags (comma-separated)</span>
            <input
              name="tags"
              defaultValue={tagsString}
              className="h-11 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
            />
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm font-semibold text-zinc-900">R2 key (path)</span>
            <input
              name="r2_key"
              required
              defaultValue={item.r2_key}
              className="h-11 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-zinc-900">File size (MB)</span>
            <input
              name="file_size_mb"
              inputMode="decimal"
              defaultValue={item.file_size_mb ?? ""}
              className="h-11 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
            />
          </label>

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input type="checkbox" name="is_new" defaultChecked={item.is_new} className="h-4 w-4" />
              Mark as New This Month
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                name="starter_pack"
                defaultChecked={item.starter_pack}
                className="h-4 w-4"
              />
              Include in Starter Packs
            </label>
          </div>

          <div className="md:col-span-2 flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-red-700">Danger zone</p>
        <p className="mt-2 text-sm text-zinc-600">
          Deleting an item removes it from the library metadata (does not delete the file from R2).
        </p>
        <form action={remove} className="mt-4">
          <input type="hidden" name="id" value={item.id} />
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            Delete item
          </button>
        </form>
      </div>
    </div>
  );
}

