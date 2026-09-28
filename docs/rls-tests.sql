-- ============================================================================
-- ROADGOV — RLS integration test script (spec §40 "Unauthorized direct DB access")
--
-- Run against a LIVE database that has all migrations + seed applied. This proves
-- the database independently enforces access even if the UI/server were bypassed.
--
-- How to run: in the Supabase SQL editor (or psql), impersonate a role by setting
-- the JWT claims for the transaction, then attempt operations. Each block states
-- the EXPECTED outcome.
--
-- Helper to impersonate a user within a transaction:
--   set local role authenticated;
--   set local request.jwt.claims to '{"sub":"<user-uuid>","role":"authenticated"}';
-- ============================================================================

-- Seeded UUIDs
--   ADMIN     11111111-1111-1111-1111-111111111111
--   OFFICER   22222222-2222-2222-2222-222222222222
--   INSPECTOR 33333333-3333-3333-3333-333333333333
-- Inspector is assigned to projects ...007 and ...008, and roads ...003/...004/...009 only.

-- ---------------------------------------------------------------------------
-- TEST 1 — Officer can read all projects (EXPECT: 10 rows)
-- ---------------------------------------------------------------------------
begin;
  set local role authenticated;
  set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
  select count(*) as officer_visible_projects from public.road_projects; -- EXPECT 10
rollback;

-- ---------------------------------------------------------------------------
-- TEST 2 — Inspector sees ONLY assigned projects (EXPECT: 2 rows: ...007, ...008)
-- ---------------------------------------------------------------------------
begin;
  set local role authenticated;
  set local request.jwt.claims to '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';
  select count(*) as inspector_visible_projects from public.road_projects; -- EXPECT 2
  select array_agg(project_code order by project_code) from public.road_projects; -- EXPECT {RP-2026-007,RP-2026-008}
rollback;

-- ---------------------------------------------------------------------------
-- TEST 3 — Inspector CANNOT insert a project (EXPECT: error / 0 rows written)
-- ---------------------------------------------------------------------------
begin;
  set local role authenticated;
  set local request.jwt.claims to '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';
  -- This must violate the projects_insert WITH CHECK (is_officer()).
  -- EXPECT: "new row violates row-level security policy"
  insert into public.road_projects
    (project_code, project_name, road_name, location, ward, road_type, length_km,
     project_reason, estimated_cost, estimated_duration_months, status, created_by)
  values ('HACK-1','x','x','x','x','URBAN_ROAD',1,'x',1,1,'DRAFT',
          '33333333-3333-3333-3333-333333333333');
rollback;

-- ---------------------------------------------------------------------------
-- TEST 4 — Inspector CANNOT approve/modify a project (EXPECT: 0 rows updated)
-- ---------------------------------------------------------------------------
begin;
  set local role authenticated;
  set local request.jwt.claims to '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';
  update public.road_projects set status='APPROVED'
    where id='10000000-0000-0000-0000-000000000003';
  -- EXPECT: UPDATE 0 (no visible/updatable row under RLS)
rollback;

-- ---------------------------------------------------------------------------
-- TEST 5 — Inspector CANNOT forge an inspection for an UNASSIGNED project
--          (EXPECT: RLS violation). Project ...003 is not assigned to them.
-- ---------------------------------------------------------------------------
begin;
  set local role authenticated;
  set local request.jwt.claims to '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';
  insert into public.construction_inspections
    (project_id, inspector_id, inspection_date, progress_percentage, quality_status)
  values ('10000000-0000-0000-0000-000000000003',
          '33333333-3333-3333-3333-333333333333', current_date, 50, 'SATISFACTORY');
  -- EXPECT: row-level security violation (not assigned)
rollback;

-- ---------------------------------------------------------------------------
-- TEST 6 — Inspector CANNOT submit an inspection under ANOTHER user's id
--          (EXPECT: RLS violation because inspector_id <> auth.uid()).
-- ---------------------------------------------------------------------------
begin;
  set local role authenticated;
  set local request.jwt.claims to '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';
  insert into public.construction_inspections
    (project_id, inspector_id, inspection_date, progress_percentage, quality_status)
  values ('10000000-0000-0000-0000-000000000007',
          '22222222-2222-2222-2222-222222222222', current_date, 50, 'SATISFACTORY');
  -- EXPECT: row-level security violation (forged inspector_id)
rollback;

-- ---------------------------------------------------------------------------
-- TEST 7 — Inspector CAN submit an inspection for an ASSIGNED project as self
--          (EXPECT: success). Project ...007 IS assigned to them.
-- ---------------------------------------------------------------------------
begin;
  set local role authenticated;
  set local request.jwt.claims to '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';
  insert into public.construction_inspections
    (project_id, inspector_id, inspection_date, progress_percentage, quality_status)
  values ('10000000-0000-0000-0000-000000000007',
          '33333333-3333-3333-3333-333333333333', current_date, 60, 'SATISFACTORY');
  -- EXPECT: INSERT 1
rollback;

-- ---------------------------------------------------------------------------
-- TEST 8 — Nobody can UPDATE or DELETE audit logs (append-only, spec §21)
--          (EXPECT: 0 rows affected even as officer/admin)
-- ---------------------------------------------------------------------------
begin;
  set local role authenticated;
  set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
  update public.audit_logs set action='CREATE' where true;   -- EXPECT UPDATE 0
  delete from public.audit_logs where true;                  -- EXPECT DELETE 0
rollback;

-- ---------------------------------------------------------------------------
-- TEST 9 — An INACTIVE user passes no policy. Temporarily deactivate the
--          inspector and confirm they can read nothing operational.
-- ---------------------------------------------------------------------------
begin;
  update public.users set status='INACTIVE' where id='33333333-3333-3333-3333-333333333333';
  set local role authenticated;
  set local request.jwt.claims to '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';
  select count(*) as inactive_visible_projects from public.road_projects; -- EXPECT 0
rollback;  -- rollback restores ACTIVE status

-- ---------------------------------------------------------------------------
-- TEST 10 — Anonymous (no JWT) sees nothing (EXPECT: 0 rows)
-- ---------------------------------------------------------------------------
begin;
  set local role anon;
  select count(*) as anon_visible_projects from public.road_projects; -- EXPECT 0
rollback;
