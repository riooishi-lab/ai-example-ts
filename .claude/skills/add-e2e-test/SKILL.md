---
name: add-e2e-test
description: Add e2e tests for the changes in the current branch compared to the base branch.
---

Add e2e tests for the changes in the current branch compared to the base branch.

Follow these steps:

## Step 1: Identify Changed Files

Detect changed files between the current branch and the base branch:

1. Determine the base branch:
   ```bash
   BASE_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main")
   ```
   This auto-detects the repository's default branch (e.g., `main`, `develop`, `master`). Falls back to `main` if detection fails.
2. Check the current branch:
   ```bash
   git branch --show-current
   ```
3. Collect changed file paths:
   - **Topic branch commits**: `git diff --name-only $(git merge-base HEAD "$BASE_BRANCH")...HEAD`
   - **Unstaged changes**: `git diff --name-only HEAD`
   - **Staged changes**: `git diff --cached --name-only HEAD`
   - **Untracked files**: `git ls-files --others --exclude-standard`
4. Merge all results and deduplicate.
5. If on the base branch or no changes detected, report "No changes detected" and stop.

## Step 2: Find Changed Apps

1. From the collected file paths, extract unique app names matching `apps/<app-name>/`:
   ```bash
   echo "$ALL_CHANGED_FILES" | grep '^apps/' | cut -d'/' -f2 | sort -u
   ```
2. If no apps have changes (e.g., only infrastructure or config changes), report "No app-level changes detected — e2e tests are not applicable" and stop.

## Step 3: Check for E2E Test Infrastructure

For each changed app, check whether e2e test infrastructure exists:

1. Look for configuration files in `apps/<app-name>/`:
   - `playwright.config.ts` or `playwright.config.js`
   - `cypress.config.ts` or `cypress.config.js`
2. Check for e2e-related scripts in `apps/<app-name>/package.json` (e.g., `test:e2e`)
3. Look for an existing e2e test directory (e.g., `apps/<app-name>/e2e/`, `apps/<app-name>/tests/`)

### If no e2e infrastructure exists

Ask the user:

> This app (`<app-name>`) does not have e2e test infrastructure. Would you like me to set it up?
>
> Proposed setup:
> - **Framework**: Playwright
> - **Config**: `apps/<app-name>/playwright.config.ts`
> - **Test directory**: `apps/<app-name>/e2e/`
> - **Helper files**: `env.ts`, `helpers/db.ts` (if database-dependent)
> - **Package.json scripts**: `test:e2e`, `test:e2e:ui`
>
> Options:
> 1. Yes — set up Playwright and then write e2e tests
> 2. No — skip e2e test creation for this app

If the user agrees, set up the infrastructure:

1. Install Playwright:
   ```bash
   pnpm --filter <app-name> add -D @playwright/test
   ```
2. Create `playwright.config.ts` following existing project patterns (check other apps for reference)
3. Create the `e2e/` directory with:
   - `env.ts` — environment variable loader (follow existing patterns with dotenv)
   - `helpers/` directory with appropriate helper files
4. Add scripts to `apps/<app-name>/package.json`:
   ```json
   {
     "test:e2e": "playwright test",
     "test:e2e:ui": "playwright test --ui"
   }
   ```

If the user declines, skip this app and continue to the next.

## Step 4: Analyze Changes for Testable Scenarios

1. Read the actual diff to understand what was changed:
   ```bash
   git diff $(git merge-base HEAD "$BASE_BRANCH")...HEAD -- apps/<app-name>/
   ```
2. Also read the full source files of changed components/routes/APIs to understand the complete behavior (not just the diff).
3. Categorize the changes:
   - **New pages/routes**: Need full-flow e2e tests
   - **New UI components with user interaction**: Need interaction tests
   - **New/modified API routes**: Need API-level or flow-level tests
   - **Modified forms**: Need validation and submission tests
   - **Modified auth flows**: Need authentication scenario tests
   - **Bug fixes**: Need regression tests reproducing the fixed scenario
4. If the changes are purely internal (refactoring, utility functions, types) with no user-facing behavior change, report "Changes are internal — no e2e tests needed" and stop.

## Step 5: Study Existing Test Patterns

Before writing new tests, study the project's established e2e patterns:

1. Read ALL existing e2e test files in `apps/<app-name>/e2e/`:
   - Test structure (describe/test nesting)
   - Naming conventions (this project uses Japanese test descriptions)
   - Selector strategies (this project uses `data-testid` attributes)
   - Setup/teardown patterns (beforeEach, try/finally cleanup)
   - Helper usage (db helpers, firebase helpers, etc.)
   - Environment variable handling (`e2eEnv`, `test.skip` for missing vars)
2. Read existing helper files in `apps/<app-name>/e2e/helpers/`
3. Read `apps/<app-name>/e2e/env.ts` for available environment variables

**CRITICAL: New tests MUST follow the exact same patterns as existing tests. Do not introduce new conventions.**

## Step 6: Ensure data-testid Attributes Exist

1. For each testable element in the changed UI, check whether appropriate `data-testid` attributes already exist in the source code.
2. If `data-testid` attributes are missing on elements that tests need to interact with:
   - Add `data-testid` attributes to the source components following the existing naming convention (e.g., `<feature>-<element>-<type>`: `signin-email-input`, `signup-submit-button`)
   - Only add `data-testid` to elements that tests will actually reference — do not add them indiscriminately

## Step 7: Write E2E Tests

For each testable scenario identified in Step 4:

1. Create new test files or add tests to existing files as appropriate:
   - **New feature/page**: Create a new `<feature>.spec.ts` file
   - **Extension of existing feature**: Add tests to the existing spec file
2. Follow these patterns strictly:
   - Use `test.describe` with Japanese description for the feature
   - Use `test` with Japanese description for each scenario
   - Use `data-testid` selectors (never CSS classes or complex selectors)
   - Use `test.skip` with condition for tests requiring specific environment variables
   - Use `test.slow()` for tests that involve full flows (signup, multi-step processes)
   - Clean up test data in `finally` blocks (soft delete pattern)
   - Use existing helpers from `e2e/helpers/` — create new helpers only when needed
3. Test scenarios should cover:
   - **Happy path**: Full successful flow
   - **Validation errors**: Required fields, format validation
   - **Error states**: Invalid input, unauthorized access, not found
   - **Edge cases**: Expired tokens, duplicate submissions, etc.
4. If new helper functions are needed (e.g., new DB fixtures, API mocking):
   - Add them to the appropriate helper file in `e2e/helpers/`
   - Follow the existing helper patterns (e.g., `runQuery` for DB operations)

## Step 8: Run and Verify Tests

1. Install dependencies if needed:
   ```bash
   pnpm install
   ```
2. If using Playwright, ensure browsers are installed:
   ```bash
   pnpm --filter <app-name> exec playwright install --with-deps chromium
   ```
3. Run only the new/modified test files:
   ```bash
   pnpm --filter <app-name> test:e2e <test-file-path>
   ```
4. If tests fail, analyze the failure using error context files and fix (up to 3 attempts):
   - Read `apps/<app-name>/test-results/<test-name>/error-context.md` for DOM snapshots
   - Determine whether the test or the app code needs fixing
   - Fix and re-run

## Step 9: Report Results

Provide a summary:

- **Changes analyzed**: List of changed files/features
- **Tests written**: List of new test files and test cases with descriptions
- **data-testid additions**: List of `data-testid` attributes added to source components (if any)
- **Helpers added**: Any new helper functions created
- **Test results**: Pass/fail status of the new tests
- **Skipped scenarios**: Any scenarios that were intentionally not tested (with reasons)
- **Notes**: Any recommendations for additional manual testing or future test improvements

**Important:**
- Always follow existing test patterns — consistency is more important than "better" patterns.
- Use Japanese for test descriptions (`test.describe` and `test` names) to match existing conventions.
- Prefer `data-testid` selectors. If the source components lack them, add them as part of this task.
- Do not write tests for purely internal logic (utility functions, type changes). E2e tests are for user-facing behavior.
- Always clean up test data. Use soft deletes (`UPDATE ... SET deleted_at = NOW()`) for database cleanup.
- If a test requires environment variables that may not be available, use `test.skip` with a descriptive message.
- Do not modify existing tests unless the branch changes broke them. Use `/e2e-test` to fix broken existing tests instead.
