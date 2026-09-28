-- ============================================================================
-- ROADGOV — Demo seed data (fictional Gujarat-style records only).
-- Safe to run against a fresh database AFTER all migrations are applied.
-- Idempotent: uses fixed UUIDs + ON CONFLICT DO NOTHING.
--
-- Demo password for all three accounts: Password123!
--   admin@roadgov.demo       (ADMIN)
--   officer@roadgov.demo     (ROAD_OFFICER)
--   inspector@roadgov.demo   (FIELD_INSPECTOR)
-- Do NOT use real passwords or real personal data.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Auth users. Inserting into auth.users fires handle_new_auth_user(), which
--    creates the matching public.users profile with the role from metadata.
-- ---------------------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated',
   'admin@roadgov.demo', crypt('Password123!', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"],"role":"ADMIN"}', '{"name":"Anjali Mehta","role":"ADMIN"}'),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated',
   'officer@roadgov.demo', crypt('Password123!', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"],"role":"ROAD_OFFICER"}', '{"name":"Rajesh Patel","role":"ROAD_OFFICER"}'),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated',
   'inspector@roadgov.demo', crypt('Password123!', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"],"role":"FIELD_INSPECTOR"}', '{"name":"Priya Desai","role":"FIELD_INSPECTOR"}')
on conflict (id) do nothing;

-- Ensure identities exist (needed for password login in newer GoTrue versions).
insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '{"sub":"11111111-1111-1111-1111-111111111111","email":"admin@roadgov.demo"}', 'email', 'admin@roadgov.demo', now(), now(), now()),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '{"sub":"22222222-2222-2222-2222-222222222222","email":"officer@roadgov.demo"}', 'email', 'officer@roadgov.demo', now(), now(), now()),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', '{"sub":"33333333-3333-3333-3333-333333333333","email":"inspector@roadgov.demo"}', 'email', 'inspector@roadgov.demo', now(), now(), now())
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- 2) Departments
-- ---------------------------------------------------------------------------
insert into public.departments (id, name, code, contact_email) values
  ('a0000000-0000-0000-0000-000000000001', 'Public Works Department, Ahmedabad', 'PWD-AHM', 'pwd.ahm@roadgov.demo'),
  ('a0000000-0000-0000-0000-000000000002', 'Roads & Buildings, Gujarat', 'RNB-GUJ', 'rnb.guj@roadgov.demo'),
  ('a0000000-0000-0000-0000-000000000003', 'Urban Roads Cell, Surat', 'URC-SUR', 'urc.sur@roadgov.demo')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 3) Ensure profiles exist & set roles/departments (in case trigger differs).
-- ---------------------------------------------------------------------------
insert into public.users (id, name, email, role, status, department_id) values
  ('11111111-1111-1111-1111-111111111111', 'Anjali Mehta', 'admin@roadgov.demo', 'ADMIN', 'ACTIVE', 'a0000000-0000-0000-0000-000000000001'),
  ('22222222-2222-2222-2222-222222222222', 'Rajesh Patel', 'officer@roadgov.demo', 'ROAD_OFFICER', 'ACTIVE', 'a0000000-0000-0000-0000-000000000002'),
  ('33333333-3333-3333-3333-333333333333', 'Priya Desai', 'inspector@roadgov.demo', 'FIELD_INSPECTOR', 'ACTIVE', 'a0000000-0000-0000-0000-000000000003')
on conflict (id) do update
  set role = excluded.role, department_id = excluded.department_id, status = 'ACTIVE', name = excluded.name;

-- ---------------------------------------------------------------------------
-- 4) Road projects (10) spanning the lifecycle.
-- ---------------------------------------------------------------------------
insert into public.road_projects
  (id, project_code, project_name, road_name, location, ward, area, road_type, length_km,
   project_reason, estimated_cost, approved_cost, final_cost, estimated_duration_months,
   status, department_id, created_by)
values
  ('10000000-0000-0000-0000-000000000001','RP-2026-001','SG Highway Service Road Upgrade','SG Highway Service Road','Bodakdev','Ward 12','West Zone','URBAN_ROAD',3.400,'Frequent congestion and surface wear',25000000,null,null,10,'DRAFT','a0000000-0000-0000-0000-000000000002','22222222-2222-2222-2222-222222222222'),
  ('10000000-0000-0000-0000-000000000002','RP-2026-002','Naroda Industrial Link Road','Naroda Link Road','Naroda','Ward 05','East Zone','MAJOR_DISTRICT_ROAD',5.100,'Heavy freight movement damage',48000000,null,null,14,'SUBMITTED','a0000000-0000-0000-0000-000000000002','22222222-2222-2222-2222-222222222222'),
  ('10000000-0000-0000-0000-000000000003','RP-2026-003','Vastrapur Lake Circular Road','Vastrapur Circular','Vastrapur','Ward 12','West Zone','URBAN_ROAD',2.200,'Pedestrian safety and resurfacing',18000000,null,null,8,'UNDER_REVIEW','a0000000-0000-0000-0000-000000000002','22222222-2222-2222-2222-222222222222'),
  ('10000000-0000-0000-0000-000000000004','RP-2026-004','Chandkheda Approach Road','Chandkheda Approach','Chandkheda','Ward 03','North Zone','MAJOR_DISTRICT_ROAD',4.600,'New connectivity to ring road',52000000,52000000,null,16,'APPROVED','a0000000-0000-0000-0000-000000000002','22222222-2222-2222-2222-222222222222'),
  ('10000000-0000-0000-0000-000000000005','RP-2026-005','Maninagar Market Road Rehab','Maninagar Market Road','Maninagar','Ward 08','South Zone','URBAN_ROAD',1.800,'Severe potholing near market','21000000',21000000,null,7,'BUDGET_APPROVED','a0000000-0000-0000-0000-000000000001','22222222-2222-2222-2222-222222222222'),
  ('10000000-0000-0000-0000-000000000006','RP-2026-006','Sarkhej Ring Widening','Sarkhej Ring Road','Sarkhej','Ward 14','West Zone','STATE_HIGHWAY',6.300,'Lane widening for traffic growth',95000000,95000000,null,20,'TENDERING','a0000000-0000-0000-0000-000000000002','22222222-2222-2222-2222-222222222222'),
  ('10000000-0000-0000-0000-000000000007','RP-2026-007','Bopal Village Road Strengthening','Bopal Main Road','Bopal','Ward 15','West Zone','RURAL_ROAD',3.900,'Base failure after monsoon',34000000,34000000,null,12,'UNDER_CONSTRUCTION','a0000000-0000-0000-0000-000000000002','22222222-2222-2222-2222-222222222222'),
  ('10000000-0000-0000-0000-000000000008','RP-2026-008','Gota Flyover Approach Resurfacing','Gota Approach','Gota','Ward 02','North Zone','URBAN_ROAD',2.700,'Surface distress on approach',29000000,29000000,null,9,'UNDER_CONSTRUCTION','a0000000-0000-0000-0000-000000000002','22222222-2222-2222-2222-222222222222'),
  ('10000000-0000-0000-0000-000000000009','RP-2026-009','Thaltej Feeder Road Reconstruction','Thaltej Feeder','Thaltej','Ward 12','West Zone','URBAN_ROAD',2.050,'Full reconstruction of worn road',24000000,24000000,23500000,8,'COMPLETED','a0000000-0000-0000-0000-000000000002','22222222-2222-2222-2222-222222222222'),
  ('10000000-0000-0000-0000-000000000010','RP-2026-010','Odhav GIDC Internal Roads','Odhav GIDC Road','Odhav','Ward 06','East Zone','MAJOR_DISTRICT_ROAD',4.100,'Industrial estate road renewal',41000000,41000000,40200000,13,'HANDED_OVER','a0000000-0000-0000-0000-000000000002','22222222-2222-2222-2222-222222222222')
on conflict (id) do nothing;

-- Set some plan/actual dates for realism
update public.road_projects set planned_start_date='2026-01-15', planned_end_date='2026-10-15', actual_start_date='2026-02-01' where id='10000000-0000-0000-0000-000000000007';
update public.road_projects set planned_start_date='2026-02-01', planned_end_date='2026-09-01', actual_start_date='2026-02-10' where id='10000000-0000-0000-0000-000000000008';
update public.road_projects set actual_start_date='2025-11-01', actual_end_date='2026-06-20' where id in ('10000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000010');

-- ---------------------------------------------------------------------------
-- 5) Approvals for approved/completed/handed-over projects
-- ---------------------------------------------------------------------------
insert into public.project_approvals (id, project_id, approved_by, approval_type, status, approved_at) values
  ('b1000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000004','22222222-2222-2222-2222-222222222222','PROJECT_APPROVAL','APPROVED', now()),
  ('b1000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000005','22222222-2222-2222-2222-222222222222','PROJECT_APPROVAL','APPROVED', now()),
  ('b1000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000005','22222222-2222-2222-2222-222222222222','BUDGET_APPROVAL','APPROVED', now()),
  ('b1000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000009','22222222-2222-2222-2222-222222222222','COMPLETION_APPROVAL','APPROVED', now()),
  ('b1000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000010','22222222-2222-2222-2222-222222222222','HANDOVER_APPROVAL','APPROVED', now())
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 6) Budgets
-- ---------------------------------------------------------------------------
insert into public.budgets (id, project_id, estimated_amount, approved_amount, funding_source, status, approved_by, approval_date) values
  ('b2000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000005',21000000,21000000,'State Budget 2026-27','APPROVED','22222222-2222-2222-2222-222222222222', current_date),
  ('b2000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000006',95000000,95000000,'State Budget 2026-27','APPROVED','22222222-2222-2222-2222-222222222222', current_date),
  ('b2000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000007',34000000,34000000,'Urban Development Fund','APPROVED','22222222-2222-2222-2222-222222222222', current_date),
  ('b2000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000009',24000000,24000000,'Municipal Fund','APPROVED','22222222-2222-2222-2222-222222222222', current_date)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 7) Contractors (5)
-- ---------------------------------------------------------------------------
insert into public.contractors (id, name, registration_number, contact_person, phone, email, experience_years, status) values
  ('c0000000-0000-0000-0000-000000000001','Sardar Infra Constructions Pvt Ltd','GJ-CON-1001','Kiran Shah','9825000001','kiran@sardarinfra.demo',18,'ACTIVE'),
  ('c0000000-0000-0000-0000-000000000002','Narmada Roadways Builders','GJ-CON-1002','Meena Joshi','9825000002','meena@narmadaroad.demo',12,'ACTIVE'),
  ('c0000000-0000-0000-0000-000000000003','Gujarat Highway Developers','GJ-CON-1003','Amit Trivedi','9825000003','amit@ghd.demo',22,'ACTIVE'),
  ('c0000000-0000-0000-0000-000000000004','Sabarmati Civil Works','GJ-CON-1004','Nisha Rana','9825000004','nisha@sabarmaticivil.demo',9,'ACTIVE'),
  ('c0000000-0000-0000-0000-000000000005','Kutch Construction Co','GJ-CON-1005','Rohit Vaghela','9825000005','rohit@kutchcon.demo',15,'ACTIVE')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 8) Tenders (5) + bids (10)
-- ---------------------------------------------------------------------------
insert into public.tenders (id, project_id, tender_number, estimated_value, status, opening_date, closing_date, created_by) values
  ('d1000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000006','TND-2026-006',95000000,'EVALUATION','2026-03-01','2026-03-21','22222222-2222-2222-2222-222222222222'),
  ('d1000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000007','TND-2026-007',34000000,'AWARDED','2026-01-05','2026-01-25','22222222-2222-2222-2222-222222222222'),
  ('d1000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000008','TND-2026-008',29000000,'AWARDED','2026-01-10','2026-01-30','22222222-2222-2222-2222-222222222222'),
  ('d1000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000009','TND-2026-009',24000000,'AWARDED','2025-09-01','2025-09-21','22222222-2222-2222-2222-222222222222'),
  ('d1000000-0000-0000-0000-000000000010','10000000-0000-0000-0000-000000000010','TND-2026-010',41000000,'AWARDED','2025-08-01','2025-08-21','22222222-2222-2222-2222-222222222222')
on conflict (id) do nothing;

insert into public.tender_bids (id, tender_id, contractor_id, bid_amount, status) values
  ('e1000000-0000-0000-0000-000000000001','d1000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000001',93500000,'UNDER_REVIEW'),
  ('e1000000-0000-0000-0000-000000000002','d1000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000003',92000000,'UNDER_REVIEW'),
  ('e1000000-0000-0000-0000-000000000003','d1000000-0000-0000-0000-000000000007','c0000000-0000-0000-0000-000000000002',33200000,'ACCEPTED'),
  ('e1000000-0000-0000-0000-000000000004','d1000000-0000-0000-0000-000000000007','c0000000-0000-0000-0000-000000000004',34500000,'REJECTED'),
  ('e1000000-0000-0000-0000-000000000005','d1000000-0000-0000-0000-000000000008','c0000000-0000-0000-0000-000000000005',28400000,'ACCEPTED'),
  ('e1000000-0000-0000-0000-000000000006','d1000000-0000-0000-0000-000000000008','c0000000-0000-0000-0000-000000000001',29200000,'REJECTED'),
  ('e1000000-0000-0000-0000-000000000007','d1000000-0000-0000-0000-000000000009','c0000000-0000-0000-0000-000000000003',23500000,'ACCEPTED'),
  ('e1000000-0000-0000-0000-000000000008','d1000000-0000-0000-0000-000000000009','c0000000-0000-0000-0000-000000000002',24800000,'REJECTED'),
  ('e1000000-0000-0000-0000-000000000009','d1000000-0000-0000-0000-000000000010','c0000000-0000-0000-0000-000000000001',40200000,'ACCEPTED'),
  ('e1000000-0000-0000-0000-000000000010','d1000000-0000-0000-0000-000000000010','c0000000-0000-0000-0000-000000000005',41800000,'REJECTED')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 9) Contracts (for construction/completed/handed-over projects)
-- ---------------------------------------------------------------------------
insert into public.contracts (id, project_id, tender_id, contractor_id, contract_number, contract_value, work_order_number, start_date, expected_end_date, actual_end_date, status) values
  ('f1000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000007','d1000000-0000-0000-0000-000000000007','c0000000-0000-0000-0000-000000000002','CON-2026-007',33200000,'WO-2026-007','2026-02-01','2026-12-01',null,'WORK_ORDER_ISSUED'),
  ('f1000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000008','d1000000-0000-0000-0000-000000000008','c0000000-0000-0000-0000-000000000005','CON-2026-008',28400000,'WO-2026-008','2026-02-10','2026-10-30',null,'WORK_ORDER_ISSUED'),
  ('f1000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000009','d1000000-0000-0000-0000-000000000009','c0000000-0000-0000-0000-000000000003','CON-2025-009',23500000,'WO-2025-009','2025-11-01','2026-06-30','2026-06-20','COMPLETED'),
  ('f1000000-0000-0000-0000-000000000010','10000000-0000-0000-0000-000000000010','d1000000-0000-0000-0000-000000000010','c0000000-0000-0000-0000-000000000001','CON-2025-010',40200000,'WO-2025-010','2025-08-15','2026-06-15','2026-06-10','COMPLETED')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 10) Construction updates (active + completed projects)
-- ---------------------------------------------------------------------------
insert into public.construction_updates (id, project_id, reported_by, update_date, physical_progress, financial_progress, current_stage, status, remarks) values
  ('a1100000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000007','22222222-2222-2222-2222-222222222222','2026-03-01',35,30,'Sub-base laying','VERIFIED','On schedule'),
  ('a1100000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000007','22222222-2222-2222-2222-222222222222','2026-04-01',55,50,'Base course','SUBMITTED','Minor rain delay'),
  ('a1100000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000008','22222222-2222-2222-2222-222222222222','2026-03-15',40,38,'Bituminous layer prep','VERIFIED',null),
  ('a1100000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000009','22222222-2222-2222-2222-222222222222','2026-06-18',100,100,'Final surfacing','VERIFIED','Ready for completion'),
  ('a1100000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000010','22222222-2222-2222-2222-222222222222','2026-06-05',100,100,'Handover snag closure','VERIFIED',null)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 11) Roads (10) — from handed-over project + standalone operational roads
-- ---------------------------------------------------------------------------
insert into public.roads (id, project_id, road_code, road_name, location, ward, area, road_type, length_km, current_condition, priority, status, handover_date, last_inspection_date) values
  ('c1a00000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000010','RD-RP-2026-010','Odhav GIDC Road','Odhav','Ward 06','East Zone','MAJOR_DISTRICT_ROAD',4.100,'GOOD','MEDIUM','OPERATIONAL','2026-06-15','2026-07-01'),
  ('c1a00000-0000-0000-0000-000000000002',null,'RD-URB-002','CG Road','Navrangpura','Ward 11','West Zone','URBAN_ROAD',1.900,'MODERATE','MEDIUM','OPERATIONAL',null,'2026-06-20'),
  ('c1a00000-0000-0000-0000-000000000003',null,'RD-URB-003','Ashram Road','Usmanpura','Ward 11','West Zone','URBAN_ROAD',3.200,'POOR','HIGH','OPERATIONAL',null,'2026-06-10'),
  ('c1a00000-0000-0000-0000-000000000004',null,'RD-URB-004','Relief Road','Kalupur','Ward 04','Central Zone','URBAN_ROAD',2.400,'CRITICAL','CRITICAL','UNDER_MAINTENANCE',null,'2026-06-25'),
  ('c1a00000-0000-0000-0000-000000000005',null,'RD-MDR-005','Sola Bhagwat Road','Sola','Ward 12','West Zone','MAJOR_DISTRICT_ROAD',5.600,'GOOD','LOW','OPERATIONAL',null,'2026-05-30'),
  ('c1a00000-0000-0000-0000-000000000006',null,'RD-URB-006','Nehru Bridge Road','Ellisbridge','Ward 11','West Zone','URBAN_ROAD',1.200,'MODERATE','MEDIUM','OPERATIONAL',null,'2026-06-15'),
  ('c1a00000-0000-0000-0000-000000000007',null,'RD-RUR-007','Shela Village Road','Shela','Ward 15','West Zone','RURAL_ROAD',4.800,'POOR','HIGH','OPERATIONAL',null,'2026-06-05'),
  ('c1a00000-0000-0000-0000-000000000008',null,'RD-URB-008','Kankaria Lake Road','Maninagar','Ward 08','South Zone','URBAN_ROAD',2.900,'GOOD','LOW','OPERATIONAL',null,'2026-06-12'),
  ('c1a00000-0000-0000-0000-000000000009',null,'RD-MDR-009','Vatva Industrial Road','Vatva','Ward 07','South Zone','MAJOR_DISTRICT_ROAD',6.100,'CRITICAL','CRITICAL','OPERATIONAL',null,'2026-06-28'),
  ('c1a00000-0000-0000-0000-000000000010',null,'RD-URB-010','Prahladnagar Road','Prahladnagar','Ward 13','West Zone','URBAN_ROAD',2.100,'MODERATE','MEDIUM','OPERATIONAL',null,'2026-06-18')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 12) Assignments (inspector Priya -> two projects + several roads)
-- ---------------------------------------------------------------------------
insert into public.project_assignments (id, project_id, inspector_id, assigned_by) values
  ('a2000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000007','33333333-3333-3333-3333-333333333333','22222222-2222-2222-2222-222222222222'),
  ('a2000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000008','33333333-3333-3333-3333-333333333333','22222222-2222-2222-2222-222222222222')
on conflict (id) do nothing;

insert into public.road_assignments (id, road_id, inspector_id, assigned_by) values
  ('a3000000-0000-0000-0000-000000000001','c1a00000-0000-0000-0000-000000000003','33333333-3333-3333-3333-333333333333','22222222-2222-2222-2222-222222222222'),
  ('a3000000-0000-0000-0000-000000000002','c1a00000-0000-0000-0000-000000000004','33333333-3333-3333-3333-333333333333','22222222-2222-2222-2222-222222222222'),
  ('a3000000-0000-0000-0000-000000000003','c1a00000-0000-0000-0000-000000000009','33333333-3333-3333-3333-333333333333','22222222-2222-2222-2222-222222222222')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 13) Road inspections (15)
-- ---------------------------------------------------------------------------
insert into public.road_inspections (id, road_id, inspector_id, inspection_date, condition, severity, status)
select
  ('a4000000-0000-0000-0000-0000000000' || lpad(g::text,2,'0'))::uuid,
  (array[
    'c1a00000-0000-0000-0000-000000000002','c1a00000-0000-0000-0000-000000000003','c1a00000-0000-0000-0000-000000000004',
    'c1a00000-0000-0000-0000-000000000005','c1a00000-0000-0000-0000-000000000006','c1a00000-0000-0000-0000-000000000007',
    'c1a00000-0000-0000-0000-000000000008','c1a00000-0000-0000-0000-000000000009','c1a00000-0000-0000-0000-000000000010',
    'c1a00000-0000-0000-0000-000000000003','c1a00000-0000-0000-0000-000000000004','c1a00000-0000-0000-0000-000000000009',
    'c1a00000-0000-0000-0000-000000000002','c1a00000-0000-0000-0000-000000000007','c1a00000-0000-0000-0000-000000000004'
  ])[g]::uuid,
  '33333333-3333-3333-3333-333333333333',
  (current_date - (g * 3))::date,
  (array['GOOD','MODERATE','POOR','GOOD','MODERATE','POOR','GOOD','CRITICAL','MODERATE','POOR','CRITICAL','CRITICAL','MODERATE','POOR','CRITICAL']::road_condition[])[g],
  (array['LOW','MEDIUM','HIGH','LOW','MEDIUM','HIGH','LOW','CRITICAL','MEDIUM','HIGH','CRITICAL','CRITICAL','MEDIUM','HIGH','CRITICAL']::priority_level[])[g],
  'REVIEWED'
from generate_series(1,15) as g
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 14) Defects (20)
-- ---------------------------------------------------------------------------
insert into public.defects (id, road_id, type, severity, quantity, status)
select
  ('a5000000-0000-0000-0000-0000000000' || lpad(g::text,2,'0'))::uuid,
  (array[
    'c1a00000-0000-0000-0000-000000000003','c1a00000-0000-0000-0000-000000000004','c1a00000-0000-0000-0000-000000000009',
    'c1a00000-0000-0000-0000-000000000003','c1a00000-0000-0000-0000-000000000004','c1a00000-0000-0000-0000-000000000009',
    'c1a00000-0000-0000-0000-000000000007','c1a00000-0000-0000-0000-000000000002','c1a00000-0000-0000-0000-000000000004',
    'c1a00000-0000-0000-0000-000000000009','c1a00000-0000-0000-0000-000000000003','c1a00000-0000-0000-0000-000000000007',
    'c1a00000-0000-0000-0000-000000000004','c1a00000-0000-0000-0000-000000000009','c1a00000-0000-0000-0000-000000000002',
    'c1a00000-0000-0000-0000-000000000003','c1a00000-0000-0000-0000-000000000004','c1a00000-0000-0000-0000-000000000009',
    'c1a00000-0000-0000-0000-000000000007','c1a00000-0000-0000-0000-000000000004'
  ])[g]::uuid,
  (array['POTHOLE','CRACK','WATERLOGGING','EDGE_DAMAGE','SURFACE_DAMAGE','DRAINAGE_ISSUE','POTHOLE','CRACK','POTHOLE','SURFACE_DAMAGE','POTHOLE','CRACK','WATERLOGGING','POTHOLE','EDGE_DAMAGE','SURFACE_DAMAGE','POTHOLE','DRAINAGE_ISSUE','CRACK','POTHOLE']::defect_type[])[g],
  (array['MEDIUM','HIGH','CRITICAL','LOW','MEDIUM','HIGH','CRITICAL','MEDIUM','HIGH','MEDIUM','CRITICAL','LOW','HIGH','CRITICAL','MEDIUM','HIGH','CRITICAL','MEDIUM','LOW','HIGH']::priority_level[])[g],
  (g % 5 + 1),
  (array['OPEN','OPEN','SCHEDULED','RESOLVED','OPEN','SCHEDULED','OPEN','RESOLVED','OPEN','SCHEDULED','OPEN','CLOSED','OPEN','OPEN','RESOLVED','OPEN','SCHEDULED','OPEN','CLOSED','OPEN']::defect_status[])[g]
from generate_series(1,20) as g
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 15) Maintenance (10) — spread across the workflow
-- ---------------------------------------------------------------------------
insert into public.maintenance (id, road_id, work_type, priority, estimated_cost, actual_cost, status, approved_by, start_date, completion_date) values
  ('a6000000-0000-0000-0000-000000000001','c1a00000-0000-0000-0000-000000000004','Emergency pothole patching','CRITICAL',450000,null,'PENDING',null,null,null),
  ('a6000000-0000-0000-0000-000000000002','c1a00000-0000-0000-0000-000000000009','Drainage clearing & resurface','CRITICAL',1200000,null,'PENDING',null,null,null),
  ('a6000000-0000-0000-0000-000000000003','c1a00000-0000-0000-0000-000000000003','Crack sealing','HIGH',300000,null,'APPROVED','22222222-2222-2222-2222-222222222222',null,null),
  ('a6000000-0000-0000-0000-000000000004','c1a00000-0000-0000-0000-000000000007','Edge repair','MEDIUM',250000,null,'APPROVED','22222222-2222-2222-2222-222222222222',null,null),
  ('a6000000-0000-0000-0000-000000000005','c1a00000-0000-0000-0000-000000000004','Surface milling & overlay','HIGH',900000,null,'IN_PROGRESS','22222222-2222-2222-2222-222222222222','2026-06-20',null),
  ('a6000000-0000-0000-0000-000000000006','c1a00000-0000-0000-0000-000000000002','Line marking refresh','LOW',80000,78000,'COMPLETED','22222222-2222-2222-2222-222222222222','2026-05-01','2026-05-05'),
  ('a6000000-0000-0000-0000-000000000007','c1a00000-0000-0000-0000-000000000006','Pothole patching','MEDIUM',150000,142000,'COMPLETED','22222222-2222-2222-2222-222222222222','2026-05-10','2026-05-14'),
  ('a6000000-0000-0000-0000-000000000008','c1a00000-0000-0000-0000-000000000008','Shoulder grading','LOW',120000,118000,'COMPLETED','22222222-2222-2222-2222-222222222222','2026-04-20','2026-04-24'),
  ('a6000000-0000-0000-0000-000000000009','c1a00000-0000-0000-0000-000000000003','Drain desilting','MEDIUM',200000,null,'PENDING',null,null,null),
  ('a6000000-0000-0000-0000-000000000010','c1a00000-0000-0000-0000-000000000009','Full-depth reclamation','CRITICAL',3500000,null,'APPROVED','22222222-2222-2222-2222-222222222222',null,null)
on conflict (id) do nothing;

-- Reflect completed maintenance on the road last_maintenance_date (as the app does)
update public.roads set last_maintenance_date='2026-05-05' where id='c1a00000-0000-0000-0000-000000000002';
update public.roads set last_maintenance_date='2026-05-14' where id='c1a00000-0000-0000-0000-000000000006';
update public.roads set last_maintenance_date='2026-04-24' where id='c1a00000-0000-0000-0000-000000000008';

-- ---------------------------------------------------------------------------
-- 16) Complaints (a few internal records)
-- ---------------------------------------------------------------------------
insert into public.complaints (id, road_id, subject, description, status, reported_by) values
  ('a7000000-0000-0000-0000-000000000001','c1a00000-0000-0000-0000-000000000004','Large pothole near Kalupur','Reported by ward office, causing two-wheeler skids','OPEN','22222222-2222-2222-2222-222222222222'),
  ('a7000000-0000-0000-0000-000000000002','c1a00000-0000-0000-0000-000000000009','Waterlogging at Vatva junction','Standing water after light rain','IN_REVIEW','22222222-2222-2222-2222-222222222222')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 17) Audit logs (illustrative history)
-- ---------------------------------------------------------------------------
insert into public.audit_logs (id, user_id, action, entity_type, entity_id, new_value, "timestamp") values
  ('a8000000-0000-0000-0000-000000000001','22222222-2222-2222-2222-222222222222','CREATE','road_project','10000000-0000-0000-0000-000000000010','{"project_code":"RP-2026-010"}', now() - interval '40 days'),
  ('a8000000-0000-0000-0000-000000000002','22222222-2222-2222-2222-222222222222','APPROVE','road_project','10000000-0000-0000-0000-000000000010','{"status":"APPROVED"}', now() - interval '38 days'),
  ('a8000000-0000-0000-0000-000000000003','22222222-2222-2222-2222-222222222222','CONTRACTOR_SELECTED','contract','f1000000-0000-0000-0000-000000000010','{"contractor":"Sardar Infra"}', now() - interval '30 days'),
  ('a8000000-0000-0000-0000-000000000004','22222222-2222-2222-2222-222222222222','WORK_ORDER_ISSUED','road_project','10000000-0000-0000-0000-000000000010','{"work_order":"WO-2025-010"}', now() - interval '29 days'),
  ('a8000000-0000-0000-0000-000000000005','22222222-2222-2222-2222-222222222222','PROJECT_COMPLETED','road_project','10000000-0000-0000-0000-000000000010','{"status":"COMPLETED"}', now() - interval '10 days'),
  ('a8000000-0000-0000-0000-000000000006','22222222-2222-2222-2222-222222222222','ROAD_HANDED_OVER','road_project','10000000-0000-0000-0000-000000000010','{"status":"HANDED_OVER"}', now() - interval '8 days'),
  ('a8000000-0000-0000-0000-000000000007','33333333-3333-3333-3333-333333333333','INSPECTION_SUBMITTED','road_inspection','a4000000-0000-0000-0000-000000000001','{"condition":"CRITICAL"}', now() - interval '2 days'),
  ('a8000000-0000-0000-0000-000000000008','22222222-2222-2222-2222-222222222222','MAINTENANCE_COMPLETED','maintenance','a6000000-0000-0000-0000-000000000006','{"actual_cost":78000}', now() - interval '5 days')
on conflict (id) do nothing;
