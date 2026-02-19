import { NextResponse } from "next/server";

import { buildVersionEtag } from "@/lib/ebooks";
import { buildEbookUnauthorizedPayload, resolveEbookAuth } from "@/lib/ebooks-auth";

type Params = {
  id: string;
};

export async function GET(
  req: Request,
  context: {
    params: Promise<Params>;
  },
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Invalid eBook id." }, { status: 400 });
  }

  const auth = await resolveEbookAuth(req);
  if (!auth) {
    return NextResponse.json(buildEbookUnauthorizedPayload(req, "ebooks_editor_auth_missing_user"), { status: 401 });
  }

  const { db, userId } = auth;

  const { data: ebook, error: ebookErr } = await db
    .from("ebooks")
    .select("id, user_id, title, niche, category, tone, language, status, target_page_count, uniqueness_mode, active_version_id, created_at, updated_at")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (ebookErr || !ebook) {
    return NextResponse.json({ error: "eBook not found." }, { status: 404 });
  }

  const activeVersionId = ebook.active_version_id;
  if (!activeVersionId) {
    return NextResponse.json({
      ebook,
      active_version: null,
      sections: [],
      quality_summary: null,
    });
  }

  const [{ data: version }, { data: sections }] = await Promise.all([
    db
      .from("ebook_versions")
      .select("id, ebook_id, version_number, source, content_json, outline_json, quality_score, quality_report_json, created_at")
      .eq("id", activeVersionId)
      .eq("ebook_id", id)
      .maybeSingle(),
    db
      .from("ebook_sections")
      .select("id, chapter_index, section_index, section_key, heading, body_richtext, word_count, est_page_span, updated_at")
      .eq("ebook_version_id", activeVersionId)
      .order("chapter_index", { ascending: true })
      .order("section_index", { ascending: true }),
  ]);

  return NextResponse.json({
    ebook,
    active_version: version,
    version_etag: version
      ? buildVersionEtag({
          versionId: version.id,
          anchorIso: ebook.updated_at,
        })
      : null,
    sections: sections ?? [],
    quality_summary: version
      ? {
          quality_score: version.quality_score,
          quality_report: version.quality_report_json,
        }
      : null,
  });
}
