-- ============================================================================
-- ROADGOV — Migration 0009: Storage buckets & policies
-- Buckets are PRIVATE (public = false). Sensitive files are served only via
-- short-lived signed URLs generated server-side (spec §30). RLS on storage.objects
-- restricts access to active, authenticated users.
-- ============================================================================

insert into storage.buckets (id, name, public)
values
  ('project-documents',   'project-documents',   false),
  ('construction-photos', 'construction-photos', false),
  ('inspection-photos',   'inspection-photos',   false),
  ('maintenance-documents','maintenance-documents', false)
on conflict (id) do nothing;

-- Read: any active authenticated user of the platform may read objects in these
-- buckets (fine-grained per-entity checks are enforced by the documents table
-- RLS + signed URLs generated server-side).
drop policy if exists roadgov_storage_read on storage.objects;
create policy roadgov_storage_read on storage.objects for select to authenticated
  using (
    bucket_id in ('project-documents','construction-photos','inspection-photos','maintenance-documents')
    and public.is_active_user()
  );

-- Write: active users may upload into their own folder (path prefixed by uid).
drop policy if exists roadgov_storage_insert on storage.objects;
create policy roadgov_storage_insert on storage.objects for insert to authenticated
  with check (
    bucket_id in ('project-documents','construction-photos','inspection-photos','maintenance-documents')
    and public.is_active_user()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Update/Delete: only the owner of the object may modify/remove it.
drop policy if exists roadgov_storage_update on storage.objects;
create policy roadgov_storage_update on storage.objects for update to authenticated
  using (owner = auth.uid()) with check (owner = auth.uid());

drop policy if exists roadgov_storage_delete on storage.objects;
create policy roadgov_storage_delete on storage.objects for delete to authenticated
  using (owner = auth.uid() or public.is_officer());
