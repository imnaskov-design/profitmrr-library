import "server-only";

import { z } from "zod";

import { readEnvString } from "@/lib/env/read";

const coreServerEnvSchema = z.object({
  APP_BASE_URL: z.string().url(),
  DOWNLOADS_PER_DAY_LIMIT: z.coerce.number().int().min(1).max(500).default(50),
  EBOOK_JOB_IDEMPOTENCY_TTL_HOURS: z.coerce.number().int().min(1).max(24 * 14).default(72),
});

const supabaseAdminEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const lemonSqueezyEnvSchema = z.object({
  LEMONSQUEEZY_API_KEY: z.string().min(1),
  LEMONSQUEEZY_VARIANT_ID: z.string().min(1),
  LEMONSQUEEZY_WEBHOOK_SECRET: z.string().min(1),
});

const r2EnvSchema = z.object({
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().min(1),
});

const emailEnvSchema = z.object({
  EMAIL_PROVIDER_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().min(1),
  EMAIL_REPLY_TO: z.string().min(1).optional(),
});

const registerInviteEnvSchema = z.object({
  REGISTER_INVITE_TOKEN_TTL_HOURS: z.coerce.number().int().min(1).max(24 * 30),
});

let coreCached: z.infer<typeof coreServerEnvSchema> | null = null;
let supabaseAdminCached: z.infer<typeof supabaseAdminEnvSchema> | null = null;
let lemonCached: z.infer<typeof lemonSqueezyEnvSchema> | null = null;
let r2Cached: z.infer<typeof r2EnvSchema> | null = null;
let emailCached: z.infer<typeof emailEnvSchema> | null = null;
let registerInviteCached: z.infer<typeof registerInviteEnvSchema> | null = null;

export function getServerEnv() {
  if (coreCached) return coreCached;

  coreCached = coreServerEnvSchema.parse({
    APP_BASE_URL: readEnvString("APP_BASE_URL"),
    DOWNLOADS_PER_DAY_LIMIT: readEnvString("DOWNLOADS_PER_DAY_LIMIT"),
    EBOOK_JOB_IDEMPOTENCY_TTL_HOURS: readEnvString("EBOOK_JOB_IDEMPOTENCY_TTL_HOURS"),
  });

  return coreCached;
}

export function getSupabaseAdminEnv() {
  if (supabaseAdminCached) return supabaseAdminCached;

  supabaseAdminCached = supabaseAdminEnvSchema.parse({
    SUPABASE_SERVICE_ROLE_KEY: readEnvString("SUPABASE_SERVICE_ROLE_KEY"),
  });

  return supabaseAdminCached;
}

export function getLemonSqueezyEnv() {
  if (lemonCached) return lemonCached;

  lemonCached = lemonSqueezyEnvSchema.parse({
    LEMONSQUEEZY_API_KEY: readEnvString("LEMONSQUEEZY_API_KEY", [
      "CF_LEMONSQUEEZY_API_KEY",
    ]),
    LEMONSQUEEZY_VARIANT_ID: readEnvString("LEMONSQUEEZY_VARIANT_ID", [
      "CF_LEMONSQUEEZY_VARIANT_ID",
    ]),
    LEMONSQUEEZY_WEBHOOK_SECRET: readEnvString("LEMONSQUEEZY_WEBHOOK_SECRET", [
      "CF_LEMONSQUEEZY_WEBHOOK_SECRET",
    ]),
  });

  return lemonCached;
}

export function getR2Env() {
  if (r2Cached) return r2Cached;

  r2Cached = r2EnvSchema.parse({
    R2_ACCOUNT_ID: readEnvString("R2_ACCOUNT_ID"),
    R2_ACCESS_KEY_ID: readEnvString("R2_ACCESS_KEY_ID"),
    R2_SECRET_ACCESS_KEY: readEnvString("R2_SECRET_ACCESS_KEY"),
    R2_BUCKET_NAME: readEnvString("R2_BUCKET_NAME"),
  });

  return r2Cached;
}

export function getEmailEnv() {
  if (emailCached) return emailCached;

  emailCached = emailEnvSchema.parse({
    EMAIL_PROVIDER_API_KEY: readEnvString("EMAIL_PROVIDER_API_KEY"),
    EMAIL_FROM: readEnvString("EMAIL_FROM"),
    EMAIL_REPLY_TO: readEnvString("EMAIL_REPLY_TO"),
  });

  return emailCached;
}

export function getRegisterInviteEnv() {
  if (registerInviteCached) return registerInviteCached;

  registerInviteCached = registerInviteEnvSchema.parse({
    REGISTER_INVITE_TOKEN_TTL_HOURS: readEnvString("REGISTER_INVITE_TOKEN_TTL_HOURS"),
  });

  return registerInviteCached;
}

