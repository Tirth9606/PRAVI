-- ============================================================================
-- ROADGOV — Migration 0007: RLS helper functions
-- These are SECURITY DEFINER so they can read public.users WITHOUT triggering
-- recursive RLS evaluation on the users table itself. search_path is pinned.
-- ============================================================================

-- Role of the currently authenticated app user (NULL if none / not provisioned)
create or replace function public.current_user_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select u.role from public.users u
  where u.id = auth.uid() and u.status = 'ACTIVE'
  limit 1;
$$;

-- Whether the current auth user maps to an ACTIVE profile
create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.status = 'ACTIVE'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select public.current_user_role() = 'ADMIN';
$$;

create or replace function public.is_officer()
returns boolean
language sql stable security definer set search_path = public as $$
  select public.current_user_role() = 'ROAD_OFFICER';
$$;

create or replace function public.is_inspector()
returns boolean
language sql stable security definer set search_path = public as $$
  select public.current_user_role() = 'FIELD_INSPECTOR';
$$;

-- Officers and admins can view all operational data. Inspectors are scoped.
create or replace function public.can_view_operational()
returns boolean
language sql stable security definer set search_path = public as $$
  select public.current_user_role() in ('ADMIN', 'ROAD_OFFICER');
$$;

-- Is the current inspector assigned to the given project?
create or replace function public.is_assigned_to_project(p_project_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.project_assignments pa
    where pa.project_id = p_project_id and pa.inspector_id = auth.uid()
  );
$$;

-- Is the current inspector assigned to the given road?
create or replace function public.is_assigned_to_road(p_road_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.road_assignments ra
    where ra.road_id = p_road_id and ra.inspector_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- New-auth-user hook: auto-create a minimal profile row.
-- Metadata name/role can be supplied at signup; defaults are safe (inspector,
-- ACTIVE). Admins refine role/department afterwards from the Admin > Users UI.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'FIELD_INSPECTOR'),
    'ACTIVE'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_auth_user_created on auth.users;
create trigger trg_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
