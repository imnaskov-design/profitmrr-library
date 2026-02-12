import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getAdminContext } from "@/lib/admin";
import { getEmailEnv, getServerEnv } from "@/lib/env/server";
import { renderCampaignEmail } from "@/lib/email/render";
import { sendResendEmail } from "@/lib/email/resend";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type SearchParams = { [key: string]: string | string[] | undefined };

const MAX_SEND_PER_RUN = 200;
const PROFILE_PAGE_SIZE = 500;

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

function noticeFromSearchParams(searchParams?: SearchParams) {
  const raw = typeof searchParams?.notice === "string" ? searchParams.notice : "";
  return raw ? raw.slice(0, 300) : null;
}

function errorFromSearchParams(searchParams?: SearchParams) {
  const raw = typeof searchParams?.error === "string" ? searchParams.error : "";
  return raw ? raw.slice(0, 300) : null;
}

export default async function AdminEmailCampaignDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: SearchParams;
}) {
  const { user, isAdmin } = await getAdminContext();
  if (!user) redirect("/login?next=/admin");
  if (!isAdmin) redirect("/dashboard");

  const admin = createSupabaseAdminClient();
  const { data: campaign } = await admin
    .from("email_campaigns")
    .select("id, subject, preview_text, body_markdown, audience, status, created_at, sent_at")
    .eq("id", params.id)
    .maybeSingle();

  if (!campaign) notFound();

  const [sentCountRes, failedCountRes, queuedCountRes, recentSendsRes] = await Promise.all([
    admin
      .from("email_sends")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", campaign.id)
      .eq("status", "sent"),
    admin
      .from("email_sends")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", campaign.id)
      .eq("status", "failed"),
    admin
      .from("email_sends")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", campaign.id)
      .eq("status", "queued"),
    admin
      .from("email_sends")
      .select("id, email, status, error, created_at, sent_at")
      .eq("campaign_id", campaign.id)
      .order("created_at", { ascending: false })
      .limit(25),
  ]);

  const sentCount = sentCountRes.count ?? 0;
  const failedCount = failedCountRes.count ?? 0;
  const queuedCount = queuedCountRes.count ?? 0;
  const recentSends = recentSendsRes.data ?? [];

  async function saveCampaign(formData: FormData) {
    "use server";
    const { isAdmin } = await getAdminContext();
    if (!isAdmin) redirect("/dashboard");

    const id = String(formData.get("id") ?? "");
    const subject = String(formData.get("subject") ?? "").trim();
    const previewText = String(formData.get("preview_text") ?? "").trim();
    const body = String(formData.get("body_markdown") ?? "").trim();
    const audience = String(formData.get("audience") ?? "all").trim();

    if (!id || !subject || !body) {
      redirect(`/admin/email-campaigns/${encodeURIComponent(params.id)}`);
    }

    const admin = createSupabaseAdminClient();
    await admin
      .from("email_campaigns")
      .update({
        subject,
        preview_text: previewText || null,
        body_markdown: body,
        audience,
      })
      .eq("id", id);

    redirect(`/admin/email-campaigns/${encodeURIComponent(id)}?notice=${encodeURIComponent("Saved")}`);
  }

  async function testSend() {
    "use server";
    const { user, isAdmin } = await getAdminContext();
    if (!user) redirect("/login?next=/admin");
    if (!isAdmin) redirect("/dashboard");

    if (!user.email) {
      redirect(`/admin/email-campaigns/${encodeURIComponent(params.id)}?error=${encodeURIComponent("Missing email on admin user")}`);
    }

    try {
      getEmailEnv();
      const env = getServerEnv();
      const baseUrl = env.APP_BASE_URL.replace(/\/$/, "");
      const adminClient = createSupabaseAdminClient();

      // Ensure we have a token for unsubscribe links.
      await adminClient
        .from("email_preferences")
        .upsert({ user_id: user.id, email: user.email.toLowerCase() }, { onConflict: "user_id" });

      const { data: pref } = await adminClient
        .from("email_preferences")
        .select("token")
        .eq("user_id", user.id)
        .maybeSingle();

      const token = pref?.token;
      if (!token) {
        redirect(`/admin/email-campaigns/${encodeURIComponent(params.id)}?error=${encodeURIComponent("Unable to create unsubscribe token")}`);
      }

      const { data: campaign } = await adminClient
        .from("email_campaigns")
        .select("id, subject, preview_text, body_markdown")
        .eq("id", params.id)
        .maybeSingle();
      if (!campaign) {
        redirect(`/admin/email-campaigns/${encodeURIComponent(params.id)}?error=${encodeURIComponent("Campaign not found")}`);
      }

      const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${encodeURIComponent(token)}`;
      const rendered = renderCampaignEmail({
        subject: campaign.subject,
        previewText: campaign.preview_text,
        bodyMarkdown: campaign.body_markdown,
        unsubscribeUrl,
      });

      const sendRes = await sendResendEmail({
        to: user.email,
        subject: `[TEST] ${campaign.subject}`,
        html: rendered.html,
        text: rendered.text,
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
        },
      });

      await adminClient.from("email_sends").insert({
        campaign_id: campaign.id,
        user_id: null,
        email: user.email.toLowerCase(),
        status: "sent",
        provider: "resend",
        provider_message_id: sendRes.id,
        sent_at: new Date().toISOString(),
      });

      redirect(`/admin/email-campaigns/${encodeURIComponent(params.id)}?notice=${encodeURIComponent("Test email sent")}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to send test email";
      redirect(`/admin/email-campaigns/${encodeURIComponent(params.id)}?error=${encodeURIComponent(msg)}`);
    }
  }

  async function sendNow() {
    "use server";
    const { isAdmin } = await getAdminContext();
    if (!isAdmin) redirect("/dashboard");

    try {
      getEmailEnv();
      const env = getServerEnv();
      const baseUrl = env.APP_BASE_URL.replace(/\/$/, "");
      const adminClient = createSupabaseAdminClient();

      const { data: campaign } = await adminClient
        .from("email_campaigns")
        .select("id, subject, preview_text, body_markdown, audience, status, sent_at")
        .eq("id", params.id)
        .maybeSingle();

      if (!campaign) {
        redirect(`/admin/email-campaigns/${encodeURIComponent(params.id)}?error=${encodeURIComponent("Campaign not found")}`);
      }

      if (campaign.status === "sending") {
        redirect(`/admin/email-campaigns/${encodeURIComponent(params.id)}?notice=${encodeURIComponent("Already sending")}`);
      }

      await adminClient.from("email_campaigns").update({ status: "sending" }).eq("id", campaign.id);

      let totalSent = 0;
      let offset = 0;

      while (totalSent < MAX_SEND_PER_RUN) {
        let query = adminClient
          .from("profiles")
          .select("user_id, email, status, created_at")
          .order("created_at", { ascending: false })
          .range(offset, offset + PROFILE_PAGE_SIZE - 1);

        if (campaign.audience && campaign.audience !== "all") {
          query = query.eq("status", campaign.audience);
        }

        const { data: batch } = await query;
        if (!batch?.length) break;
        offset += PROFILE_PAGE_SIZE;

        const recipients = batch
          .map((r) => ({
            userId: r.user_id as string,
            email: String(r.email ?? "").toLowerCase(),
          }))
          .filter((r) => r.userId && r.email.includes("@"));

        if (!recipients.length) continue;

        // Ensure preferences exist (token for unsubscribe, plus unsubscribed filtering).
        await adminClient
          .from("email_preferences")
          .upsert(
            recipients.map((r) => ({ user_id: r.userId, email: r.email })),
            { onConflict: "user_id" },
          );

        const { data: prefs } = await adminClient
          .from("email_preferences")
          .select("user_id, token, unsubscribed")
          .in(
            "user_id",
            recipients.map((r) => r.userId),
          );

        const prefByUser = new Map<string, { token: string; unsubscribed: boolean }>();
        for (const p of prefs ?? []) {
          if (!p.user_id || !p.token) continue;
          prefByUser.set(p.user_id, {
            token: p.token,
            unsubscribed: !!p.unsubscribed,
          });
        }

        for (const r of recipients) {
          if (totalSent >= MAX_SEND_PER_RUN) break;
          const pref = prefByUser.get(r.userId);
          if (!pref || pref.unsubscribed) continue;

          // Claim send row first (idempotent per user/campaign).
          const { data: sendRow, error: insertError } = await adminClient
            .from("email_sends")
            .insert({
              campaign_id: campaign.id,
              user_id: r.userId,
              email: r.email,
              status: "queued",
              provider: "resend",
            })
            .select("id")
            .maybeSingle();

          if (insertError) {
            if ((insertError as { code?: string }).code === "23505") {
              continue;
            }
            continue;
          }

          const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${encodeURIComponent(pref.token)}`;
          const rendered = renderCampaignEmail({
            subject: campaign.subject,
            previewText: campaign.preview_text,
            bodyMarkdown: campaign.body_markdown,
            unsubscribeUrl,
          });

          try {
            const sendRes = await sendResendEmail({
              to: r.email,
              subject: campaign.subject,
              html: rendered.html,
              text: rendered.text,
              headers: {
                "List-Unsubscribe": `<${unsubscribeUrl}>`,
              },
            });

            await adminClient
              .from("email_sends")
              .update({
                status: "sent",
                provider_message_id: sendRes.id,
                sent_at: new Date().toISOString(),
              })
              .eq("id", sendRow?.id ?? "");

            totalSent += 1;
          } catch (err) {
            const message = err instanceof Error ? err.message : "Send failed";
            await adminClient
              .from("email_sends")
              .update({ status: "failed", error: message })
              .eq("id", sendRow?.id ?? "");
          }
        }
      }

      await adminClient
        .from("email_campaigns")
        .update({
          status: "sent",
          ...(campaign.sent_at ? null : { sent_at: new Date().toISOString() }),
        })
        .eq("id", campaign.id);

      redirect(
        `/admin/email-campaigns/${encodeURIComponent(params.id)}?notice=${encodeURIComponent(
          `Send complete (${totalSent} sent this run)`,
        )}`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to send";
      redirect(`/admin/email-campaigns/${encodeURIComponent(params.id)}?error=${encodeURIComponent(msg)}`);
    }
  }

  const exportHref = `/api/admin/email/export?audience=${encodeURIComponent(campaign.audience)}`;
  const notice = noticeFromSearchParams(searchParams);
  const error = errorFromSearchParams(searchParams);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Campaign
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            {audienceLabel(campaign.audience)} • <span className="font-medium">{campaign.status}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/email-campaigns"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
          >
            Back
          </Link>
          <a
            href={exportHref}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
          >
            Export audience CSV
          </a>
        </div>
      </div>

      {notice ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {notice}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Sent" value={sentCount.toLocaleString()} />
        <InfoCard label="Failed" value={failedCount.toLocaleString()} />
        <InfoCard label="Queued" value={queuedCount.toLocaleString()} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-zinc-900">Edit</h2>
          <form action={saveCampaign} className="mt-5 grid gap-4">
            <input type="hidden" name="id" value={campaign.id} />

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-zinc-700">Audience</span>
              <select
                name="audience"
                defaultValue={campaign.audience}
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
                defaultValue={campaign.subject}
                required
                className="h-11 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-zinc-700">Preview text (optional)</span>
              <input
                name="preview_text"
                defaultValue={campaign.preview_text ?? ""}
                className="h-11 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-zinc-700">Body (markdown)</span>
              <textarea
                name="body_markdown"
                defaultValue={campaign.body_markdown}
                required
                rows={12}
                className="rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
              />
            </label>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
            >
              Save changes
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Send</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Uses Resend. Sends up to {MAX_SEND_PER_RUN} emails per run to avoid timeouts.
          </p>

          <div className="mt-5 flex flex-col gap-2">
            <form action={testSend}>
              <button
                type="submit"
                className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
              >
                Test send to me
              </button>
            </form>

            <form action={sendNow}>
              <button
                type="submit"
                className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
              >
                Send now
              </button>
            </form>
          </div>

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
            <p className="font-semibold">Safety</p>
            <p className="mt-1">
              We automatically exclude users who unsubscribed. Every email includes an unsubscribe link.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Recent sends</h2>
        <p className="mt-2 text-sm text-zinc-600">Last 25 attempts for this campaign.</p>

        <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs font-semibold text-zinc-600">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {recentSends.length ? (
                recentSends.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium text-zinc-900">{s.email}</td>
                    <td className="px-4 py-3 text-zinc-700">{s.status}</td>
                    <td className="px-4 py-3 text-xs text-zinc-600">{s.error ?? ""}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-10 text-sm text-zinc-600" colSpan={3}>
                    No sends yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">{value}</p>
    </div>
  );
}

