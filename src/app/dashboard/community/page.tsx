import Link from "next/link";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CommunityPage() {
  const supabase = await createSupabaseServerClient();

  const { data: communityLinkRow } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "community_link")
    .maybeSingle();

  const { data: announcementRow } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "announcement")
    .maybeSingle();

  const communityLink = communityLinkRow?.value ?? "";
  const announcement = announcementRow?.value ?? "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Community
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Join the community, get announcements, and share what’s working.
        </p>
      </div>

      {announcement ? (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-700">
          <p className="font-semibold text-zinc-900">Announcements</p>
          <p className="mt-2 whitespace-pre-wrap">{announcement}</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-600">
          No announcements yet.
        </div>
      )}

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-zinc-900">Join Community</p>
        <p className="mt-2 text-sm text-zinc-600">
          The invite link is stored in the `app_settings` table.
        </p>
        <div className="mt-4">
          {communityLink ? (
            <a
              href={communityLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
            >
              Join Community
            </a>
          ) : (
            <div className="text-sm text-zinc-600">
              Community link not set yet. Admins can set it in settings.
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-zinc-500">
          Looking for support? Use the{" "}
          <Link href="/dashboard/support" className="font-semibold text-zinc-900 underline">
            support
          </Link>
          {" "}page.
        </div>
      </div>
    </div>
  );
}

