import { z } from "zod";

import { readEnvString } from "@/lib/env/read";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

let cached: z.infer<typeof publicEnvSchema> | null = null;

export function getPublicEnv() {
  if (cached) return cached;

  cached = publicEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: readEnvString("NEXT_PUBLIC_SUPABASE_URL", [
      "SUPABASE_URL",
      "CF_SUPABASE_URL",
      "PUBLIC_SUPABASE_URL",
    ]),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: readEnvString("NEXT_PUBLIC_SUPABASE_ANON_KEY", [
      "SUPABASE_ANON_KEY",
      "CF_SUPABASE_ANON_KEY",
      "PUBLIC_SUPABASE_ANON_KEY",
    ]),
  });

  return cached;
}

