# ROADGOV — MASTER CLAUDE CODE IMPLEMENTATION PROMPT

You are the lead full-stack engineer responsible for building the complete ROADGOV hackathon MVP.

ROADGOV stands for Government Road Lifecycle Management System.

You must implement the application end-to-end in this repository.

IMPORTANT:
- Do not merely explain how to build it.
- Do not provide a plan and stop.
- Actually create and modify the files in the repository.
- Work autonomously through all implementation phases.
- Inspect the repository before making architectural decisions.
- Run tests, type checks, linting and builds during implementation.
- Fix errors before moving forward.
- Do not wait for me after every phase.
- Continue until the application is implemented as completely as reasonably possible.
- If a live Supabase credential is missing, continue implementing everything that does not require it and leave a clearly documented integration step.
- Never replace Supabase with a fake database or localStorage implementation.

==================================================
1. PRODUCT OBJECTIVE
==================================================

Build ROADGOV as a serious government operational system for managing the complete lifecycle of government road projects.

The core value proposition is:

Proposal
→ Approval
→ Budget
→ Tender
→ Bid
→ Contractor Selection
→ Contract
→ Work Order
→ Construction
→ Inspection
→ Completion
→ Handover
→ Operational Road
→ Road Inspection
→ Defect
→ Maintenance
→ History

The application must help government officers understand:

- What projects exist
- Current project status
- Project cost
- Budget status
- Tender status
- Contractor status
- Construction progress
- Inspection history
- Road condition
- Defects
- Maintenance
- Expenditure
- Accountability
- Audit history

This is NOT a generic CRUD dashboard.

The application should feel like a serious government operations platform.

==================================================
2. TECHNOLOGY STACK
==================================================

Use:

Frontend:
- Next.js
- TypeScript
- App Router
- Server Components wherever appropriate

UI:
- Tailwind CSS
- shadcn/ui
- Lucide icons

Backend:
- Next.js Server Actions
- Route Handlers where appropriate

Database:
- Supabase PostgreSQL

Authentication:
- Supabase Auth

Authorization:
- Application-level RBAC
- PostgreSQL Row Level Security (RLS)

Storage:
- Supabase Storage

Deployment:
- Vercel

Version control:
- GitHub

Architecture:
- Modular monolith

DO NOT introduce:
- Microservices
- Kafka
- Kubernetes
- unnecessary backend services
- unnecessary libraries

Keep the architecture simple, secure and maintainable.

==================================================
3. SCOPE FREEZE
==================================================

MUST IMPLEMENT:

- Authentication
- Role-based access control
- PostgreSQL RLS
- Admin
- Road Officer
- Field Inspector
- Projects
- Project approvals
- Budgets
- Tenders
- Contractors
- Bids
- Contracts
- Work orders
- Construction updates
- Construction inspections
- Road management
- Road inspections
- Defects
- Maintenance
- Documents
- Audit logs
- Reports
- CSV exports
- English/Hindi/Gujarati
- Accessibility
- Privacy page
- Seed/demo data
- Critical tests

DO NOT IMPLEMENT NOW:

- AI functionality
- Voice interface
- Citizen portal
- Contractor login portal
- Road segment/GIS system
- Payment gateway
- Aadhaar
- Biometrics
- SSO
- Advanced ML
- Procurement integrations
- Microservices
- Complex government integrations

The architecture should remain AI-ready, but AI must not be implemented in this MVP.

==================================================
4. USER ROLES
==================================================

There are exactly three application roles.

ADMIN

Purpose:
- System administration
- Governance
- User management
- Department management
- View operational information

ADMIN is not the primary operational decision-maker.

ROAD_OFFICER

Primary operational role.

Can:
- Create projects
- Review projects
- Approve projects
- Approve budgets
- Manage tenders
- Review bids
- Select contractors
- Create contracts
- Issue work orders
- Monitor construction
- Review inspections
- Complete projects
- Handover projects
- Manage roads
- Manage maintenance
- Generate reports
- View history

FIELD_INSPECTOR

Can:
- View assigned projects
- View assigned roads
- Submit construction inspections
- Submit road inspections
- Upload inspection photos
- Create defects related to inspections
- View own inspection history

FIELD_INSPECTOR cannot:
- Approve projects
- Approve budgets
- Manage tenders
- Select contractors
- Create contracts
- Issue work orders
- Approve maintenance
- Manage users

These restrictions must be enforced at:

1. UI level
2. Server level
3. PostgreSQL RLS level

Never rely only on hidden buttons.

==================================================
5. DATABASE
==================================================

Create version-controlled SQL migrations under:

supabase/migrations/

Do NOT require manually creating every table in the Supabase dashboard.

Create migrations in dependency-safe order.

At minimum implement:

departments

users

road_projects

project_approvals

budgets

tenders

contractors

tender_bids

contracts

construction_updates

construction_inspections

roads

road_inspections

defects

maintenance

complaints

audit_logs

==================================================
6. USERS
==================================================

users:

- id UUID
- name
- email
- phone nullable
- role enum
- department_id nullable
- status enum
- created_at
- updated_at

Roles:

ADMIN
ROAD_OFFICER
FIELD_INSPECTOR

Status:

ACTIVE
INACTIVE

The application user should be associated with Supabase auth.users.

Do NOT implement a custom password system.

Supabase Auth handles authentication.

The public users table stores application profile/role information.

==================================================
7. DEPARTMENTS
==================================================

departments:

- id
- name
- code
- contact_email nullable
- created_at
- updated_at

==================================================
8. ROAD PROJECTS
==================================================

road_projects:

- id
- project_code unique
- project_name
- road_name
- location
- ward
- area nullable
- road_type
- length_km
- project_reason
- estimated_cost
- approved_cost nullable
- final_cost nullable
- estimated_duration_months
- planned_start_date nullable
- planned_end_date nullable
- actual_start_date nullable
- actual_end_date nullable
- status
- created_by
- created_at
- updated_at

Statuses:

DRAFT
SUBMITTED
UNDER_REVIEW
APPROVED
BUDGET_APPROVED
TENDERING
CONTRACTOR_SELECTED
WORK_ORDER_ISSUED
UNDER_CONSTRUCTION
COMPLETED
HANDED_OVER
CANCELLED

==================================================
9. PROJECT APPROVALS
==================================================

project_approvals:

- id
- project_id
- approved_by
- approval_type
- status
- remarks nullable
- approved_at
- created_at

Approval types:

PROJECT_APPROVAL
BUDGET_APPROVAL
COMPLETION_APPROVAL
HANDOVER_APPROVAL

==================================================
10. BUDGETS
==================================================

budgets:

- id
- project_id
- estimated_amount
- approved_amount
- funding_source
- approval_date nullable
- approved_by nullable
- status
- remarks nullable
- created_at

==================================================
11. TENDERS
==================================================

tenders:

- id
- project_id
- tender_number unique
- estimated_value
- published_date nullable
- opening_date nullable
- closing_date nullable
- status
- created_by
- created_at
- updated_at

Statuses:

DRAFT
OPEN
CLOSED
EVALUATION
AWARDED
CANCELLED

==================================================
12. CONTRACTORS
==================================================

contractors:

- id
- name
- registration_number unique
- contact_person
- phone nullable
- email nullable
- address nullable
- experience_years nullable
- status
- created_at
- updated_at

==================================================
13. TENDER BIDS
==================================================

tender_bids:

- id
- tender_id
- contractor_id
- bid_amount
- submitted_at
- status
- remarks nullable
- created_at

==================================================
14. CONTRACTS
==================================================

contracts:

- id
- project_id
- tender_id
- contractor_id
- contract_number unique
- contract_value
- work_order_number nullable
- start_date
- expected_end_date
- actual_end_date nullable
- status
- created_at
- updated_at

==================================================
15. CONSTRUCTION UPDATES
==================================================

construction_updates:

- id
- project_id
- reported_by
- update_date
- physical_progress
- financial_progress
- amount_claimed nullable
- current_stage
- status
- remarks nullable
- photo_urls JSONB nullable
- created_at

Progress must be between 0 and 100.

==================================================
16. CONSTRUCTION INSPECTIONS
==================================================

construction_inspections:

- id
- project_id
- inspector_id
- inspection_date
- progress_percentage
- quality_status
- issues_found nullable
- remarks nullable
- photo_urls JSONB nullable
- status
- created_at

==================================================
17. ROADS
==================================================

roads:

- id
- project_id
- road_code unique
- road_name
- location
- ward
- area nullable
- road_type
- length_km
- current_condition
- priority
- status
- handover_date nullable
- last_inspection_date nullable
- last_maintenance_date nullable
- created_at
- updated_at

Conditions:

GOOD
MODERATE
POOR
CRITICAL

Priority:

LOW
MEDIUM
HIGH
CRITICAL

==================================================
18. ROAD INSPECTIONS
==================================================

road_inspections:

- id
- road_id
- inspector_id
- inspection_date
- condition
- severity
- remarks nullable
- photo_urls JSONB nullable
- status
- created_at

==================================================
19. DEFECTS
==================================================

defects:

- id
- road_id
- inspection_id
- type
- severity
- quantity
- description nullable
- status
- created_at
- updated_at

Types:

POTHOLE
CRACK
WATERLOGGING
EDGE_DAMAGE
SURFACE_DAMAGE
DRAINAGE_ISSUE

==================================================
20. MAINTENANCE
==================================================

maintenance:

- id
- road_id
- inspection_id nullable
- work_type
- priority
- estimated_cost
- actual_cost nullable
- status
- assigned_to nullable
- start_date nullable
- completion_date nullable
- remarks nullable
- created_at
- updated_at

Statuses:

PENDING
APPROVED
IN_PROGRESS
COMPLETED
CANCELLED

Workflow:

PENDING
→ APPROVED
→ IN_PROGRESS
→ COMPLETED

Officer approves maintenance.

Inspector may verify maintenance where appropriate.

When maintenance is completed:

roads.last_maintenance_date

must be updated.

Do NOT automatically invent or change road condition unless explicitly recorded.

==================================================
21. AUDIT LOG
==================================================

audit_logs:

- id
- user_id
- action
- entity_type
- entity_id
- old_value JSONB nullable
- new_value JSONB nullable
- timestamp
- ip_address nullable

Audit events:

LOGIN
LOGOUT
CREATE
UPDATE
DELETE
APPROVE
REJECT
ASSIGN
CONTRACTOR_SELECTED
WORK_ORDER_ISSUED
INSPECTION_SUBMITTED
MAINTENANCE_APPROVED
MAINTENANCE_COMPLETED
PROJECT_COMPLETED
ROAD_HANDED_OVER

Audit logs must be append-oriented.

Do not silently overwrite historical actions.

==================================================
22. BUSINESS RULES
==================================================

Enforce lifecycle rules server-side.

Project:

DRAFT
→ SUBMITTED
→ UNDER_REVIEW
→ APPROVED

Project must be approved before budget approval.

Budget must be approved before tendering.

Contractor selection only from valid tender state.

Valid contract/work order required before construction.

Project must be under construction before completion.

Project must be completed before handover.

Operational road required before maintenance.

Inspector must be assigned before inspection.

Invalid state transitions must be rejected.

Do not rely on frontend validation alone.

==================================================
23. AUTHENTICATION
==================================================

Implement Supabase Auth.

Routes:

/login

/admin/*
/officer/*
/inspector/*

Flow:

Supabase Auth
→ load profile
→ verify ACTIVE
→ determine role
→ redirect

Inactive users must be blocked.

Unauthorized users must receive a proper 403/not-authorized experience.

Implement logout.

Implement session handling correctly for Next.js App Router.

Do not expose service-role credentials to browser code.

==================================================
24. SUPABASE CLIENT ARCHITECTURE
==================================================

Create a clean Supabase integration.

For example:

src/lib/supabase/

Use appropriate browser/server clients.

Never use a privileged Supabase key in client-side code.

Create environment variable validation.

Expected public environment variables:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

If a server-only secret is absolutely necessary, isolate it in server-only modules and never expose it to the browser.

==================================================
25. ROW LEVEL SECURITY
==================================================

RLS is mandatory.

Every sensitive table must have appropriate RLS policies.

Authenticated users only.

Policies must respect:

- user role
- user status
- assignments
- ownership
- operational permissions

Important:

RLS must independently protect the database even if someone bypasses the UI.

Create SQL migrations for:

- enabling RLS
- policies
- helper functions where appropriate
- role checks
- assignment checks

Avoid insecure policies such as:

"authenticated users can do everything"

==================================================
26. DASHBOARD
==================================================

Create officer dashboard.

KPI cards:

- Active Projects
- Under Construction
- Completed
- Critical Roads
- Pending Approvals
- Pending Maintenance

All metrics must come from database queries.

Never hardcode dashboard numbers.

Include:

Attention Required

Project Pipeline

Construction Overview

Road Condition Overview

Impact/Outcome Summary

Use aggregate queries efficiently.

Clearly label estimates.

Any ROI/impact estimate must say:

"Estimated based on configured assumptions"

==================================================
27. PROJECT UI
==================================================

Create project list.

Columns:

- Project Code
- Project Name
- Road
- Ward
- Cost
- Status
- Progress
- Actions

Filters:

- Status
- Ward
- Road type
- Date
- Search

Project detail tabs:

Overview
Approval
Budget
Tender
Contractor
Construction
Inspections
Documents
History

Show lifecycle timeline.

==================================================
28. ROAD UI
==================================================

Road list.

Road detail tabs:

Overview
Inspection History
Defects
Maintenance
Construction History
Cost History
Documents

Show:

- Condition
- Priority
- Last inspection
- Last maintenance
- Project
- Road length
- Location

==================================================
29. INSPECTOR UI
==================================================

Create a simple focused interface.

Inspector dashboard:

- Assigned Projects
- Assigned Roads
- Pending Inspections
- Recent Inspections
- Open Defects

Forms:

Construction Inspection

Road Inspection

Defect

Photo upload

Inspectors must only access assigned entities.

==================================================
30. DOCUMENTS
==================================================

Storage categories:

project-documents
construction-photos
inspection-photos
maintenance-documents

Support:

Administrative Approval
Budget Approval
Tender Document
Contract
Work Order
Inspection Report
Completion Certificate

Validate:

- file type
- file size
- ownership/access

Use secure access/signed URLs where appropriate.

Do not make sensitive files publicly accessible by default.

==================================================
31. REPORTS
==================================================

Create reports:

Project Status
Construction Progress
Road Condition
Maintenance
Expenditure Summary

Support CSV export.

PDF export is optional if time permits.

Reports must query real database data.

==================================================
32. MULTILINGUAL
==================================================

Support:

English
Hindi
Gujarati

Use dictionaries/localization architecture.

Do not store translated enum values in the database.

Database enums remain canonical English values.

Example:

UNDER_CONSTRUCTION

can display different translated labels.

==================================================
33. ACCESSIBILITY
==================================================

Follow WCAG 2.1 AA-oriented practices.

Ensure:

- keyboard navigation
- visible focus
- labels
- accessible forms
- semantic HTML
- sufficient contrast
- no color-only meaning
- screen-reader-friendly controls
- accessible dialogs
- accessible tables

==================================================
34. ERROR / LOADING / EMPTY STATES
==================================================

Every major feature must have:

Loading state

Empty state

Error state

Validation state

Success feedback

Do not leave blank screens.

==================================================
35. PERFORMANCE
==================================================

Use:

- server components where appropriate
- server-side queries
- pagination
- filtering
- indexes
- aggregate queries
- efficient joins
- no N+1 queries

Do not load entire tables unnecessarily.

==================================================
36. SECURITY
==================================================

Never:

- expose service role key
- store passwords manually
- trust client-provided roles
- rely only on frontend authorization
- expose unrestricted database access
- use insecure public storage for sensitive data
- silently modify official history

Validate all server inputs.

Use proper authorization before mutations.

==================================================
37. VALIDATION
==================================================

Validate:

- required fields
- numeric values
- costs
- dates
- progress
- file type
- file size
- string lengths

Rules:

length_km >= 0

cost >= 0

progress between 0 and 100

completion date >= start date

expected end date >= start date

==================================================
38. PROJECT STRUCTURE
==================================================

Use a clean structure similar to:

src/
  app/
  components/
  features/
  lib/
  types/
  hooks/
  locales/

supabase/
  migrations/
  seed.sql

tests/

Keep domain logic organized.

Do not create a giant monolithic component.

==================================================
39. SEED DATA
==================================================

Create fictional Indian/Gujarat-style demo data.

Never use real personal information.

Seed:

3 users

3 departments

10 projects

5 contractors

5 tenders

10 bids

5 active construction projects

5 completed projects

10 roads

15 road inspections

20 defects

10 maintenance records

Multiple audit logs

Use realistic but fictional names.

Demo emails:

admin@roadgov.demo
officer@roadgov.demo
inspector@roadgov.demo

Do NOT commit real passwords.

==================================================
40. TESTING
==================================================

Priority 0 tests:

Authentication

RBAC

RLS

Project lifecycle

Construction workflow

Road inspection

Maintenance workflow

Priority 1:

Audit logs

Reports

Multilingual

Document upload

Priority 2:

Advanced accessibility

Performance

PDF

Test both allowed and denied operations.

Especially test:

Inspector attempting officer action.

Officer accessing assigned operational data.

Inactive user attempting login.

Unauthorized direct database access.

Invalid lifecycle transition.

==================================================
41. AI-READY ARCHITECTURE
==================================================

Do not implement AI now.

But keep the data model extensible for future:

Photo
→ AI Analysis
→ Suggested Finding
→ Human Review
→ Confirmed Record

AI must never silently modify official records.

Any future AI suggestion must require human confirmation.

==================================================
42. PRIVACY
==================================================

Do not collect:

Aadhaar
Biometrics
Sensitive personal information
Personal financial information

Create a basic Privacy page.

Include a prototype/hackathon disclaimer.

==================================================
43. UI DESIGN
==================================================

Design should feel like a serious government operations platform.

Use:

- restrained colors
- clear hierarchy
- professional typography
- compact but readable tables
- status badges
- cards where useful
- clear navigation
- minimal decorative elements
- responsive layout

Do NOT make it look like:

- a gaming dashboard
- a crypto dashboard
- a social media application
- an AI chatbot

Prioritize operational clarity.

==================================================
44. REQUIRED APPLICATION AREAS
==================================================

Build:

/login

/admin/dashboard
/admin/users
/admin/departments
/admin/audit-logs

/officer/dashboard
/officer/projects
/officer/projects/[id]
/officer/approvals
/officer/budgets
/officer/tenders
/officer/contractors
/officer/contracts
/officer/construction
/officer/roads
/officer/roads/[id]
/officer/maintenance
/officer/reports

/inspector/dashboard
/inspector/projects
/inspector/roads
/inspector/inspections
/inspector/defects

Add documents/history wherever appropriate.

==================================================
45. IMPLEMENTATION METHOD
==================================================

Do NOT attempt to create everything blindly in one untested pass.

Internally work in phases.

PHASE 0
Repository inspection

Inspect:

- existing files
- package.json
- existing source
- configuration
- git state

Do not destroy useful existing work.

PHASE 1
Foundation

Implement:

- Next.js setup
- TypeScript
- Tailwind
- shadcn
- Lucide
- app shell
- navigation
- layout
- theme
- error/loading states
- environment configuration

PHASE 2
Database foundation

Create:

- enums
- tables
- foreign keys
- constraints
- indexes
- migrations
- seed structure

PHASE 3
Authentication

Implement:

- Supabase Auth
- login
- logout
- session handling
- protected routes
- profile lookup
- inactive user blocking
- role redirects

PHASE 4
RBAC + RLS

Implement:

- role helpers
- authorization helpers
- PostgreSQL RLS
- assignment policies
- negative tests

PHASE 5
Officer core

Implement:

- dashboard
- projects
- approvals
- budgets
- tenders
- bids
- contractors
- contracts
- work orders

PHASE 6
Construction

Implement:

- construction updates
- construction inspections
- progress
- photos
- completion
- handover

PHASE 7
Road operations

Implement:

- roads
- road inspections
- defects
- maintenance

PHASE 8
Governance

Implement:

- audit logs
- documents
- reports
- CSV export

PHASE 9
Inspector

Implement:

- assigned work
- inspection forms
- photo uploads
- defects
- history

PHASE 10
Admin

Implement:

- users
- departments
- audit visibility

PHASE 11
Localization/accessibility

Implement:

- English
- Hindi
- Gujarati
- accessibility improvements

PHASE 12
Testing/security/performance

Run:

- typecheck
- lint
- unit tests
- integration tests
- build
- security review
- RLS tests

Fix errors.

PHASE 13
Demo readiness

Verify the complete lifecycle:

Project creation
→ approval
→ budget
→ tender
→ bid
→ contractor
→ contract
→ work order
→ construction
→ inspection
→ completion
→ handover
→ road
→ road inspection
→ defect
→ maintenance
→ completion
→ history

==================================================
46. AFTER EACH PHASE
==================================================

After each phase:

1. Run TypeScript checks.
2. Run lint.
3. Run relevant tests.
4. Check database migration validity.
5. Check authorization.
6. Fix P0/P1 issues.
7. Continue automatically.

Do not stop just because one phase is complete.

==================================================
47. SUPABASE ENVIRONMENT
==================================================

The developer may not have Supabase credentials initially.

If:

NEXT_PUBLIC_SUPABASE_URL

or

NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

is missing:

DO NOT:

- create fake Supabase credentials
- replace Supabase with localStorage
- create a fake database
- remove database functionality

Instead:

- implement the integration
- create migrations
- create RLS
- create seed
- create types
- create UI
- create server logic
- document the exact missing configuration

Once credentials exist, verify the real connection.

==================================================
48. GIT SAFETY
==================================================

Never commit:

.env
.env.local
Supabase secret keys
service-role keys
real passwords
real personal information

Create/update .gitignore as necessary.

==================================================
49. README
==================================================

Create a complete README explaining:

- What ROADGOV is
- Architecture
- Tech stack
- Folder structure
- Environment variables
- Supabase setup
- Migration process
- Seed process
- Authentication
- Roles
- RLS
- Local development
- Testing
- Deployment
- Demo flow
- Known limitations

==================================================
50. FINAL QUALITY BAR
==================================================

The application is NOT complete merely because pages exist.

A feature is complete only when it has:

- UI
- backend logic
- database operation
- authorization
- validation
- loading state
- empty state
- error state
- success feedback
- audit logging where appropriate
- tests for critical behavior

Avoid placeholder buttons.

Avoid fake metrics.

Avoid fake database operations.

Avoid dead navigation.

Avoid console errors.

Avoid TypeScript errors.

Avoid broken routes.

==================================================
51. FINAL VERIFICATION
==================================================

Before declaring completion:

Run:

- npm install if required
- typecheck
- lint
- tests
- production build

Verify:

- login
- logout
- role redirects
- inactive account
- admin permissions
- officer permissions
- inspector restrictions
- RLS
- project lifecycle
- tender workflow
- contract workflow
- construction
- inspection
- road management
- defects
- maintenance
- audit
- reports
- CSV
- storage
- multilingual UI

Fix any critical issues found.

==================================================
52. FINAL RESPONSE
==================================================

When implementation is finished, provide a concise final report containing:

1. What was implemented
2. Database/migrations created
3. Authentication
4. RBAC/RLS
5. Major modules
6. Storage
7. Audit system
8. Reports
9. Tests performed
10. Build status
11. Demo accounts
12. Required environment variables
13. Remaining blockers
14. Recommended next manual steps

Do NOT dump the entire source code into the final response.

==================================================
BEGIN IMPLEMENTATION
==================================================

Start by inspecting the repository.

Then implement ROADGOV phase-by-phase.

Do not stop at planning.

Build the actual application.