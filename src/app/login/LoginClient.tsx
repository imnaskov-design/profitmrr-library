"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const MAX_COOKIE_VERIFY_ATTEMPTS = 5;
const COOKIE_VERIFY_DELAY_MS = 200;

/**
 * Verifies that Supabase auth cookies exist in the browser.
 * Returns true if any sb-* cookie is found.
 */
function verifySupabaseCookiesExist(): boolean {
  return document.cookie.split(";").some((cookie) => {
    const name = cookie.trim().split("=")[0];
    return name?.startsWith("sb-");
  });
}

/**
 * Waits for Supabase cookies to appear in the browser with retry logic.
 * Cloudflare Pages can have delays in cookie persistence.
 */
async function waitForCookies(maxAttempts = MAX_COOKIE_VERIFY_ATTEMPTS): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, COOKIE_VERIFY_DELAY_MS));
    
    if (verifySupabaseCookiesExist()) {
      console.info("[LoginClient] Cookies verified on attempt", attempt + 1);
      return true;
    }
  }
  
  console.warn("[LoginClient] Cookies not found after", maxAttempts, "attempts");
  return false;
}

export default function LoginClient({ nextPath }: { nextPath: string }) {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveEmail = useCallback(async (inputIdentifier: string): Promise<string | null> => {
    // First, try server-side username resolution
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ identifier: inputIdentifier, password, remember }),
    });

    const data = (await res.json().catch(() => null)) as {
      error?: string;
      resolved_email?: string;
      ok?: boolean;
    } | null;

    if (!res.ok) {
      return null; // Will trigger error handling in caller
    }

    // Server resolved the email (handles username -> email mapping)
    return data?.resolved_email ?? inputIdentifier.trim();
  }, [password, remember]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const trimmedIdentifier = identifier.trim();
    
    if (!trimmedIdentifier || !password) {
      setError("Please enter your username/email and password.");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Get the Supabase browser client
      const supabase = await createSupabaseBrowserClient();

      // Step 2: Resolve email via server (handles username lookup)
      // This also validates credentials on the server
      const resolvedEmail = await resolveEmail(trimmedIdentifier);
      
      if (!resolvedEmail) {
        setError("Invalid credentials.");
        setLoading(false);
        return;
      }

      // Step 3: ALWAYS use browser signInWithPassword to ensure cookies are created
      // This is the KEY fix - setSession() doesn't persist cookies reliably on Cloudflare Pages
      console.info("[LoginClient] Starting browser authentication for:", resolvedEmail);
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password,
      });

      if (signInError) {
        console.error("[LoginClient] Browser sign-in failed:", signInError.message);
        setError("Invalid credentials.");
        setLoading(false);
        return;
      }

      // Step 4: Verify cookies were created with retry logic
      console.info("[LoginClient] Sign-in succeeded, verifying cookies...");
      const cookiesCreated = await waitForCookies();

      if (!cookiesCreated) {
        // Last resort: Try to force cookie creation by refreshing the session
        console.warn("[LoginClient] Cookies not found, attempting session refresh...");
        
        const { error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error("[LoginClient] Session refresh failed:", refreshError.message);
        }

        // Final verification
        await new Promise((resolve) => setTimeout(resolve, 300));
        const finalCheck = verifySupabaseCookiesExist();

        if (!finalCheck) {
          console.error("[LoginClient] CRITICAL: Cookies still not present after all attempts");
          // Still proceed - the server login was successful, and the middleware
          // might be able to handle auth via server-side cookies
        }
      }

      // Step 5: Verify we have a valid session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        console.warn("[LoginClient] No session token found, but proceeding with redirect");
      } else {
        console.info("[LoginClient] Session verified, access token present");
      }

      // Step 6: Set remember-me preference cookie
      // This is handled by the server route, but we can also set it client-side
      if (!remember) {
        // For "don't remember me", the server already handled session-only cookies
        // No additional action needed
      }

      console.info("[LoginClient] Authentication complete, redirecting to:", nextPath);
      setLoading(false);

      // Use replace to avoid back-button issues
      router.replace(nextPath);
      router.refresh();
      
    } catch (err) {
      console.error("[LoginClient] Unexpected error during login:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background-dark font-display">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(255,193,7,0.08)_0%,transparent_60%)]" />

      <nav className="relative z-10 w-full">
        <div className="mx-auto flex h-28 max-w-7xl items-center justify-center px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-1.5">
              <span className="material-symbols-outlined block text-xl leading-none font-bold text-background-dark">
                account_balance_wallet
              </span>
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase text-white">
              Profit<span className="text-primary">MRR</span>
            </h1>
          </Link>
        </div>
      </nav>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-12">
        <div className="relative w-full max-w-[560px]">
          <div className="absolute -inset-10 rounded-full bg-primary/10 opacity-40 blur-[100px]" />

          <div className="relative rounded-[2.5rem] border border-white/10 bg-[#121212]/40 p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] backdrop-blur-2xl md:p-12">
            <div className="mb-10 text-center">
              <h2 className="whitespace-nowrap text-2xl font-bold tracking-tight text-white">
                Log in to access your Reseller Tools
              </h2>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Username or email
                </label>
                <div className="group relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-xl text-white/30 transition-colors group-focus-within:text-primary">
                    person
                  </span>
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your username"
                    className="h-12 w-full rounded-xl border border-white/15 bg-black/30 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Password
                </label>
                <div className="group relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-xl text-white/30 transition-colors group-focus-within:text-primary">
                    lock
                  </span>
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 w-full rounded-xl border border-white/15 bg-black/30 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {error ? (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error}
                </div>
              ) : null}

              <div className="flex items-center justify-between px-1">
                <label className="group flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-black/40 text-primary focus:ring-primary focus:ring-offset-background-dark"
                  />
                  <span className="text-xs font-semibold text-white/60 transition-colors group-hover:text-white">
                    Remember me
                  </span>
                </label>

                <Link
                  href="/reset-password"
                  className="text-xs font-bold text-primary transition-colors hover:text-white"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full rounded-xl bg-primary py-4 text-sm font-black uppercase tracking-widest text-background-dark transition-all hover:bg-[#ffd54f] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-xs font-medium text-white/40">
                Don&apos;t have an account?
                <span className="ml-1 font-bold text-primary">Use your private invite link from email</span>
                {" "}
                after payment.
                <Link className="ml-1 font-bold text-primary transition-colors hover:text-white" href="/">
                  View plans
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 opacity-30">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span className="text-[9px] font-black uppercase tracking-widest">SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">shield</span>
              <span className="text-[9px] font-black uppercase tracking-widest">Secure Access</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">gavel</span>
              <span className="text-[9px] font-black uppercase tracking-widest">Certified Platform</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full px-6 py-10 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">
          © 2024 ProfitMRR Infrastructure. Digital Wealth Engineered.
        </p>
      </footer>
    </div>
  );
}
