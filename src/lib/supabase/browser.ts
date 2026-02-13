"use client";

import { createBrowserClient } from "@supabase/ssr";

type BrowserSupabaseClient = ReturnType<typeof createBrowserClient>;

let browserClient: BrowserSupabaseClient | null = null;
let browserClientPromise: Promise<BrowserSupabaseClient> | null = null;

async function getPublicConfigFromRuntime() {
  const res = await fetch("/api/public-config", {
    method: "GET",
    cache: "no-store",
  });

  const data = (await res.json().catch(() => null)) as
    | { supabaseUrl?: string; supabaseAnonKey?: string; error?: string }
    | null;

  if (!res.ok || !data?.supabaseUrl || !data?.supabaseAnonKey) {
    throw new Error(data?.error ?? "Supabase public config is not available.");
  }

  return {
    supabaseUrl: data.supabaseUrl,
    supabaseAnonKey: data.supabaseAnonKey,
  };
}

export async function createSupabaseBrowserClient() {
  if (browserClient) return browserClient;
  if (browserClientPromise) return browserClientPromise;

  browserClientPromise = (async () => {
    let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // On Cloudflare Pages, runtime secrets may be available only at request time,
    // not as build-time NEXT_PUBLIC_* inlined values.
    if (!supabaseUrl || !supabaseAnonKey) {
      const runtime = await getPublicConfigFromRuntime();
      supabaseUrl = runtime.supabaseUrl;
      supabaseAnonKey = runtime.supabaseAnonKey;
    }

    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
    return browserClient;
  })();

  return browserClientPromise;
}


