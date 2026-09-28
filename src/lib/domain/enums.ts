/**
 * Canonical domain enums for ROADGOV.
 *
 * These values are the SINGLE SOURCE OF TRUTH and MUST match the PostgreSQL
 * enum types defined in supabase/migrations. They are always stored in the
 * database as English UPPER_SNAKE_CASE. Translated labels live in src/locales
 * and are applied at render time only (see spec §32 Multilingual).
 */

export const USER_ROLES = ["ADMIN", "ROAD_OFFICER", "FIELD_INSPECTOR"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["ACTIVE", "INACTIVE"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const PROJECT_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "BUDGET_APPROVED",
  "TENDERING",
  "CONTRACTOR_SELECTED",
  "WORK_ORDER_ISSUED",
  "UNDER_CONSTRUCTION",
  "COMPLETED",
  "HANDED_OVER",
  "CANCELLED",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const APPROVAL_TYPES = [
  "PROJECT_APPROVAL",
  "BUDGET_APPROVAL",
  "COMPLETION_APPROVAL",
  "HANDOVER_APPROVAL",
] as const;
export type ApprovalType = (typeof APPROVAL_TYPES)[number];

export const APPROVAL_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const BUDGET_STATUSES = ["DRAFT", "PENDING", "APPROVED", "REJECTED"] as const;
export type BudgetStatus = (typeof BUDGET_STATUSES)[number];

export const TENDER_STATUSES = [
  "DRAFT",
  "OPEN",
  "CLOSED",
  "EVALUATION",
  "AWARDED",
  "CANCELLED",
] as const;
export type TenderStatus = (typeof TENDER_STATUSES)[number];

export const CONTRACTOR_STATUSES = ["ACTIVE", "BLACKLISTED", "INACTIVE"] as const;
export type ContractorStatus = (typeof CONTRACTOR_STATUSES)[number];

export const BID_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "REJECTED"] as const;
export type BidStatus = (typeof BID_STATUSES)[number];

export const CONTRACT_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "WORK_ORDER_ISSUED",
  "COMPLETED",
  "TERMINATED",
] as const;
export type ContractStatus = (typeof CONTRACT_STATUSES)[number];

export const CONSTRUCTION_UPDATE_STATUSES = ["SUBMITTED", "VERIFIED", "REJECTED"] as const;
export type ConstructionUpdateStatus = (typeof CONSTRUCTION_UPDATE_STATUSES)[number];

export const QUALITY_STATUSES = ["SATISFACTORY", "NEEDS_ATTENTION", "UNSATISFACTORY"] as const;
export type QualityStatus = (typeof QUALITY_STATUSES)[number];

export const INSPECTION_STATUSES = ["SUBMITTED", "REVIEWED", "ACTION_REQUIRED"] as const;
export type InspectionStatus = (typeof INSPECTION_STATUSES)[number];

export const ROAD_CONDITIONS = ["GOOD", "MODERATE", "POOR", "CRITICAL"] as const;
export type RoadCondition = (typeof ROAD_CONDITIONS)[number];

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const ROAD_STATUSES = ["OPERATIONAL", "UNDER_MAINTENANCE", "CLOSED"] as const;
export type RoadStatus = (typeof ROAD_STATUSES)[number];

export const DEFECT_TYPES = [
  "POTHOLE",
  "CRACK",
  "WATERLOGGING",
  "EDGE_DAMAGE",
  "SURFACE_DAMAGE",
  "DRAINAGE_ISSUE",
] as const;
export type DefectType = (typeof DEFECT_TYPES)[number];

export const DEFECT_STATUSES = ["OPEN", "SCHEDULED", "RESOLVED", "CLOSED"] as const;
export type DefectStatus = (typeof DEFECT_STATUSES)[number];

export const MAINTENANCE_STATUSES = [
  "PENDING",
  "APPROVED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;
export type MaintenanceStatus = (typeof MAINTENANCE_STATUSES)[number];

export const ROAD_TYPES = [
  "NATIONAL_HIGHWAY",
  "STATE_HIGHWAY",
  "MAJOR_DISTRICT_ROAD",
  "URBAN_ROAD",
  "RURAL_ROAD",
  "VILLAGE_ROAD",
] as const;
export type RoadType = (typeof ROAD_TYPES)[number];

export const COMPLAINT_STATUSES = ["OPEN", "IN_REVIEW", "RESOLVED", "REJECTED"] as const;
export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

export const AUDIT_ACTIONS = [
  "LOGIN",
  "LOGOUT",
  "CREATE",
  "UPDATE",
  "DELETE",
  "APPROVE",
  "REJECT",
  "ASSIGN",
  "CONTRACTOR_SELECTED",
  "WORK_ORDER_ISSUED",
  "INSPECTION_SUBMITTED",
  "MAINTENANCE_APPROVED",
  "MAINTENANCE_COMPLETED",
  "PROJECT_COMPLETED",
  "ROAD_HANDED_OVER",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const DOCUMENT_CATEGORIES = [
  "ADMINISTRATIVE_APPROVAL",
  "BUDGET_APPROVAL",
  "TENDER_DOCUMENT",
  "CONTRACT",
  "WORK_ORDER",
  "INSPECTION_REPORT",
  "COMPLETION_CERTIFICATE",
] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export const STORAGE_BUCKETS = [
  "project-documents",
  "construction-photos",
  "inspection-photos",
  "maintenance-documents",
] as const;
export type StorageBucket = (typeof STORAGE_BUCKETS)[number];
