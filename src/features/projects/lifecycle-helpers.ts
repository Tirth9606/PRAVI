import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { assertProjectTransition } from "@/lib/domain/lifecycle";
import { recordAudit } from "@/lib/audit";
import type { ProjectStatus, AuditAction } from "@/lib/domain/enums";
import type { RoadProject } from "@/types/models";

type SB = Awaited<ReturnType<typeof createSupabaseServerClient>>;

/**
 * Fetch a project (must exist) and enforce the lifecycle guard before applying a
 * status transition. Writes an audit row. Returns the updated project row.
 * This is the single choke-point every lifecycle mutation flows through.
 */
export async function transitionProjectStatus(params: {
  supabase: SB;
  userId: string;
  projectId: string;
  to: ProjectStatus;
  auditAction: AuditAction;
  patch?: Partial<RoadProject>;
}): Promise<RoadProject> {
  const { supabase, userId, projectId, to, auditAction, patch } = params;

  const { data: current, error: readErr } = await supabase
    .from("road_projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();
  if (readErr) throw new Error(readErr.message);
  if (!current) throw new Error("Project not found.");

  const from = current.status as ProjectStatus;
  assertProjectTransition(from, to);

  const { data: updated, error: updErr } = await supabase
    .from("road_projects")
    .update({ status: to, ...patch })
    .eq("id", projectId)
    .select("*")
    .single();
  if (updErr) throw new Error(updErr.message);

  await recordAudit({
    userId,
    action: auditAction,
    entityType: "road_project",
    entityId: projectId,
    oldValue: { status: from },
    newValue: { status: to },
  });

  return updated as RoadProject;
}
