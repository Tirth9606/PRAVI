-- ============================================================================
-- ROADGOV — Migration 0005: Roads, inspections, defects, maintenance, complaints
-- ============================================================================

create table if not exists public.roads (
  id                     uuid primary key default gen_random_uuid(),
  project_id             uuid references public.road_projects(id) on delete set null,
  road_code              text not null unique,
  road_name              text not null,
  location               text not null,
  ward                   text not null,
  area                   text,
  road_type              road_type not null,
  length_km              numeric(10,3) not null,
  current_condition      road_condition not null default 'GOOD',
  priority               priority_level not null default 'MEDIUM',
  status                 road_status not null default 'OPERATIONAL',
  handover_date          date,
  last_inspection_date   date,
  last_maintenance_date  date,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  constraint road_length_nonneg check (length_km >= 0)
);
create index if not exists idx_roads_condition on public.roads(current_condition);
create index if not exists idx_roads_priority on public.roads(priority);
create index if not exists idx_roads_status on public.roads(status);
create index if not exists idx_roads_ward on public.roads(ward);
create index if not exists idx_roads_project on public.roads(project_id);
create index if not exists idx_roads_code_trgm on public.roads using gin (road_code gin_trgm_ops);

drop trigger if exists trg_roads_updated_at on public.roads;
create trigger trg_roads_updated_at before update on public.roads
  for each row execute function public.set_updated_at();

-- Road assignments (which inspector may access which road) -------------------
create table if not exists public.road_assignments (
  id           uuid primary key default gen_random_uuid(),
  road_id      uuid not null references public.roads(id) on delete cascade,
  inspector_id uuid not null references public.users(id) on delete cascade,
  assigned_by  uuid references public.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  unique (road_id, inspector_id)
);
create index if not exists idx_road_assign_inspector on public.road_assignments(inspector_id);
create index if not exists idx_road_assign_road on public.road_assignments(road_id);

-- Road inspections -----------------------------------------------------------
create table if not exists public.road_inspections (
  id              uuid primary key default gen_random_uuid(),
  road_id         uuid not null references public.roads(id) on delete cascade,
  inspector_id    uuid not null references public.users(id) on delete restrict,
  inspection_date date not null default current_date,
  condition       road_condition not null,
  severity        priority_level not null,
  remarks         text,
  photo_urls      jsonb default '[]'::jsonb,
  status          inspection_status not null default 'SUBMITTED',
  created_at      timestamptz not null default now()
);
create index if not exists idx_rinspections_road on public.road_inspections(road_id);
create index if not exists idx_rinspections_inspector on public.road_inspections(inspector_id);
create index if not exists idx_rinspections_date on public.road_inspections(inspection_date desc);

-- Defects --------------------------------------------------------------------
create table if not exists public.defects (
  id            uuid primary key default gen_random_uuid(),
  road_id       uuid not null references public.roads(id) on delete cascade,
  inspection_id uuid references public.road_inspections(id) on delete set null,
  type          defect_type not null,
  severity      priority_level not null,
  quantity      numeric(12,2) not null default 1,
  description   text,
  status        defect_status not null default 'OPEN',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint defect_qty_nonneg check (quantity >= 0)
);
create index if not exists idx_defects_road on public.defects(road_id);
create index if not exists idx_defects_status on public.defects(status);
create index if not exists idx_defects_severity on public.defects(severity);

drop trigger if exists trg_defects_updated_at on public.defects;
create trigger trg_defects_updated_at before update on public.defects
  for each row execute function public.set_updated_at();

-- Maintenance ----------------------------------------------------------------
create table if not exists public.maintenance (
  id              uuid primary key default gen_random_uuid(),
  road_id         uuid not null references public.roads(id) on delete cascade,
  inspection_id   uuid references public.road_inspections(id) on delete set null,
  work_type       text not null,
  priority        priority_level not null default 'MEDIUM',
  estimated_cost  numeric(16,2) not null,
  actual_cost     numeric(16,2),
  status          maintenance_status not null default 'PENDING',
  assigned_to     uuid references public.users(id) on delete set null,
  approved_by     uuid references public.users(id) on delete set null,
  start_date      date,
  completion_date date,
  remarks         text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint maint_est_nonneg check (estimated_cost >= 0),
  constraint maint_actual_nonneg check (actual_cost is null or actual_cost >= 0),
  constraint maint_dates check (completion_date is null or start_date is null or completion_date >= start_date)
);
create index if not exists idx_maint_road on public.maintenance(road_id);
create index if not exists idx_maint_status on public.maintenance(status);
create index if not exists idx_maint_priority on public.maintenance(priority);

drop trigger if exists trg_maint_updated_at on public.maintenance;
create trigger trg_maint_updated_at before update on public.maintenance
  for each row execute function public.set_updated_at();

-- Complaints (minimal, no citizen portal in MVP — internal record only) ------
create table if not exists public.complaints (
  id            uuid primary key default gen_random_uuid(),
  road_id       uuid references public.roads(id) on delete set null,
  subject       text not null,
  description   text,
  status        complaint_status not null default 'OPEN',
  reported_by   uuid references public.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_complaints_status on public.complaints(status);
create index if not exists idx_complaints_road on public.complaints(road_id);

drop trigger if exists trg_complaints_updated_at on public.complaints;
create trigger trg_complaints_updated_at before update on public.complaints
  for each row execute function public.set_updated_at();
