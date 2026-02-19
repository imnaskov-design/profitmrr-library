import "server-only";

import { createSignedR2GetUrl, putR2Object } from "@/lib/r2";

function sanitizeSegment(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normalizeExportPath(path: string) {
  return path.replace(/^\/+/, "").replace(/\.{2,}/g, ".").trim();
}

function inferExtension(format: string) {
  if (format === "pdf" || format === "docx" || format === "epub") {
    return format;
  }
  return "bin";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

type BuildExportPayloadInput = {
  title: string;
  niche: string;
  category: string;
  tone: string;
  language: string;
  profile: "us_letter" | "a4";
  format: "pdf" | "docx" | "epub";
  generatedAtIso: string;
  chapters: Array<{
    title: string;
    sections: Array<{
      heading: string;
      text: string;
    }>;
  }>;
};

export function buildR2ExportKey(input: {
  ebookId: string;
  versionId: string;
  exportId: string;
  profile: "us_letter" | "a4";
  format: "pdf" | "docx" | "epub";
}) {
  const profile = sanitizeSegment(input.profile || "us_letter") || "us-letter";
  const ext = inferExtension(input.format);
  return normalizeExportPath(
    `exports/ebooks/${sanitizeSegment(input.ebookId) || input.ebookId}/${sanitizeSegment(
      input.versionId,
    ) || input.versionId}/${profile}/${sanitizeSegment(input.exportId) || input.exportId}.${ext}`,
  );
}

export function buildFallbackExportText(input: BuildExportPayloadInput) {
  const sections = input.chapters
    .map((chapter, chapterIndex) => {
      const chapterHeader = `Chapter ${chapterIndex + 1}: ${chapter.title}`;
      const chapterSections = chapter.sections
        .map((section, sectionIndex) => {
          return [
            `Section ${chapterIndex + 1}.${sectionIndex + 1}: ${section.heading}`,
            section.text,
          ]
            .filter(Boolean)
            .join("\n\n");
        })
        .join("\n\n---\n\n");

      return [chapterHeader, chapterSections].filter(Boolean).join("\n\n");
    })
    .join("\n\n==============================\n\n");

  return [
    `Title: ${input.title}`,
    `Niche: ${input.niche}`,
    `Category: ${input.category}`,
    `Tone: ${input.tone}`,
    `Language: ${input.language}`,
    `Profile: ${input.profile}`,
    `Export Format: ${input.format}`,
    `Generated At (UTC): ${input.generatedAtIso}`,
    "",
    "--------------------------------------------------",
    "",
    sections,
    "",
  ].join("\n");
}

export function buildFallbackExportHtml(input: BuildExportPayloadInput) {
  const chapterHtml = input.chapters
    .map((chapter, chapterIndex) => {
      const sectionsHtml = chapter.sections
        .map(
          (section, sectionIndex) => `
          <section class="section">
            <h3>Section ${chapterIndex + 1}.${sectionIndex + 1}: ${escapeHtml(section.heading)}</h3>
            <p>${escapeHtml(section.text).replaceAll("\n", "<br />")}</p>
          </section>
        `,
        )
        .join("\n");

      return `
        <article class="chapter">
          <h2>Chapter ${chapterIndex + 1}: ${escapeHtml(chapter.title)}</h2>
          ${sectionsHtml}
        </article>
      `;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(input.title)}</title>
    <style>
      body { font-family: Inter, Arial, sans-serif; margin: 40px; color: #111827; }
      .meta { margin-bottom: 24px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; }
      .chapter { margin-bottom: 32px; }
      .section { margin: 12px 0 18px; }
      h1, h2, h3 { margin: 0 0 8px; }
      p { line-height: 1.6; margin: 0; }
      .small { color: #6b7280; font-size: 12px; }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(input.title)}</h1>
    <div class="meta">
      <div><strong>Niche:</strong> ${escapeHtml(input.niche)}</div>
      <div><strong>Category:</strong> ${escapeHtml(input.category)}</div>
      <div><strong>Tone:</strong> ${escapeHtml(input.tone)}</div>
      <div><strong>Language:</strong> ${escapeHtml(input.language)}</div>
      <div><strong>Profile:</strong> ${escapeHtml(input.profile)}</div>
      <div><strong>Format:</strong> ${escapeHtml(input.format)}</div>
      <div class="small">Generated at ${escapeHtml(input.generatedAtIso)} UTC</div>
    </div>
    ${chapterHtml}
  </body>
</html>`;
}

export function toUtf8ByteLength(text: string) {
  return new TextEncoder().encode(text).byteLength;
}

export function inferDownloadFileName(format: string) {
  const ext = inferExtension(format);
  return `ebook.${ext}`;
}

export function inferMimeType(format: string) {
  switch (format) {
    case "pdf":
      return "application/pdf";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "epub":
      return "application/epub+zip";
    default:
      return "application/octet-stream";
  }
}

export async function persistFallbackExportToR2(input: {
  r2Key: string;
  format: "pdf" | "docx" | "epub";
  textPayload: string;
  htmlPayload: string;
}) {
  const uploadBody = input.format === "pdf" ? input.htmlPayload : input.textPayload;

  // Phase-safe fallback payloads:
  // - PDF path stores HTML payload for browser/PDF-print compatibility.
  // - DOCX/EPUB paths store UTF-8 text payload.
  await putR2Object({
    r2Key: input.r2Key,
    body: uploadBody,
    contentType: input.format === "pdf" ? "text/html; charset=utf-8" : "text/plain; charset=utf-8",
    cacheControl: "private, max-age=600",
  });

  return {
    fileSizeBytes: toUtf8ByteLength(uploadBody),
  };
}

export async function createSignedExportDownloadUrl(input: {
  r2Key: string;
  expiresSeconds?: number;
}) {
  return createSignedR2GetUrl({
    r2Key: input.r2Key,
    expiresSeconds: input.expiresSeconds ?? 600,
  });
}

