---
name: check-monorepo
description: Analyze the current project structure against the monorepo rules and recommend migration steps.
---

Analyze the current project structure against the monorepo rules defined in `.claude/rules/monorepo.md` and recommend migration steps if the project does not conform.

## What This Skill Checks

### 1. Workspace Structure

- Does `pnpm-workspace.yaml` exist with proper `apps/*` and `packages/*` entries?
- Are shared packages (`@monorepo/database`, `@monorepo/shared`, etc.) properly defined?
- Do `package.json` files use `workspace:*` protocol for internal dependencies?

### 2. Import Pattern Violations

- Are there relative path imports to `packages/` from `apps/` (should use `@monorepo/*`)?
- Are workspace package aliases used consistently?
- Are `import type` used for type-only imports from workspace packages?

### 3. Code Placement Violations

Check if code exists in `apps/` that should be in `packages/` according to these rules:

| Code Type | Correct Location |
|---|---|
| Database models/queries | `packages/database` |
| External API integrations (Google, Slack, etc.) | `packages/shared/libs/` |
| Validation functions | `packages/shared/utils/` |
| Shared business logic | `packages/functions` or `packages/shared` |
| Shared type definitions | `packages/shared/types/` |
| Shared constants | `packages/shared/constants/` |

### 4. Database Package Compliance

- Is Prisma schema at `packages/database/prisma/schema.prisma`?
- Is the generated client properly exported?
- Are database types and enums exported from the package?

### 5. Missing Shared Packages

- Are there utilities or integrations in `apps/` that are used by only one app now but are generic enough to belong in `packages/`?
- Are there files in `apps/*/libs/`, `apps/*/utils/`, `apps/*/services/` that should be shared?

## Analysis Steps

1. **Read project structure**: Check root `package.json`, `pnpm-workspace.yaml`, and directory layout
2. **Scan `apps/` directories**: Look for `utils/`, `libs/`, `helpers/`, `services/`, `types/`, `constants/` directories
3. **Scan `packages/` directories**: Understand what shared packages exist and what they export
4. **Check imports**: Search for relative path imports to packages, incorrect workspace imports
5. **Check `package.json` dependencies**: Verify `workspace:*` protocol is used for all internal deps
6. **Cross-reference**: Compare code in `apps/` against the decision guide (see below)

## Decision Guide

For each file/module found in `apps/`, ask:

- **Is this used by 2+ apps?** -> Must move to `packages/`
- **Is this an external integration?** -> Should be in `packages/shared/libs/`
- **Is this a database model/query?** -> Should be in `packages/database`
- **Is this validation logic?** -> Should be in `packages/shared/utils/`
- **Is this business logic (not UI)?** -> Consider `packages/functions` or `packages/shared`
- **Is this UI/presentation logic?** -> OK to stay in `apps/`
- **Is this app-specific routing/layout?** -> OK to stay in `apps/`

## Output Format

### Summary

Provide an overall compliance score and summary:

```
## Monorepo Compliance Report

**Score**: X/10
**Status**: [Compliant | Needs Migration | Not a Monorepo]

### Overview
- Workspace config: [OK | Missing | Incomplete]
- Shared packages: [OK | Missing | Incomplete]
- Import patterns: [OK | X violations found]
- Code placement: [OK | X items should be moved]
```

### Violations (if any)

For each violation:

```
### [CRITICAL|WARNING|INFO] <Category>

**Location**: <file path(s)>
**Issue**: <what's wrong>
**Rule**: <which monorepo rule is violated>
**Recommendation**:
  - <specific migration step 1>
  - <specific migration step 2>
  - ...
```

### Migration Plan (if needed)

If the project needs significant migration, provide a prioritized plan:

```
## Migration Plan

### Phase 1: Foundation (must do first)
1. Create `pnpm-workspace.yaml`
2. Set up `packages/` directory structure
3. ...

### Phase 2: Extract Shared Code
1. Move database layer to `packages/database`
2. Move shared utilities to `packages/shared`
3. ...

### Phase 3: Update Imports
1. Replace relative imports with workspace aliases
2. Update `package.json` dependencies
3. ...

### Phase 4: Verification
1. Run builds for all apps
2. Run tests
3. Verify no relative path imports remain
```

## Severity Levels

- **CRITICAL**: Direct violations that break monorepo conventions (e.g., no workspace config, relative imports to packages)
- **WARNING**: Code that should be shared but isn't (potential duplication risk)
- **INFO**: Suggestions for better organization (nice-to-have improvements)
