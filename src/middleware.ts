import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getPublicEnv } from "@/lib/env/public";

const REMEMBER_COOKIE = "pmrr_remember";

export async function middleware(request: NextRequest) {
  // Don’t block rendering if the project is not configured yet.
  // Once env vars are present, we automatically get session refresh.
  let env: ReturnType<typeof getPublicEnv> | null = null;
  try {
    env = getPublicEnv();
  } catch {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

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
          cookiesToSet.forEach(({ name, value, options }) => {
            // If remember-me is disabled, keep auth cookies as session cookies.
            // We do this by removing persistence attributes (Expires/Max-Age)
            // for non-delete cookies.
            let nextOptions = options;
            if (!remember) {
              const isDelete = typeof options.maxAge === "number" && options.maxAge === 0;
              if (!isDelete) {
                nextOptions = { ...options };
                delete nextOptions.expires;
                delete nextOptions.maxAge;
              }
            }

            response.cookies.set(name, value, nextOptions);
          });
        },
      },
    },
  );

  // Refresh the session if needed.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js|css|map|woff|woff2|ttf|otf|eot)$).*)",
  ],
};

