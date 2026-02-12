import { NextResponse } from "next/server";
import { z } from "zod";

import { getServerEnv } from "@/lib/env/server";
import { createSignedR2GetUrl } from "@/lib/r2";
import { hasSubscriptionAccess, normalizeSubscriptionStatus } from "@/lib/subscription";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const querySchema = z.object({
  id: z.string().uuid(),
});

function wantsHtml(req: Request) {
  const accept = req.headers.get("accept") ?? "";
  return accept.includes("text/html");
}

function htmlErrorPage(input: {
  title: string;
  message: string;
  status: number;
  linkHref?: string;
  linkLabel?: string;
}) {
  const safeTitle = escapeHtml(input.title);
  const safeMessage = escapeHtml(input.message);
  const linkHref = input.linkHref ? escapeAttr(input.linkHref) : null;
  const linkLabel = input.linkLabel ? escapeHtml(input.linkLabel) : null;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>
    <style>
      body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; margin:0; padding:48px; background:#fafafa; color:#111827;}
      .card{max-width:680px; margin:0 auto; background:#fff; border:1px solid #e5e7eb; border-radius:16px; padding:24px; box-shadow:0 1px 2px rgba(0,0,0,.04);}
      h1{font-size:22px; margin:0 0 8px 0;}
      p{margin:0 0 16px 0; line-height:1.6; color:#374151;}
      a{display:inline-block; padding:10px 14px; border-radius:12px; background:#111827; color:#fff; text-decoration:none; font-weight:600; font-size:13px;}
      .muted{font-size:12px; color:#6b7280; margin-top:12px;}
    </style>
  </head>
  <body>
    <div class="card">
      <h1>${safeTitle}</h1>
      <p>${safeMessage}</p>
      ${linkHref && linkLabel ? `<a href="${linkHref}">${linkLabel}</a>` : ""}
      <div class="muted">HTTP ${input.status}</div>
    </div>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value: string) {
  return escapeHtml(value);
}

function errorResponse(
  req: Request,
  status: number,
  title: string,
  message: string,
  link?: { href: string; label: string },
) {
  if (wantsHtml(req)) {
    return new NextResponse(
      htmlErrorPage({
        status,
        title,
        message,
        linkHref: link?.href,
        linkLabel: link?.label,
      }),
      {
        status,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
        },
      },
    );
  }

  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({ id: url.searchParams.get("id") });

  if (!parsed.success) {
    return errorResponse(
      req,
      400,
      "Invalid download link",
      "The download link is missing or invalid.",
      { href: "/dashboard/library", label: "Back to library" },
    );
  }

  const libraryItemId = parsed.data.id;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (wantsHtml(req)) {
      const next = encodeURIComponent(`/api/download?id=${libraryItemId}`);
      return NextResponse.redirect(`/login?next=${next}`, 302);
    }

    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("status, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  const status = normalizeSubscriptionStatus(profile?.status);
  const hasAccess = hasSubscriptionAccess({
    status,
    currentPeriodEnd: profile?.current_period_end ?? null,
  });

  if (!hasAccess) {
    return errorResponse(
      req,
      403,
      "Access locked",
      "Your subscription is not active. Reactivate to download files.",
      { href: "/dashboard/account", label: "Account & Billing" },
    );
  }

  const { data: item } = await supabase
    .from("library_items")
    .select("id, title, r2_key")
    .eq("id", libraryItemId)
    .maybeSingle();

  if (!item) {
    return errorResponse(
      req,
      404,
      "File not found",
      "This library item no longer exists.",
      { href: "/dashboard/library", label: "Back to library" },
    );
  }

  const env = getServerEnv();
  const limit = env.DOWNLOADS_PER_DAY_LIMIT;
  const sinceIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from("download_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", sinceIso);

  const used = count ?? 0;
  if (used >= limit) {
    return errorResponse(
      req,
      429,
      "Daily download limit reached",
      `You’ve reached your fair-use download limit (${limit}/day). Try again later.`,
      { href: "/dashboard/downloads", label: "View downloads" },
    );
  }

  let signedUrl: string;
  try {
    signedUrl = await createSignedR2GetUrl({ r2Key: item.r2_key, expiresSeconds: 600 });
  } catch {
    return errorResponse(
      req,
      500,
      "Download error",
      "Unable to generate a secure download link. Please try again.",
      { href: "/dashboard/library", label: "Back to library" },
    );
  }

  const { error: logError } = await supabase.from("download_logs").insert({
    user_id: user.id,
    library_item_id: item.id,
  });

  if (logError) {
    return errorResponse(
      req,
      500,
      "Download error",
      "Unable to log your download. Please try again.",
      { href: "/dashboard/library", label: "Back to library" },
    );
  }

  const res = NextResponse.redirect(signedUrl, 302);
  res.headers.set("cache-control", "no-store");
  return res;
}

