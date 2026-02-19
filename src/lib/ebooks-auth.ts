import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getPublicEnv } from "@/lib/env/public";
import { normalizePlanTier, type EbookPlanTier } from "@/lib/ebooks";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type EbookAuthSource =
  | "cookie"
  | "session_verified"
  | "session_unverified"
  | "session_decoded"
  | "bearer_verified"
  | "bearer_decoded";

type EbookDbClient = SupabaseClient;

export type EbookAuthContext = {
  db: EbookDbClient;
  userId: string;
  planTier: EbookPlanTier;
  authSource: EbookAuthSource;
  accessToken: string | null;
};

export function summarizeCookieHeader(rawCookieHeader: string | null) {
  if (!rawCookieHeader) {
    return {
      hasCookieHeader: false,
      cookieNames: [] as string[],
      hasSupabaseCookie: false,
    };
  }

  const cookieNames = rawCookieHeader
    .split(";")
    .map((part) => part.trim().split("=")[0]?.trim())
    .filter((name): name is string => !!name)
    .slice(0, 20);

  const hasSupabaseCookie = cookieNames.some((name) => name.startsWith("sb-") || name.includes("supabase"));

  return {
    hasCookieHeader: true,
    cookieNames,
    hasSupabaseCookie,
  };
}

export function buildEbookUnauthorizedPayload(req: Request, code = "ebooks_auth_missing_user") {
  const payload: {
    error: string;
    code: string;
    has_cookie_header?: boolean;
    has_supabase_cookie?: boolean;
    cookie_names?: string[];
    has_authorization_header?: boolean;
  } = {
    error: "Unauthorized.",
    code,
  };

  if (process.env.NODE_ENV !== "production") {
    const summary = summarizeCookieHeader(req.headers.get("cookie"));
    payload.has_cookie_header = summary.hasCookieHeader;
    payload.has_supabase_cookie = summary.hasSupabaseCookie;
    payload.cookie_names = summary.cookieNames;
    payload.has_authorization_header = req.headers.has("authorization");
  }

  return payload;
}

function createRlsClientWithAccessToken(accessToken: string) {
  const env = getPublicEnv();

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function decodeJwtUserId(accessToken: string) {
  try {
    const payloadPart = accessToken.split(".")[1];
    if (!payloadPart) return null;

    const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8")) as {
      sub?: unknown;
    };

    return typeof payload.sub === "string" && payload.sub ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function resolveEbookAuth(req: Request): Promise<EbookAuthContext | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user: cookieUser },
  } = await supabase.auth.getUser();

  let resolvedUserId = cookieUser?.id ?? null;
  let resolvedUserMeta = (cookieUser?.user_metadata ?? {}) as Record<string, unknown>;
  let resolvedAppMeta = (cookieUser?.app_metadata ?? {}) as Record<string, unknown>;
  let authSource: EbookAuthSource = "cookie";
  let resolvedAccessToken: string | null = null;

  let dbClient: EbookDbClient = supabase as SupabaseClient;

  if (!resolvedUserId) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      resolvedAccessToken = session.access_token;

      const { data, error } = await supabase.auth.getUser(session.access_token);

      if (!error && data.user?.id) {
        resolvedUserId = data.user.id;
        resolvedUserMeta = (data.user.user_metadata ?? {}) as Record<string, unknown>;
        resolvedAppMeta = (data.user.app_metadata ?? {}) as Record<string, unknown>;
        authSource = "session_verified";
      } else if (session.user?.id) {
        resolvedUserId = session.user.id;
        resolvedUserMeta = (session.user.user_metadata ?? {}) as Record<string, unknown>;
        resolvedAppMeta = (session.user.app_metadata ?? {}) as Record<string, unknown>;
        authSource = "session_unverified";
      } else {
        const decodedUserId = decodeJwtUserId(session.access_token);
        if (decodedUserId) {
          resolvedUserId = decodedUserId;
          authSource = "session_decoded";
        }
      }
    }
  }

  if (!resolvedUserId) {
    const authHeader = req.headers.get("authorization") ?? "";
    const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    const accessToken = bearerMatch?.[1]?.trim();

    if (accessToken) {
      resolvedAccessToken = accessToken;

      const { data, error } = await supabase.auth.getUser(accessToken);

      if (!error && data.user?.id) {
        resolvedUserId = data.user.id;
        resolvedUserMeta = (data.user.user_metadata ?? {}) as Record<string, unknown>;
        resolvedAppMeta = (data.user.app_metadata ?? {}) as Record<string, unknown>;
        authSource = "bearer_verified";
      } else {
        const decodedUserId = decodeJwtUserId(accessToken);
        if (decodedUserId) {
          resolvedUserId = decodedUserId;
          authSource = "bearer_decoded";
        }
      }
    }
  }

  if (resolvedAccessToken) {
    dbClient = createRlsClientWithAccessToken(resolvedAccessToken) as SupabaseClient;
  }

  if (!resolvedUserId) {
    return null;
  }

  return {
    db: dbClient,
    userId: resolvedUserId,
    planTier: normalizePlanTier(resolvedUserMeta.plan_tier ?? resolvedAppMeta.plan_tier),
    authSource,
    accessToken: resolvedAccessToken,
  };
}

