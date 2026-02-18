import "server-only";

import { getServerEnv } from "@/lib/env/server";
import { renderCampaignEmail } from "@/lib/email/render";
import { sendResendEmail } from "@/lib/email/resend";

export async function sendRegisterInviteEmail(input: {
  to: string;
  token: string;
  expiresAtIso: string;
}) {
  const baseUrl = getServerEnv().APP_BASE_URL.replace(/\/$/, "");
  const registerUrl = `${baseUrl}/register?token=${encodeURIComponent(input.token)}&email=${encodeURIComponent(input.to)}`;

  const subject = "Your ProfitMRR account access link";
  const previewText = "Complete your account setup from this private registration link.";

  const bodyMarkdown = [
    "Your payment was confirmed.",
    "",
    "Use your private registration link below to create your member account:",
    "",
    `[Create your account](${registerUrl})`,
    "",
    "This link is tied to your checkout email and expires automatically.",
    `Expiry: **${new Date(input.expiresAtIso).toLocaleString("en")}**`,
    "",
    "If you already have an account with this email, you can ignore this message and sign in as normal.",
  ].join("\n");

  const rendered = renderCampaignEmail({
    subject,
    previewText,
    bodyMarkdown,
    unsubscribeUrl: `${baseUrl}/privacy`,
  });

  return sendResendEmail({
    to: input.to,
    subject,
    html: rendered.html,
    text: rendered.text,
  });
}

