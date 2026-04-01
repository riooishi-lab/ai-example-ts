# Database Rules

## Prisma Patterns

### Import from Workspace Package

```typescript
// ✅ CORRECT
import { prisma } from '@monorepo/database/client';
import type { User, Invitation } from '@monorepo/database';
import { UserRole, InvitationStatus } from '@monorepo/database';

// ❌ WRONG - Don't use relative paths to Prisma
import { PrismaClient } from '../../../packages/database/generated/client';
```

### After Schema Changes

```bash
pnpm --filter database db:generate  # Generates Prisma client + exports
```

### Transaction Pattern

For atomic operations:

```typescript
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  await tx.invitation.create({ data: { ...invitationData, invitedById: user.id } });
});
```

### Soft Delete Pattern

Never hard delete records:

```typescript
// ✅ CORRECT - Soft delete
await prisma.user.update({
  where: { id: userId },
  data: { deletedAt: new Date() }
});

// ❌ WRONG - Hard delete
await prisma.user.delete({
  where: { id: userId }
});
```

### Visible Views (Soft Delete Filtering)

Each model with `deletedAt` has a corresponding database view prefixed with `Visible` that automatically filters out soft-deleted records (`WHERE deleted_at IS NULL`).

```typescript
// ✅ CORRECT - Use Visible views for read queries
const users = await prisma.visibleUser.findMany();
const invitations = await prisma.visibleInvitation.findMany({
  where: { email: 'user@example.com' }
});

// ✅ CORRECT - Use base model for writes (create, update, soft delete)
await prisma.user.create({ data: userData });
await prisma.user.update({
  where: { id: userId },
  data: { deletedAt: new Date() }
});

// ❌ WRONG - Querying base model without deletedAt filter
const users = await prisma.user.findMany();

// ❌ WRONG - Manually adding deletedAt filter when Visible view exists
const users = await prisma.user.findMany({
  where: { deletedAt: null }
});
```

**When to use which:**
- **Read (findMany, findFirst, findUnique, count)** → Use `Visible` view (e.g., `prisma.visibleUser`)
- **Write (create, update, upsert)** → Use base model (e.g., `prisma.user`)
- **Soft delete** → Use base model with `update` to set `deletedAt`

**Naming convention:**
- Model `User` → View `VisibleUser` → Table `visible_users`
- Model `Invitation` → View `VisibleInvitation` → Table `visible_invitations`

### Adding a New Model with Soft Delete

When adding a new model with `deletedAt`:

1. Define the model in `schema.prisma`
2. Define the corresponding `Visible` view in `schema.prisma`
3. Create a migration that includes both the table creation and the `CREATE VIEW` statement

```prisma
// 1. Model definition
model Example {
  id        Int       @id @default(autoincrement()) @map("id")
  publicId  String    @unique @default(cuid()) @map("public_id")
  name      String    @map("name")
  createdAt DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt DateTime  @updatedAt @map("updated_at") @db.Timestamptz(6)
  deletedAt DateTime? @map("deleted_at") @db.Timestamptz(6)

  @@map("examples")
}

// 2. Corresponding view
view VisibleExample {
  id        Int       @unique
  publicId  String    @unique @map("public_id")
  name      String
  createdAt DateTime  @map("created_at") @db.Timestamptz(6)
  updatedAt DateTime  @map("updated_at") @db.Timestamptz(6)
  deletedAt DateTime? @map("deleted_at") @db.Timestamptz(6)

  @@map("visible_examples")
}
```

## Migration Rules

### Creating Migrations

```bash
pnpm --filter database db:migrate  # Reset DB + run migrations (dev only)
```

### View Handling in Migrations

Prisma does not manage views automatically. When a migration affects a table that has a corresponding `Visible` view, the migration SQL must manually handle the view.

**Adding a column to a table with a Visible view:**

```sql
-- AlterTable
ALTER TABLE "examples" ADD COLUMN "description" TEXT;

-- Recreate visible_examples view to include description
DROP VIEW IF EXISTS "visible_examples";
CREATE VIEW "visible_examples" AS
SELECT * FROM examples WHERE deleted_at IS NULL;
```

**Creating a new table with a Visible view:**

```sql
-- CreateTable
CREATE TABLE "examples" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    CONSTRAINT "examples_pkey" PRIMARY KEY ("id")
);

-- CreateView: visible_examples
CREATE VIEW "visible_examples" AS
SELECT * FROM examples WHERE deleted_at IS NULL;
```

**Adding soft delete to an existing table:**

```sql
-- AlterTable
ALTER TABLE "examples" ADD COLUMN "deleted_at" TIMESTAMPTZ(6);

-- CreateView: visible_examples
DROP VIEW IF EXISTS "visible_examples";
CREATE VIEW "visible_examples" AS
SELECT * FROM examples WHERE deleted_at IS NULL;
```

### Migration Checklist

When modifying the schema:

1. Update `schema.prisma` (model and view definitions)
2. Run `prisma migrate dev --name <migration_name>` to generate the migration
3. Edit the generated SQL to include `DROP VIEW IF EXISTS` + `CREATE VIEW` statements if the migration affects a table with a Visible view
4. Run `pnpm --filter database db:generate` to regenerate the client

## Database Schema Location

- **Schema**: `packages/database/prisma/schema.prisma`
- **Generated Client**: `packages/database/generated/client`
- **Exports**: Auto-generated by `scripts/generate-exports.ts` (run via `pnpm db:generate`)

## Model Relationships

Current models:

```
User ──< Invitation (invitedBy)
```

- **User**: Authentication, profile, role-based access control
- **Invitation**: User invitations with status tracking (PENDING, ACCEPTED, EXPIRED, REVOKED)

Both models use soft deletes (`deletedAt`) and have corresponding `Visible` views.
