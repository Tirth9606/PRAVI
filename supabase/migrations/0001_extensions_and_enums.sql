-- ============================================================================
-- ROADGOV — Migration 0001: Extensions & Enum Types
-- Canonical enum values (English UPPER_SNAKE_CASE). These MUST stay in sync with
-- src/lib/domain/enums.ts. Never store translated labels here (spec §32).
-- ============================================================================

create extension if not exists "pgcrypto";      -- gen_random_uuid()
create extension if not exists "pg_trgm";        -- trigram search on codes/names

-- ---------------------------------------------------------------------------
-- Identity & governance
-- ---------------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('ADMIN', 'ROAD_OFFICER', 'FIELD_INSPECTOR');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_status as enum ('ACTIVE', 'INACTIVE');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Projects
-- ---------------------------------------------------------------------------
do $$ begin
  create type project_status as enum (
    'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'BUDGET_APPROVED',
    'TENDERING', 'CONTRACTOR_SELECTED', 'WORK_ORDER_ISSUED', 'UNDER_CONSTRUCTION',
    'COMPLETED', 'HANDED_OVER', 'CANCELLED'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type road_type as enum (
    'NATIONAL_HIGHWAY', 'STATE_HIGHWAY', 'MAJOR_DISTRICT_ROAD',
    'URBAN_ROAD', 'RURAL_ROAD', 'VILLAGE_ROAD'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type approval_type as enum (
    'PROJECT_APPROVAL', 'BUDGET_APPROVAL', 'COMPLETION_APPROVAL', 'HANDOVER_APPROVAL'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type approval_status as enum ('PENDING', 'APPROVED', 'REJECTED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type budget_status as enum ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Procurement
-- ---------------------------------------------------------------------------
do $$ begin
  create type tender_status as enum ('DRAFT', 'OPEN', 'CLOSED', 'EVALUATION', 'AWARDED', 'CANCELLED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type contractor_status as enum ('ACTIVE', 'BLACKLISTED', 'INACTIVE');
exception when duplicate_object then null; end $$;

do $$ begin
  create type bid_status as enum ('SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type contract_status as enum ('DRAFT', 'ACTIVE', 'WORK_ORDER_ISSUED', 'COMPLETED', 'TERMINATED');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Construction
-- ---------------------------------------------------------------------------
do $$ begin
  create type construction_update_status as enum ('SUBMITTED', 'VERIFIED', 'REJECTED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type quality_status as enum ('SATISFACTORY', 'NEEDS_ATTENTION', 'UNSATISFACTORY');
exception when duplicate_object then null; end $$;

do $$ begin
  create type inspection_status as enum ('SUBMITTED', 'REVIEWED', 'ACTION_REQUIRED');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Roads & maintenance
-- ---------------------------------------------------------------------------
do $$ begin
  create type road_condition as enum ('GOOD', 'MODERATE', 'POOR', 'CRITICAL');
exception when duplicate_object then null; end $$;

do $$ begin
  create type priority_level as enum ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
exception when duplicate_object then null; end $$;

do $$ begin
  create type road_status as enum ('OPERATIONAL', 'UNDER_MAINTENANCE', 'CLOSED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type defect_type as enum (
    'POTHOLE', 'CRACK', 'WATERLOGGING', 'EDGE_DAMAGE', 'SURFACE_DAMAGE', 'DRAINAGE_ISSUE'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type defect_status as enum ('OPEN', 'SCHEDULED', 'RESOLVED', 'CLOSED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type maintenance_status as enum ('PENDING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type complaint_status as enum ('OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Audit & documents
-- ---------------------------------------------------------------------------
do $$ begin
  create type audit_action as enum (
    'LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'ASSIGN',
    'CONTRACTOR_SELECTED', 'WORK_ORDER_ISSUED', 'INSPECTION_SUBMITTED',
    'MAINTENANCE_APPROVED', 'MAINTENANCE_COMPLETED', 'PROJECT_COMPLETED', 'ROAD_HANDED_OVER'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type document_category as enum (
    'ADMINISTRATIVE_APPROVAL', 'BUDGET_APPROVAL', 'TENDER_DOCUMENT', 'CONTRACT',
    'WORK_ORDER', 'INSPECTION_REPORT', 'COMPLETION_CERTIFICATE'
  );
exception when duplicate_object then null; end $$;
