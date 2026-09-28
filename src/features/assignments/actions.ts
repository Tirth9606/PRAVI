"use server";

import { revalidatePath } from "next/cache";
import { authorize, ok, toActionError, fail, type ActionResult } from "@/lib/action-helpers";
import { recordAudit } from "@/lib/audit";

/** Officer assigns an inspector to a project (spec §22: inspector must be
 *  assigned before inspection). */
export async function assignInspectorToProjectAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize("project.edit");
    const projectId = String(formData.get("project_id") ?? "");
    const inspectorId = String(formData.get("inspector_id") ?? "");
    if (!projectId || !inspectorId) return fail("Project and inspector are required.");

    const { error } = await supabase
      .from("project_assignments")
      .upsert(
        { project_id: projectId, inspector_id: inspectorId, assigned_by: ctx.profile.id },
        { onConflict: "project_id,inspector_id", ignoreDuplicates: true },
      );
    if (error) throw new Error(error.message);
    await recordAudit({
      userId: ctx.profile.id,
      action: "ASSIGN",
      entityType: "project_assignment",
      entityId: projectId,
      newValue: { inspector_id: inspectorId },
    });
    revalidatePath(`/officer/projects/${projectId}`);
    return ok(undefined, "Inspector assigned.");
  } catch (err) {
    return toActionError(err);
  }
}

export async function assignInspectorToRoadAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize("road.manage");
    const roadId = String(formData.get("road_id") ?? "");
    const inspectorId = String(formData.get("inspector_id") ?? "");
    if (!roadId || !inspectorId) return fail("Road and inspector are required.");

    const { error } = await supabase
      .from("road_assignments")
      .upsert(
        { road_id: roadId, inspector_id: inspectorId, assigned_by: ctx.profile.id },
        { onConflict: "road_id,inspector_id", ignoreDuplicates: true },
      );
    if (error) throw new Error(error.message);
    await recordAudit({
      userId: ctx.profile.id,
      action: "ASSIGN",
      entityType: "road_assignment",
      entityId: roadId,
      newValue: { inspector_id: inspectorId },
    });
    revalidatePath(`/officer/roads/${roadId}`);
    return ok(undefined, "Inspector assigned.");
  } catch (err) {
    return toActionError(err);
  }
}
