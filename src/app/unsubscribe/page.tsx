import Link from "next/link";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SearchParams = { [key: string]: string | string[] | undefined };

function isValidToken(value: string) {
  // Default token is hex from encode(gen_random_bytes(32), 'hex')
  return /^[a-f0-9]{20,200}$/i.test(value);
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const token = typeof searchParams?.token === "string" ? searchParams.token : "";

  if (!token || !isValidToken(token)) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-16">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Invalid unsubscribe link
            </h1>
            <p className="mt-3 text-sm text-zinc-600">
              This unsubscribe link is missing or malformed.
            </p>
            <div className="mt-6">
              <Link className="text-sm font-semibold text-zinc-900 underline" href="/">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("email_preferences")
    .update({ unsubscribed: true })
    .eq("token", token)
    .select("email")
    .maybeSingle();

  const updatedEmail = data?.email ?? null;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-16">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Unsubscribed
          </h1>

          {error ? (
            <p className="mt-3 text-sm text-zinc-600">
              We couldn’t update your preferences right now. Please contact support.
            </p>
          ) : updatedEmail ? (
            <p className="mt-3 text-sm text-zinc-600">
              {updatedEmail} will no longer receive campaign emails from ProfitMRR Library.
            </p>
          ) : (
            <p className="mt-3 text-sm text-zinc-600">
              Your preferences have been updated.
            </p>
          )}

          <div className="mt-6">
            <Link className="text-sm font-semibold text-zinc-900 underline" href="/">
              Back to home
            </Link>
          </div>
        </div>

        <p className="text-xs text-zinc-500">
          Note: transactional emails related to your account (password resets, receipts, etc.) may still be
          sent when required.
        </p>
      </div>
    </div>
  );
}

