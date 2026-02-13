import { NextResponse } from "next/server";

import { readEnvString } from "@/lib/env/read";

type EnvCheck = {
  key: string;
  present: boolean;
};

function check(key: string, aliases: string[] = []): EnvCheck {
  return {
    key,
    present: !!readEnvString(key, aliases),
  };
}

export async function GET() {
  const checks: EnvCheck[] = [
    check("APP_BASE_URL"),
    check("LEMONSQUEEZY_API_KEY", ["CF_LEMONSQUEEZY_API_KEY"]),
    check("LEMONSQUEEZY_VARIANT_ID", ["CF_LEMONSQUEEZY_VARIANT_ID"]),
    check("LEMONSQUEEZY_WEBHOOK_SECRET", ["CF_LEMONSQUEEZY_WEBHOOK_SECRET"]),
    check("NEXT_PUBLIC_SUPABASE_URL", ["SUPABASE_URL", "CF_SUPABASE_URL"]),
    check("NEXT_PUBLIC_SUPABASE_ANON_KEY", [
      "SUPABASE_ANON_KEY",
      "CF_SUPABASE_ANON_KEY",
    ]),
    check("SUPABASE_SERVICE_ROLE_KEY"),
    check("R2_ACCOUNT_ID"),
    check("R2_ACCESS_KEY_ID"),
    check("R2_SECRET_ACCESS_KEY"),
    check("R2_BUCKET_NAME"),
    check("EMAIL_PROVIDER_API_KEY"),
    check("EMAIL_FROM"),
  ];

  const missing = checks.filter((c) => !c.present).map((c) => c.key);

  return NextResponse.json(
    {
      ok: missing.length === 0,
      checks,
      missing,
    },
    {
      status: missing.length === 0 ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

