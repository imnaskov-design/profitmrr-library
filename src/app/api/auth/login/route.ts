import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getPublicEnv } from "@/lib/env/public";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

const REMEMBER_COOKIE = "pmrr_remember";

const schema = z.object({
  identifier: z.string().min(1).max(254),
  password: z.string().min(1).max(2000),
  remember: z.boolean().optional().default(true),
});

function looksLikeEmail(value: string) {
  // Intentionally simple: we only need to distinguish "has @" from usernames.
  return value.includes("@");
}

function normalizeCookieOptionsForRemember(
  options: Partial<ResponseCookie> | undefined,
  remember: boolean,
): Partial<ResponseCookie> | undefined {
  if (remember) return options;

  if (!options) return options;

  // Keep delete cookies working.
  // Supabase sets removal cookies with maxAge: 0.
  if (typeof options.maxAge === "number" && options.maxAge === 0) {
    return options;
  }

  const nextOptions = { ...options };
  delete nextOptions.expires;
  delete nextOptions.maxAge;
  return nextOptions;
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const identifier = parsed.data.identifier.trim();
  const password = parsed.data.password;
  const remember = parsed.data.remember;

  // We create a request-scoped SSR client so we can apply remember-me behavior
  // to the auth cookies on this login.
  const env = getPublicEnv();
  const cookieStore = await cookies();
  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          const nextOptions = normalizeCookieOptionsForRemember(options, remember);
          if (nextOptions) {
            cookieStore.set(name, value, nextOptions);
          } else {
            cookieStore.set(name, value);
          }
        });
      },
    },
  });

  // Resolve username -> email on the server.
  let email = identifier;
  if (!looksLikeEmail(identifier)) {
    // Must use the admin client because `profiles` is not readable by `anon`.
    const admin = createSupabaseAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("email")
      .eq("username", identifier.toLowerCase())
      .maybeSingle();

    if (!profileError && profile?.email) {
      email = profile.email;
    } else {
      // Avoid username enumeration: return the same generic error.
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  // Persist the user's preference so middleware can preserve it on refresh.
  cookieStore.set(REMEMBER_COOKIE, remember ? "1" : "0", {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    ...(remember
      ? {
          // Align with @supabase/ssr default cookie persistence (~400 days).
          maxAge: 400 * 24 * 60 * 60,
        }
      : null),
  });

  return NextResponse.json({ ok: true, remember, resolved_email: email });
}
