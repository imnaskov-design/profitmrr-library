export type SubscriptionStatus = "active" | "cancelled" | "expired" | "inactive";

export type EbookStatus = "draft" | "generating" | "ready" | "failed" | "archived";
export type EbookJobStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled";

export function normalizeEbookStatus(value: unknown): EbookStatus {
  if (value === "draft" || value === "generating" || value === "ready" || value === "failed" || value === "archived") {
    return value;
  }

  return "draft";
}

export function normalizeEbookJobStatus(value: unknown): EbookJobStatus {
  if (value === "queued" || value === "running" || value === "succeeded" || value === "failed" || value === "cancelled") {
    return value;
  }

  return "queued";
}

export function normalizeSubscriptionStatus(value: unknown): SubscriptionStatus {
  if (
    value === "active" ||
    value === "cancelled" ||
    value === "expired" ||
    value === "inactive"
  ) {
    return value;
  }

  return "inactive";
}

export function parseTimestamptz(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export function formatDateShort(
  value: string | Date | null | undefined,
  locale = "en",
): string | null {
  const d =
    value instanceof Date
      ? value
      : typeof value === "string"
        ? new Date(value)
        : null;

  if (!d || Number.isNaN(d.getTime())) return null;

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function hasSubscriptionAccess(input: {
  status: SubscriptionStatus;
  currentPeriodEnd: string | null | undefined;
  now?: Date;
}): boolean {
  const now = input.now ?? new Date();
  const end = parseTimestamptz(input.currentPeriodEnd);

  if (input.status === "active") return true;
  if (input.status === "cancelled") return !!(end && now < end);
  return false;
}

export function getSubscriptionSummary(input: {
  status: SubscriptionStatus;
  currentPeriodEnd: string | null | undefined;
  now?: Date;
  locale?: string;
}) {
  const locale = input.locale ?? "en";
  const now = input.now ?? new Date();
  const endsAt = parseTimestamptz(input.currentPeriodEnd);
  const hasAccess = hasSubscriptionAccess({
    status: input.status,
    currentPeriodEnd: input.currentPeriodEnd,
    now,
  });

  const endFormatted = formatDateShort(endsAt, locale);

  let title: string;
  let detail: string | null = null;

  switch (input.status) {
    case "active":
      title = "Active";
      detail = endFormatted ? `Renews on ${endFormatted}` : null;
      break;
    case "cancelled":
      title = "Cancelled";
      detail = endFormatted ? `Access until ${endFormatted}` : null;
      break;
    case "expired":
      title = "Expired";
      detail = endFormatted ? `Expired on ${endFormatted}` : null;
      break;
    default:
      title = "Inactive";
      detail = null;
  }

  return {
    hasAccess,
    endsAt,
    title,
    detail,
  };
}

