import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RequestsVotingPage() {
  const supabase = await createSupabaseServerClient();
  // Prefer getSession() (cookie-based, no network) and fall back to getUser()
  // to avoid false logouts if the Auth API is temporarily unreachable.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let user = session?.user ?? null;
  if (!user) {
    const {
      data: { user: verifiedUser },
    } = await supabase.auth.getUser();
    user = verifiedUser ?? null;
  }

  if (!user) redirect("/login?next=/dashboard/requests");

  const { data: requests } = await supabase
    .from("requests")
    .select("id, user_id, title, details, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const requestIds = (requests ?? []).map((r) => r.id);
  const { data: votes } = requestIds.length
    ? await supabase
        .from("request_votes")
        .select("id, request_id, user_id")
        .in("request_id", requestIds)
        .limit(5000)
    : { data: [] };

  const voteCounts = new Map<string, number>();
  const votedByMe = new Set<string>();
  for (const v of votes ?? []) {
    voteCounts.set(v.request_id, (voteCounts.get(v.request_id) ?? 0) + 1);
    if (v.user_id === user.id) votedByMe.add(v.request_id);
  }

  async function createRequest(formData: FormData) {
    "use server";
    const supabase = await createSupabaseServerClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    let user = session?.user ?? null;
    if (!user) {
      const {
        data: { user: verifiedUser },
      } = await supabase.auth.getUser();
      user = verifiedUser ?? null;
    }

    if (!user) redirect("/login?next=/dashboard/requests");

    const title = String(formData.get("title") ?? "").trim();
    const details = String(formData.get("details") ?? "").trim();
    if (!title) redirect("/dashboard/requests");

    await supabase.from("requests").insert({
      user_id: user.id,
      title,
      details: details || null,
    });

    redirect("/dashboard/requests");
  }

  async function toggleVote(formData: FormData) {
    "use server";
    const supabase = await createSupabaseServerClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    let user = session?.user ?? null;
    if (!user) {
      const {
        data: { user: verifiedUser },
      } = await supabase.auth.getUser();
      user = verifiedUser ?? null;
    }

    if (!user) redirect("/login?next=/dashboard/requests");

    const requestId = String(formData.get("request_id") ?? "");
    const action = String(formData.get("action") ?? "");

    if (!requestId) redirect("/dashboard/requests");

    if (action === "upvote") {
      await supabase.from("request_votes").insert({ request_id: requestId, user_id: user.id });
      redirect("/dashboard/requests");
    }

    if (action === "remove") {
      await supabase
        .from("request_votes")
        .delete()
        .eq("request_id", requestId)
        .eq("user_id", user.id);
      redirect("/dashboard/requests");
    }

    redirect("/dashboard/requests");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Requests & Voting
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Request product packs and upvote what you want next.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-zinc-900">Request a pack</p>
        <p className="mt-2 text-sm text-zinc-600">
          Tell us what you want. Keep it specific (niche + type + format).
        </p>
        <form action={createRequest} className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs font-semibold text-zinc-700">Title</span>
            <input
              name="title"
              required
              className="h-11 rounded-xl border border-zinc-200 px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
              placeholder="Example: Wedding planner templates pack (Canva)"
            />
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs font-semibold text-zinc-700">Details (optional)</span>
            <textarea
              name="details"
              rows={4}
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-900/10 focus:ring-4"
              placeholder="Formats, niche, intended use, examples…"
            />
          </label>

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
          >
            Submit request
          </button>

          <p className="self-center text-xs text-zinc-500">
            Admins moderate requests in the admin panel.
          </p>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
          <p className="text-sm font-semibold text-zinc-900">Community requests</p>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-zinc-900 underline"
          >
            Back
          </Link>
        </div>

        <ul className="divide-y divide-zinc-100">
          {(requests ?? []).map((r) => {
            const votes = voteCounts.get(r.id) ?? 0;
            const voted = votedByMe.has(r.id);
            return (
              <li key={r.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900">{r.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">{r.status}</p>
                    {r.details ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600">
                        {r.details}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-xs text-zinc-500">
                      <span className="font-semibold text-zinc-900">{votes}</span> votes
                    </div>
                    <form action={toggleVote}>
                      <input type="hidden" name="request_id" value={r.id} />
                      <input
                        type="hidden"
                        name="action"
                        value={voted ? "remove" : "upvote"}
                      />
                      <button
                        type="submit"
                        className={
                          voted
                            ? "inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-50"
                            : "inline-flex h-9 items-center justify-center rounded-xl bg-zinc-900 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800"
                        }
                      >
                        {voted ? "Remove vote" : "Upvote"}
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
          {!requests?.length ? (
            <li className="px-5 py-10 text-sm text-zinc-600">No requests yet.</li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}

