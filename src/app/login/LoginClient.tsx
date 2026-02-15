"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { AnimatedInput } from "@/components/ui/AnimatedInput";

export default function LoginClient({ nextPath }: { nextPath: string }) {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Use a server route to support username-or-email login without loosening RLS.
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ identifier, password, remember }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setLoading(false);
      setError(data?.error ?? "Unable to log in.");
      return;
    }

    // Ensure the browser client exists so subsequent navigation has a hydrated client.
    // (Session is stored in cookies via SSR helpers.)
    await createSupabaseBrowserClient();

    setLoading(false);

    router.replace(nextPath);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] h-[80%] w-[60%] rounded-full bg-indigo-100/50 blur-3xl animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] h-[50%] w-[40%] rounded-full bg-violet-100/50 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-16">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold">
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              ProfitMRR
            </span>
            <span className="text-zinc-400">Library</span>
          </Link>
        </div>

        <GlassCard padding="lg" className="relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-indigo-200/30 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-violet-200/30 blur-3xl" />
          
          <div className="relative">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Welcome back</h1>
              <p className="mt-1 text-sm text-zinc-500">
                Log in to access your member dashboard.
              </p>
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <AnimatedInput
                label="Username or email"
                type="text"
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                icon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />

              <AnimatedInput
                label="Password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 10-10V002 2zm7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />

              {error ? (
                <div className="rounded-xl border border-red-200/50 bg-red-50/80 px-3 py-2 text-sm text-red-600 backdrop-blur-sm">
                  {error}
                </div>
              ) : null}

              <label className="flex items-center gap-2 text-sm text-zinc-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500/20"
                />
                Remember me
              </label>

              <GlassButton
                type="submit"
                loading={loading}
                variant="primary"
                size="lg"
                className="w-full"
              >
                Log in
              </GlassButton>
            </form>
          </div>
        </GlassCard>

        <p className="text-center text-sm text-zinc-500">
          Don't have an account?{" "}
          <Link className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700" href="/register">
            Create one
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
