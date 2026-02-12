import Link from "next/link";
import { redirect } from "next/navigation";

import { getAdminContext } from "@/lib/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function audienceLabel(value: string) {
  switch (value) {
    case "active":
      return "Active";
    case "cancelled":
      return "Cancelled";
    case "expired":
      return "Expired";
    case "all":
      return "All";
    default:
      return value;
  }
}

export default async function AdminEmailCampaignsPage() {
  const { isAdmin } = await getAdminContext();
  if (!isAdmin) redirect("/dashboard");

  const supabase = await createSupabaseServerClient();
  const { data: campaigns } = await supabase
    .from("email_campaigns")
    .select("id, subject, audience, status, created_at, sent_at")
    .order("created_at", { ascending: false })
    .limit(50);

  async function createCampaign(formData: FormData) {
    "use server";
    const { user, isAdmin } = await getAdminContext();
    if (!user) redirect("/login?next=/admin");
    if (!isAdmin) redirect("/dashboard");

    const subject = String(formData.get("subject") ?? "").trim();
    const previewText = String(formData.get("preview_text") ?? "").trim();
    const body = String(formData.get("body_markdown") ?? "").trim();
    const audience = String(formData.get("audience") ?? "all").trim();

    if (!subject || !body) {
      redirect("/admin/email-campaigns");
    }

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("email_campaigns")
      .insert({
        subject,
        preview_text: previewText || null,
        body_markdown: body,
        audience,
        status: "draft",
        created_by: user.id,
      })
      .select("id")
      .maybeSingle();

    if (error || !data?.id) {
      redirect("/admin/email-campaigns");
    }

    redirect(`/admin/email-campaigns/${data.id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Email Campaigns
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Create a campaign, then send to a segment. Every email includes an unsubscribe link.
          </p>
        </div>

        <a
          href="/api/admin/email/export?audience=active"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
        >
          Export active CSV
        </a>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">New campaign</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Body supports basic markdown. Keep it simple and value-led.
          </p>

          <form action={createCampaign} className="mt-5 grid gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-zinc-700">Audience</span>
              <select
                name="audience"
                defaultValue="active"
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
              >
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
                <option value="all">All</option>
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-zinc-700">Subject</span>
              <input
                name="subject"
                required
                className="h-11 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
                placeholder="This month’s drop is live…"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-zinc-700">Preview text (optional)</span>
              <input
                name="preview_text"
                className="h-11 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
                placeholder="Quick summary shown in inbox previews"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-zinc-700">Body (markdown)</span>
              <textarea
                name="body_markdown"
                required
                rows={10}
                className="rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
                placeholder={`Hey there!\n\nThis month we added…\n\n- 10 new Canva templates\n- 3 planner packs\n\nDownload inside your dashboard.`}
              />
            </label>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
            >
              Create campaign
            </button>
          </form>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 px-5 py-4">
            <p className="text-sm font-semibold text-zinc-900">Recent campaigns</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-zinc-50 text-xs font-semibold text-zinc-600">
                <tr>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Audience</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {(campaigns ?? []).map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50">
                    <td className="px-5 py-3 font-medium text-zinc-900">{c.subject}</td>
                    <td className="px-5 py-3 text-zinc-700">{audienceLabel(c.audience)}</td>
                    <td className="px-5 py-3 text-zinc-700">
                      <span className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-700">
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/email-campaigns/${c.id}`}
                        className="text-sm font-semibold text-zinc-900 underline"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
                {!campaigns?.length ? (
                  <tr>
                    <td className="px-5 py-10 text-sm text-zinc-600" colSpan={4}>
                      No campaigns yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

