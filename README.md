# ROADGOV — Government Road Lifecycle Management System

ROADGOV is a serious government operations platform for managing the **complete lifecycle of
government road projects**, from proposal to long-term maintenance:

> Proposal → Approval → Budget → Tender → Bid → Contractor Selection → Contract → Work Order →
> Construction → Inspection → Completion → Handover → Operational Road → Road Inspection → Defect →
> Maintenance → History

It is built as a **modular monolith** with Next.js + Supabase and enforces authorization at three
independent layers: the UI, the server (Server Actions/Route Handlers), and PostgreSQL Row Level
Security (RLS).

> ⚠️ **Prototype / hackathon disclaimer.** All data is fictional. This is a demonstration system and
> must not be used to store real citizen or official government records.

---

## Table of contents
1. [Architecture](#architecture)
2. [Tech stack](#tech-stack)
3. [Folder structure](#folder-structure)
4. [Environment variables](#environment-variables)
5. [Supabase setup](#supabase-setup)
6. [Migrations](#migrations)
7. [Seeding](#seeding)
8. [Authentication & roles](#authentication--roles)
9. [Row Level Security](#row-level-security)
10. [Local development](#local-development)
11. [Testing](#testing)
12. [Deployment](#deployment)
13. [Demo flow](#demo-flow)
14. [Known limitations](#known-limitations)

---

## Architecture

- **Modular monolith.** All domain logic lives in one Next.js app under `src/features/*`. No
  microservices, no Kafka, no Kubernetes.
- **Server-first.** Data fetching happens in Server Components; mutations happen in Server Actions
  and a small number of Route Handlers (CSV export). The browser only ever holds the public Supabase
  publishable key.
- **Three enforcement layers**
  1. **UI** — `can(role, permission)` hides actions the user may not perform.
  2. **Server** — every mutation calls `authorize(permission)` (`src/lib/action-helpers.ts`) which
     throws `AuthorizationError` (403) before touching the database, and every lifecycle change goes
     through the state machine in `src/lib/domain/lifecycle.ts`.
  3. **Database** — RLS policies (`supabase/migrations/0008_rls_policies.sql`) independently restrict
     every table by role, status and assignment, even if the UI/server were bypassed.
- **AI-ready, AI-free.** The data model (photo URLs, inspection → defect → confirmed record flow) is
  extensible for future AI assistance, but no AI is implemented. Any future AI suggestion must require
  human confirmation.

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| UI | Tailwind CSS, shadcn/ui-style components, Lucide icons |
| Backend | Next.js Server Actions + Route Handlers |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (no custom passwords) |
| Authorization | App-level RBAC + PostgreSQL RLS |
| Storage | Supabase Storage (private buckets + signed URLs) |
| i18n | Dictionary-based (English / Hindi / Gujarati) |
| Tests | Vitest |
| Deploy | Vercel |

## Folder structure

```
src/
  app/                      # App Router routes
    login/  privacy/  not-authorized/
    admin/ (dashboard, users, departments, audit-logs)
    officer/ (dashboard, projects, approvals, budgets, tenders, contractors,
              contracts, construction, roads, maintenance, reports)
    inspector/ (dashboard, projects, roads, inspections, defects)
  components/               # UI primitives, shell, forms, i18n provider
  features/                 # Domain modules (queries + server actions + forms)
    auth/ projects/ procurement/ construction/ roads/ inspector/
    assignments/ admin/ documents/ reports/ dashboard/
  lib/                      # supabase clients, env, rbac, lifecycle, validation, audit, csv
  locales/                  # en / hi / gu dictionaries + enum labels
  types/                    # DB row model types
supabase/
  migrations/               # Version-controlled SQL (0001..0009)
  seed.sql                  # Fictional demo data
tests/                      # Vitest unit tests
docs/                       # RLS integration test script
```

## Environment variables

Copy `.env.example` → `.env.local` and fill in real values:

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Project URL, e.g. `https://<ref>.supabase.co` **(no `/rest/v1/` suffix)** |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public | Publishable / anon key (protected by RLS) |
| `NEXT_PUBLIC_SITE_URL` | public | Base URL for auth redirects (optional locally) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server-only** | Only for admin invite/seed scripts; never exposed to the browser |

> The app is designed to **build and run its non-database surface even before credentials exist**
> (`src/lib/env.ts`). If Supabase is not configured, the login page shows a clear notice instead of
> crashing. Supabase is **never** replaced with localStorage or a fake database.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy the **Project URL** and the **publishable/anon key** into
   `.env.local` (`NEXT_PUBLIC_SUPABASE_URL` must be the bare `https://<ref>.supabase.co`).
3. Apply the migrations and seed (below).
4. (Optional) copy the **service_role** key into `SUPABASE_SERVICE_ROLE_KEY` only if you want to use
   the Admin → Invite User flow.

## Migrations

Migrations are version-controlled under `supabase/migrations/` in dependency-safe order:

| File | Contents |
| --- | --- |
| `0001_extensions_and_enums.sql` | pgcrypto/pg_trgm + all enum types |
| `0002_core_tables.sql` | `departments`, `users`, `set_updated_at()` |
| `0003_project_tables.sql` | projects, assignments, approvals, budgets, tenders, contractors, bids, contracts |
| `0004_construction_tables.sql` | construction updates & inspections |
| `0005_road_tables.sql` | roads, assignments, road inspections, defects, maintenance, complaints |
| `0006_audit_documents.sql` | append-only `audit_logs`, `documents` |
| `0007_functions.sql` | RLS helper functions + new-auth-user trigger |
| `0008_rls_policies.sql` | enable RLS + per-table policies |
| `0009_storage.sql` | private storage buckets + policies |

**Using the Supabase CLI** (recommended):

```bash
supabase link --project-ref <your-ref>
supabase db push          # applies everything in supabase/migrations
```

**Or** paste each migration file into the Supabase **SQL Editor** in numeric order.

## Seeding

`supabase/seed.sql` creates fictional Gujarat-style demo data: 3 users, 3 departments, 10 projects
spanning the lifecycle, 5 contractors, 5 tenders, 10 bids, contracts, construction updates, 10 roads,
15 road inspections, 20 defects, 10 maintenance records, complaints and audit history.

```bash
supabase db execute --file supabase/seed.sql
# or paste supabase/seed.sql into the SQL Editor (run AFTER migrations)
```

The seed inserts the three demo auth users directly with a hashed password (`Password123!`). If your
Supabase instance restricts direct `auth.users` inserts, instead create the users via
**Authentication → Users → Add user** (emails below) and then run the seed — the `on conflict`
clauses make it safe to re-run.

## Authentication & roles

Authentication is handled entirely by **Supabase Auth**; this app stores no passwords. On sign-in the
flow is: *Supabase Auth → load `public.users` profile → verify `ACTIVE` → determine role → redirect to
role home*. Inactive accounts are blocked and signed out. Middleware refreshes the session and blocks
cross-role navigation early; layouts + RLS provide the authoritative checks.

| Role | Home | Summary |
| --- | --- | --- |
| `ADMIN` | `/admin/dashboard` | Users, departments, audit visibility, governance |
| `ROAD_OFFICER` | `/officer/dashboard` | The primary operational role — full project/road lifecycle |
| `FIELD_INSPECTOR` | `/inspector/dashboard` | Assigned projects/roads only; submits inspections & defects |

Demo accounts (password `Password123!`):

```
admin@roadgov.demo        ADMIN
officer@roadgov.demo      ROAD_OFFICER
inspector@roadgov.demo    FIELD_INSPECTOR
```

## Row Level Security

RLS is **mandatory** and enabled on every table. Policies key off SECURITY DEFINER helper functions
(`current_user_role()`, `is_active_user()`, `is_officer()`, `is_assigned_to_project()`,
`is_assigned_to_road()`, …). Highlights:

- Only **active** authenticated users pass any policy.
- Officers/admins can read operational data; **inspectors see only assigned** projects/roads and the
  records hanging off them.
- Only officers create/modify projects, budgets, tenders, contracts, roads and maintenance.
- Inspectors may insert construction/road inspections **only for entities they are assigned to**, and
  only with their own `inspector_id`.
- `audit_logs` has **no UPDATE or DELETE policy** — history is append-only and immutable.
- Storage buckets are **private**; files are served through short-lived signed URLs.

There is deliberately **no** "authenticated users can do everything" policy.

## Local development

```bash
npm install
cp .env.example .env.local      # then fill in Supabase values
npm run dev                     # http://localhost:3000
```

Useful scripts:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
npm run test        # vitest
npm run build       # production build
```

## Testing

- **Unit tests** (`tests/`, Vitest) cover the P0 domain logic that must never regress: the RBAC
  matrix (including inspector-denied-officer-actions), the lifecycle state machine (valid + invalid
  transitions), input validation rules, CSV escaping and multilingual label parity.
- **RLS integration tests**: `docs/rls-tests.sql` contains SQL you run against a live database (as
  different roles) to prove the database independently enforces access — e.g. an inspector cannot read
  an unassigned project, cannot approve a project, and cannot forge another user's inspection.

```bash
npm run test
```

## Deployment

1. Push to GitHub.
2. Import the repo in **Vercel**.
3. Add the environment variables (public ones; add the service-role key only if using invites) in the
   Vercel project settings.
4. Ensure migrations + seed have been applied to your Supabase project.
5. Deploy. Set `NEXT_PUBLIC_SITE_URL` to your production URL and add it to Supabase Auth redirect URLs.

## Demo flow

Sign in as `officer@roadgov.demo` and walk the full lifecycle on a fresh project:

1. **Create** a project (`/officer/projects/new`) → it starts in `DRAFT`.
2. **Submit** → **Begin review** → **Approve** (Approval tab).
3. **Budget** tab: create a budget, then **Approve** it → project becomes `BUDGET_APPROVED`.
4. **Tender** tab: create a tender → project becomes `TENDERING`; publish, record bids.
5. **Contractor** tab: **Select** the winning bid → a contract is created (`CONTRACTOR_SELECTED`).
6. **Issue work order** → **Start construction**.
7. **Construction** tab: record progress updates.
8. Assign `inspector@roadgov.demo`; sign in as the inspector to submit a construction inspection.
9. Back as officer: **Mark completed** → **Handover** → an operational **road** is auto-registered.
10. **Roads**: raise a defect, create maintenance, then approve → start → complete it (updates the
    road's last-maintenance date).
11. **Reports**: export any report as CSV. **Admin**: review users, departments and the audit trail.

The seed already provides projects at every lifecycle stage so each screen has realistic content
immediately.

## Known limitations

- **AI, voice, citizen portal, contractor login, GIS/segments, payments, Aadhaar/biometrics, SSO** are
  intentionally out of scope for this MVP (the architecture stays AI-ready).
- **User invitations** require `SUPABASE_SERVICE_ROLE_KEY`; without it, admins manage the role/status
  of already-provisioned profiles only.
- **PDF report export** is not implemented; CSV export is provided.
- Photo upload records URLs/metadata and uploads to private Storage buckets; there is no image
  processing pipeline.
- RLS integration tests are provided as SQL to run against a live DB rather than automated CI (a live
  Postgres with the `auth` schema is required).
```
