"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { formatDateShort } from "@/lib/subscription";

type Section = {
  id: string;
  chapter_index: number;
  section_index: number;
  section_key: string;
  heading: string | null;
  body_richtext: { blocks?: Array<{ text?: string }> } | null;
  word_count: number | null;
  updated_at: string;
};

type EditorPayload = {
  ebook: {
    id: string;
    title: string | null;
    niche: string | null;
    category: string | null;
    tone: string | null;
    language: string | null;
    status: string;
    target_page_count: number | null;
    uniqueness_mode: boolean;
    active_version_id: string | null;
    created_at: string;
    updated_at: string;
  };
  active_version: {
    id: string;
    version_number: number;
    quality_score: number | null;
    created_at: string;
  } | null;
  version_etag: string | null;
  sections: Section[];
  quality_summary: {
    quality_score: number | null;
    quality_report: unknown;
  } | null;
};

type SaveResponse = {
  error?: string;
  code?: string;
  updated_section?: Section;
  version_etag?: string;
};

type AiResponse = {
  error?: string;
  code?: string;
  revised_text?: string;
  updated_section?: Section;
  version_etag?: string;
};

const aiActions = [
  { key: "rewrite", label: "Rewrite" },
  { key: "expand", label: "Expand" },
  { key: "shorten", label: "Shorten" },
  { key: "tone_switch", label: "Tone switch" },
] as const;

type AiActionKey = (typeof aiActions)[number]["key"];

export default function EbookQuickPolishPage({ params }: { params: { id: string } }) {
  const ebookId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [runningAi, setRunningAi] = useState<AiActionKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [payload, setPayload] = useState<EditorPayload | null>(null);
  const [versionEtag, setVersionEtag] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [headingDraft, setHeadingDraft] = useState("");
  const [bodyDraft, setBodyDraft] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/ebooks/${ebookId}/editor`, {
        method: "GET",
        cache: "no-store",
      });

      const data = (await res.json().catch(() => null)) as EditorPayload | { error?: string } | null;
      if (!res.ok || !data || "error" in data) {
        if (mounted) {
          setError((data as { error?: string } | null)?.error ?? "Unable to load editor.");
          setLoading(false);
        }
        return;
      }

      if (!mounted) return;

      const next = data as EditorPayload;
      setPayload(next);
      setVersionEtag(next.version_etag ?? null);

      const firstSection = next.sections[0] ?? null;
      if (firstSection) {
        setSelectedSectionId(firstSection.id);
        setHeadingDraft(firstSection.heading ?? "");
        setBodyDraft((firstSection.body_richtext?.blocks ?? []).map((b) => b.text ?? "").join("\n\n"));
      }

      setLoading(false);
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [ebookId]);

  const selectedSection = useMemo(() => {
    if (!payload || !selectedSectionId) return null;
    return payload.sections.find((s) => s.id === selectedSectionId) ?? null;
  }, [payload, selectedSectionId]);

  function selectSection(section: Section) {
    setSelectedSectionId(section.id);
    setHeadingDraft(section.heading ?? "");
    setBodyDraft((section.body_richtext?.blocks ?? []).map((b) => b.text ?? "").join("\n\n"));
  }

  async function saveSection() {
    if (!selectedSection) return;
    setSaving(true);
    setError(null);

    const richtext = {
      blocks: bodyDraft
        .split(/\n{2,}/)
        .map((text) => text.trim())
        .filter(Boolean)
        .map((text) => ({ type: "paragraph", text })),
    };

    const res = await fetch(`/api/ebooks/${ebookId}/sections/${selectedSection.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        heading: headingDraft,
        body_richtext: richtext,
        version_etag: versionEtag,
      }),
    });

    const data = (await res.json().catch(() => null)) as
      | SaveResponse
      | null;

    if (!res.ok || !data?.updated_section) {
      setSaving(false);
      if (data?.code === "version_etag_conflict") {
        setError("Editor was updated in another action. Reloading latest version.");
        window.location.reload();
        return;
      }
      setError(data?.error ?? "Unable to save section.");
      return;
    }

    setPayload((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map((s) => (s.id === data.updated_section?.id ? (data.updated_section as Section) : s)),
      };
    });

    if (data.version_etag) {
      setVersionEtag(data.version_etag);
    }

    setSaving(false);
  }

  async function runAiAction(action: AiActionKey) {
    if (!selectedSection) return;
    setRunningAi(action);
    setError(null);

    const res = await fetch(`/api/ebooks/${ebookId}/sections/${selectedSection.id}/ai-action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action,
        version_etag: versionEtag,
        tone_target: payload?.ebook.tone ?? "Professional",
      }),
    });

    const data = (await res.json().catch(() => null)) as
      | AiResponse
      | null;

    if (!res.ok) {
      setRunningAi(null);
      if (data?.code === "version_etag_conflict") {
        setError("Editor was updated in another action. Reloading latest version.");
        window.location.reload();
        return;
      }
      setError(data?.error ?? "AI action failed.");
      return;
    }

    if (data?.revised_text) {
      setBodyDraft(data.revised_text);
    }

    if (data?.updated_section) {
      setPayload((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sections: prev.sections.map((s) => (s.id === data.updated_section?.id ? (data.updated_section as Section) : s)),
        };
      });
    }

    if (data?.version_etag) {
      setVersionEtag(data.version_etag);
    }

    setRunningAi(null);
  }

  async function regenerateSection() {
    if (!selectedSection) return;
    setRunningAi("rewrite");
    setError(null);

    const res = await fetch(`/api/ebooks/${ebookId}/sections/${selectedSection.id}/regenerate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        instruction: "Regenerate with clearer examples and stronger flow.",
      }),
    });

    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    if (!res.ok) {
      setRunningAi(null);
      setError(data?.error ?? "Unable to regenerate section.");
      return;
    }

    setRunningAi(null);
  }

  if (loading) {
    return <div className="text-sm text-white/60">Loading quick polish editor...</div>;
  }

  if (!payload) {
    return <div className="text-sm text-rose-300">{error ?? "Unable to load editor."}</div>;
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/40">Quick polish editor</p>
          <h1 className="text-4xl font-black tracking-tight text-white">{payload.ebook.title ?? "Untitled eBook"}</h1>
          <p className="mt-2 text-sm text-white/50">
            Version {payload.active_version?.version_number ?? 1} • Last update {formatDateShort(payload.ebook.updated_at) ?? "—"}
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/dashboard/ebooks/${ebookId}`}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to details
          </Link>
          <button
            type="button"
            onClick={saveSection}
            disabled={!selectedSection || saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black uppercase tracking-widest text-background-dark transition-all hover:bg-primary/90 disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            {saving ? "Saving..." : "Save section"}
          </button>
        </div>
      </header>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <aside className="space-y-3 lg:col-span-3">
          <div className="rounded-2xl border border-white/10 p-4 glass-card">
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-white/40">Sections</p>
            <div className="space-y-2">
              {payload.sections.map((section) => {
                const active = section.id === selectedSectionId;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => selectSection(section)}
                    className={`w-full rounded-xl border px-3 py-2 text-left text-xs transition-all ${
                      active
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-white/10 bg-white/5 text-white/70 hover:border-primary/30"
                    }`}
                  >
                    <p className="font-bold">{section.heading ?? section.section_key}</p>
                    <p className="mt-1 text-[10px] text-white/40">
                      Ch {section.chapter_index} • Sec {section.section_index}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="space-y-4 lg:col-span-6">
          <div className="rounded-2xl border border-white/10 p-6 glass-card">
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-white/40">Section heading</label>
            <input
              value={headingDraft}
              onChange={(e) => setHeadingDraft(e.target.value)}
              className="mb-4 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-primary"
            />

            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-white/40">Section body</label>
            <textarea
              value={bodyDraft}
              onChange={(e) => setBodyDraft(e.target.value)}
              rows={18}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-primary"
            />
          </div>
        </main>

        <aside className="space-y-4 lg:col-span-3">
          <div className="rounded-2xl border border-white/10 p-4 glass-card">
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-white/40">AI actions</p>
            <div className="space-y-2">
              {aiActions.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  onClick={() => runAiAction(action.key)}
                  disabled={!selectedSection || !!runningAi}
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition-all hover:border-primary/40 disabled:opacity-60"
                >
                  <span>{action.label}</span>
                  {runningAi === action.key ? <span className="material-symbols-outlined text-sm">hourglass_top</span> : null}
                </button>
              ))}

              <button
                type="button"
                onClick={regenerateSection}
                disabled={!selectedSection || !!runningAi}
                className="mt-2 flex w-full items-center justify-between rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-bold text-primary transition-all hover:bg-primary/20 disabled:opacity-60"
              >
                <span>Regenerate section</span>
                <span className="material-symbols-outlined text-sm">refresh</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 p-4 glass-card">
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-white/40">Quality</p>
            <p className="text-sm text-white/80">
              Score: <span className="font-bold text-primary">{payload.quality_summary?.quality_score ?? "—"}</span>
            </p>
            <p className="mt-2 text-xs text-white/50">Phase 2 uses placeholder AI and quality signals. Full typography checks are next phase.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
