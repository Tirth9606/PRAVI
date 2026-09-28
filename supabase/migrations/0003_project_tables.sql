-- ============================================================================
-- ROADGOV — Migration 0003: Projects, approvals, budgets, procurement
-- ============================================================================

-- Road projects --------------------------------------------------------------
create table if not exists public.road_projects (
  id                        uuid primary key default gen_random_uuid(),
  project_code              text not null unique,
  project_name              text not null,
  road_name                 text not null,
  location                  text not null,
  ward                      text not null,
  area                      text,
  road_type                 road_type not null,
  length_km                 numeric(10,3) not null,
  project_reason            text not null,
  estimated_cost            numeric(16,2) not null,
  approved_cost             numeric(16,2),
  final_cost                numeric(16,2),
  estimated_duration_months integer not null,
  planned_start_date        date,
  planned_end_date          date,
  actual_start_date         date,
  actual_end_date           date,
  status                    project_status not null default 'DRAFT',
  department_id             uuid references public.departments(id) on delete set null,
  created_by                uuid not null references public.users(id) on delete restrict,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  constraint rp_length_nonneg     check (length_km >= 0),
  constraint rp_est_cost_nonneg   check (estimated_cost >= 0),
  constraint rp_appr_cost_nonneg  check (approved_cost is null or approved_cost >= 0),
  constraint rp_final_cost_nonneg check (final_cost is null or final_cost >= 0),
  constraint rp_duration_pos      check (estimated_duration_months > 0),
  constraint rp_planned_dates     check (planned_end_date is null or planned_start_date is null or planned_end_date >= planned_start_date),
  constraint rp_actual_dates      check (actual_end_date is null or actual_start_date is null or actual_end_date >= actual_start_date)
);

create index if not exists idx_projects_status on public.road_projects(status);
create index if not exists idx_projects_ward on public.road_projects(ward);
create index if not exists idx_projects_road_type on public.road_projects(road_type);
create index if not exists idx_projects_created_by on public.road_projects(created_by);
create index if not exists idx_projects_created_at on public.road_projects(created_at desc);
create index if not exists idx_projects_code_trgm on public.road_projects using gin (project_code gin_trgm_ops);
create index if not exists idx_projects_name_trgm on public.road_projects using gin (project_name gin_trgm_ops);

drop trigger if exists trg_projects_updated_at on public.road_projects;
create trigger trg_projects_updated_at before update on public.road_projects
  for each row execute function public.set_updated_at();

-- Inspector assignments (junction: which inspector may access which project) --
create table if not exists public.project_assignments (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.road_projects(id) on delete cascade,
  inspector_id uuid not null references public.users(id) on delete cascade,
  assigned_by  uuid references public.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  unique (project_id, inspector_id)
);
create index if not exists idx_proj_assign_inspector on public.project_assignments(inspector_id);
create index if not exists idx_proj_assign_project on public.project_assignments(project_id);

-- Project approvals ----------------------------------------------------------
create table if not exists public.project_approvals (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.road_projects(id) on delete cascade,
  approved_by   uuid not null references public.users(id) on delete restrict,
  approval_type approval_type not null,
  status        approval_status not null default 'PENDING',
  remarks       text,
  approved_at   timestamptz,
  created_at    timestamptz not null default now()
);
create index if not exists idx_approvals_project on public.project_approvals(project_id);
create index if not exists idx_approvals_type on public.project_approvals(approval_type);

-- Budgets --------------------------------------------------------------------
create table if not exists public.budgets (
  id               uuid primary key default gen_random_uuid(),
  project_id       uuid not null references public.road_projects(id) on delete cascade,
  estimated_amount numeric(16,2) not null,
  approved_amount  numeric(16,2),
  funding_source   text not null,
  approval_date    date,
  approved_by      uuid references public.users(id) on delete set null,
  status           budget_status not null default 'DRAFT',
  remarks          text,
  created_at       timestamptz not null default now(),
  constraint budget_est_nonneg check (estimated_amount >= 0),
  constraint budget_appr_nonneg check (approved_amount is null or approved_amount >= 0)
);
create index if not exists idx_budgets_project on public.budgets(project_id);
create index if not exists idx_budgets_status on public.budgets(status);

-- Tenders --------------------------------------------------------------------
create table if not exists public.tenders (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references public.road_projects(id) on delete cascade,
  tender_number   text not null unique,
  estimated_value numeric(16,2) not null,
  published_date  date,
  opening_date    date,
  closing_date    date,
  status          tender_status not null default 'DRAFT',
  created_by      uuid not null references public.users(id) on delete restrict,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint tender_value_nonneg check (estimated_value >= 0),
  constraint tender_dates check (closing_date is null or opening_date is null or closing_date >= opening_date)
);
create index if not exists idx_tenders_project on public.tenders(project_id);
create index if not exists idx_tenders_status on public.tenders(status);

drop trigger if exists trg_tenders_updated_at on public.tenders;
create trigger trg_tenders_updated_at before update on public.tenders
  for each row execute function public.set_updated_at();

-- Contractors ----------------------------------------------------------------
create table if not exists public.contractors (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  registration_number text not null unique,
  contact_person      text not null,
  phone               text,
  email               text,
  address             text,
  experience_years    integer,
  status              contractor_status not null default 'ACTIVE',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint contractor_exp_nonneg check (experience_years is null or experience_years >= 0)
);
create index if not exists idx_contractors_status on public.contractors(status);

drop trigger if exists trg_contractors_updated_at on public.contractors;
create trigger trg_contractors_updated_at before update on public.contractors
  for each row execute function public.set_updated_at();

-- Tender bids ----------------------------------------------------------------
create table if not exists public.tender_bids (
  id            uuid primary key default gen_random_uuid(),
  tender_id     uuid not null references public.tenders(id) on delete cascade,
  contractor_id uuid not null references public.contractors(id) on delete restrict,
  bid_amount    numeric(16,2) not null,
  submitted_at  timestamptz not null default now(),
  status        bid_status not null default 'SUBMITTED',
  remarks       text,
  created_at    timestamptz not null default now(),
  constraint bid_amount_nonneg check (bid_amount >= 0),
  unique (tender_id, contractor_id)
);
create index if not exists idx_bids_tender on public.tender_bids(tender_id);
create index if not exists idx_bids_contractor on public.tender_bids(contractor_id);

-- Contracts ------------------------------------------------------------------
create table if not exists public.contracts (
  id                 uuid primary key default gen_random_uuid(),
  project_id         uuid not null references public.road_projects(id) on delete cascade,
  tender_id          uuid references public.tenders(id) on delete set null,
  contractor_id      uuid not null references public.contractors(id) on delete restrict,
  contract_number    text not null unique,
  contract_value     numeric(16,2) not null,
  work_order_number  text,
  start_date         date not null,
  expected_end_date  date not null,
  actual_end_date    date,
  status             contract_status not null default 'DRAFT',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint contract_value_nonneg check (contract_value >= 0),
  constraint contract_dates check (expected_end_date >= start_date),
  constraint contract_actual_date check (actual_end_date is null or actual_end_date >= start_date)
);
create index if not exists idx_contracts_project on public.contracts(project_id);
create index if not exists idx_contracts_contractor on public.contracts(contractor_id);
create index if not exists idx_contracts_status on public.contracts(status);

drop trigger if exists trg_contracts_updated_at on public.contracts;
create trigger trg_contracts_updated_at before update on public.contracts
  for each row execute function public.set_updated_at();
