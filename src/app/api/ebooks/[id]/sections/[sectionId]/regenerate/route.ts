import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  instruction: z.string().trim().max(500).optional(),
  preserve_key_points: z.array(z.string().trim().max(200)).max(20).optional(),
});

type Params = {
  id: string;
  sectionId: string;
};

export async function POST(
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
    .select("id, user_id, active_version_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!ebook?.active_version_id) {
    return NextResponse.json({ error: "eBook version not available." }, { status: 404 });
  }

  const { data: section } = await supabase
    .from("ebook_sections")
    .select("id, heading")
    .eq("id", sectionId)
    .eq("ebook_version_id", ebook.active_version_id)
    .maybeSingle();

  if (!section) {
    return NextResponse.json({ error: "Section not found." }, { status: 404 });
  }

  const jobId = randomUUID();
  const nowIso = new Date().toISOString();

  const { error: jobErr } = await supabase.from("ebook_jobs").insert({
    id: jobId,
    ebook_id: id,
    user_id: user.id,
    idempotency_key: `regen_${sectionId}_${Date.now()}`,
    job_type: "regenerate_section",
    status: "succeeded",
    step: "section_regenerated_stub",
    progress_pct: 100,
    input_json: {
      section_id: sectionId,
      instruction: parsed.data.instruction ?? null,
      preserve_key_points: parsed.data.preserve_key_points ?? [],
    },
    output_json: {
      section_id: sectionId,
      section_heading: section.heading,
      provider: "phase2_stub",
    },
    created_at: nowIso,
    started_at: nowIso,
    finished_at: nowIso,
  });

  if (jobErr) {
    return NextResponse.json({ error: "Unable to create regenerate job." }, { status: 500 });
  }

  return NextResponse.json({
    job_id: jobId,
    status: "succeeded",
    section_id: sectionId,
  });
}
