import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  RoadProject,
  Road,
  ConstructionInspection,
  RoadInspection,
  Defect,
} from "@/types/models";

/** All queries here run under the inspector's session; RLS restricts every
 *  result set to entities the inspector is assigned to (spec §29). */

export async function getAssignedProjects(): Promise<RoadProject[]> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("road_projects").select("*").order("updated_at", { ascending: false });
  return (data ?? []) as RoadProject[];
}

export async function getAssignedRoads(): Promise<Road[]> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("roads").select("*").order("priority", { ascending: false });
  return (data ?? []) as Road[];
}

export async function getMyConstructionInspections(): Promise<ConstructionInspection[]> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("construction_inspections").select("*").order("inspection_date", { ascending: false });
  return (data ?? []) as ConstructionInspection[];
}

export async function getMyRoadInspections(): Promise<RoadInspection[]> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("road_inspections").select("*").order("inspection_date", { ascending: false });
  return (data ?? []) as RoadInspection[];
}

export async function getVisibleDefects(): Promise<Defect[]> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("defects").select("*").order("created_at", { ascending: false });
  return (data ?? []) as Defect[];
}

export async function getInspectorDashboard() {
  const [projects, roads, cInsp, rInsp, defects] = await Promise.all([
    getAssignedProjects(),
    getAssignedRoads(),
    getMyConstructionInspections(),
    getMyRoadInspections(),
    getVisibleDefects(),
  ]);
  return {
    assignedProjects: projects.length,
    assignedRoads: roads.length,
    recentInspections: [...cInsp, ...rInsp]
      .sort((a, b) => (a.inspection_date < b.inspection_date ? 1 : -1))
      .slice(0, 5),
    pendingInspections: projects.filter((p) => p.status === "UNDER_CONSTRUCTION").length,
    openDefects: defects.filter((d) => d.status === "OPEN").length,
    projects,
    roads,
  };
}
