import { describe, it, expect } from "vitest";
import { can, assertPermission, AuthorizationError, ROLE_HOME } from "@/lib/domain/rbac";

describe("RBAC permission matrix (spec §4)", () => {
  it("road officer can perform core operational actions", () => {
    expect(can("ROAD_OFFICER", "project.approve")).toBe(true);
    expect(can("ROAD_OFFICER", "budget.approve")).toBe(true);
    expect(can("ROAD_OFFICER", "contractor.select")).toBe(true);
    expect(can("ROAD_OFFICER", "workorder.issue")).toBe(true);
    expect(can("ROAD_OFFICER", "maintenance.approve")).toBe(true);
  });

  it("field inspector CANNOT perform officer-only actions", () => {
    const denied = [
      "project.approve",
      "budget.approve",
      "tender.manage",
      "contractor.select",
      "contract.create",
      "workorder.issue",
      "maintenance.approve",
      "user.manage",
    ] as const;
    for (const p of denied) expect(can("FIELD_INSPECTOR", p)).toBe(false);
  });

  it("field inspector CAN submit inspections and defects", () => {
    expect(can("FIELD_INSPECTOR", "inspection.construction.submit")).toBe(true);
    expect(can("FIELD_INSPECTOR", "inspection.road.submit")).toBe(true);
    expect(can("FIELD_INSPECTOR", "defect.create")).toBe(true);
  });

  it("admin manages governance but is not the operational decision-maker", () => {
    expect(can("ADMIN", "user.manage")).toBe(true);
    expect(can("ADMIN", "department.manage")).toBe(true);
    expect(can("ADMIN", "project.viewAll")).toBe(true);
    // Admin does not approve budgets or select contractors
    expect(can("ADMIN", "budget.approve")).toBe(false);
    expect(can("ADMIN", "contractor.select")).toBe(false);
  });

  it("anonymous/null role is denied everything", () => {
    expect(can(null, "project.viewAll")).toBe(false);
    expect(can(undefined, "inspection.viewOwn")).toBe(false);
  });

  it("assertPermission throws AuthorizationError (403) when denied", () => {
    expect(() => assertPermission("FIELD_INSPECTOR", "project.approve")).toThrow(AuthorizationError);
    try {
      assertPermission("FIELD_INSPECTOR", "workorder.issue");
    } catch (e) {
      expect((e as AuthorizationError).status).toBe(403);
    }
  });

  it("each role has a distinct home route", () => {
    expect(ROLE_HOME.ADMIN).toBe("/admin/dashboard");
    expect(ROLE_HOME.ROAD_OFFICER).toBe("/officer/dashboard");
    expect(ROLE_HOME.FIELD_INSPECTOR).toBe("/inspector/dashboard");
  });
});
