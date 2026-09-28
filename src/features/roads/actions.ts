"use server";

import { revalidatePath } from "next/cache";
import { authorize, ok, toActionError, parseForm, fail, type ActionResult } from "@/lib/action-helpers";
import { roadSchema, maintenanceSchema, maintenanceCompleteSchema, defectSchema } from "@/lib/validation";
import { recordAudit } from "@/lib/audit";
import { assertMaintenanceTransition } from "@/lib/domain/lifecycle";
import type { MaintenanceStatus } from "@/lib/domain/enums";

// --- Roads ------------------------------------------------------------------
export async function upsertRoadAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize("road.manage");
    const input = parseForm(roadSchema, formData);
    const id = String(formData.get("id") ?? "");
    if (id) {
      const { error } = await supabase.from("roads").update(input).eq("id", id);
      if (error) throw new Error(error.message);
      await recordAudit({ userId: ctx.profile.id, action: "UPDATE", entityType: "road", entityId: id });
    } else {
      const { data, error } = await supabase.from("roads").insert({ ...input, status: "OPERATIONAL" }).select("id").single();
      if (error) throw new Error(error.message);
      await recordAudit({ userId: ctx.profile.id, action: "CREATE", entityType: "road", entityId: data.id });
    }
    revalidatePath("/officer/roads");
    return ok(undefined, id ? "Road updated." : "Road registered.");
  } catch (err) {
    return toActionError(err);
  }
}

// --- Defects (officer create; inspector create lives in inspector actions) --
export async function createDefectAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize("road.manage");
    const input = parseForm(defectSchema, formData);
    const { error } = await supabase.from("defects").insert({ ...input, status: "OPEN" });
    if (error) throw new Error(error.message);
    await recordAudit({ userId: ctx.profile.id, action: "CREATE", entityType: "defect", entityId: input.road_id });
    revalidatePath(`/officer/roads/${input.road_id}`);
    return ok(undefined, "Defect recorded.");
  } catch (err) {
    return toActionError(err);
  }
}

// --- Maintenance workflow: PENDING → APPROVED → IN_PROGRESS → COMPLETED ------
export async function createMaintenanceAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize("maintenance.create");
    const input = parseForm(maintenanceSchema, formData);
    const { error } = await supabase.from("maintenance").insert({
      road_id: input.road_id,
      inspection_id: input.inspection_id ?? null,
      work_type: input.work_type,
      priority: input.priority,
      estimated_cost: input.estimated_cost,
      remarks: input.remarks ?? null,
      status: "PENDING",
    });
    if (error) throw new Error(error.message);
    await recordAudit({ userId: ctx.profile.id, action: "CREATE", entityType: "maintenance", entityId: input.road_id });
    revalidatePath("/officer/maintenance");
    revalidatePath(`/officer/roads/${input.road_id}`);
    return ok(undefined, "Maintenance task created.");
  } catch (err) {
    return toActionError(err);
  }
}

async function moveMaintenance(
  permission: Parameters<typeof authorize>[0],
  maintenanceId: string,
  to: MaintenanceStatus,
  audit: Parameters<typeof recordAudit>[0]["action"],
  successMessage: string,
  extraPatch?: Record<string, unknown>,
): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize(permission);
    const { data: m } = await supabase.from("maintenance").select("*").eq("id", maintenanceId).maybeSingle();
    if (!m) return fail("Maintenance task not found.");
    assertMaintenanceTransition(m.status as MaintenanceStatus, to);
    const patch: Record<string, unknown> = { status: to, ...extraPatch };
    if (to === "APPROVED") patch.approved_by = ctx.profile.id;
    await supabase.from("maintenance").update(patch).eq("id", maintenanceId);
    await recordAudit({
      userId: ctx.profile.id,
      action: audit,
      entityType: "maintenance",
      entityId: maintenanceId,
      oldValue: { status: m.status },
      newValue: { status: to },
    });
    revalidatePath("/officer/maintenance");
    revalidatePath(`/officer/roads/${m.road_id}`);
    return ok(undefined, successMessage);
  } catch (err) {
    return toActionError(err);
  }
}

export async function approveMaintenanceAction(maintenanceId: string): Promise<ActionResult> {
  return moveMaintenance("maintenance.approve", maintenanceId, "APPROVED", "MAINTENANCE_APPROVED", "Maintenance approved.");
}

export async function startMaintenanceAction(maintenanceId: string): Promise<ActionResult> {
  return moveMaintenance("maintenance.approve", maintenanceId, "IN_PROGRESS", "UPDATE", "Maintenance in progress.", {
    start_date: new Date().toISOString().slice(0, 10),
  });
}

/** Complete maintenance → set actual cost/date AND update roads.last_maintenance_date (spec §20). */
export async function completeMaintenanceAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize("maintenance.complete");
    const input = parseForm(maintenanceCompleteSchema, formData);
    const { data: m } = await supabase.from("maintenance").select("*").eq("id", input.id).maybeSingle();
    if (!m) return fail("Maintenance task not found.");
    assertMaintenanceTransition(m.status as MaintenanceStatus, "COMPLETED");

    await supabase
      .from("maintenance")
      .update({
        status: "COMPLETED",
        actual_cost: input.actual_cost,
        completion_date: input.completion_date,
        remarks: input.remarks ?? m.remarks,
      })
      .eq("id", input.id);

    // Update the road's last maintenance date. Do NOT invent a new condition.
    await supabase
      .from("roads")
      .update({ last_maintenance_date: input.completion_date, status: "OPERATIONAL" })
      .eq("id", m.road_id);

    await recordAudit({
      userId: ctx.profile.id,
      action: "MAINTENANCE_COMPLETED",
      entityType: "maintenance",
      entityId: input.id,
      newValue: { actual_cost: input.actual_cost, completion_date: input.completion_date },
    });

    revalidatePath("/officer/maintenance");
    revalidatePath(`/officer/roads/${m.road_id}`);
    return ok(undefined, "Maintenance completed.");
  } catch (err) {
    return toActionError(err);
  }
}
