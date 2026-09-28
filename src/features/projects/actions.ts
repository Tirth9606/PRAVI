"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authorize, ok, toActionError, parseForm, type ActionResult } from "@/lib/action-helpers";
import { projectCreateSchema, projectApprovalSchema } from "@/lib/validation";
import { recordAudit } from "@/lib/audit";
import { transitionProjectStatus } from "./lifecycle-helpers";

/** Create a new road project in DRAFT (spec §8, §22). */
export async function createProjectAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  let newId: string | null = null;
  try {
    const { ctx, supabase } = await authorize("project.create");
    const input = parseForm(projectCreateSchema, formData);

    const { data, error } = await supabase
      .from("road_projects")
      .insert({
        ...input,
        status: "DRAFT",
        created_by: ctx.profile.id,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    newId = data.id;

    await recordAudit({
      userId: ctx.profile.id,
      action: "CREATE",
      entityType: "road_project",
      entityId: data.id,
      newValue: { project_code: input.project_code, status: "DRAFT" },
    });
  } catch (err) {
    return toActionError(err);
  }
  revalidatePath("/officer/projects");
  redirect(`/officer/projects/${newId}`);
}

async function transition(
  permission: Parameters<typeof authorize>[0],
  projectId: string,
  to: Parameters<typeof transitionProjectStatus>[0]["to"],
  auditAction: Parameters<typeof transitionProjectStatus>[0]["auditAction"],
  patch?: Parameters<typeof transitionProjectStatus>[0]["patch"],
): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize(permission);
    await transitionProjectStatus({ supabase, userId: ctx.profile.id, projectId, to, auditAction, patch });
    revalidatePath(`/officer/projects/${projectId}`);
    revalidatePath("/officer/projects");
    return ok(undefined, "Status updated.");
  } catch (err) {
    return toActionError(err);
  }
}

export async function submitProjectAction(projectId: string): Promise<ActionResult> {
  return transition("project.submit", projectId, "SUBMITTED", "UPDATE");
}

export async function reviewProjectAction(projectId: string): Promise<ActionResult> {
  return transition("project.review", projectId, "UNDER_REVIEW", "UPDATE");
}

/** Approve a project (UNDER_REVIEW → APPROVED) and record a PROJECT_APPROVAL. */
export async function approveProjectAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize("project.approve");
    const { project_id, remarks } = parseForm(projectApprovalSchema, formData);

    await transitionProjectStatus({
      supabase,
      userId: ctx.profile.id,
      projectId: project_id,
      to: "APPROVED",
      auditAction: "APPROVE",
    });

    await supabase.from("project_approvals").insert({
      project_id,
      approved_by: ctx.profile.id,
      approval_type: "PROJECT_APPROVAL",
      status: "APPROVED",
      remarks: remarks ?? null,
      approved_at: new Date().toISOString(),
    });

    revalidatePath(`/officer/projects/${project_id}`);
    revalidatePath("/officer/approvals");
    return ok(undefined, "Project approved.");
  } catch (err) {
    return toActionError(err);
  }
}

export async function completeProjectAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize("project.complete");
    const { project_id, remarks } = parseForm(projectApprovalSchema, formData);

    await transitionProjectStatus({
      supabase,
      userId: ctx.profile.id,
      projectId: project_id,
      to: "COMPLETED",
      auditAction: "PROJECT_COMPLETED",
      patch: { actual_end_date: new Date().toISOString().slice(0, 10) },
    });

    await supabase.from("project_approvals").insert({
      project_id,
      approved_by: ctx.profile.id,
      approval_type: "COMPLETION_APPROVAL",
      status: "APPROVED",
      remarks: remarks ?? null,
      approved_at: new Date().toISOString(),
    });

    revalidatePath(`/officer/projects/${project_id}`);
    return ok(undefined, "Project marked completed.");
  } catch (err) {
    return toActionError(err);
  }
}

/**
 * Handover (COMPLETED → HANDED_OVER). Also provisions an operational road from
 * the project so it enters the maintenance lifecycle (spec §22, §17).
 */
export async function handoverProjectAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const { ctx, supabase } = await authorize("project.handover");
    const { project_id, remarks } = parseForm(projectApprovalSchema, formData);

    const project = await transitionProjectStatus({
      supabase,
      userId: ctx.profile.id,
      projectId: project_id,
      to: "HANDED_OVER",
      auditAction: "ROAD_HANDED_OVER",
    });

    await supabase.from("project_approvals").insert({
      project_id,
      approved_by: ctx.profile.id,
      approval_type: "HANDOVER_APPROVAL",
      status: "APPROVED",
      remarks: remarks ?? null,
      approved_at: new Date().toISOString(),
    });

    // Create the operational road if one does not already exist for this project.
    const { data: existing } = await supabase
      .from("roads")
      .select("id")
      .eq("project_id", project_id)
      .maybeSingle();

    if (!existing) {
      const today = new Date().toISOString().slice(0, 10);
      const { data: road } = await supabase
        .from("roads")
        .insert({
          project_id,
          road_code: `RD-${project.project_code}`,
          road_name: project.road_name,
          location: project.location,
          ward: project.ward,
          area: project.area,
          road_type: project.road_type,
          length_km: project.length_km,
          current_condition: "GOOD",
          priority: "MEDIUM",
          status: "OPERATIONAL",
          handover_date: today,
        })
        .select("id")
        .single();
      if (road) {
        await recordAudit({
          userId: ctx.profile.id,
          action: "CREATE",
          entityType: "road",
          entityId: road.id,
          newValue: { from_project: project_id },
        });
      }
    }

    revalidatePath(`/officer/projects/${project_id}`);
    revalidatePath("/officer/roads");
    return ok(undefined, "Project handed over and road registered.");
  } catch (err) {
    return toActionError(err);
  }
}

export async function cancelProjectAction(projectId: string): Promise<ActionResult> {
  return transition("project.edit", projectId, "CANCELLED", "UPDATE");
}
