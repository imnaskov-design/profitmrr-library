import { NextResponse } from "next/server";

import { getPublicEnv } from "@/lib/env/public";

export async function GET() {
  try {
    const env = getPublicEnv();

    return NextResponse.json({
      supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Supabase public config is missing. Set SUPABASE_URL and SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) in Cloudflare secrets.",
      },
      { status: 500 },
    );
  }
}

