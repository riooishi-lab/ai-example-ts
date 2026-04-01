# Multi-Tenant Security Rules

**CRITICAL: All database queries MUST be scoped by tenantId to prevent data leakage.**

## Required Patterns

### 1. Always Filter by tenantId

```typescript
// ✅ CORRECT
const events = await prisma.userCalendarEvent.findMany({
  where: {
    tenantId: session.tenantId,
    userId: session.userId,
    deletedAt: null
  }
});

// ❌ WRONG - Missing tenantId filter
const events = await prisma.userCalendarEvent.findMany({
  where: {
    userId: session.userId
  }
});
```

### 2. Soft Delete Filter

Always filter out soft-deleted records:

```typescript
where: {
  tenantId: session.tenantId,
  deletedAt: null  // Required for soft deletes
}
```

### 3. Session Validation

Always validate session before database operations:

```typescript
const session = await getSession();
if (!session) {
  throw new Error('Unauthorized');
}

// Use session.tenantId in all queries
```

### 4. API Route Protection

All API routes must validate tenant access:

```typescript
app.get('/api/tenants/:tenantId/events', async (c) => {
  const session = await getSession(c);
  const tenant = await getTenant(c);

  // Verify session tenant matches route tenant
  if (session.tenantId !== tenant.tenantId) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  // Proceed with tenantId-scoped query
});
```

## Never Do This

- ❌ Query without tenantId filter
- ❌ Use userId alone without tenantId
- ❌ Trust client-provided tenantId without session validation
- ❌ Skip soft delete filters (deletedAt: null)
- ❌ Expose raw database IDs without tenant validation
