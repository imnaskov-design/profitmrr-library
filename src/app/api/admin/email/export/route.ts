import { NextResponse } from "next/server";

import { getAdminContext } from "@/lib/admin";

function csvEscape(value: string) {
  if (/\n|\r|,|"/g.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

type Audience = "active" | "cancelled" | "expired" | "all";

function parseAudience(value: string | null): Audience {
  if (value === "active" || value === "cancelled" || value === "expired" || value === "all") {
    return value;
  }
  return "active";
}

export async function GET(req: Request) {
  const { user, isAdmin, supabase } = await getAdminContext();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const audience = parseAudience(url.searchParams.get("audience"));

  let query = supabase
    .from("profiles")
    .select("user_id, email, status")
    .order("created_at", { ascending: false })
    .limit(50000);

  if (audience !== "all") query = query.eq("status", audience);
  const { data: profiles, error: profileError } = await query;

  if (profileError) {
    return NextResponse.json({ error: "Unable to export." }, { status: 500 });
  }

  const userIds = (profiles ?? []).map((p) => p.user_id);
  const { data: prefs } = userIds.length
    ? await supabase
        .from("email_preferences")
        .select("user_id, unsubscribed")
        .in("user_id", userIds)
    : { data: [] };

  const unsubscribed = new Set<string>();
  for (const p of prefs ?? []) {
    if (p.unsubscribed) unsubscribed.add(p.user_id);
  }

  const header = ["email", "status", "user_id"];
  const lines = [header.join(",")];

  for (const p of profiles ?? []) {
    if (!p.email) continue;
    if (unsubscribed.has(p.user_id)) continue;
    lines.push(
      [p.email, p.status, p.user_id]
        .map((v) => csvEscape(String(v ?? "")))
        .join(","),
    );
  }

  const csv = lines.join("\n");
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="emails_${audience}.csv"`,
      "cache-control": "no-store",
    },
  });
}

