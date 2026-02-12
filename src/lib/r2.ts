import "server-only";

import { AwsClient } from "aws4fetch";

import { getR2Env } from "@/lib/env/server";

let cachedClient: AwsClient | null = null;

function getR2Client() {
  if (cachedClient) return cachedClient;
  const env = getR2Env();
  cachedClient = new AwsClient({
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    service: "s3",
    region: "auto",
  });
  return cachedClient;
}

function encodeR2Key(key: string) {
  const normalized = key.replace(/^\/+/, "");
  return normalized
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

export async function createSignedR2GetUrl(input: {
  r2Key: string;
  expiresSeconds?: number;
}) {
  const env = getR2Env();

  const url = new URL(
    `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET_NAME}/${encodeR2Key(
      input.r2Key,
    )}`,
  );

  // aws4fetch sets X-Amz-Expires to 86400 by default for S3 presigned URLs.
  // We want short-lived access to avoid permanent file URLs.
  url.searchParams.set("X-Amz-Expires", String(input.expiresSeconds ?? 600));

  const signed = await getR2Client().sign(url.toString(), {
    method: "GET",
    aws: {
      signQuery: true,
    },
  });

  return signed.url;
}

