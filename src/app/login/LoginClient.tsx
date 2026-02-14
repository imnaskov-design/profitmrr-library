"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

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
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-16">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Log in</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Access your ProfitMRR Library member dashboard.
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-zinc-800">Username or email</span>
              <input
                type="text"
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="h-11 rounded-xl border border-zinc-200 px-3 text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
                placeholder="test"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-zinc-800">Password</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl border border-zinc-200 px-3 text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
                placeholder="••••••••"
              />
            </label>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border border-zinc-300"
              />
              Remember me
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-600">
          Don’t have an account?{" "}
          <Link className="font-medium text-zinc-900 underline" href="/register">
            Create one
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

