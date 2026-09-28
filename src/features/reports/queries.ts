import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toCSV } from "@/lib/csv";

export type ReportType =
  | "project-status"
  | "construction-progress"
  | "road-condition"
  | "maintenance"
  | "expenditure";

export const REPORT_TYPES: { type: ReportType; title: string }[] = [
  { type: "project-status", title: "Project Status" },
  { type: "construction-progress", title: "Construction Progress" },
  { type: "road-condition", title: "Road Condition" },
  { type: "maintenance", title: "Maintenance" },
  { type: "expenditure", title: "Expenditure Summary" },
];

/** Build the CSV for a given report from live DB data (spec §31). */
export async function buildReportCSV(type: ReportType): Promise<{ filename: string; csv: string }> {
  const sb = await createSupabaseServerClient();

  switch (type) {
    case "project-status": {
      const { data } = await sb
        .from("road_projects")
        .select("project_code, project_name, road_name, ward, road_type, status, estimated_cost, approved_cost, final_cost")
        .order("created_at", { ascending: false });
      const rows = (data ?? []).map((p) => [
        p.project_code, p.project_name, p.road_name, p.ward, p.road_type, p.status,
        p.estimated_cost, p.approved_cost, p.final_cost,
      ]);
      return {
        filename: "project-status.csv",
        csv: toCSV(
          ["Project Code", "Project Name", "Road", "Ward", "Road Type", "Status", "Estimated Cost", "Approved Cost", "Final Cost"],
          rows,
        ),
      };
    }
    case "construction-progress": {
      const { data } = await sb
        .from("construction_updates")
        .select("update_date, current_stage, physical_progress, financial_progress, amount_claimed, road_projects(project_code)")
        .order("update_date", { ascending: false });
      const rows = (data ?? []).map((u: any) => [
        u.road_projects?.project_code ?? "", u.update_date, u.current_stage,
        u.physical_progress, u.financial_progress, u.amount_claimed,
      ]);
      return {
        filename: "construction-progress.csv",
        csv: toCSV(["Project Code", "Date", "Stage", "Physical %", "Financial %", "Amount Claimed"], rows),
      };
    }
    case "road-condition": {
      const { data } = await sb
        .from("roads")
        .select("road_code, road_name, ward, road_type, current_condition, priority, status, last_inspection_date, last_maintenance_date")
        .order("priority", { ascending: false });
      const rows = (data ?? []).map((r) => [
        r.road_code, r.road_name, r.ward, r.road_type, r.current_condition, r.priority, r.status,
        r.last_inspection_date, r.last_maintenance_date,
      ]);
      return {
        filename: "road-condition.csv",
        csv: toCSV(["Road Code", "Road Name", "Ward", "Road Type", "Condition", "Priority", "Status", "Last Inspection", "Last Maintenance"], rows),
      };
    }
    case "maintenance": {
      const { data } = await sb
        .from("maintenance")
        .select("work_type, priority, status, estimated_cost, actual_cost, start_date, completion_date, roads(road_code)")
        .order("created_at", { ascending: false });
      const rows = (data ?? []).map((m: any) => [
        m.roads?.road_code ?? "", m.work_type, m.priority, m.status, m.estimated_cost, m.actual_cost, m.start_date, m.completion_date,
      ]);
      return {
        filename: "maintenance.csv",
        csv: toCSV(["Road Code", "Work Type", "Priority", "Status", "Estimated Cost", "Actual Cost", "Start Date", "Completion Date"], rows),
      };
    }
    case "expenditure": {
      const { data: projects } = await sb.from("road_projects").select("project_code, project_name, estimated_cost, approved_cost, final_cost, status");
      const rows = (projects ?? []).map((p) => [
        p.project_code, p.project_name, p.status, p.estimated_cost, p.approved_cost, p.final_cost,
      ]);
      return {
        filename: "expenditure-summary.csv",
        csv: toCSV(["Project Code", "Project Name", "Status", "Estimated", "Approved", "Final"], rows),
      };
    }
    default:
      throw new Error("Unknown report type.");
  }
}

/** Summary counts shown on the Reports landing page. */
export async function getReportSummary() {
  const sb = await createSupabaseServerClient();
  const [{ count: projects }, { count: roads }, { count: maintenance }, { count: inspections }] = await Promise.all([
    sb.from("road_projects").select("*", { count: "exact", head: true }),
    sb.from("roads").select("*", { count: "exact", head: true }),
    sb.from("maintenance").select("*", { count: "exact", head: true }),
    sb.from("road_inspections").select("*", { count: "exact", head: true }),
  ]);
  return {
    projects: projects ?? 0,
    roads: roads ?? 0,
    maintenance: maintenance ?? 0,
    inspections: inspections ?? 0,
  };
}
