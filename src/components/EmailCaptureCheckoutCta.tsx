"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

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

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

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

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0"
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-primary/20 bg-modal-bg p-8 md:p-12 modal-gold-glow">
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-primary/10 blur-[80px]" />
        <div className="relative z-10">
          <div className="mb-4 flex items-center gap-3">
            <h2 id="checkout-modal-title" className="text-3xl font-extrabold text-white md:text-4xl">
              Get instant access
            </h2>
            <div className="rounded-lg bg-primary/20 p-1.5">
              <span className="material-symbols-outlined text-xl font-bold text-primary">bolt</span>
            </div>
          </div>
          <p className="mb-10 text-lg leading-relaxed text-white/60">
            Enter your email to start checkout and unlock the full ProfitMRR library.
          </p>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="checkout-email" className="ml-1 block text-sm font-bold text-white/90">
                Email
              </label>
              <input
                id="checkout-email"
                ref={emailRef}
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white placeholder:text-white/30 transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="checkout-name" className="ml-1 block text-sm font-bold text-white/90">
                Name <span className="font-medium text-white/40">(optional)</span>
              </label>
              <input
                id="checkout-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white placeholder:text-white/30 transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                placeholder="Your name"
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-4 w-full rounded-2xl bg-primary py-5 text-lg font-extrabold text-black shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] hover:bg-primary/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Starting checkout…" : "Continue to checkout"}
            </button>
          </form>

          <div className="mt-8 space-y-4 border-t border-white/5 pt-8">
            <p className="text-center text-sm text-white/40">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-white">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-white">
                Privacy Policy
              </Link>
              .
            </p>
            <p className="text-center text-sm text-white/60">
              Already purchased?{" "}
              <Link href="/register" className="font-bold text-primary hover:underline">
                Create your account
              </Link>{" "}
              using the same email.
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Close modal"
          onClick={onClose}
          className="absolute top-6 right-6 text-white/20 transition-colors hover:text-white"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>,
    document.body,
  );
}

