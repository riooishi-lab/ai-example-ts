# 0003. Add equipment management, inspection records, and failure reports

## Status

Proposed

## Date

2026-04-02

## Context

The application was originally focused on user and invitation management. To support the core business domain of equipment maintenance, the system needs to track equipment, their parts, inspection items, inspection records, and failure reports. The existing teams feature was unused and added unnecessary complexity to the admin interface and database schema.

Key forces driving this decision:

- **Business need**: Field workers and maintenance staff need a way to record inspections and report equipment failures digitally
- **Data visibility**: Managers need dashboards with KPIs (inspection completion rates, failure trends, abnormal value counts) to make informed maintenance decisions
- **Data export**: Compliance and reporting requirements demand CSV export of inspection and failure data
- **Schema simplification**: The teams model (Team, TeamMember) was not being used and added overhead to the codebase and database

## Decision

### New features added

1. **Equipment master management** (admin): CRUD for Equipment, Part, and InspectionItem models with admin-only access via `checkIsAdminOrManager()`
2. **Inspection records**: Field workers can submit inspection records with numeric values that are validated against upper/lower thresholds defined on InspectionItem. Abnormal values are flagged automatically.
3. **Failure reports**: Any authenticated user can submit failure reports with photos (file names stored; actual file storage is a TODO)
4. **Dashboard**: Server-rendered dashboard with stats grid, uninspected equipment alerts, monthly failure charts, and daily inspection charts using Recharts
5. **CSV export API**: Hono-based export routes (`/api/export/inspections`, `/api/export/failure-reports`) restricted to admin/manager roles
6. **Inspection trend visualization**: Per-equipment trend page showing historical numeric inspection values over time

### Removed features

- **Teams module**: All team-related actions, components, types, and database models (Team, TeamMember) were removed. The database migration was updated to exclude these tables.

### Database changes

- Added 7 new models: Equipment, Part, InspectionItem, InspectionRecord, InspectionValue, FailureReport, FailureReportPhoto
- Added corresponding Visible views for soft-delete filtering
- Updated the single migration file (0001_init) since the project has not been deployed to production yet

### Security improvements during review

- `getCurrentUser()` now uses `prisma.visibleUser` to prevent soft-deleted users from authenticating
- `deleteUser`/`updateUser` actions now use `prisma.visibleUser` for read queries
- DB reads moved outside try/catch blocks in invitation actions to comply with Next.js pitfall rules

## Consequences

### Positive

- Covers the core equipment maintenance workflow end-to-end (equipment → inspection → failure report)
- Dashboard provides at-a-glance visibility into maintenance KPIs
- Removing unused teams feature reduces schema complexity and UI clutter
- Security fixes prevent soft-deleted users from accessing the system
- Code metrics improved: no files below MI 30, no functions above CC 30

### Negative

- Photo upload stores only file names, not actual files — file storage (S3/Cloud Storage) integration is still needed
- Base Prisma models are used with manual `deletedAt: null` filters where `include` is needed (Visible views don't support relations)
- Export buttons are visible to all authenticated users but the API requires admin/manager role — UX mismatch
- Dashboard makes 11+ parallel database queries per page load, which may need optimization at scale

## Compliance

- **Soft deletes**: All new models include `deletedAt` field and corresponding `Visible` views. The `database.md` rule requires using Visible views for reads and base models for writes.
- **Multi-tenant security**: Currently single-tenant. If multi-tenancy is added, all queries must be scoped by `tenantId`.
- **Code style**: All files pass Biome linting. Cognitive complexity and maintainability index thresholds are met.
- **Next.js pitfalls**: `revalidatePath`/`redirect` are placed outside try/catch blocks in all server actions.

## Notes

- Author: Claude Opus 4.6
- Version: 0.1
- Changelog:
  - 0.1: Initial proposed version
