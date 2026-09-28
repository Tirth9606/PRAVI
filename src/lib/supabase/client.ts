"use client";

/**
 * Browser Supabase client (uses the PUBLIC publishable/anon key only).
 * All privileged access is denied by RLS. Never place a service-role key here.
 */

import { createBrowserClient } from "@supabase/ssr";
import { assertSupabaseEnv } from "@/lib/env";

export function createSupabaseBrowserClient() {
  const { url, publishableKey } = assertSupabaseEnv();
  return createBrowserClient(url, publishableKey);
}
