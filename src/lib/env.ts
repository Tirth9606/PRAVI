/**
 * Environment variable access & validation.
 *
 * Public vars are read via NEXT_PUBLIC_* and may be embedded in the client bundle.
 * We DO NOT throw at import time when they are missing, because the spec requires
 * the app to build and run its non-DB surface even before credentials exist
 * (spec §47). Instead callers use `getSupabaseEnv()` / `assertSupabaseEnv()`.
 */

export interface SupabaseEnv {
  url: string;
  publishableKey: string;
}

export function getSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return null;
  return { url, publishableKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null;
}

/**
 * Returns the env or throws a clear, actionable error. Use this inside code
 * paths that genuinely require a live database (server actions, data fetching).
 */
export function assertSupabaseEnv(): SupabaseEnv {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local. See README > Supabase setup.",
    );
  }
  return env;
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/** Server-only. Never import from client components. */
export function getServiceRoleKey(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;
}
