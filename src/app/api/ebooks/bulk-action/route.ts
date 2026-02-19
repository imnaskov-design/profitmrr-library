import { NextResponse } from "next/server";
import { z } from "zod";

import { buildEbookUnauthorizedPayload, resolveEbookAuth } from "@/lib/ebooks-auth";

const schema = z.object({
  action: z.enum(["archive", "restore", "delete_soft"]),
  ebook_ids: z.array(z.string().uuid()).min(1).max(100),
});

export async function POST(req: Request) {
  const auth = await resolveEbookAuth(req);
  if (!auth) {
    return NextResponse.json(buildEbookUnauthorizedPayload(req, "ebooks_bulk_action_auth_missing_user"), { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { db, userId } = auth;
  const ebookIds = Array.from(new Set(parsed.data.ebook_ids));

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.action === "archive") {
    patch.status = "archived";
  } else if (parsed.data.action === "restore") {
    patch.status = "ready";
  } else {
    patch.status = "archived";
    patch.deleted_at = new Date().toISOString();
  }

  const { data: updatedRows, error } = await db
    .from("ebooks")
    .update(patch)
    .eq("user_id", userId)
    .in("id", ebookIds)
    .select("id");

  if (error) {
    return NextResponse.json({ error: "Unable to apply bulk action." }, { status: 500 });
  }

  const updatedIds = (updatedRows ?? []).map((row) => row.id);

  return NextResponse.json({
    ok: true,
    action: parsed.data.action,
    requested_count: ebookIds.length,
    updated_count: updatedIds.length,
    updated_ids: updatedIds,
  });
}

