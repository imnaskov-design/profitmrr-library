import { NextResponse } from "next/server";
import { z } from "zod";

import { getServerEnv } from "@/lib/env/server";
import { createLemonSqueezyCheckout } from "@/lib/lemonsqueezy";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(200).optional(),
  source: z.string().min(1).max(200).optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const requestUrl = new URL(req.url);
    let appBaseUrl = `${requestUrl.protocol}//${requestUrl.host}`;

    try {
      const env = getServerEnv();
      appBaseUrl = env.APP_BASE_URL.replace(/\/$/, "");
    } catch {
      // Fall back to current request origin if APP_BASE_URL is not configured.
    }

    let supabaseUserId: string | undefined;
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      supabaseUserId = user?.id;
    } catch {
      // Checkout can still continue for logged-out users.
    }

    const customData: Record<string, unknown> = {
      ...(parsed.data.source ? { source: parsed.data.source } : null),
      ...(supabaseUserId ? { supabase_user_id: supabaseUserId } : null),
    };

    const checkoutUrl = await createLemonSqueezyCheckout({
      email: parsed.data.email,
      name: parsed.data.name,
      redirectUrl: `${appBaseUrl}/thanks`,
      customData,
    });

    return NextResponse.json({ checkout_url: checkoutUrl });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Unable to create checkout.",
      },
      { status: 500 },
    );
  }
}

