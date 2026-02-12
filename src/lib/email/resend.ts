import "server-only";

import { getEmailEnv } from "@/lib/env/server";

type ResendError = {
  message?: string;
  name?: string;
};

function isResendSendResponse(value: unknown): value is { id: string } {
  return !!value && typeof value === "object" && typeof (value as { id?: unknown }).id === "string";
}

export async function sendResendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
}) {
  const env = getEmailEnv();

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.EMAIL_PROVIDER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
      ...(env.EMAIL_REPLY_TO ? { reply_to: env.EMAIL_REPLY_TO } : null),
      ...(input.headers ? { headers: input.headers } : null),
    }),
  });

  if (!res.ok) {
    let message = `Email provider error (${res.status})`;
    try {
      const data = (await res.json()) as ResendError;
      if (data?.message) message = data.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const json = (await res.json()) as unknown;
  if (!isResendSendResponse(json)) {
    throw new Error("Unexpected response from email provider.");
  }

  return { id: json.id };
}

