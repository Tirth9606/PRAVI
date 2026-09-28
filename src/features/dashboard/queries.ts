import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProjectStatus, RoadCondition } from "@/lib/domain/enums";

type SB = Awaited<ReturnType<typeof createSupabaseServerClient>>;

async function count(sb: SB, table: string, apply?: (q: any) => any): Promise<number> {
  let q = sb.from(table).select("*", { count: "exact", head: true });
  if (apply) q = apply(q);
  const { count: c } = await q;
  return c ?? 0;
}

export interface OfficerDashboardData {
  kpis: {
    activeProjects: number;
    underConstruction: number;
    completed: number;
    criticalRoads: number;
    pendingApprovals: number;
    pendingMaintenance: number;
  };
  pipeline: { status: ProjectStatus; count: number }[];
  roadConditions: { condition: RoadCondition; count: number }[];
  attention: {
    criticalRoads: { id: string; road_code: string; road_name: string; ward: string }[];
    pendingMaintenance: { id: string; work_type: string; priority: string; road_id: string }[];
  };
  impact: {
    totalExpenditure: number;
    roadsManaged: number;
    lengthUnderConstructionKm: number;
    completedProjects: number;
  };
}

const ACTIVE_STATUSES: ProjectStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "BUDGET_APPROVED",
  "TENDERING",
  "CONTRACTOR_SELECTED",
  "WORK_ORDER_ISSUED",
  "UNDER_CONSTRUCTION",
];

export async function getOfficerDashboard(): Promise<OfficerDashboardData> {
  const sb = await createSupabaseServerClient();

  const [
    activeProjects,
    underConstruction,
    completed,
    criticalRoads,
    pendingMaintenance,
    pendingApprovalProjects,
  ] = await Promise.all([
    count(sb, "road_projects", (q) => q.in("status", ACTIVE_STATUSES)),
    count(sb, "road_projects", (q) => q.eq("status", "UNDER_CONSTRUCTION")),
    count(sb, "road_projects", (q) => q.in("status", ["COMPLETED", "HANDED_OVER"])),
    count(sb, "roads", (q) => q.eq("current_condition", "CRITICAL")),
    count(sb, "maintenance", (q) => q.eq("status", "PENDING")),
    count(sb, "road_projects", (q) => q.in("status", ["SUBMITTED", "UNDER_REVIEW"])),
  ]);

  // Pipeline: group projects by status (single scan).
  const { data: projects } = await sb.from("road_projects").select("status, length_km, final_cost, approved_cost, estimated_cost");
  const pipelineMap = new Map<string, number>();
  let lengthUC = 0;
  let totalExpenditure = 0;
  let completedProjects = 0;
  for (const p of projects ?? []) {
    pipelineMap.set(p.status, (pipelineMap.get(p.status) ?? 0) + 1);
    if (p.status === "UNDER_CONSTRUCTION") lengthUC += Number(p.length_km ?? 0);
    if (p.status === "COMPLETED" || p.status === "HANDED_OVER") {
      completedProjects += 1;
      totalExpenditure += Number(p.final_cost ?? p.approved_cost ?? p.estimated_cost ?? 0);
    }
  }
  const pipeline = Array.from(pipelineMap.entries()).map(([status, c]) => ({
    status: status as ProjectStatus,
    count: c,
  }));

  // Road conditions distribution.
  const { data: roads } = await sb.from("roads").select("current_condition");
  const condMap = new Map<string, number>();
  for (const r of roads ?? []) {
    condMap.set(r.current_condition, (condMap.get(r.current_condition) ?? 0) + 1);
  }
  const roadConditions = (["GOOD", "MODERATE", "POOR", "CRITICAL"] as RoadCondition[]).map((condition) => ({
    condition,
    count: condMap.get(condition) ?? 0,
  }));

  const { data: criticalList } = await sb
    .from("roads")
    .select("id, road_code, road_name, ward")
    .eq("current_condition", "CRITICAL")
    .order("updated_at", { ascending: false })
    .limit(5);

  const { data: pendingMaintList } = await sb
    .from("maintenance")
    .select("id, work_type, priority, road_id")
    .eq("status", "PENDING")
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    kpis: {
      activeProjects,
      underConstruction,
      completed,
      criticalRoads,
      pendingApprovals: pendingApprovalProjects,
      pendingMaintenance,
    },
    pipeline,
    roadConditions,
    attention: {
      criticalRoads: criticalList ?? [],
      pendingMaintenance: pendingMaintList ?? [],
    },
    impact: {
      totalExpenditure,
      roadsManaged: roads?.length ?? 0,
      lengthUnderConstructionKm: lengthUC,
      completedProjects,
    },
  };
}
