import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  token: z.string().min(1).max(400),
  email: z.string().email(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const token = parsed.data.token.trim();
  const email = parsed.data.email.trim().toLowerCase();

  const supabase = createSupabaseAdminClient();
  const { data: invite, error } = await supabase
    .from("register_invites")
    .select("token, email, expires_at, consumed_at")
    .eq("token", token)
    .maybeSingle();

  if (error || !invite) {
    return NextResponse.json({ error: "Invalid or expired invite link." }, { status: 403 });
  }

  if (invite.email.toLowerCase() !== email) {
    return NextResponse.json({ error: "Invite email mismatch." }, { status: 403 });
  }

  if (invite.consumed_at) {
    return NextResponse.json({ error: "Invite has already been used." }, { status: 403 });
  }

  const expiresAt = new Date(invite.expires_at);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
    return NextResponse.json({ error: "Invite has expired." }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}

