-- ============================================================================
-- ROADGOV — Migration 0006: Audit logs & documents
-- Audit logs are append-oriented: no UPDATE/DELETE policies are ever granted
-- (see 0008_rls_policies.sql). Official history is never silently overwritten.
-- ============================================================================

create table if not exists public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users(id) on delete set null,
  action      audit_action not null,
  entity_type text not null,
  entity_id   uuid,
  old_value   jsonb,
  new_value   jsonb,
  ip_address  text,
  "timestamp" timestamptz not null default now()
);
create index if not exists idx_audit_user on public.audit_logs(user_id);
create index if not exists idx_audit_entity on public.audit_logs(entity_type, entity_id);
create index if not exists idx_audit_action on public.audit_logs(action);
create index if not exists idx_audit_time on public.audit_logs("timestamp" desc);

comment on table public.audit_logs is
  'Append-only audit trail. No UPDATE or DELETE RLS policies exist for this table.';

-- Documents metadata (files themselves live in Supabase Storage buckets) -----
create table if not exists public.documents (
  id            uuid primary key default gen_random_uuid(),
  category      document_category not null,
  bucket        text not null,
  storage_path  text not null,
  file_name     text not null,
  mime_type     text,
  size_bytes    bigint,
  project_id    uuid references public.road_projects(id) on delete cascade,
  road_id       uuid references public.roads(id) on delete cascade,
  uploaded_by   uuid not null references public.users(id) on delete restrict,
  created_at    timestamptz not null default now(),
  constraint doc_size_nonneg check (size_bytes is null or size_bytes >= 0),
  constraint doc_has_parent check (project_id is not null or road_id is not null)
);
create index if not exists idx_documents_project on public.documents(project_id);
create index if not exists idx_documents_road on public.documents(road_id);
create index if not exists idx_documents_category on public.documents(category);
