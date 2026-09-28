"use server";

import { revalidatePath } from "next/cache";
import { authorize, ok, toActionError, parseForm, fail, type ActionResult } from "@/lib/action-helpers";
import { constructionUpdateSchema } from "@/lib/validation";
import { recordAudit } from "@/lib/audit";

/** Officer records a construction progress update (spec §15). */
export async function createConstructionUpdateAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize("construction.update");
    const input = parseForm(constructionUpdateSchema, formData);
    const { error } = await supabase.from("construction_updates").insert({
      project_id: input.project_id,
      reported_by: ctx.profile.id,
      update_date: input.update_date,
      physical_progress: input.physical_progress,
      financial_progress: input.financial_progress,
      amount_claimed: input.amount_claimed ?? null,
      current_stage: input.current_stage,
      remarks: input.remarks ?? null,
      status: "SUBMITTED",
      photo_urls: [],
    });
    if (error) throw new Error(error.message);
    await recordAudit({
      userId: ctx.profile.id,
      action: "UPDATE",
      entityType: "construction_update",
      entityId: input.project_id,
      newValue: { physical_progress: input.physical_progress },
    });
    revalidatePath(`/officer/projects/${input.project_id}`);
    revalidatePath("/officer/construction");
    return ok(undefined, "Progress update recorded.");
  } catch (err) {
    return toActionError(err);
  }
}

/** Officer reviews a construction inspection submitted by an inspector. */
export async function reviewConstructionInspectionAction(
  inspectionId: string,
  status: "REVIEWED" | "ACTION_REQUIRED",
): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize("construction.verify");
    const { data: insp } = await supabase
      .from("construction_inspections")
      .select("project_id")
      .eq("id", inspectionId)
      .maybeSingle();
    if (!insp) return fail("Inspection not found.");
    await supabase.from("construction_inspections").update({ status }).eq("id", inspectionId);
    await recordAudit({
      userId: ctx.profile.id,
      action: "UPDATE",
      entityType: "construction_inspection",
      entityId: inspectionId,
      newValue: { status },
    });
    revalidatePath(`/officer/projects/${insp.project_id}`);
    return ok(undefined, "Inspection reviewed.");
  } catch (err) {
    return toActionError(err);
  }
}
