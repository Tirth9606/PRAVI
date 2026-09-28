"use server";

import { revalidatePath } from "next/cache";
import { authorize, ok, toActionError, parseForm, type ActionResult } from "@/lib/action-helpers";
import {
  constructionInspectionSchema,
  roadInspectionSchema,
  defectSchema,
} from "@/lib/validation";
import { recordAudit } from "@/lib/audit";

function parsePhotoUrls(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);
}

/** Inspector submits a construction inspection for an ASSIGNED project.
 *  RLS additionally verifies inspector_id = auth.uid() AND assignment. */
export async function submitConstructionInspectionAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize("inspection.construction.submit");
    const input = parseForm(constructionInspectionSchema, formData);
    const { error } = await supabase.from("construction_inspections").insert({
      project_id: input.project_id,
      inspector_id: ctx.profile.id,
      inspection_date: input.inspection_date,
      progress_percentage: input.progress_percentage,
      quality_status: input.quality_status,
      issues_found: input.issues_found ?? null,
      remarks: input.remarks ?? null,
      photo_urls: parsePhotoUrls(input.photo_urls),
      status: "SUBMITTED",
    });
    if (error) throw new Error(error.message);
    await recordAudit({
      userId: ctx.profile.id,
      action: "INSPECTION_SUBMITTED",
      entityType: "construction_inspection",
      entityId: input.project_id,
    });
    revalidatePath("/inspector/inspections");
    revalidatePath("/inspector/dashboard");
    return ok(undefined, "Construction inspection submitted.");
  } catch (err) {
    return toActionError(err);
  }
}

/** Inspector submits a road inspection for an ASSIGNED road. */
export async function submitRoadInspectionAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize("inspection.road.submit");
    const input = parseForm(roadInspectionSchema, formData);
    const { data, error } = await supabase
      .from("road_inspections")
      .insert({
        road_id: input.road_id,
        inspector_id: ctx.profile.id,
        inspection_date: input.inspection_date,
        condition: input.condition,
        severity: input.severity,
        remarks: input.remarks ?? null,
        photo_urls: parsePhotoUrls(input.photo_urls),
        status: "SUBMITTED",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    // Record the recorded condition on the road + last inspection date.
    await supabase
      .from("roads")
      .update({ current_condition: input.condition, last_inspection_date: input.inspection_date })
      .eq("id", input.road_id);

    await recordAudit({
      userId: ctx.profile.id,
      action: "INSPECTION_SUBMITTED",
      entityType: "road_inspection",
      entityId: data.id,
      newValue: { condition: input.condition },
    });
    revalidatePath("/inspector/inspections");
    revalidatePath("/inspector/dashboard");
    return ok(undefined, "Road inspection submitted.");
  } catch (err) {
    return toActionError(err);
  }
}

/** Inspector creates a defect linked to an ASSIGNED road. */
export async function submitDefectAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize("defect.create");
    const input = parseForm(defectSchema, formData);
    const { error } = await supabase.from("defects").insert({
      road_id: input.road_id,
      inspection_id: input.inspection_id ?? null,
      type: input.type,
      severity: input.severity,
      quantity: input.quantity,
      description: input.description ?? null,
      status: "OPEN",
    });
    if (error) throw new Error(error.message);
    await recordAudit({ userId: ctx.profile.id, action: "CREATE", entityType: "defect", entityId: input.road_id });
    revalidatePath("/inspector/defects");
    return ok(undefined, "Defect reported.");
  } catch (err) {
    return toActionError(err);
  }
}
