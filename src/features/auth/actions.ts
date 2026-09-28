"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";
import { recordAudit } from "@/lib/audit";
import { ROLE_HOME } from "@/lib/domain/rbac";
import type { AppUser } from "@/types/models";

export interface AuthActionState {
  error?: string;
  code?: "invalid" | "inactive" | "notConfigured" | "unknown";
}

/**
 * Email/password sign-in via Supabase Auth. On success we verify the profile is
 * ACTIVE, write a LOGIN audit event, and redirect to the role home (spec §23).
 */
export async function signInAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { code: "notConfigured", error: "Authentication is not configured." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { code: "invalid", error: "Email and password are required." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    // Surface the real reason to the server log, and distinguish genuine
    // "invalid credentials" from configuration/API errors so they are debuggable.
    console.error("[auth] signInWithPassword failed:", {
      status: (error as { status?: number } | null)?.status,
      code: (error as { code?: string } | null)?.code,
      message: error?.message,
    });
    const msg = error?.message ?? "Sign-in failed.";
    const isCredentialError = /invalid login credentials/i.test(msg);
    if (isCredentialError) {
      return { code: "invalid", error: "Invalid email or password." };
    }
    // e.g. "Email not confirmed", "Invalid API key", network/URL errors.
    return { code: "unknown", error: msg };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    console.error("[auth] profile lookup failed:", profileError.message);
    await supabase.auth.signOut();
    return { code: "unknown", error: `Profile lookup failed: ${profileError.message}` };
  }

  const typed = profile as AppUser | null;
  if (!typed) {
    // Authenticated, but no application profile row exists (seed not applied,
    // or the auth-user trigger did not run for this account).
    await supabase.auth.signOut();
    return {
      code: "unknown",
      error:
        "Signed in, but no application profile exists for this account. Apply the seed or have an admin provision your profile.",
    };
  }
  if (typed.status !== "ACTIVE") {
    await supabase.auth.signOut();
    return { code: "inactive", error: "Your account is inactive. Contact your administrator." };
  }

  await recordAudit({
    userId: typed.id,
    action: "LOGIN",
    entityType: "auth",
    entityId: typed.id,
  });

  redirect(ROLE_HOME[typed.role]);
}

export async function signOutAction(): Promise<void> {
  const ctx = await getCurrentUser().catch(() => null);
  const supabase = await createSupabaseServerClient();
  if (ctx) {
    await recordAudit({
      userId: ctx.profile.id,
      action: "LOGOUT",
      entityType: "auth",
      entityId: ctx.profile.id,
    });
  }
  await supabase.auth.signOut();
  redirect("/login");
}
