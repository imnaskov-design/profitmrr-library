import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getPublicEnv } from "@/lib/env/public";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

const REMEMBER_COOKIE = "pmrr_remember";
const LEGACY_SUPABASE_COOKIE_PATHS = [
  "/api",
  "/api/auth",
  "/api/auth/login",
  "/dashboard",
  "/dashboard/ebooks",
  "/dashboard/ebooks/create",
] as const;
const SUPABASE_REMEMBER_MAX_AGE_SECONDS = 400 * 24 * 60 * 60;

function normalizeCookieOptionsForRemember(
  options: Partial<ResponseCookie> | undefined,
  remember: boolean,
): Partial<ResponseCookie> | undefined {
  const nextOptions: Partial<ResponseCookie> = {
    ...(options ?? {}),
    // Always keep auth cookies root-scoped so both app pages and API routes
    // receive the same auth context.
    path: "/",
  };

  if (remember) return nextOptions;

  // Keep delete cookies working.
  // Supabase sets removal cookies with maxAge: 0.
  if (typeof nextOptions.maxAge === "number" && nextOptions.maxAge === 0) {
    return nextOptions;
  }

  delete nextOptions.expires;
  delete nextOptions.maxAge;
  return nextOptions;
}

function stabilizeSupabaseAuthCookies(input: {
  request: NextRequest;
  response: NextResponse;
  remember: boolean;
}) {
  const secure = process.env.NODE_ENV === "production";

  const supabaseCookies = input.request.cookies
    .getAll()
    .filter(({ name, value }) => name.startsWith("sb-") && value.length > 0);

  if (!supabaseCookies.length) return;

  const latestByName = new Map<string, string>();
  supabaseCookies.forEach(({ name, value }) => {
    latestByName.set(name, value);
  });

  latestByName.forEach((value, name) => {
    // Ensure root-scoped Supabase cookies exist so API and dashboard routes
    // resolve the same session identity.
    input.response.cookies.set(name, value, {
      path: "/",
      sameSite: "lax",
      secure,
      ...(input.remember
        ? {
            maxAge: SUPABASE_REMEMBER_MAX_AGE_SECONDS,
          }
        : null),
    });

    // Remove legacy path-scoped copies that may shadow or override the root
    // cookie on API requests, causing false Unauthorized responses.
    LEGACY_SUPABASE_COOKIE_PATHS.forEach((path) => {
      input.response.cookies.set(name, "", {
        path,
        expires: new Date(0),
        maxAge: 0,
        sameSite: "lax",
        secure,
      });
    });
  });
}

export async function middleware(request: NextRequest) {
  // Don’t block rendering if the project is not configured yet.
  // Once env vars are present, we automatically get session refresh.
  let env: ReturnType<typeof getPublicEnv> | null = null;
  try {
    env = getPublicEnv();
  } catch {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const remember = request.cookies.get(REMEMBER_COOKIE)?.value !== "0";

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Ensure freshly rotated cookies are also available to server code
          // in this same request lifecycle.
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          // Recreate the response with the updated request cookies.
          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            const nextOptions = normalizeCookieOptionsForRemember(options, remember);

            if (nextOptions) {
              response.cookies.set(name, value, nextOptions);
            } else {
              response.cookies.set(name, value);
            }
          });
        },
      },
    },
  );

  // Refresh the session if needed.
  await supabase.auth.getUser();

  stabilizeSupabaseAuthCookies({
    request,
    response,
    remember,
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js|css|map|woff|woff2|ttf|otf|eot)$).*)",
  ],
};

