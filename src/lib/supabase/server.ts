import "server-only";

/**
 * Server-side Supabase clients for the Next.js App Router.
 *
 * - `createSupabaseServerClient()` reads/writes the auth cookies and runs as the
 *   signed-in user (RLS applies). Use it in Server Components, Route Handlers and
 *   Server Actions.
 * - `createSupabaseServiceClient()` uses the SERVICE ROLE key and bypasses RLS.
 *   It is isolated here (server-only) and must ONLY be used by trusted admin
 *   flows (e.g. provisioning auth users). Never expose it to the browser.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { assertSupabaseEnv, getServiceRoleKey } from "@/lib/env";

export async function createSupabaseServerClient() {
  const { url, publishableKey } = assertSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // `setAll` called from a Server Component — safe to ignore because the
          // middleware refreshes the session cookie on every request.
        }
      },
    },
  });
}

export function createSupabaseServiceClient() {
  const { url } = assertSupabaseEnv();
  const serviceKey = getServiceRoleKey();
  if (!serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. It is required only for admin " +
        "provisioning scripts and must never be exposed to the browser.",
    );
  }
  return createServerClient(url, serviceKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}
