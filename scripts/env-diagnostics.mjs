const checks = {
  NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_URL: !!process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
  APP_BASE_URL: !!process.env.APP_BASE_URL,
  LEMONSQUEEZY_API_KEY: !!process.env.LEMONSQUEEZY_API_KEY,
  LEMONSQUEEZY_VARIANT_ID: !!process.env.LEMONSQUEEZY_VARIANT_ID,
  LEMONSQUEEZY_WEBHOOK_SECRET: !!process.env.LEMONSQUEEZY_WEBHOOK_SECRET,
  SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  R2_ACCOUNT_ID: !!process.env.R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID: !!process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: !!process.env.R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME: !!process.env.R2_BUCKET_NAME,
  EMAIL_PROVIDER_API_KEY: !!process.env.EMAIL_PROVIDER_API_KEY,
  EMAIL_FROM: !!process.env.EMAIL_FROM,
};

const rendered = Object.entries(checks)
  .map(([key, present]) => `${key}=${present ? "present" : "MISSING"}`)
  .join(" | ");

console.log(`[env-diagnostics] ${rendered}`);
