import { NextResponse } from "next/server";

import { createSignedExportDownloadUrl, inferDownloadFileName } from "@/lib/ebook-exports";
import { buildEbookUnauthorizedPayload, resolveEbookAuth } from "@/lib/ebooks-auth";

type Params = {
  exportId: string;
};

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

  try {
    const signedUrl = await createSignedExportDownloadUrl({
      r2Key: directPath,
      expiresSeconds: 600,
    });

    const res = NextResponse.redirect(signedUrl, 302);
    res.headers.set("cache-control", "no-store");
    return res;
  } catch {
    const fallbackName = inferDownloadFileName(row.format ?? "");

    return NextResponse.json(
      {
        error: "Export file is currently unavailable.",
        code: "ebooks_export_download_unavailable",
        export_id: row.id,
        ebook_id: row.ebook_id,
        format: row.format,
        suggested_file_name: fallbackName,
      },
      { status: 503 },
    );
  }
}

