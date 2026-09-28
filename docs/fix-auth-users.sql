-- ============================================================================
-- Fix for GoTrue "Database error querying schema" on login.
-- Cause: seed.sql inserted auth.users rows with NULL token columns; GoTrue scans
-- these into non-nullable strings and fails. This sets them to '' (empty string).
-- Run once in the Supabase SQL Editor, then log in again.
-- ============================================================================
update auth.users set
  confirmation_token        = coalesce(confirmation_token, ''),
  recovery_token            = coalesce(recovery_token, ''),
  email_change              = coalesce(email_change, ''),
  email_change_token_new    = coalesce(email_change_token_new, ''),
  email_change_token_current= coalesce(email_change_token_current, ''),
  phone_change              = coalesce(phone_change, ''),
  phone_change_token        = coalesce(phone_change_token, ''),
  reauthentication_token    = coalesce(reauthentication_token, '')
where email in ('admin@roadgov.demo', 'officer@roadgov.demo', 'inspector@roadgov.demo');

-- Verify the accounts are confirmed & present:
select email, email_confirmed_at is not null as confirmed
from auth.users
where email like '%@roadgov.demo';
