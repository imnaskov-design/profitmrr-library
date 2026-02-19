import Link from "next/link";

export default function ThanksPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        Thanks — you’re in.
      </h1>
      <p className="mt-4 text-zinc-700">
        Your checkout is complete. We’ll send your private registration link to the checkout email.
        Use that link to create your account.
      </p>
      <p className="mt-3 text-sm text-zinc-600">
        It can take a minute for your subscription status to sync. If your dashboard doesn’t show active
        access right away, refresh after a short wait.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Log in
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Go to dashboard
        </Link>
      </div>

      <div className="mt-10 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-700">
        <p className="font-medium text-zinc-900">Quick reminder</p>
        <p className="mt-2">
          Your downloads stay gated to your subscription status. If your subscription expires or becomes
          inactive, access is revoked (no permanent file URLs).
        </p>
      </div>
    </main>
  );
}

