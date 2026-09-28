import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Road,
  RoadInspection,
  Defect,
  Maintenance,
  DocumentRecord,
} from "@/types/models";

export interface RoadFilters {
  condition?: string;
  priority?: string;
  ward?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function listRoads(filters: RoadFilters = {}) {
  const sb = await createSupabaseServerClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? 20;
  const from = (page - 1) * pageSize;

  let q = sb.from("roads").select("*", { count: "exact" });
  if (filters.condition) q = q.eq("current_condition", filters.condition);
  if (filters.priority) q = q.eq("priority", filters.priority);
  if (filters.ward) q = q.eq("ward", filters.ward);
  if (filters.status) q = q.eq("status", filters.status);
  if (filters.search) {
    const term = `%${filters.search}%`;
    q = q.or(`road_code.ilike.${term},road_name.ilike.${term}`);
  }
  q = q.order("priority", { ascending: false }).order("created_at", { ascending: false }).range(from, from + pageSize - 1);

  const { data, count, error } = await q;
  if (error) throw new Error(error.message);
  return { rows: (data ?? []) as Road[], total: count ?? 0, page, pageSize };
}

export async function getRoadWards(): Promise<string[]> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("roads").select("ward");
  const set = new Set<string>();
  for (const r of data ?? []) if (r.ward) set.add(r.ward as string);
  return Array.from(set).sort();
}

export interface RoadDetail {
  road: Road;
  inspections: RoadInspection[];
  defects: Defect[];
  maintenance: Maintenance[];
  documents: DocumentRecord[];
  costHistory: { total: number; count: number };
}

export async function getRoadDetail(id: string): Promise<RoadDetail | null> {
  const sb = await createSupabaseServerClient();
  const { data: road } = await sb.from("roads").select("*").eq("id", id).maybeSingle();
  if (!road) return null;

  const [inspections, defects, maintenance, documents] = await Promise.all([
    sb.from("road_inspections").select("*").eq("road_id", id).order("inspection_date", { ascending: false }),
    sb.from("defects").select("*").eq("road_id", id).order("created_at", { ascending: false }),
    sb.from("maintenance").select("*").eq("road_id", id).order("created_at", { ascending: false }),
    sb.from("documents").select("*").eq("road_id", id).order("created_at", { ascending: false }),
  ]);

  const maint = (maintenance.data ?? []) as Maintenance[];
  const total = maint.reduce((s, m) => s + Number(m.actual_cost ?? 0), 0);

  return {
    road: road as Road,
    inspections: (inspections.data ?? []) as RoadInspection[],
    defects: (defects.data ?? []) as Defect[],
    maintenance: maint,
    documents: (documents.data ?? []) as DocumentRecord[],
    costHistory: { total, count: maint.filter((m) => m.status === "COMPLETED").length },
  };
}
