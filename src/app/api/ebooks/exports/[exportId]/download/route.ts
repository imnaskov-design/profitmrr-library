import { NextResponse } from "next/server";

import { buildEbookUnauthorizedPayload, resolveEbookAuth } from "@/lib/ebooks-auth";

type Params = {
  exportId: string;
};

function inferFileName(format: string) {
  if (format === "pdf" || format === "docx" || format === "epub") {
    return `ebook.${format}`;
  }

  return "ebook.bin";
}

export async function GET(
  req: Request,
  context: {
    params: Promise<Params>;
  },
) {
  const { exportId } = await context.params;
  if (!exportId) {
    return NextResponse.json({ error: "Invalid export id." }, { status: 400 });
  }

  const auth = await resolveEbookAuth(req);
  if (!auth) {
    return NextResponse.json(buildEbookUnauthorizedPayload(req, "ebooks_export_download_auth_missing_user"), { status: 401 });
  }

  const { db, userId } = auth;

  const { data: row, error } = await db
    .from("ebook_exports")
    .select("id, user_id, ebook_id, format, status, file_path")
    .eq("id", exportId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !row) {
    return NextResponse.json({ error: "Export not found." }, { status: 404 });
  }

  if (row.status !== "ready") {
    return NextResponse.json({ error: "Export is not ready yet." }, { status: 409 });
  }

  const directPath = String(row.file_path ?? "").trim();
  if (!directPath) {
    return NextResponse.json({ error: "Export file path is missing." }, { status: 500 });
  }

  if (directPath.startsWith("http://") || directPath.startsWith("https://")) {
    return NextResponse.redirect(directPath, 302);
  }

  const fallbackName = inferFileName(row.format ?? "");

  return NextResponse.json(
    {
      error: "Export delivery is not configured for private object paths yet.",
      code: "ebooks_export_delivery_not_configured",
      export_id: row.id,
      ebook_id: row.ebook_id,
      format: row.format,
      suggested_file_name: fallbackName,
    },
    { status: 501 },
  );
}

