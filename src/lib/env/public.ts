import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

let cached: z.infer<typeof publicEnvSchema> | null = null;

export function getPublicEnv() {
  if (cached) return cached;

  const injectedSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const injectedSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Cloudflare Pages + wrangler can store these as runtime secrets instead of
  // build-time inlined NEXT_PUBLIC_* vars.
  const runtimeSupabaseUrl =
    process.env.SUPABASE_URL ?? process.env.CF_SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL;
  const runtimeSupabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ??
    process.env.CF_SUPABASE_ANON_KEY ??
    process.env.PUBLIC_SUPABASE_ANON_KEY;

  cached = publicEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: injectedSupabaseUrl ?? runtimeSupabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: injectedSupabaseAnonKey ?? runtimeSupabaseAnonKey,
  });

  return cached;
}

