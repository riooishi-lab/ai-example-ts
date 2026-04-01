# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js monorepo template for deploying to AWS ECS on Fargate. Includes authentication (Firebase), user management, and invitation management with role-based access control. Uses pnpm workspaces.

## Common Commands

```bash
# Development
pnpm dev                              # Generate Prisma client + start Next.js dev server
pnpm build                            # Deploy DB migrations + generate client + build web
pnpm studio                           # Launch Prisma Studio

# Linting & Formatting (Biome only — never ESLint/Prettier)
pnpm --filter web lint                # Check formatting & linting
pnpm --filter web lint:fix            # Auto-fix
pnpm --filter web format              # Format only

# Database
pnpm --filter database db:generate    # Generate Prisma client + exports
pnpm --filter database db:deploy      # Apply migrations (production)
pnpm --filter database db:migrate     # Reset DB + run migrations (dev)
pnpm --filter database db:seed        # Seed database

# Docker
docker build -t app -f docker/web/Dockerfile .              # Build web image
docker build -t migration -f docker/db-migration/Dockerfile . # Build migration image
```

## Architecture

### Monorepo Structure

- **apps/web** — Next.js 16 app (App Router, standalone output for Docker). API routes use Hono (`src/app/api/[[...route]]`).
- **packages/database** — Prisma schema, generated client, and database types. Schema at `packages/database/prisma/schema.prisma`.
- **infrastructure/** — Terraform (VPC, ECS Fargate, RDS PostgreSQL, ALB, Route53, ACM). Environment configs in `environments/*.tfvars`.
- **docker/** — Multi-stage Dockerfiles for web (ARM64) and DB migration.
- **scripts/** — Deployment scripts and k6 load testing.

### Web App (apps/web/src)

- `app/` — Next.js App Router. `(authenticated)/` route group for protected pages; `auth/` for login/signup/password-reset; `api/` for Hono API routes.
- `env/` — Typed environment variables (`client.ts`, `server.ts`). All env access must go through these — direct `process.env` is banned.
- `libs/` — Integration wrappers (Firebase auth, Prisma, googleapis, email via Resend, Hono factory).
- `components/common/` — Shared UI components (Radix UI based).
- `hooks/`, `contexts/`, `constants/`, `utils/` — Standard app-level modules.

### Database Models

Two models: **User** (with roles: SUPER_ADMIN, ADMIN, MANAGER, SALES_REP, VIEWER) and **Invitation** (with statuses: PENDING, ACCEPTED, EXPIRED, REVOKED). Both use soft deletes (`deletedAt`) and have corresponding database views (`VisibleUser`, `VisibleInvitation`).

### Key Patterns

- **Multi-tenant security**: All DB queries must include `tenantId` filter and `deletedAt: null`.
- **Soft deletes**: Never hard-delete records. Always filter `deletedAt: null` in queries.
- **Typed env**: Import from `@/env/server` or `@/env/client`, never use `process.env` directly.
- **Workspace imports**: Use `@monorepo/database`, `@monorepo/database/client` — never relative paths to packages.
- **No path aliases**: Internal imports within the web app use relative paths (no `@/` alias).
