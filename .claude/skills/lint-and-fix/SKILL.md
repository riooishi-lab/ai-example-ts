---
name: lint-and-fix
description: Check the codebase for violations of CLAUDE.md and .claude/rules/* guidelines, and fix them automatically.
---

Check the codebase for violations of CLAUDE.md and .claude/rules/* guidelines, and fix them automatically where possible.

Focus on:
1. **Code style violations**: Run Biome to fix formatting, linting issues (process.env, console.log, explicit any, etc.)
2. **Import violations**: Check for missing `import type` for type-only imports
3. **Multi-tenant security**: Look for database queries missing tenantId filters
4. **File size violations**: Identify files exceeding limits (500 lines for non-TSX, 1000 lines for TSX)
5. **Firestore usage**: Flag any new Firestore usage (should use Prisma instead)
6. **Array mutations**: Identify use of .push(), .pop(), .shift(), .unshift(), .splice()
7. **For loops**: Identify for loops that should use functional array methods
8. **Package manager**: Check for npm/yarn usage instead of pnpm

After checking, fix all auto-fixable violations and report any issues that require manual intervention.
