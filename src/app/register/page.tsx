"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialEmail = (searchParams.get("email") ?? "").trim().toLowerCase();
  const initialToken = (searchParams.get("token") ?? "").trim();
  const hasInviteContext = Boolean(initialEmail && initialToken);

  const email = initialEmail;
  const accessToken = initialToken;
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    if (!hasInviteContext) {
      setLoading(false);
      setError("Registration is invite-only. Use the private registration link from your email.");
      return;
    }

    const validateRes = await fetch("/api/auth/validate-register-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: accessToken,
        email,
      }),
    });

    if (!validateRes.ok) {
      const data = (await validateRes.json().catch(() => null)) as { error?: string } | null;
      setLoading(false);
      setError(data?.error ?? "Invalid invite link.");
      return;
    }

    const supabase = await createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          invite_token: accessToken,
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.user && !data.session) {
      setSuccessMessage(
        "Account created. Check your email to confirm your address, then log in.",
      );
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background-dark px-6 py-12">
      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,193,7,0.06)_0%,rgba(255,193,7,0)_70%)]" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="mb-8 flex justify-center">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20">
              <span className="text-xl font-extrabold text-black">P</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">ProfitMRR</span>
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-[#111111]/80 p-10 shadow-2xl backdrop-blur-xl">
          <header className="mb-8">
            <h1 className="mb-3 text-3xl font-bold text-white">Create your account</h1>
            <p className="max-w-sm text-sm leading-relaxed text-white/50">
              Registration is invite-only and available through the private link in your payment confirmation email.
            </p>
          </header>

          {!hasInviteContext ? (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-100">
              <p className="font-semibold">Registration link required.</p>
              <p className="mt-2 text-amber-100/90">
                Open the private registration link sent to your checkout email after payment.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="mb-2.5 block text-sm font-semibold text-white/80" htmlFor="register-email">
                  Checkout email
                </label>
                <input
                  id="register-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-gray-800 bg-black/40 px-4 py-3.5 text-white/80 placeholder:text-white/30 outline-none"
                />
              </div>

              <div>
                <label className="mb-2.5 block text-sm font-semibold text-white/80" htmlFor="register-password">
                  Password
                </label>
                <input
                  id="register-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-800 bg-black/40 px-4 py-3.5 text-white placeholder:text-white/30 outline-none transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error}
                </div>
              ) : null}

              {successMessage ? (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                  {successMessage}
                </div>
              ) : null}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-xl bg-primary px-4 py-4 text-base font-bold text-black shadow-xl shadow-primary/10 transition-all duration-200 hover:bg-[#ffd54f] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Creating…" : "Create account"}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-white/50">
            Already have an account?
            <Link className="ml-1 font-bold text-primary transition-all hover:brightness-110" href="/login">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function RegisterPageFallback() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background-dark px-6 py-12">
      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,193,7,0.06)_0%,rgba(255,193,7,0)_70%)]" />
      <div className="relative z-10 text-sm text-white/60">Loading registration form…</div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterPageFallback />}>
      <RegisterPageContent />
    </Suspense>
  );
}

