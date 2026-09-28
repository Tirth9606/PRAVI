-- ============================================================================
-- ROADGOV — Migration 0002: Core tables (departments, users)
-- ============================================================================

-- Shared updated_at trigger function -----------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Departments ----------------------------------------------------------------
create table if not exists public.departments (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  code          text not null unique,
  contact_email text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint departments_name_len check (char_length(name) between 2 and 200)
);

drop trigger if exists trg_departments_updated_at on public.departments;
create trigger trg_departments_updated_at
  before update on public.departments
  for each row execute function public.set_updated_at();

-- Users (application profile linked to auth.users) ---------------------------
-- id == auth.users.id so RLS can key off auth.uid() directly.
create table if not exists public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  name          text not null,
  email         text not null unique,
  phone         text,
  role          user_role not null default 'FIELD_INSPECTOR',
  department_id uuid references public.departments(id) on delete set null,
  status        user_status not null default 'ACTIVE',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint users_name_len check (char_length(name) between 2 and 200),
  constraint users_email_format check (position('@' in email) > 1)
);

create index if not exists idx_users_role on public.users(role);
create index if not exists idx_users_status on public.users(status);
create index if not exists idx_users_department on public.users(department_id);

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

comment on table public.users is
  'Application profile & role for each Supabase auth user. Authentication itself is handled by Supabase Auth; no custom passwords are stored here.';
