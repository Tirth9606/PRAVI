import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  RoadProject,
  ProjectApproval,
  Budget,
  Tender,
  Contract,
  ConstructionUpdate,
  ConstructionInspection,
  DocumentRecord,
  AuditLog,
  TenderBid,
} from "@/types/models";
import type { ProjectStatus } from "@/lib/domain/enums";

export interface ProjectFilters {
  status?: string;
  ward?: string;
  roadType?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ProjectListResult {
  rows: RoadProject[];
  total: number;
  page: number;
  pageSize: number;
}

const DEFAULT_PAGE_SIZE = 20;

export async function listProjects(filters: ProjectFilters = {}): Promise<ProjectListResult> {
  const sb = await createSupabaseServerClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = sb.from("road_projects").select("*", { count: "exact" });

  if (filters.status) q = q.eq("status", filters.status);
  if (filters.ward) q = q.eq("ward", filters.ward);
  if (filters.roadType) q = q.eq("road_type", filters.roadType);
  if (filters.search) {
    const term = `%${filters.search}%`;
    q = q.or(`project_code.ilike.${term},project_name.ilike.${term},road_name.ilike.${term}`);
  }

  q = q.order("created_at", { ascending: false }).range(from, to);

  const { data, count, error } = await q;
  if (error) throw new Error(error.message);

  return { rows: (data ?? []) as RoadProject[], total: count ?? 0, page, pageSize };
}

/** Distinct wards for filter dropdowns. */
export async function getProjectWards(): Promise<string[]> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("road_projects").select("ward").order("ward");
  const set = new Set<string>();
  for (const r of data ?? []) if (r.ward) set.add(r.ward as string);
  return Array.from(set);
}

/** Latest physical progress per project id (for the list Progress column). */
export async function getLatestProgress(projectIds: string[]): Promise<Record<string, number>> {
  if (projectIds.length === 0) return {};
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from("construction_updates")
    .select("project_id, physical_progress, update_date")
    .in("project_id", projectIds)
    .order("update_date", { ascending: false });
  const map: Record<string, number> = {};
  for (const row of data ?? []) {
    if (!(row.project_id in map)) map[row.project_id] = Number(row.physical_progress);
  }
  return map;
}

export interface ProjectDetail {
  project: RoadProject;
  approvals: ProjectApproval[];
  budgets: Budget[];
  tenders: Tender[];
  bids: TenderBid[];
  contracts: Contract[];
  updates: ConstructionUpdate[];
  inspections: ConstructionInspection[];
  documents: DocumentRecord[];
  audit: AuditLog[];
  latestProgress: number | null;
}

export async function getProjectDetail(id: string): Promise<ProjectDetail | null> {
  const sb = await createSupabaseServerClient();
  const { data: project } = await sb.from("road_projects").select("*").eq("id", id).maybeSingle();
  if (!project) return null;

  const [approvals, budgets, tenders, contracts, updates, inspections, documents, audit] =
    await Promise.all([
      sb.from("project_approvals").select("*").eq("project_id", id).order("created_at", { ascending: false }),
      sb.from("budgets").select("*").eq("project_id", id).order("created_at", { ascending: false }),
      sb.from("tenders").select("*").eq("project_id", id).order("created_at", { ascending: false }),
      sb.from("contracts").select("*").eq("project_id", id).order("created_at", { ascending: false }),
      sb.from("construction_updates").select("*").eq("project_id", id).order("update_date", { ascending: false }),
      sb.from("construction_inspections").select("*").eq("project_id", id).order("inspection_date", { ascending: false }),
      sb.from("documents").select("*").eq("project_id", id).order("created_at", { ascending: false }),
      sb.from("audit_logs").select("*").eq("entity_type", "road_project").eq("entity_id", id).order("timestamp", { ascending: false }).limit(50),
    ]);

  const tenderIds = (tenders.data ?? []).map((t) => t.id);
  let bids: TenderBid[] = [];
  if (tenderIds.length > 0) {
    const { data: bidData } = await sb.from("tender_bids").select("*").in("tender_id", tenderIds).order("bid_amount", { ascending: true });
    bids = (bidData ?? []) as TenderBid[];
  }

  const latestProgress = (updates.data ?? [])[0]?.physical_progress ?? null;

  return {
    project: project as RoadProject,
    approvals: (approvals.data ?? []) as ProjectApproval[],
    budgets: (budgets.data ?? []) as Budget[],
    tenders: (tenders.data ?? []) as Tender[],
    bids,
    contracts: (contracts.data ?? []) as Contract[],
    updates: (updates.data ?? []) as ConstructionUpdate[],
    inspections: (inspections.data ?? []) as ConstructionInspection[],
    documents: (documents.data ?? []) as DocumentRecord[],
    audit: (audit.data ?? []) as AuditLog[],
    latestProgress: latestProgress === null ? null : Number(latestProgress),
  };
}

export function isActiveStatus(status: ProjectStatus): boolean {
  return !["COMPLETED", "HANDED_OVER", "CANCELLED"].includes(status);
}
