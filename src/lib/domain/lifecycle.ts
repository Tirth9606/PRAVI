/**
 * Server-enforced lifecycle state machine for ROADGOV (spec §22 Business Rules).
 *
 * Invalid state transitions MUST be rejected server-side. The frontend may hide
 * actions, but this module is the authoritative guard used by every server action.
 */

import type {
  ProjectStatus,
  TenderStatus,
  MaintenanceStatus,
  DefectStatus,
} from "./enums";

/** Allowed forward transitions for a road project. */
export const PROJECT_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  DRAFT: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["UNDER_REVIEW", "CANCELLED"],
  UNDER_REVIEW: ["APPROVED", "DRAFT", "CANCELLED"],
  APPROVED: ["BUDGET_APPROVED", "CANCELLED"],
  BUDGET_APPROVED: ["TENDERING", "CANCELLED"],
  TENDERING: ["CONTRACTOR_SELECTED", "CANCELLED"],
  CONTRACTOR_SELECTED: ["WORK_ORDER_ISSUED", "CANCELLED"],
  WORK_ORDER_ISSUED: ["UNDER_CONSTRUCTION", "CANCELLED"],
  UNDER_CONSTRUCTION: ["COMPLETED", "CANCELLED"],
  COMPLETED: ["HANDED_OVER"],
  HANDED_OVER: [],
  CANCELLED: [],
};

export function canTransitionProject(from: ProjectStatus, to: ProjectStatus): boolean {
  return PROJECT_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertProjectTransition(from: ProjectStatus, to: ProjectStatus): void {
  if (!canTransitionProject(from, to)) {
    throw new LifecycleError(
      `Invalid project transition: ${from} → ${to}. Allowed: ${
        PROJECT_TRANSITIONS[from].join(", ") || "(none — terminal state)"
      }`,
    );
  }
}

export const TENDER_TRANSITIONS: Record<TenderStatus, TenderStatus[]> = {
  DRAFT: ["OPEN", "CANCELLED"],
  OPEN: ["CLOSED", "CANCELLED"],
  CLOSED: ["EVALUATION", "CANCELLED"],
  EVALUATION: ["AWARDED", "CANCELLED"],
  AWARDED: [],
  CANCELLED: [],
};

export function canTransitionTender(from: TenderStatus, to: TenderStatus): boolean {
  return TENDER_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTenderTransition(from: TenderStatus, to: TenderStatus): void {
  if (!canTransitionTender(from, to)) {
    throw new LifecycleError(`Invalid tender transition: ${from} → ${to}.`);
  }
}

/** Maintenance workflow: PENDING → APPROVED → IN_PROGRESS → COMPLETED (spec §20). */
export const MAINTENANCE_TRANSITIONS: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  PENDING: ["APPROVED", "CANCELLED"],
  APPROVED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransitionMaintenance(from: MaintenanceStatus, to: MaintenanceStatus): boolean {
  return MAINTENANCE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertMaintenanceTransition(from: MaintenanceStatus, to: MaintenanceStatus): void {
  if (!canTransitionMaintenance(from, to)) {
    throw new LifecycleError(`Invalid maintenance transition: ${from} → ${to}.`);
  }
}

export const DEFECT_TRANSITIONS: Record<DefectStatus, DefectStatus[]> = {
  OPEN: ["SCHEDULED", "RESOLVED", "CLOSED"],
  SCHEDULED: ["RESOLVED", "CLOSED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
};

export function canTransitionDefect(from: DefectStatus, to: DefectStatus): boolean {
  return DEFECT_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Guard conditions that gate transitions beyond simple adjacency (spec §22):
 * - a project must be APPROVED before budget approval,
 * - budget approved before tendering, etc.
 * These are expressed as the required predecessor status for a given target.
 */
export const PROJECT_STATUS_PREREQUISITE: Partial<Record<ProjectStatus, ProjectStatus>> = {
  BUDGET_APPROVED: "APPROVED",
  TENDERING: "BUDGET_APPROVED",
  CONTRACTOR_SELECTED: "TENDERING",
  WORK_ORDER_ISSUED: "CONTRACTOR_SELECTED",
  UNDER_CONSTRUCTION: "WORK_ORDER_ISSUED",
  COMPLETED: "UNDER_CONSTRUCTION",
  HANDED_OVER: "COMPLETED",
};

export class LifecycleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LifecycleError";
  }
}
