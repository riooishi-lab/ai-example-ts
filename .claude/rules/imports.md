# Import Rules

## Workspace Packages

Always import from workspace packages using their aliases:

```typescript
// ✅ CORRECT
import { prisma } from '@monorepo/database';
import type { User } from '@monorepo/database/client';
import { UserRole } from '@monorepo/database/enums';
import { COOKIE_NAMES } from '@monorepo/shared';
import { generateSummary } from '@monorepo/functions/generateSummary';

// ❌ WRONG - Don't use relative paths to packages
import { prisma } from '../../../packages/database';
import { COOKIE_NAMES } from '../../../packages/shared';
```

## Workspace Package Structure

- `@monorepo/database` - Prisma client and utilities
  - `/client` - Prisma client types
  - `/enums` - Generated enums
  - `/types` - Database types

- `@monorepo/shared` - Shared utilities
  - Constants, types, utils, integrations

- `@monorepo/functions` - Cloud functions
  - AI summarization, notifications

## Internal Imports

Use relative paths for internal imports (no path aliases):

```typescript
// ✅ CORRECT
import { Button } from '../../../../../components/common/Button';
import { getUser } from '../../../../../utils/libs/auth';

// Note: No @/ alias is configured in this project
```

## Type-Only Imports

Use `import type` for type-only imports:

```typescript
// ✅ CORRECT
import type { User, Tenant } from '@monorepo/database/client';
import type { ReactElement } from 'react';

// ❌ WRONG - Imports values unnecessarily
import { User, Tenant } from '@monorepo/database/client';
```

## Import Order

Organize imports logically:

```typescript
// 1. External packages
import { Hono } from 'hono';
import { z } from 'zod';

// 2. Workspace packages
import { prisma } from '@monorepo/database';
import type { User } from '@monorepo/database/client';

// 3. Internal modules
import { getSession } from '../../../../../utils/libs/auth';
import { Button } from '../../../../../components/common/Button';

// 4. Types
import type { ComponentProps } from './types';
```

Biome's `organizeImports` will help sort these automatically.
