import { redirect } from "next/navigation";

import { getAdminContext } from "@/lib/admin";
import { getSupabaseAdminEnv } from "@/lib/env/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminSettingsPage() {
  getSupabaseAdminEnv();

  const supabase = await createSupabaseServerClient();
  const [{ data: community }, { data: announcement }] = await Promise.all([
    supabase
      .from("app_settings")
      .select("value")
      .eq("key", "community_link")
      .maybeSingle(),
    supabase
      .from("app_settings")
      .select("value")
      .eq("key", "announcement")
      .maybeSingle(),
  ]);

  async function save(formData: FormData) {
    "use server";
    const { isAdmin } = await getAdminContext();
    if (!isAdmin) redirect("/dashboard");

    const communityLink = String(formData.get("community_link") ?? "").trim();
    const announcementText = String(formData.get("announcement") ?? "").trim();

    const admin = createSupabaseAdminClient();
    await admin.from("app_settings").upsert(
      [
        { key: "community_link", value: communityLink || "" },
        { key: "announcement", value: announcementText || "" },
      ],
      { onConflict: "key" },
    );

    redirect("/admin/settings");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Settings</h1>
        <p className="mt-2 text-sm text-zinc-600">Community link and announcements.</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <form action={save} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-zinc-900">Community link</span>
            <input
              name="community_link"
              defaultValue={community?.value ?? ""}
              placeholder="Discord invite link…"
              className="h-11 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-zinc-900">Announcement banner</span>
            <textarea
              name="announcement"
              rows={6}
              defaultValue={announcement?.value ?? ""}
              placeholder="Member-only announcement text…"
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
            />
          </label>

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
          >
            Save settings
          </button>
        </form>
      </div>
    </div>
  );
}

