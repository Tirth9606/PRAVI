-- ============================================================================
-- ROADGOV — Migration 0004: Construction updates & inspections
-- ============================================================================

create table if not exists public.construction_updates (
  id                 uuid primary key default gen_random_uuid(),
  project_id         uuid not null references public.road_projects(id) on delete cascade,
  reported_by        uuid not null references public.users(id) on delete restrict,
  update_date        date not null default current_date,
  physical_progress  numeric(5,2) not null,
  financial_progress numeric(5,2) not null,
  amount_claimed     numeric(16,2),
  current_stage      text not null,
  status             construction_update_status not null default 'SUBMITTED',
  remarks            text,
  photo_urls         jsonb default '[]'::jsonb,
  created_at         timestamptz not null default now(),
  constraint cu_physical_range  check (physical_progress between 0 and 100),
  constraint cu_financial_range check (financial_progress between 0 and 100),
  constraint cu_amount_nonneg   check (amount_claimed is null or amount_claimed >= 0)
);
create index if not exists idx_cupdates_project on public.construction_updates(project_id);
create index if not exists idx_cupdates_date on public.construction_updates(update_date desc);

create table if not exists public.construction_inspections (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid not null references public.road_projects(id) on delete cascade,
  inspector_id        uuid not null references public.users(id) on delete restrict,
  inspection_date     date not null default current_date,
  progress_percentage numeric(5,2) not null,
  quality_status      quality_status not null,
  issues_found        text,
  remarks             text,
  photo_urls          jsonb default '[]'::jsonb,
  status              inspection_status not null default 'SUBMITTED',
  created_at          timestamptz not null default now(),
  constraint ci_progress_range check (progress_percentage between 0 and 100)
);
create index if not exists idx_cinspections_project on public.construction_inspections(project_id);
create index if not exists idx_cinspections_inspector on public.construction_inspections(inspector_id);
create index if not exists idx_cinspections_date on public.construction_inspections(inspection_date desc);
