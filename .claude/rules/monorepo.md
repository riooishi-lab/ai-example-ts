# Monorepo Design Rules

**Shared code should be extracted into workspace packages to avoid duplication across apps.**

This project uses a monorepo structure (pnpm workspace) to share common functionality across multiple applications (web, admin, api-server, calendar, native).

## When to Create a Shared Package

Extract code into `packages/` when it meets these criteria:

1. **Used by 2+ apps** - Database access, auth logic, type definitions
2. **Domain logic independent of UI** - Business rules, data transformations
3. **External integrations** - API clients (Google, Slack, Zoom, etc.)
4. **Infrastructure concerns** - Database schema, common utilities

## Current Shared Packages

### packages/database
**Database layer**
- Prisma schema and generated client
- Database types and enums
- Shared by: web, admin, api-server, calendar, functions

```typescript
// ✅ CORRECT - Import from shared package
import { prisma } from '@monorepo/database';
import type { User, Tenant } from '@monorepo/database/client';
import { UserRole, TenantStatus } from '@monorepo/database/enums';

// ❌ WRONG - Duplicating database models
// apps/web/types/User.ts
// apps/admin/types/User.ts
```

### packages/shared
**Common utilities and integrations**
- Constants, types, utility functions
- External API integrations (Google, Slack, Salesforce)
- Shared business logic
- Shared by: all apps

```typescript
// ✅ CORRECT - Import from shared package
import { COOKIE_NAMES } from '@monorepo/shared';
import { validateEmail } from '@monorepo/shared';
import { SlackClient } from '@monorepo/shared/libs/slack';

// ❌ WRONG - Duplicating utilities
// apps/web/utils/validateEmail.ts
// apps/admin/utils/validateEmail.ts
// apps/api-server/utils/validateEmail.ts
```

### packages/functions
**Cloud Functions logic**
- AI summarization functions
- Notification handlers
- Background job logic
- Shared by: web, api-server, calendar

```typescript
// ✅ CORRECT - Import from shared package
import { generateSummary } from '@monorepo/functions/generateSummary';
import { getTenant } from '@monorepo/functions/getTenant';

// ❌ WRONG - Duplicating business logic
// Each app reimplements AI summarization
```

## Package Design Guidelines

```typescript
// ✅ CORRECT - Organize by concern
// packages/database/
export { prisma } from './client';
export type { User, Tenant } from './types';

// packages/shared/
export const COOKIE_NAMES = { /* ... */ };
export function validateEmail(email: string) { /* ... */ }
export class SlackClient { /* ... */ }

// packages/functions/
export async function generateSummary(transcript: string) { /* ... */ }
export async function getTenant(tenantId: string) { /* ... */ }

// ❌ WRONG - Monolithic package
// packages/everything/
// All code mixed together without organization
```

## Benefits of This Approach

1. **Single source of truth**
   - Update once, apply everywhere
   - No synchronization issues between apps

2. **Consistent behavior**
   - Same validation logic across all apps
   - Same formatting, API clients, error handling

3. **Type safety**
   - Shared types ensure consistency
   - TypeScript enforces contracts across apps

4. **Easier testing**
   - Test shared logic once
   - Reduces test duplication

5. **Faster development**
   - Reuse instead of reimplementing
   - New apps can leverage existing packages

## Anti-Patterns to Avoid

### ❌ Duplicating Database Access

```typescript
// WRONG - Each app has its own database models
apps/web/models/User.ts
apps/admin/models/User.ts
apps/api-server/models/User.ts

// CORRECT - Centralized in packages/database
import type { User } from '@monorepo/database/client';
```

### ❌ Duplicating External Integrations

```typescript
// WRONG - Each app has its own integration
apps/web/libs/slack.ts
apps/admin/libs/slack.ts
apps/api-server/libs/slack.ts

// CORRECT - Centralized in packages/shared
import { SlackClient } from '@monorepo/shared';
```

### ❌ Duplicating Business Logic

```typescript
// WRONG - Each app has its own multi-tenant filtering
apps/web/utils/filterByTenant.ts
apps/admin/utils/filterByTenant.ts

// CORRECT - Shared utility
import { filterByTenant } from '@monorepo/shared';
```

### ❌ Duplicating Validation

```typescript
// WRONG - Each app validates differently
// apps/web/utils/validateEmail.ts
export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// apps/admin/utils/validateEmail.ts
export function validateEmail(email: string) {
  return email.includes('@');  // Different logic!
}

// CORRECT - One validation function
import { validateEmail } from '@monorepo/shared';
```

## Decision Guide: App vs Package

Ask yourself:

- **Is this used by 2+ apps?** → Package
- **Is this UI/presentation logic?** → App
- **Is this business logic?** → Probably package
- **Is this an external integration?** → Package
- **Is this app-specific routing/layout?** → App
- **Is this a database model/query?** → Package

```typescript
// APP-SPECIFIC (stay in apps/)
- Page components (dashboard, settings pages)
- App-specific layouts and navigation
- App-specific middleware
- App-specific API route handlers

// SHARED (extract to packages/)
- Database schema and queries (packages/database)
- Validation functions (packages/shared)
- External API clients (packages/shared)
- Business logic functions (packages/functions)
- Common types and constants (packages/shared)
```

## Creating a New Shared Package

When you identify code that should be shared:

1. **Create package structure**
   ```bash
   mkdir -p packages/my-package/src
   cd packages/my-package
   ```

2. **Create package.json**
   ```json
   {
     "name": "@monorepo/my-package",
     "version": "1.0.0",
     "main": "dist/index.js",
     "types": "dist/index.d.ts",
     "scripts": {
       "build": "tsc"
     }
   }
   ```

3. **Add to pnpm-workspace.yaml** (if not using wildcard)
   ```yaml
   packages:
     - 'apps/*'
     - 'packages/*'  # Already includes new package
   ```

4. **Install in apps that need it**
   ```json
   {
     "dependencies": {
       "@monorepo/my-package": "workspace:*"
     }
   }
   ```

## Workspace Dependencies

Always use `workspace:*` protocol for internal dependencies:

```json
// ✅ CORRECT
{
  "dependencies": {
    "@monorepo/database": "workspace:*",
    "@monorepo/shared": "workspace:*",
    "@monorepo/functions": "workspace:*"
  }
}

// ❌ WRONG
{
  "dependencies": {
    "@monorepo/database": "1.0.0",
    "@monorepo/shared": "file:../../packages/shared"
  }
}
```
