/** Vitaway core-backend. Browser calls are proxied; see getApiBaseUrl. */
export const DEFAULT_CARE_API_BASE_URL = "https://care-api.vitaway.org/api/v1";

/** Same-origin prefix rewritten to the care-api base in next.config.ts. */
export const CARE_API_PROXY_PATH = "/api/care";

export const ORG_PORTAL = "organization" as const;

export function isLegacyLaravelOrgBase(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    return /\/api\/organization\/?$/i.test(new URL(trimmed).pathname);
  } catch {
    return /\/api\/organization\/?$/i.test(trimmed);
  }
}

/**
 * Upstream core-backend base.
 * A stale Laravel organization URL (…/api/organization) is ignored so auth
 * cannot stay on the email-only EHR path.
 */
export function resolveApiBaseUrl(configured: string | undefined | null): string {
  const value = configured?.trim();
  if (!value || isLegacyLaravelOrgBase(value)) {
    return DEFAULT_CARE_API_BASE_URL;
  }
  return value.replace(/\/+$/, "");
}

/**
 * Base used by fetch.
 * The browser uses the Next rewrite because care-api CORS allows
 * care.vitaway.org and ehr.vitaway.org, not organizations.vitaway.org.
 */
export function getApiBaseUrl(configured?: string | null): string {
  if (typeof window !== "undefined") return CARE_API_PROXY_PATH;
  return resolveApiBaseUrl(configured ?? process.env.NEXT_PUBLIC_API_BASE_URL);
}
