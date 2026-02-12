import "server-only";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value: string) {
  return escapeHtml(value);
}

function isSafeLink(href: string) {
  return /^https?:\/\//i.test(href) || /^mailto:/i.test(href);
}

function renderInline(markdown: string) {
  // Escape first, then apply a tiny markdown subset.
  let out = escapeHtml(markdown);

  // Links: [text](https://example.com)
  out = out.replaceAll(
    /\[([^\]]+)]\(([^)]+)\)/g,
    (_m, label: string, href: string) => {
      const trimmed = String(href ?? "").trim();
      if (!isSafeLink(trimmed)) return label;
      return `<a href="${escapeAttr(trimmed)}" style="color:#111827; text-decoration:underline; font-weight:600;">${escapeHtml(
        label,
      )}</a>`;
    },
  );

  // Bold: **text**
  out = out.replaceAll(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // Italic: *text*
  out = out.replaceAll(/\*([^*]+)\*/g, "<em>$1</em>");

  return out;
}

function renderMarkdownToHtml(bodyMarkdown: string) {
  const normalized = bodyMarkdown.replaceAll("\r\n", "\n").replaceAll("\r", "\n").trim();
  if (!normalized) return "";

  const parts = normalized.split(/\n{2,}/g);
  return parts
    .map((p) => {
      const inline = renderInline(p).replaceAll("\n", "<br/>\n");
      return `<p style="margin:0 0 14px 0; line-height:1.7;">${inline}</p>`;
    })
    .join("\n");
}

export function renderCampaignEmail(input: {
  subject: string;
  previewText?: string | null;
  bodyMarkdown: string;
  unsubscribeUrl: string;
}) {
  const preview = (input.previewText ?? "").trim();
  const bodyHtml = renderMarkdownToHtml(input.bodyMarkdown);
  const safeUnsub = escapeAttr(input.unsubscribeUrl);

  const preheaderHtml = preview
    ? `<div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
  ${escapeHtml(preview)}
</div>`
    : "";

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(input.subject)}</title>
  </head>
  <body style="margin:0; padding:0; background:#f4f4f5;">
    ${preheaderHtml}
    <div style="padding:28px 14px;">
      <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e4e4e7; border-radius:16px; overflow:hidden;">
        <div style="padding:22px 22px 0 22px;">
          <p style="margin:0 0 10px 0; font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; font-size:12px; color:#71717a; letter-spacing:0.02em; text-transform:uppercase;">
            ProfitMRR Library
          </p>
          <h1 style="margin:0 0 14px 0; font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; font-size:20px; line-height:1.35; color:#111827;">
            ${escapeHtml(input.subject)}
          </h1>
        </div>

        <div style="padding:0 22px 22px 22px; font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; color:#111827; font-size:14px;">
          ${bodyHtml}

          <div style="margin-top:22px; padding-top:14px; border-top:1px solid #f4f4f5;">
            <p style="margin:0; font-size:12px; line-height:1.6; color:#6b7280;">
              You’re receiving this because you have an account with ProfitMRR Library.
              <a href="${safeUnsub}" style="color:#111827; text-decoration:underline; font-weight:600;">Unsubscribe</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;

  const text = `${input.bodyMarkdown.trim()}\n\n---\nUnsubscribe: ${input.unsubscribeUrl}`;

  return { html, text };
}

