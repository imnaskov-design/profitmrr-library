import { NextResponse } from "next/server";

import { getLemonSqueezyEnv, getRegisterInviteEnv } from "@/lib/env/server";
import { sendRegisterInviteEmail } from "@/lib/email/register-invite";
import { createRegisterInviteToken } from "@/lib/invite-tokens";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type SubscriptionStatus = "active" | "cancelled" | "expired" | "inactive";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getPath(value: unknown, path: string[]): unknown {
  let cur: unknown = value;
  for (const key of path) {
    if (!isRecord(cur)) return undefined;
    cur = cur[key];
  }
  return cur;
}

function getStringAt(value: unknown, path: string[]): string | undefined {
  const v = getPath(value, path);
  return typeof v === "string" ? v : undefined;
}

function getIdStringAt(value: unknown, path: string[]): string | undefined {
  const v = getPath(value, path);
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  return undefined;
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function toHex(bytes: Uint8Array) {
  let hex = "";
  for (const b of bytes) {
    hex += b.toString(16).padStart(2, "0");
  }
  return hex;
}

async function hmacSha256Hex(secret: string, message: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return toHex(new Uint8Array(sig));
}

async function sha256Hex(message: string) {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(message));
  return toHex(new Uint8Array(digest));
}

function mapEventToStatus(eventName: string): SubscriptionStatus | null {
  switch (eventName) {
    case "subscription_created":
    case "subscription_updated":
    case "subscription_payment_success":
      return "active";
    case "subscription_cancelled":
      return "cancelled";
    case "subscription_expired":
    case "subscription_payment_failed":
      return "expired";
    default:
      return null;
  }
}

function shouldIssueInvite(eventName: string) {
  return eventName === "order_created";
}

export async function POST(req: Request) {
  const env = getLemonSqueezyEnv();
  const signature = (req.headers.get("X-Signature") ?? "").toLowerCase();
  const eventName = req.headers.get("X-Event-Name") ?? "";

  const rawBody = await req.text();
  if (!rawBody) {
    return NextResponse.json({ error: "Empty payload." }, { status: 400 });
  }

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 401 });
  }

  const expected = await hmacSha256Hex(env.LEMONSQUEEZY_WEBHOOK_SECRET, rawBody);
  if (!timingSafeEqual(signature, expected)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody) as unknown;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const mappedStatus = mapEventToStatus(eventName);
  const issueInvite = shouldIssueInvite(eventName);

  const headerEventId =
    req.headers.get("X-Event-Id") ??
    req.headers.get("X-Event-ID") ??
    req.headers.get("X-Request-Id") ??
    req.headers.get("X-Request-ID");

  const payloadEventId =
    getStringAt(payload, ["meta", "event_id"]) ??
    getIdStringAt(payload, ["meta", "id"]) ??
    getIdStringAt(payload, ["meta", "event_id"]);

  const eventId = String(headerEventId ?? payloadEventId ?? (await sha256Hex(rawBody)));

  const supabase = createSupabaseAdminClient();

  // Idempotency: store the event_id and bail out if we've already processed it.
  const { error: insertEventError } = await supabase.from("webhook_events").insert({
    event_id: eventId,
    event_name: eventName || "(missing)",
    payload,
  });

  if (insertEventError) {
    // 23505 = unique_violation (duplicate primary key)
    if ((insertEventError as { code?: string }).code === "23505") {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    return NextResponse.json(
      { error: "Unable to store webhook event." },
      { status: 500 },
    );
  }

  const subscriptionId = getIdStringAt(payload, ["data", "id"]);
  const customerId =
    getIdStringAt(payload, ["data", "attributes", "customer_id"]) ??
    getIdStringAt(payload, ["data", "relationships", "customer", "data", "id"]);

  const emailRaw =
    getStringAt(payload, ["data", "attributes", "user_email"]) ??
    getStringAt(payload, ["data", "attributes", "customer_email"]) ??
    getStringAt(payload, ["data", "attributes", "email"]);

  const email = emailRaw ? emailRaw.toLowerCase() : undefined;

  const checkoutId = getIdStringAt(payload, ["data", "attributes", "checkout_id"]);
  const orderId = getIdStringAt(payload, ["data", "attributes", "order_id"]);

  if (issueInvite && email) {
    try {
      const inviteEnv = getRegisterInviteEnv();
      const token = createRegisterInviteToken();
      const expiresAt = new Date(Date.now() + inviteEnv.REGISTER_INVITE_TOKEN_TTL_HOURS * 60 * 60 * 1000);

      const { error: inviteInsertError } = await supabase.from("register_invites").insert({
        token,
        email,
        source: eventName,
        checkout_id: checkoutId,
        order_id: orderId,
        expires_at: expiresAt.toISOString(),
      });

      if (!inviteInsertError) {
        await sendRegisterInviteEmail({
          to: email,
          token,
          expiresAtIso: expiresAt.toISOString(),
        });
      }
    } catch {
      // Invite email is best-effort; webhook should still proceed.
    }
  }

  // Ignore events we don't care about for subscription gating.
  // (Invite emails above are still allowed for events like `order_created`.)
  if (!mappedStatus) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const renewsAt = getStringAt(payload, ["data", "attributes", "renews_at"]);
  const endsAt = getStringAt(payload, ["data", "attributes", "ends_at"]);
  const trialEndsAt = getStringAt(payload, ["data", "attributes", "trial_ends_at"]);
  const currentPeriodEnd =
    mappedStatus === "active"
      ? (renewsAt ?? endsAt ?? trialEndsAt)
      : (endsAt ?? renewsAt ?? trialEndsAt);

  const customData = getPath(payload, ["meta", "custom_data"]);
  const supabaseUserId =
    isRecord(customData) && typeof customData.supabase_user_id === "string"
      ? customData.supabase_user_id
      : undefined;

  // Linking priority:
  // 1) custom_data.supabase_user_id
  // 2) existing Supabase user by email
  // 3) pending_subscriptions by email (linked during signup trigger)
  let targetUserId: string | undefined = supabaseUserId;

  if (!targetUserId && email) {
    // Fallback: match an existing member by email in profiles.
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", email)
      .maybeSingle();

    if (profile?.user_id) targetUserId = profile.user_id;
  }

  if (targetUserId) {
    // Ensure we always have an email for inserts.
    let profileEmail = email;
    if (!profileEmail) {
      const { data: byId } = await supabase.auth.admin.getUserById(targetUserId);
      profileEmail = byId.user?.email?.toLowerCase();
    }

    if (!profileEmail) {
      return NextResponse.json({ ok: true, linked: false, reason: "missing_email" });
    }

    const profileUpsert: {
      user_id: string;
      email: string;
      status: SubscriptionStatus;
      ls_customer_id?: string;
      ls_subscription_id?: string;
      current_period_end?: string;
    } = {
      user_id: targetUserId,
      email: profileEmail,
      status: mappedStatus,
      ...(customerId ? { ls_customer_id: customerId } : null),
      ...(subscriptionId ? { ls_subscription_id: subscriptionId } : null),
      ...(currentPeriodEnd ? { current_period_end: currentPeriodEnd } : null),
    };

    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(profileUpsert, { onConflict: "user_id" });

    if (upsertError) {
      return NextResponse.json(
        { error: "Unable to update subscription status." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, linked: true });
  }

  if (email) {
    const pendingUpsert: {
      email: string;
      status: SubscriptionStatus;
      ls_customer_id?: string;
      ls_subscription_id?: string;
      current_period_end?: string;
    } = {
      email,
      status: mappedStatus,
      ...(customerId ? { ls_customer_id: customerId } : null),
      ...(subscriptionId ? { ls_subscription_id: subscriptionId } : null),
      ...(currentPeriodEnd ? { current_period_end: currentPeriodEnd } : null),
    };

    const { error: pendingError } = await supabase
      .from("pending_subscriptions")
      .upsert(pendingUpsert, { onConflict: "email" });

    if (pendingError) {
      return NextResponse.json(
        { error: "Unable to store pending subscription." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, linked: false, pending: true });
  }

  return NextResponse.json({ ok: true, linked: false, pending: false });
}

