import { describe, it, expect } from "vitest";
import {
  canTransitionProject,
  assertProjectTransition,
  canTransitionTender,
  canTransitionMaintenance,
  assertMaintenanceTransition,
  LifecycleError,
  PROJECT_STATUS_PREREQUISITE,
} from "@/lib/domain/lifecycle";

describe("Project lifecycle (spec §22)", () => {
  it("allows the canonical happy path step-by-step", () => {
    const path = [
      ["DRAFT", "SUBMITTED"],
      ["SUBMITTED", "UNDER_REVIEW"],
      ["UNDER_REVIEW", "APPROVED"],
      ["APPROVED", "BUDGET_APPROVED"],
      ["BUDGET_APPROVED", "TENDERING"],
      ["TENDERING", "CONTRACTOR_SELECTED"],
      ["CONTRACTOR_SELECTED", "WORK_ORDER_ISSUED"],
      ["WORK_ORDER_ISSUED", "UNDER_CONSTRUCTION"],
      ["UNDER_CONSTRUCTION", "COMPLETED"],
      ["COMPLETED", "HANDED_OVER"],
    ] as const;
    for (const [from, to] of path) expect(canTransitionProject(from, to)).toBe(true);
  });

  it("rejects skipping stages (e.g. DRAFT -> APPROVED)", () => {
    expect(canTransitionProject("DRAFT", "APPROVED")).toBe(false);
    expect(canTransitionProject("APPROVED", "UNDER_CONSTRUCTION")).toBe(false);
    expect(canTransitionProject("BUDGET_APPROVED", "COMPLETED")).toBe(false);
  });

  it("cannot leave terminal states", () => {
    expect(canTransitionProject("HANDED_OVER", "COMPLETED")).toBe(false);
    expect(canTransitionProject("CANCELLED", "DRAFT")).toBe(false);
  });

  it("assertProjectTransition throws LifecycleError on invalid transition", () => {
    expect(() => assertProjectTransition("DRAFT", "COMPLETED")).toThrow(LifecycleError);
    expect(() => assertProjectTransition("SUBMITTED", "UNDER_REVIEW")).not.toThrow();
  });

  it("encodes prerequisites: budget requires APPROVED, tendering requires BUDGET_APPROVED", () => {
    expect(PROJECT_STATUS_PREREQUISITE.BUDGET_APPROVED).toBe("APPROVED");
    expect(PROJECT_STATUS_PREREQUISITE.TENDERING).toBe("BUDGET_APPROVED");
    expect(PROJECT_STATUS_PREREQUISITE.COMPLETED).toBe("UNDER_CONSTRUCTION");
    expect(PROJECT_STATUS_PREREQUISITE.HANDED_OVER).toBe("COMPLETED");
  });
});

describe("Tender lifecycle", () => {
  it("follows DRAFT -> OPEN -> CLOSED -> EVALUATION -> AWARDED", () => {
    expect(canTransitionTender("DRAFT", "OPEN")).toBe(true);
    expect(canTransitionTender("OPEN", "CLOSED")).toBe(true);
    expect(canTransitionTender("CLOSED", "EVALUATION")).toBe(true);
    expect(canTransitionTender("EVALUATION", "AWARDED")).toBe(true);
  });
  it("rejects invalid tender jumps", () => {
    expect(canTransitionTender("DRAFT", "AWARDED")).toBe(false);
    expect(canTransitionTender("AWARDED", "OPEN")).toBe(false);
  });
});

describe("Maintenance workflow (spec §20)", () => {
  it("follows PENDING -> APPROVED -> IN_PROGRESS -> COMPLETED", () => {
    expect(canTransitionMaintenance("PENDING", "APPROVED")).toBe(true);
    expect(canTransitionMaintenance("APPROVED", "IN_PROGRESS")).toBe(true);
    expect(canTransitionMaintenance("IN_PROGRESS", "COMPLETED")).toBe(true);
  });
  it("rejects completing a task that was never started", () => {
    expect(canTransitionMaintenance("PENDING", "COMPLETED")).toBe(false);
    expect(canTransitionMaintenance("APPROVED", "COMPLETED")).toBe(false);
    expect(() => assertMaintenanceTransition("PENDING", "COMPLETED")).toThrow(LifecycleError);
  });
});
