---
name: suggest-deduplication
description: Search the codebase for duplicate or similar code that can be extracted into shared packages.
---

Search the codebase for duplicate or similar code that can be extracted into shared packages, and suggest refactoring opportunities.

## Search Strategy

1. **Cross-app duplication**: Look for similar code across different apps (web, admin, api-server, calendar)
   - Same or similar function names
   - Similar utility functions
   - Duplicate validation logic
   - Similar database query patterns
   - Duplicate external API integration code

2. **File-level analysis**:
   - Compare files with similar names across apps (e.g., `validateEmail.ts` in multiple apps)
   - Identify utility functions that appear in multiple places
   - Look for repeated business logic patterns

3. **Common patterns to detect**:
   - **Validation functions**: Email, password, phone number validation
   - **Date/time utilities**: Formatting, parsing, timezone handling
   - **API clients**: Google, Slack, Zoom, Salesforce integrations
   - **Database helpers**: Common query patterns, filtering by tenantId
   - **Auth utilities**: Session management, token validation
   - **Data transformations**: Formatting, normalization, serialization
   - **Type guards**: isUser, isValidEvent, etc.
   - **Constants**: Magic numbers, configuration values, enum-like objects

4. **Similarity detection criteria**:
   - **High similarity (>80%)**: Nearly identical code, should be deduplicated immediately
   - **Medium similarity (50-80%)**: Similar logic with minor variations, consider extracting with parameters
   - **Low similarity (30-50%)**: Shared patterns, consider creating abstract utilities

## Analysis Steps

1. **Scan apps directory**:
   - `apps/web/`
   - `apps/admin/`
   - `apps/api-server/`
   - `apps/calendar/`
   - Look for: `utils/`, `libs/`, `helpers/`, `services/` directories

2. **Compare against existing packages**:
   - `packages/shared/` - Check if similar code already exists
   - `packages/database/` - Check for duplicate database access patterns
   - `packages/functions/` - Check for duplicate business logic

3. **For each duplicate found**:
   - Calculate similarity score
   - Determine appropriate target package (`@monorepo/shared`, `@monorepo/database`, or new package)
   - Suggest refactoring strategy
   - Estimate impact (number of files affected)

## Output Format

For each finding, provide:
- **Location**: Where the duplicate code exists (file paths)
- **Similarity**: Percentage or qualitative assessment (high/medium/low)
- **Type**: What kind of duplication (validation, API client, utility, etc.)
- **Recommendation**:
  - Target package to extract to
  - Suggested function/module name
  - Migration strategy (create new function, update imports)
- **Impact**: Number of files/apps affected
- **Priority**: High (3+ occurrences), Medium (2 occurrences), Low (potential future duplication)

## Example Output

```
HIGH PRIORITY: Email validation duplicated across 3 apps
- apps/web/utils/validateEmail.ts (95% similar)
- apps/admin/utils/validate.ts:15-20 (90% similar)
- apps/api-server/utils/validators/email.ts (95% similar)

Recommendation:
→ Extract to: packages/shared/src/utils/validation/validateEmail.ts
→ Export as: export function validateEmail(email: string): boolean
→ Update 3 files to import from '@monorepo/shared'

MEDIUM PRIORITY: Date formatting utilities (2 occurrences)
- apps/web/utils/formatDate.ts (70% similar)
- apps/admin/utils/dateHelpers.ts:30-45 (75% similar)

Recommendation:
→ Extract to: packages/shared/src/utils/date/formatDate.ts
→ Unify parameters and return types
→ Update 2 files to import from '@monorepo/shared'
```

## Refactoring Checklist

After identifying duplicates:
1. Create/update shared package
2. Move common code to package
3. Add proper TypeScript types
4. Write tests for extracted code
5. Update all consuming apps to import from shared package
6. Run tests to ensure no regressions
7. Remove old duplicate code

## Focus Areas (based on monorepo rules)

Prioritize these types of duplication:
1. **Database access patterns** → `@monorepo/database`
2. **External integrations** → `@monorepo/shared/libs/`
3. **Validation functions** → `@monorepo/shared/utils/validation/`
4. **Business logic** → `@monorepo/functions` or `@monorepo/shared`
5. **Type definitions** → `@monorepo/shared/types/`
6. **Constants** → `@monorepo/shared/constants/`
