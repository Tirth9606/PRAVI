import "server-only";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser, type AuthContext } from "@/lib/auth/session";
import { assertPermission, AuthorizationError, type Permission } from "@/lib/domain/rbac";
import { LifecycleError } from "@/lib/domain/lifecycle";

export interface ActionResult<T = unknown> {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  data?: T;
}

export function ok<T>(data?: T, message?: string): ActionResult<T> {
  return { ok: true, data, message };
}

export function fail<T = unknown>(message: string, fieldErrors?: Record<string, string>): ActionResult<T> {
  return { ok: false, message, fieldErrors };
}

/**
 * Resolve the current user, assert they hold `permission`, and return an
 * authenticated Supabase client (RLS still applies as a second guard).
 */
export async function authorize(permission: Permission): Promise<{
  ctx: AuthContext;
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
}> {
  const ctx = await requireUser();
  assertPermission(ctx.profile.role, permission);
  const supabase = await createSupabaseServerClient();
  return { ctx, supabase };
}

/** Turn a thrown error into a user-facing ActionResult. */
export function toActionError(err: unknown): ActionResult {
  if (err instanceof z.ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of err.issues) {
      const key = issue.path.join(".") || "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors };
  }
  if (err instanceof AuthorizationError) return fail(err.message);
  if (err instanceof LifecycleError) return fail(err.message);
  if (err instanceof Error) return fail(err.message);
  return fail("An unexpected error occurred.");
}

/** Parse a FormData object with a Zod schema, coercing empty strings to undefined. */
export function parseForm<T extends z.ZodTypeAny>(schema: T, formData: FormData): z.infer<T> {
  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      raw[key] = value === "" ? undefined : value;
    } else {
      raw[key] = value;
    }
  }
  return schema.parse(raw);
}
