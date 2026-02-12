import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getPublicEnv } from "@/lib/env/public";
import { getSupabaseAdminEnv } from "@/lib/env/server";

export function createSupabaseAdminClient() {
  const publicEnv = getPublicEnv();
  const serverEnv = getSupabaseAdminEnv();

  return createClient(publicEnv.NEXT_PUBLIC_SUPABASE_URL, serverEnv.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

