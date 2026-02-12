import Link from "next/link";

import {
  getSubscriptionSummary,
  normalizeSubscriptionStatus,
} from "@/lib/subscription";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AccountBillingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user?.id
    ? await supabase
        .from("profiles")
        .select("status, current_period_end")
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  const summary = getSubscriptionSummary({
    status: normalizeSubscriptionStatus(profile?.status),
    currentPeriodEnd: profile?.current_period_end ?? null,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Account & Billing
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Manage your account and see your subscription status.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold text-zinc-500">Email</p>
          <p className="mt-2 text-sm font-medium text-zinc-900">
            {user?.email ?? "(no email)"}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold text-zinc-500">Subscription</p>
          <p className="mt-2 text-sm font-semibold text-zinc-900">{summary.title}</p>
          {summary.detail ? (
            <p className="mt-1 text-sm text-zinc-600">{summary.detail}</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-zinc-900">Manage billing</p>
        <p className="mt-2 text-sm text-zinc-600">
          Customer portal link generation will be added next. For now, renew from the landing page.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
          >
            Renew / Subscribe
          </Link>
          <button
            type="button"
            disabled
            className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 opacity-50"
          >
            Manage billing (coming next)
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-600">
          <p className="font-semibold text-zinc-900">Cancel policy</p>
          <p className="mt-1">
            If you cancel, you keep access until the end of your current paid period. After that, downloads
            are revoked.
          </p>
        </div>
      </div>
    </div>
  );
}

