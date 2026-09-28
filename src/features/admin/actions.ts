"use server";

import { revalidatePath } from "next/cache";
import { authorize, ok, toActionError, parseForm, fail, type ActionResult } from "@/lib/action-helpers";
import { userSchema, departmentSchema } from "@/lib/validation";
import { recordAudit } from "@/lib/audit";
import { getServiceRoleKey } from "@/lib/env";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

/** Update an existing user's profile (role, status, department, contact).
 *  Creating brand-new sign-in accounts requires the Supabase invite flow /
 *  service role (see README > Demo flow); this manages provisioned profiles. */
export async function updateUserAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize("user.manage");
    const input = parseForm(userSchema, formData);
    const id = String(formData.get("id") ?? "");
    if (!id) return fail("Creating new sign-in accounts requires the invite flow. See README.");

    const { data: before } = await supabase.from("users").select("role, status").eq("id", id).maybeSingle();
    const { error } = await supabase
      .from("users")
      .update({
        name: input.name,
        phone: input.phone ?? null,
        role: input.role,
        department_id: input.department_id ?? null,
        status: input.status,
      })
      .eq("id", id);
    if (error) throw new Error(error.message);

    await recordAudit({
      userId: ctx.profile.id,
      action: "UPDATE",
      entityType: "user",
      entityId: id,
      oldValue: before ?? undefined,
      newValue: { role: input.role, status: input.status },
    });
    revalidatePath("/admin/users");
    return ok(undefined, "User updated.");
  } catch (err) {
    return toActionError(err);
  }
}

/** Invite a new user by email (requires SUPABASE_SERVICE_ROLE_KEY). The auth
 *  trigger creates the matching profile; we then set role/department. */
export async function inviteUserAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const { ctx } = await authorize("user.manage");
    if (!getServiceRoleKey()) {
      return fail(
        "User invitations require SUPABASE_SERVICE_ROLE_KEY to be configured server-side. See README > Demo flow.",
      );
    }
    const input = parseForm(userSchema, formData);
    const admin = createSupabaseServiceClient();

    const { data, error } = await admin.auth.admin.inviteUserByEmail(input.email, {
      data: { name: input.name, role: input.role },
    });
    if (error || !data.user) throw new Error(error?.message ?? "Invite failed.");

    await admin
      .from("users")
      .update({
        name: input.name,
        phone: input.phone ?? null,
        role: input.role,
        department_id: input.department_id ?? null,
        status: input.status,
      })
      .eq("id", data.user.id);

    await recordAudit({
      userId: ctx.profile.id,
      action: "CREATE",
      entityType: "user",
      entityId: data.user.id,
      newValue: { email: input.email, role: input.role },
    });
    revalidatePath("/admin/users");
    return ok(undefined, "Invitation sent.");
  } catch (err) {
    return toActionError(err);
  }
}

export async function upsertDepartmentAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize("department.manage");
    const input = parseForm(departmentSchema, formData);
    const id = String(formData.get("id") ?? "");
    if (id) {
      const { error } = await supabase
        .from("departments")
        .update({ name: input.name, code: input.code, contact_email: input.contact_email ?? null })
        .eq("id", id);
      if (error) throw new Error(error.message);
      await recordAudit({ userId: ctx.profile.id, action: "UPDATE", entityType: "department", entityId: id });
    } else {
      const { data, error } = await supabase
        .from("departments")
        .insert({ name: input.name, code: input.code, contact_email: input.contact_email ?? null })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      await recordAudit({ userId: ctx.profile.id, action: "CREATE", entityType: "department", entityId: data.id });
    }
    revalidatePath("/admin/departments");
    return ok(undefined, id ? "Department updated." : "Department created.");
  } catch (err) {
    return toActionError(err);
  }
}
