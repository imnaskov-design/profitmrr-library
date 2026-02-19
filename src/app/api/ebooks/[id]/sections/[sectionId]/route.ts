import { NextResponse } from "next/server";
import { z } from "zod";

import { buildVersionEtag } from "@/lib/ebooks";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  heading: z.string().trim().max(300).optional(),
  body_richtext: z.unknown(),
  version_etag: z.string().trim().min(8).max(300),
});

type Params = {
  id: string;
  sectionId: string;
};

export async function PATCH(
  req: Request,
  context: {
    params: Promise<Params>;
  },
) {
  const { id, sectionId } = await context.params;
  if (!id || !sectionId) {
    return NextResponse.json({ error: "Invalid route parameters." }, { status: 400 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data: ebook } = await supabase
    .from("ebooks")
    .select("id, user_id, active_version_id, updated_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!ebook?.active_version_id) {
    return NextResponse.json({ error: "eBook version not available." }, { status: 404 });
  }

  const expectedEtag = buildVersionEtag({
    versionId: ebook.active_version_id,
    anchorIso: ebook.updated_at,
  });

  if (parsed.data.version_etag !== expectedEtag) {
    const { data: latestSection } = await supabase
      .from("ebook_sections")
      .select("id, chapter_index, section_index, section_key, heading, body_richtext, word_count, est_page_span, updated_at")
      .eq("id", sectionId)
      .eq("ebook_version_id", ebook.active_version_id)
      .maybeSingle();

    return NextResponse.json(
      {
        error: "Version conflict. Refresh and retry.",
        code: "version_etag_conflict",
        expected_version_etag: expectedEtag,
        latest_section: latestSection ?? null,
      },
      { status: 409 },
    );
  }

  const bodyRichText = parsed.data.body_richtext;
  const wordCount = JSON.stringify(bodyRichText)
    .replace(/[{}\[\]":,]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  const { data: updated, error } = await supabase
    .from("ebook_sections")
    .update({
      heading: parsed.data.heading,
      body_richtext: bodyRichText,
      word_count: wordCount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sectionId)
    .eq("ebook_version_id", ebook.active_version_id)
    .select("id, chapter_index, section_index, section_key, heading, body_richtext, word_count, est_page_span, updated_at")
    .maybeSingle();

  if (error || !updated) {
    return NextResponse.json({ error: "Section not found or not updated." }, { status: 404 });
  }

  const nextUpdatedAt = new Date().toISOString();
  await supabase
    .from("ebooks")
    .update({
      updated_at: nextUpdatedAt,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  const nextVersionEtag = buildVersionEtag({
    versionId: ebook.active_version_id,
    anchorIso: nextUpdatedAt,
  });

  return NextResponse.json({
    updated_section: updated,
    autosave_timestamp: new Date().toISOString(),
    version_etag: nextVersionEtag,
  });
}
