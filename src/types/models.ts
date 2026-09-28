/**
 * Row model interfaces mirroring the PostgreSQL schema (supabase/migrations).
 * These are the shapes returned by Supabase queries and consumed across the app.
 */

import type {
  UserRole,
  UserStatus,
  ProjectStatus,
  RoadType,
  ApprovalType,
  ApprovalStatus,
  BudgetStatus,
  TenderStatus,
  ContractorStatus,
  BidStatus,
  ContractStatus,
  ConstructionUpdateStatus,
  QualityStatus,
  InspectionStatus,
  RoadCondition,
  Priority,
  RoadStatus,
  DefectType,
  DefectStatus,
  MaintenanceStatus,
  ComplaintStatus,
  AuditAction,
  DocumentCategory,
} from "@/lib/domain/enums";

export interface Department {
  id: string;
  name: string;
  code: string;
  contact_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  department_id: string | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface RoadProject {
  id: string;
  project_code: string;
  project_name: string;
  road_name: string;
  location: string;
  ward: string;
  area: string | null;
  road_type: RoadType;
  length_km: number;
  project_reason: string;
  estimated_cost: number;
  approved_cost: number | null;
  final_cost: number | null;
  estimated_duration_months: number;
  planned_start_date: string | null;
  planned_end_date: string | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
  status: ProjectStatus;
  department_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectApproval {
  id: string;
  project_id: string;
  approved_by: string;
  approval_type: ApprovalType;
  status: ApprovalStatus;
  remarks: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface Budget {
  id: string;
  project_id: string;
  estimated_amount: number;
  approved_amount: number | null;
  funding_source: string;
  approval_date: string | null;
  approved_by: string | null;
  status: BudgetStatus;
  remarks: string | null;
  created_at: string;
}

export interface Tender {
  id: string;
  project_id: string;
  tender_number: string;
  estimated_value: number;
  published_date: string | null;
  opening_date: string | null;
  closing_date: string | null;
  status: TenderStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Contractor {
  id: string;
  name: string;
  registration_number: string;
  contact_person: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  experience_years: number | null;
  status: ContractorStatus;
  created_at: string;
  updated_at: string;
}

export interface TenderBid {
  id: string;
  tender_id: string;
  contractor_id: string;
  bid_amount: number;
  submitted_at: string;
  status: BidStatus;
  remarks: string | null;
  created_at: string;
}

export interface Contract {
  id: string;
  project_id: string;
  tender_id: string | null;
  contractor_id: string;
  contract_number: string;
  contract_value: number;
  work_order_number: string | null;
  start_date: string;
  expected_end_date: string;
  actual_end_date: string | null;
  status: ContractStatus;
  created_at: string;
  updated_at: string;
}

export interface ConstructionUpdate {
  id: string;
  project_id: string;
  reported_by: string;
  update_date: string;
  physical_progress: number;
  financial_progress: number;
  amount_claimed: number | null;
  current_stage: string;
  status: ConstructionUpdateStatus;
  remarks: string | null;
  photo_urls: string[] | null;
  created_at: string;
}

export interface ConstructionInspection {
  id: string;
  project_id: string;
  inspector_id: string;
  inspection_date: string;
  progress_percentage: number;
  quality_status: QualityStatus;
  issues_found: string | null;
  remarks: string | null;
  photo_urls: string[] | null;
  status: InspectionStatus;
  created_at: string;
}

export interface Road {
  id: string;
  project_id: string | null;
  road_code: string;
  road_name: string;
  location: string;
  ward: string;
  area: string | null;
  road_type: RoadType;
  length_km: number;
  current_condition: RoadCondition;
  priority: Priority;
  status: RoadStatus;
  handover_date: string | null;
  last_inspection_date: string | null;
  last_maintenance_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoadInspection {
  id: string;
  road_id: string;
  inspector_id: string;
  inspection_date: string;
  condition: RoadCondition;
  severity: Priority;
  remarks: string | null;
  photo_urls: string[] | null;
  status: InspectionStatus;
  created_at: string;
}

export interface Defect {
  id: string;
  road_id: string;
  inspection_id: string | null;
  type: DefectType;
  severity: Priority;
  quantity: number;
  description: string | null;
  status: DefectStatus;
  created_at: string;
  updated_at: string;
}

export interface Maintenance {
  id: string;
  road_id: string;
  inspection_id: string | null;
  work_type: string;
  priority: Priority;
  estimated_cost: number;
  actual_cost: number | null;
  status: MaintenanceStatus;
  assigned_to: string | null;
  approved_by: string | null;
  start_date: string | null;
  completion_date: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

export interface Complaint {
  id: string;
  road_id: string | null;
  subject: string;
  description: string | null;
  status: ComplaintStatus;
  reported_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: AuditAction;
  entity_type: string;
  entity_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  ip_address: string | null;
  timestamp: string;
}

export interface DocumentRecord {
  id: string;
  category: DocumentCategory;
  bucket: string;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  project_id: string | null;
  road_id: string | null;
  uploaded_by: string;
  created_at: string;
}

export interface ProjectAssignment {
  id: string;
  project_id: string;
  inspector_id: string;
  assigned_by: string | null;
  created_at: string;
}

export interface RoadAssignment {
  id: string;
  road_id: string;
  inspector_id: string;
  assigned_by: string | null;
  created_at: string;
}
