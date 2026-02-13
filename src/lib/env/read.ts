import "server-only";

type CloudflareContextLike = {
  env?: Record<string, unknown>;
};

type ProcessLike = {
  env?: Record<string, unknown>;
};

function toNonEmptyString(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function getCloudflareBindings(): Record<string, unknown> | null {
  const symbol = Symbol.for("__cloudflare-context__");
  const globalScope = globalThis as unknown as Record<PropertyKey, unknown>;
  const context = globalScope[symbol] as CloudflareContextLike | undefined;

  if (!context || typeof context !== "object") return null;
  if (!context.env || typeof context.env !== "object") return null;

  return context.env;
}

function getProcessEnv(): Record<string, unknown> | null {
  const globalScope = globalThis as unknown as Record<PropertyKey, unknown>;
  const processLike = globalScope.process as ProcessLike | undefined;

  if (!processLike || typeof processLike !== "object") return null;
  if (!processLike.env || typeof processLike.env !== "object") return null;

  return processLike.env;
}

/**
 * Reads runtime configuration in deterministic order:
 * 1) process.env primary name
 * 2) process.env aliases
 * 3) Cloudflare runtime bindings primary name
 * 4) Cloudflare runtime bindings aliases
 */
export function readEnvString(primaryName: string, aliases: string[] = []) {
  const keys = [primaryName, ...aliases];
  const processEnv = getProcessEnv();

  if (processEnv) {
    for (const key of keys) {
      const value = toNonEmptyString(processEnv[key]);
      if (value) return value;
    }
  }

  const bindings = getCloudflareBindings();
  if (!bindings) return undefined;

  for (const key of keys) {
    const value = toNonEmptyString(bindings[key]);
    if (value) return value;
  }

  return undefined;
}

