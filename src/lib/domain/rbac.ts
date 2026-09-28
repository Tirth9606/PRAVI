/**
 * Application-level RBAC matrix (spec §4 User Roles).
 *
 * This is the FIRST of three enforcement layers (UI → Server → Postgres RLS).
 * Server actions call `assertPermission` before mutating; the UI calls `can`
 * to decide whether to render an action. RLS in the database is the final,
 * independent guard.
 */

import type { UserRole } from "./enums";

/** Every discrete capability in the system. */
export type Permission =
  // Governance / admin
  | "user.manage"
  | "department.manage"
  | "audit.viewAll"
  // Projects
  | "project.create"
  | "project.edit"
  | "project.submit"
  | "project.review"
  | "project.approve"
  | "project.complete"
  | "project.handover"
  | "project.viewAll"
  // Budgets / tenders / contracts
  | "budget.approve"
  | "tender.manage"
  | "bid.review"
  | "contractor.manage"
  | "contractor.select"
  | "contract.create"
  | "workorder.issue"
  // Construction
  | "construction.update"
  | "construction.verify"
  // Roads / maintenance
  | "road.manage"
  | "maintenance.create"
  | "maintenance.approve"
  | "maintenance.complete"
  // Inspections (field work)
  | "inspection.construction.submit"
  | "inspection.road.submit"
  | "defect.create"
  | "inspection.viewOwn"
  // Reports & documents
  | "report.generate"
  | "document.upload";

const OFFICER_PERMISSIONS: Permission[] = [
  "project.create",
  "project.edit",
  "project.submit",
  "project.review",
  "project.approve",
  "project.complete",
  "project.handover",
  "project.viewAll",
  "budget.approve",
  "tender.manage",
  "bid.review",
  "contractor.manage",
  "contractor.select",
  "contract.create",
  "workorder.issue",
  "construction.update",
  "construction.verify",
  "road.manage",
  "maintenance.create",
  "maintenance.approve",
  "maintenance.complete",
  "report.generate",
  "document.upload",
  "audit.viewAll",
];

const INSPECTOR_PERMISSIONS: Permission[] = [
  "inspection.construction.submit",
  "inspection.road.submit",
  "defect.create",
  "inspection.viewOwn",
  "document.upload",
];

const ADMIN_PERMISSIONS: Permission[] = [
  "user.manage",
  "department.manage",
  "audit.viewAll",
  // Admin has governance + full visibility, but is not the primary operational
  // decision-maker. It can still view operational data (viewAll) and generate reports.
  "project.viewAll",
  "report.generate",
];

export const ROLE_PERMISSIONS: Record<UserRole, ReadonlySet<Permission>> = {
  ADMIN: new Set(ADMIN_PERMISSIONS),
  ROAD_OFFICER: new Set(OFFICER_PERMISSIONS),
  FIELD_INSPECTOR: new Set(INSPECTOR_PERMISSIONS),
};

/** Pure check — safe to use in both server and client components. */
export function can(role: UserRole | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

export class AuthorizationError extends Error {
  readonly status = 403;
  constructor(message = "You are not authorized to perform this action.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/** Throws AuthorizationError (403) if the role lacks the permission. */
export function assertPermission(role: UserRole | null | undefined, permission: Permission): void {
  if (!can(role, permission)) {
    throw new AuthorizationError(
      `Role ${role ?? "anonymous"} lacks required permission: ${permission}`,
    );
  }
}

/** Landing route per role after successful login. */
export const ROLE_HOME: Record<UserRole, string> = {
  ADMIN: "/admin/dashboard",
  ROAD_OFFICER: "/officer/dashboard",
  FIELD_INSPECTOR: "/inspector/dashboard",
};

/** Route-prefix ownership: which roles may enter which top-level segment. */
export const ROUTE_ROLE_ACCESS: Record<string, UserRole[]> = {
  admin: ["ADMIN"],
  officer: ["ROAD_OFFICER"],
  inspector: ["FIELD_INSPECTOR"],
};
