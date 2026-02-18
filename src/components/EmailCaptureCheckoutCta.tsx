"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  buttonLabel?: string;
  buttonClassName?: string;
  source?: string;
};

export function EmailCaptureCheckoutCta({
  buttonLabel = "Access The Full Library",
  buttonClassName =
    "inline-flex h-12 items-center justify-center rounded-xl bg-zinc-900 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800",
  source,
}: Props) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function onBridge(event: Event) {
      const customEvent = event as CustomEvent<{ source?: string }>;
      const nextSource = customEvent.detail?.source;

      if (nextSource && source && nextSource !== source) return;
      buttonRef.current?.click();
    }

    window.addEventListener("profitmrr:checkout-bridge", onBridge as EventListener);
    return () => window.removeEventListener("profitmrr:checkout-bridge", onBridge as EventListener);
  }, [source]);

  return (
    <>
      <button ref={buttonRef} type="button" onClick={() => setOpen(true)} className={buttonClassName}>
        {buttonLabel}
      </button>
      {open ? (
        <EmailCaptureModal onClose={() => setOpen(false)} source={source} />
      ) : null}
    </>
  );
}

function EmailCaptureModal({
  onClose,
  source,
}: {
  onClose: () => void;
  source?: string;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);

  const canSubmit = useMemo(() => email.trim().length > 3 && !loading, [email, loading]);

  useEffect(() => {
    const t = setTimeout(() => emailRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() ? name.trim() : undefined,
          source,
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { checkout_url?: string; error?: string }
        | null;

      if (!res.ok) {
        setError(data?.error ?? "Unable to start checkout. Please try again.");
        setLoading(false);
        return;
      }

      if (!data?.checkout_url) {
        setError("Checkout URL missing. Please try again.");
        setLoading(false);
        return;
      }

      window.location.href = data.checkout_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-start justify-center px-4 pt-20 sm:pt-24"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
        <div className="mb-5">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
            Get instant access
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Enter your email to start checkout and unlock the full ProfitMRR library.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-800">Email</span>
            <input
              ref={emailRef}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl border border-zinc-200 px-3 text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
              placeholder="you@example.com"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-800">
              Name <span className="font-normal text-zinc-500">(optional)</span>
            </span>
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-xl border border-zinc-200 px-3 text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
              placeholder="Your name"
            />
          </label>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Starting checkout…" : "Continue to checkout"}
          </button>

          <p className="text-xs leading-5 text-zinc-500">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline">
              Terms
            </Link>
            {" "}and{" "}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>
            .
          </p>
        </form>

        <div className="mt-4 border-t border-zinc-100 pt-4">
          <p className="text-xs text-zinc-500">
            Already purchased?{" "}
            <Link href="/register" className="font-medium text-zinc-900 underline">
              Create your account
            </Link>
            {" "}using the same email.
          </p>
        </div>
      </div>
    </div>
  );
}

