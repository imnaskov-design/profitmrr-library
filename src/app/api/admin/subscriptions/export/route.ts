import { NextResponse } from "next/server";

import { getAdminContext } from "@/lib/admin";
import { formatDateShort } from "@/lib/subscription";

function csvEscape(value: string) {
  if (/[\n\r,\"]/g.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
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
  const status = url.searchParams.get("status");

  let query = supabase
    .from("profiles")
    .select(
      "user_id, email, status, current_period_end, ls_customer_id, ls_subscription_id, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(50000);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data: rows, error } = await query;
  if (error) {
    return NextResponse.json({ error: "Unable to export." }, { status: 500 });
  }

  const header = [
    "email",
    "status",
    "current_period_end",
    "ls_customer_id",
    "ls_subscription_id",
    "created_at",
    "user_id",
  ];

  const lines = [header.join(",")];
  for (const r of rows ?? []) {
    lines.push(
      [
        r.email,
        r.status,
        r.current_period_end ?? "",
        r.ls_customer_id ?? "",
        r.ls_subscription_id ?? "",
        formatDateShort(r.created_at) ?? "",
        r.user_id,
      ]
        .map((v) => csvEscape(String(v)))
        .join(","),
    );
  }

  const csv = lines.join("\n");
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="subscriptions${status ? `_${status}` : ""}.csv"`,
      "cache-control": "no-store",
    },
  });
}

