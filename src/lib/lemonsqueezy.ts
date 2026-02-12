import "server-only";

import { getLemonSqueezyEnv } from "@/lib/env/server";

const LS_API_BASE = "https://api.lemonsqueezy.com/v1";

const cachedStoreIdForVariant: Record<string, string> = {};

type LemonApiError = {
  errors?: Array<{ title?: string; detail?: string; status?: string }>;
};

async function lemonFetch(path: string, init: RequestInit) {
  const env = getLemonSqueezyEnv();

  const res = await fetch(`${LS_API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${env.LEMONSQUEEZY_API_KEY}`,
      ...(init.headers ?? {}),
    },
  });

  if (res.ok) return res;

  let message = `LemonSqueezy API error (${res.status})`;
  try {
    const data = (await res.json()) as LemonApiError;
    const first = data?.errors?.[0];
    if (first?.detail || first?.title) {
      message = [first.title, first.detail].filter(Boolean).join(": ");
    }
  } catch {
    // ignore
  }

  throw new Error(message);
}

async function getStoreIdForVariant(variantId: string) {
  if (cachedStoreIdForVariant[variantId]) return cachedStoreIdForVariant[variantId];

  const res = await lemonFetch(`/variants/${variantId}/product`, {
    method: "GET",
  });
  const json = (await res.json()) as unknown;
  if (!isVariantProductResponse(json)) {
    throw new Error(
      "Unexpected response from LemonSqueezy when fetching variant product. Check your LEMONSQUEEZY_VARIANT_ID.",
    );
  }

  const storeId = json.data.attributes.store_id;

  if (!storeId) {
    throw new Error(
      "Unable to determine LemonSqueezy store ID from variant. Check your LEMONSQUEEZY_VARIANT_ID.",
    );
  }

  cachedStoreIdForVariant[variantId] = String(storeId);
  return cachedStoreIdForVariant[variantId];
}

type VariantResponse = {
  data: {
    attributes: {
      store_id: string | number;
    };
  };
};

type VariantProductResponse = {
  data: {
    attributes: {
      store_id: string | number;
    };
  };
};

function isVariantResponse(value: unknown): value is VariantResponse {
  if (!value || typeof value !== "object") return false;
  const storeId = (value as VariantResponse)?.data?.attributes?.store_id;
  return typeof storeId === "string" || typeof storeId === "number";
}

function isVariantProductResponse(value: unknown): value is VariantProductResponse {
  if (!value || typeof value !== "object") return false;
  const storeId = (value as VariantProductResponse)?.data?.attributes?.store_id;
  return typeof storeId === "string" || typeof storeId === "number";
}

// Kept for backwards compatibility if LemonSqueezy changes payload shape again.
type LegacyVariantResponse = {
  data: {
    relationships: {
      store: {
        data: { id: string | number };
      };
    };
  };
};

function isLegacyVariantResponse(value: unknown): value is LegacyVariantResponse {
  if (!value || typeof value !== "object") return false;
  const id = (value as LegacyVariantResponse)?.data?.relationships?.store?.data?.id;
  return typeof id === "string" || typeof id === "number";
}

export async function createLemonSqueezyCheckout(input: {
  email: string;
  name?: string;
  redirectUrl: string;
  customData?: Record<string, unknown>;
}) {
  const env = getLemonSqueezyEnv();
  const variantId = env.LEMONSQUEEZY_VARIANT_ID;
  const storeId = await getStoreIdForVariant(variantId);

  const body = {
    data: {
      type: "checkouts",
      attributes: {
        product_options: {
          redirect_url: input.redirectUrl,
        },
        checkout_data: {
          email: input.email,
          ...(input.name ? { name: input.name } : null),
          ...(input.customData && Object.keys(input.customData).length
            ? { custom: input.customData }
            : null),
        },
      },
      relationships: {
        store: { data: { type: "stores", id: String(storeId) } },
        variant: { data: { type: "variants", id: String(variantId) } },
      },
    },
  };

  const res = await lemonFetch(`/checkouts`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as unknown;
  if (!isCreateCheckoutResponse(json)) {
    throw new Error("Unexpected response from LemonSqueezy when creating checkout.");
  }
  const checkoutUrl = json.data.attributes.url;
  if (!checkoutUrl) {
    throw new Error("LemonSqueezy did not return a checkout URL.");
  }

  return String(checkoutUrl);
}

type CreateCheckoutResponse = {
  data: {
    attributes: {
      url: string;
    };
  };
};

function isCreateCheckoutResponse(value: unknown): value is CreateCheckoutResponse {
  if (!value || typeof value !== "object") return false;
  return typeof (value as CreateCheckoutResponse)?.data?.attributes?.url === "string";
}

