import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getAdminContext } from "@/lib/admin";
import { getSupabaseAdminEnv } from "@/lib/env/server";
import { formatDateShort } from "@/lib/subscription";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminUserDetailPage({
  params,
}: {
  params: { userId: string };
}) {
  getSupabaseAdminEnv();

  const { isAdmin } = await getAdminContext();
  if (!isAdmin) redirect("/dashboard");

  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "user_id, email, status, current_period_end, role, ls_customer_id, ls_subscription_id, created_at",
    )
    .eq("user_id", params.userId)
    .maybeSingle();

  if (!profile) notFound();

  const [{ data: notes }, { data: tags }, { data: logs }] = await Promise.all([
    supabase
      .from("user_notes")
      .select("id, note, created_at")
      .eq("user_id", profile.user_id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("user_tags")
      .select("id, tag, created_at")
      .eq("user_id", profile.user_id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("download_logs")
      .select(
        "id, created_at, library_item:library_items ( id, title, category, file_size_mb )",
      )
      .eq("user_id", profile.user_id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  async function grantOneYear(formData: FormData) {
    "use server";
    const uid = String(formData.get("user_id") ?? "");
    const { isAdmin } = await getAdminContext();
    if (!isAdmin) redirect("/dashboard");

    const admin = createSupabaseAdminClient();
    const end = new Date();
    end.setDate(end.getDate() + 365);

    await admin
      .from("profiles")
      .update({ status: "active", current_period_end: end.toISOString() })
      .eq("user_id", uid);

    redirect(`/admin/users/${uid}`);
  }

  async function revokeNow(formData: FormData) {
    "use server";
    const uid = String(formData.get("user_id") ?? "");
    const { isAdmin } = await getAdminContext();
    if (!isAdmin) redirect("/dashboard");

    const admin = createSupabaseAdminClient();
    await admin
      .from("profiles")
      .update({ status: "expired", current_period_end: new Date().toISOString() })
      .eq("user_id", uid);

    redirect(`/admin/users/${uid}`);
  }

  async function addNote(formData: FormData) {
    "use server";
    const uid = String(formData.get("user_id") ?? "");
    const note = String(formData.get("note") ?? "").trim();
    if (!note) redirect(`/admin/users/${uid}`);

    const { isAdmin } = await getAdminContext();
    if (!isAdmin) redirect("/dashboard");

    const admin = createSupabaseAdminClient();
    await admin.from("user_notes").insert({ user_id: uid, note });
    redirect(`/admin/users/${uid}`);
  }

  async function addTag(formData: FormData) {
    "use server";
    const uid = String(formData.get("user_id") ?? "");
    const tag = String(formData.get("tag") ?? "").trim();
    if (!tag) redirect(`/admin/users/${uid}`);

    const { isAdmin } = await getAdminContext();
    if (!isAdmin) redirect("/dashboard");

    const admin = createSupabaseAdminClient();
    await admin
      .from("user_tags")
      .upsert({ user_id: uid, tag }, { onConflict: "user_id,tag" });
    redirect(`/admin/users/${uid}`);
  }

  async function removeTag(formData: FormData) {
    "use server";
    const uid = String(formData.get("user_id") ?? "");
    const tagId = String(formData.get("tag_id") ?? "");

    const { isAdmin } = await getAdminContext();
    if (!isAdmin) redirect("/dashboard");

    const admin = createSupabaseAdminClient();
    await admin.from("user_tags").delete().eq("id", tagId).eq("user_id", uid);
    redirect(`/admin/users/${uid}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            User detail
          </h1>
          <p className="mt-2 text-sm text-zinc-600">{profile.email}</p>
        </div>
        <Link
          href="/admin/users"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
        >
          Back to users
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Status" value={profile.status} />
        <InfoCard
          label="Period end"
          value={formatDateShort(profile.current_period_end) ?? "—"}
        />
        <InfoCard label="Created" value={formatDateShort(profile.created_at) ?? "—"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Subscription identifiers</h2>
          <div className="mt-4 space-y-2 text-sm text-zinc-700">
            <Row label="ls_customer_id" value={profile.ls_customer_id ?? "—"} />
            <Row label="ls_subscription_id" value={profile.ls_subscription_id ?? "—"} />
            <Row label="role" value={profile.role} />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Quick actions</h2>
          <div className="mt-4 flex flex-col gap-2">
            <form action={grantOneYear}>
              <input type="hidden" name="user_id" value={profile.user_id} />
              <button
                type="submit"
                className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
              >
                Grant access (1 year)
              </button>
            </form>

            <form action={revokeNow}>
              <input type="hidden" name="user_id" value={profile.user_id} />
              <button
                type="submit"
                className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
              >
                Revoke access (expire now)
              </button>
            </form>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Tags</h2>
          <form action={addTag} className="mt-4 flex gap-2">
            <input type="hidden" name="user_id" value={profile.user_id} />
            <input
              name="tag"
              placeholder="Add tag…"
              className="h-10 flex-1 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
            />
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
            >
              Add
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {(tags ?? []).length ? (
              tags?.map((t) => (
                <form key={t.id} action={removeTag} className="inline-flex">
                  <input type="hidden" name="user_id" value={profile.user_id} />
                  <input type="hidden" name="tag_id" value={t.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-800 hover:bg-zinc-50"
                    title="Remove tag"
                  >
                    {t.tag}
                    <span className="text-zinc-400">×</span>
                  </button>
                </form>
              ))
            ) : (
              <p className="text-sm text-zinc-600">No tags yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Notes</h2>
          <form action={addNote} className="mt-4 flex flex-col gap-2">
            <input type="hidden" name="user_id" value={profile.user_id} />
            <textarea
              name="note"
              rows={4}
              placeholder="Add a note…"
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
            />
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
            >
              Save note
            </button>
          </form>

          <div className="mt-5 space-y-3">
            {(notes ?? []).length ? (
              notes?.map((n) => (
                <div
                  key={n.id}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
                >
                  <p className="whitespace-pre-wrap text-sm text-zinc-900">{n.note}</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {formatDateShort(n.created_at) ?? "—"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-600">No notes yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Download history</h2>
          <p className="mt-2 text-sm text-zinc-600">Most recent downloads.</p>

          <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200">
            {(logs ?? []).length ? (
              <ul className="divide-y divide-zinc-100">
                {logs?.map((l) => (
                  <li key={l.id} className="px-4 py-3">
                    {(() => {
                      const libraryItem = Array.isArray(l.library_item)
                        ? l.library_item[0]
                        : l.library_item;

                      return (
                        <>
                    <p className="text-sm font-medium text-zinc-900">
                      {libraryItem?.title ?? "(deleted item)"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {libraryItem?.category ?? ""} • {formatDateShort(l.created_at) ?? "—"}
                    </p>
                    {libraryItem?.id ? (
                      <div className="mt-2">
                        <a
                          href={`/api/download?id=${libraryItem.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-zinc-900 underline"
                        >
                          Download
                        </a>
                      </div>
                    ) : null}
                        </>
                      );
                    })()}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-10 text-sm text-zinc-600">No downloads yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <p className="text-xs font-semibold text-zinc-500">{label}</p>
      <p className="break-all text-sm font-medium text-zinc-900">{value}</p>
    </div>
  );
}

