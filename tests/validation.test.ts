import { describe, it, expect } from "vitest";
import {
  projectCreateSchema,
  constructionUpdateSchema,
  contractSchema,
  maintenanceCompleteSchema,
} from "@/lib/validation";

const baseProject = {
  project_code: "RP-1",
  project_name: "Test Project",
  road_name: "Test Road",
  location: "Somewhere",
  ward: "Ward 1",
  road_type: "URBAN_ROAD",
  length_km: "2.5",
  project_reason: "Because",
  estimated_cost: "100000",
  estimated_duration_months: "6",
};

describe("Validation rules (spec §37)", () => {
  it("accepts a valid project", () => {
    expect(projectCreateSchema.safeParse(baseProject).success).toBe(true);
  });

  it("rejects negative cost and negative length", () => {
    expect(projectCreateSchema.safeParse({ ...baseProject, estimated_cost: "-1" }).success).toBe(false);
    expect(projectCreateSchema.safeParse({ ...baseProject, length_km: "-0.1" }).success).toBe(false);
  });

  it("rejects zero/negative duration", () => {
    expect(projectCreateSchema.safeParse({ ...baseProject, estimated_duration_months: "0" }).success).toBe(false);
  });

  it("rejects planned end date before start date", () => {
    const r = projectCreateSchema.safeParse({
      ...baseProject,
      planned_start_date: "2026-05-01",
      planned_end_date: "2026-04-01",
    });
    expect(r.success).toBe(false);
  });

  it("clamps construction progress to 0..100", () => {
    const good = constructionUpdateSchema.safeParse({
      project_id: "00000000-0000-0000-0000-000000000001",
      update_date: "2026-01-01",
      physical_progress: "50",
      financial_progress: "40",
      current_stage: "Base",
    });
    expect(good.success).toBe(true);
    const bad = constructionUpdateSchema.safeParse({
      project_id: "00000000-0000-0000-0000-000000000001",
      update_date: "2026-01-01",
      physical_progress: "150",
      financial_progress: "40",
      current_stage: "Base",
    });
    expect(bad.success).toBe(false);
  });

  it("requires contract expected end date on/after start date", () => {
    const r = contractSchema.safeParse({
      project_id: "00000000-0000-0000-0000-000000000001",
      contractor_id: "00000000-0000-0000-0000-000000000002",
      contract_number: "C-1",
      contract_value: "1000",
      start_date: "2026-02-01",
      expected_end_date: "2026-01-01",
    });
    expect(r.success).toBe(false);
  });

  it("requires completion cost to be non-negative", () => {
    const r = maintenanceCompleteSchema.safeParse({
      id: "00000000-0000-0000-0000-000000000001",
      actual_cost: "-5",
      completion_date: "2026-01-01",
    });
    expect(r.success).toBe(false);
  });
});
