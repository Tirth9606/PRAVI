-- ============================================================================
-- ROADGOV — Migration 0008: Row Level Security policies
-- RLS is MANDATORY (spec §25). Every table below denies by default and grants
-- narrowly by role, status and assignment. No "authenticated can do everything".
-- Enforcement is independent of the UI and server layer.
-- ============================================================================

-- Enable RLS everywhere ------------------------------------------------------
alter table public.departments              enable row level security;
alter table public.users                    enable row level security;
alter table public.road_projects            enable row level security;
alter table public.project_assignments      enable row level security;
alter table public.project_approvals        enable row level security;
alter table public.budgets                  enable row level security;
alter table public.tenders                  enable row level security;
alter table public.contractors              enable row level security;
alter table public.tender_bids              enable row level security;
alter table public.contracts                enable row level security;
alter table public.construction_updates     enable row level security;
alter table public.construction_inspections enable row level security;
alter table public.roads                    enable row level security;
alter table public.road_assignments         enable row level security;
alter table public.road_inspections         enable row level security;
alter table public.defects                  enable row level security;
alter table public.maintenance              enable row level security;
alter table public.complaints               enable row level security;
alter table public.audit_logs               enable row level security;
alter table public.documents                enable row level security;

-- ---------------------------------------------------------------------------
-- DEPARTMENTS: all active users read; only admins write.
-- ---------------------------------------------------------------------------
drop policy if exists dept_select on public.departments;
create policy dept_select on public.departments for select to authenticated
  using (public.is_active_user());
drop policy if exists dept_write on public.departments;
create policy dept_write on public.departments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- USERS: read own row; admins & officers read all (for assignment/visibility).
-- Only admins may modify roles/status. Users may update their own name/phone.
-- ---------------------------------------------------------------------------
drop policy if exists users_select on public.users;
create policy users_select on public.users for select to authenticated
  using (id = auth.uid() or public.can_view_operational());

drop policy if exists users_admin_write on public.users;
create policy users_admin_write on public.users for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists users_self_update on public.users;
create policy users_self_update on public.users for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- ROAD PROJECTS: officers/admins see all; inspectors see only assigned.
-- Only officers create/update/delete.
-- ---------------------------------------------------------------------------
drop policy if exists projects_select on public.road_projects;
create policy projects_select on public.road_projects for select to authenticated
  using (public.can_view_operational() or public.is_assigned_to_project(id));

drop policy if exists projects_insert on public.road_projects;
create policy projects_insert on public.road_projects for insert to authenticated
  with check (public.is_officer() and created_by = auth.uid());

drop policy if exists projects_update on public.road_projects;
create policy projects_update on public.road_projects for update to authenticated
  using (public.is_officer()) with check (public.is_officer());

drop policy if exists projects_delete on public.road_projects;
create policy projects_delete on public.road_projects for delete to authenticated
  using (public.is_officer());

-- ---------------------------------------------------------------------------
-- PROJECT ASSIGNMENTS: officers/admins manage; inspectors read their own.
-- ---------------------------------------------------------------------------
drop policy if exists proj_assign_select on public.project_assignments;
create policy proj_assign_select on public.project_assignments for select to authenticated
  using (public.can_view_operational() or inspector_id = auth.uid());
drop policy if exists proj_assign_write on public.project_assignments;
create policy proj_assign_write on public.project_assignments for all to authenticated
  using (public.is_officer()) with check (public.is_officer());

-- ---------------------------------------------------------------------------
-- PROJECT APPROVALS: operational read + assigned inspector read; officers write.
-- ---------------------------------------------------------------------------
drop policy if exists approvals_select on public.project_approvals;
create policy approvals_select on public.project_approvals for select to authenticated
  using (public.can_view_operational() or public.is_assigned_to_project(project_id));
drop policy if exists approvals_insert on public.project_approvals;
create policy approvals_insert on public.project_approvals for insert to authenticated
  with check (public.is_officer() and approved_by = auth.uid());
drop policy if exists approvals_update on public.project_approvals;
create policy approvals_update on public.project_approvals for update to authenticated
  using (public.is_officer()) with check (public.is_officer());

-- ---------------------------------------------------------------------------
-- BUDGETS / TENDERS / CONTRACTORS / BIDS / CONTRACTS: operational read; officer write.
-- ---------------------------------------------------------------------------
drop policy if exists budgets_select on public.budgets;
create policy budgets_select on public.budgets for select to authenticated
  using (public.can_view_operational() or public.is_assigned_to_project(project_id));
drop policy if exists budgets_write on public.budgets;
create policy budgets_write on public.budgets for all to authenticated
  using (public.is_officer()) with check (public.is_officer());

drop policy if exists tenders_select on public.tenders;
create policy tenders_select on public.tenders for select to authenticated
  using (public.can_view_operational());
drop policy if exists tenders_write on public.tenders;
create policy tenders_write on public.tenders for all to authenticated
  using (public.is_officer()) with check (public.is_officer());

drop policy if exists contractors_select on public.contractors;
create policy contractors_select on public.contractors for select to authenticated
  using (public.can_view_operational());
drop policy if exists contractors_write on public.contractors;
create policy contractors_write on public.contractors for all to authenticated
  using (public.is_officer()) with check (public.is_officer());

drop policy if exists bids_select on public.tender_bids;
create policy bids_select on public.tender_bids for select to authenticated
  using (public.can_view_operational());
drop policy if exists bids_write on public.tender_bids;
create policy bids_write on public.tender_bids for all to authenticated
  using (public.is_officer()) with check (public.is_officer());

drop policy if exists contracts_select on public.contracts;
create policy contracts_select on public.contracts for select to authenticated
  using (public.can_view_operational());
drop policy if exists contracts_write on public.contracts;
create policy contracts_write on public.contracts for all to authenticated
  using (public.is_officer()) with check (public.is_officer());

-- ---------------------------------------------------------------------------
-- CONSTRUCTION UPDATES: operational + assigned inspector read; officer writes.
-- ---------------------------------------------------------------------------
drop policy if exists cupdates_select on public.construction_updates;
create policy cupdates_select on public.construction_updates for select to authenticated
  using (public.can_view_operational() or public.is_assigned_to_project(project_id));
drop policy if exists cupdates_write on public.construction_updates;
create policy cupdates_write on public.construction_updates for all to authenticated
  using (public.is_officer()) with check (public.is_officer());

-- ---------------------------------------------------------------------------
-- CONSTRUCTION INSPECTIONS: inspectors submit for assigned projects (own id);
-- officers review (update). Inspectors read their own + officers read all.
-- ---------------------------------------------------------------------------
drop policy if exists cinsp_select on public.construction_inspections;
create policy cinsp_select on public.construction_inspections for select to authenticated
  using (public.can_view_operational() or inspector_id = auth.uid());
drop policy if exists cinsp_insert on public.construction_inspections;
create policy cinsp_insert on public.construction_inspections for insert to authenticated
  with check (
    inspector_id = auth.uid()
    and public.is_inspector()
    and public.is_assigned_to_project(project_id)
  );
drop policy if exists cinsp_update on public.construction_inspections;
create policy cinsp_update on public.construction_inspections for update to authenticated
  using (public.is_officer()) with check (public.is_officer());

-- ---------------------------------------------------------------------------
-- ROADS: operational read all; inspectors read assigned. Officer writes.
-- ---------------------------------------------------------------------------
drop policy if exists roads_select on public.roads;
create policy roads_select on public.roads for select to authenticated
  using (public.can_view_operational() or public.is_assigned_to_road(id));
drop policy if exists roads_write on public.roads;
create policy roads_write on public.roads for all to authenticated
  using (public.is_officer()) with check (public.is_officer());

drop policy if exists road_assign_select on public.road_assignments;
create policy road_assign_select on public.road_assignments for select to authenticated
  using (public.can_view_operational() or inspector_id = auth.uid());
drop policy if exists road_assign_write on public.road_assignments;
create policy road_assign_write on public.road_assignments for all to authenticated
  using (public.is_officer()) with check (public.is_officer());

-- ---------------------------------------------------------------------------
-- ROAD INSPECTIONS: inspectors submit for assigned roads (own id); officer reviews.
-- ---------------------------------------------------------------------------
drop policy if exists rinsp_select on public.road_inspections;
create policy rinsp_select on public.road_inspections for select to authenticated
  using (public.can_view_operational() or inspector_id = auth.uid());
drop policy if exists rinsp_insert on public.road_inspections;
create policy rinsp_insert on public.road_inspections for insert to authenticated
  with check (
    inspector_id = auth.uid()
    and public.is_inspector()
    and public.is_assigned_to_road(road_id)
  );
drop policy if exists rinsp_update on public.road_inspections;
create policy rinsp_update on public.road_inspections for update to authenticated
  using (public.is_officer()) with check (public.is_officer());

-- ---------------------------------------------------------------------------
-- DEFECTS: assigned inspector may create (via assigned road); officer manages.
-- ---------------------------------------------------------------------------
drop policy if exists defects_select on public.defects;
create policy defects_select on public.defects for select to authenticated
  using (public.can_view_operational() or public.is_assigned_to_road(road_id));
drop policy if exists defects_insert on public.defects;
create policy defects_insert on public.defects for insert to authenticated
  with check (
    public.is_officer()
    or (public.is_inspector() and public.is_assigned_to_road(road_id))
  );
drop policy if exists defects_update on public.defects;
create policy defects_update on public.defects for update to authenticated
  using (public.is_officer()) with check (public.is_officer());

-- ---------------------------------------------------------------------------
-- MAINTENANCE: operational read (assigned inspector may read own tasks); officer writes.
-- ---------------------------------------------------------------------------
drop policy if exists maint_select on public.maintenance;
create policy maint_select on public.maintenance for select to authenticated
  using (public.can_view_operational() or assigned_to = auth.uid()
         or public.is_assigned_to_road(road_id));
drop policy if exists maint_write on public.maintenance;
create policy maint_write on public.maintenance for all to authenticated
  using (public.is_officer()) with check (public.is_officer());

-- ---------------------------------------------------------------------------
-- COMPLAINTS: operational read; officer/admin write.
-- ---------------------------------------------------------------------------
drop policy if exists complaints_select on public.complaints;
create policy complaints_select on public.complaints for select to authenticated
  using (public.can_view_operational());
drop policy if exists complaints_write on public.complaints;
create policy complaints_write on public.complaints for all to authenticated
  using (public.can_view_operational()) with check (public.can_view_operational());

-- ---------------------------------------------------------------------------
-- AUDIT LOGS: append-only. Officers/admins read; any active user may INSERT
-- their own action. NO update/delete policies exist -> history is immutable.
-- ---------------------------------------------------------------------------
drop policy if exists audit_select on public.audit_logs;
create policy audit_select on public.audit_logs for select to authenticated
  using (public.can_view_operational());
drop policy if exists audit_insert on public.audit_logs;
create policy audit_insert on public.audit_logs for insert to authenticated
  with check (public.is_active_user() and (user_id = auth.uid() or user_id is null));

-- ---------------------------------------------------------------------------
-- DOCUMENTS: operational + assigned inspector read; uploaders write their own.
-- ---------------------------------------------------------------------------
drop policy if exists documents_select on public.documents;
create policy documents_select on public.documents for select to authenticated
  using (
    public.can_view_operational()
    or (project_id is not null and public.is_assigned_to_project(project_id))
    or (road_id is not null and public.is_assigned_to_road(road_id))
  );
drop policy if exists documents_insert on public.documents;
create policy documents_insert on public.documents for insert to authenticated
  with check (
    uploaded_by = auth.uid() and public.is_active_user() and (
      public.can_view_operational()
      or (project_id is not null and public.is_assigned_to_project(project_id))
      or (road_id is not null and public.is_assigned_to_road(road_id))
    )
  );
drop policy if exists documents_delete on public.documents;
create policy documents_delete on public.documents for delete to authenticated
  using (public.is_officer() or uploaded_by = auth.uid());
