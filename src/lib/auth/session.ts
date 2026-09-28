import "server-only";

/**
 * Server-side session & profile resolution (spec §23 Authentication flow):
 *   Supabase Auth → load profile → verify ACTIVE → determine role → redirect.
 */

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ROLE_HOME } from "@/lib/domain/rbac";
import type { AppUser } from "@/types/models";
import type { UserRole } from "@/lib/domain/enums";

export interface AuthContext {
  authId: string;
  email: string;
  profile: AppUser;
}

/**
 * Resolve the current user's auth id + application profile. Returns null when
 * not signed in, when the profile is missing, or when the account is INACTIVE.
 */
export async function getCurrentUser(): Promise<AuthContext | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;
  const typed = profile as AppUser;
  if (typed.status !== "ACTIVE") return null;

  return { authId: user.id, email: user.email ?? typed.email, profile: typed };
}

/** Require a signed-in ACTIVE user, else redirect to /login. */
export async function requireUser(): Promise<AuthContext> {
  const ctx = await getCurrentUser();
  if (!ctx) redirect("/login");
  return ctx;
}

/** Require a specific role. Redirects to the user's own home on mismatch,
 *  or to /not-authorized when the role cannot be determined. */
export async function requireRole(role: UserRole): Promise<AuthContext> {
  const ctx = await requireUser();
  if (ctx.profile.role !== role) {
    redirect(ROLE_HOME[ctx.profile.role] ?? "/not-authorized");
  }
  return ctx;
}
