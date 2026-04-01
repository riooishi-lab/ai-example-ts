---
name: e2e-test
description: Run e2e tests for apps that have changes, and fix any failures.
---

Run e2e tests for apps that have changes, and fix any failures.

Follow these steps:

## Step 1: Identify Changed Files

Detect changed files using **both** committed and uncommitted changes:

1. Check the current branch:
   ```bash
   git branch --show-current
   ```
2. Collect changed file paths from all sources:
   - **Topic branch commits** (if not on main): `git diff --name-only $(git merge-base HEAD main)...HEAD`
   - **Unstaged changes**: `git diff --name-only HEAD`
   - **Staged changes**: `git diff --cached --name-only HEAD`
   - **Untracked files**: `git ls-files --others --exclude-standard`
3. Merge all results and deduplicate.

## Step 2: Find Changed Apps

1. From the collected file paths, extract unique app names matching `apps/<app-name>/`:
   ```bash
   echo "$ALL_CHANGED_FILES" | grep '^apps/' | cut -d'/' -f2 | sort -u
   ```
2. If no apps have changes, report "No app changes detected" and stop.

## Step 3: Check for E2E Test Configuration

For each changed app:
- Look for `playwright.config.ts`, `playwright.config.js`, `cypress.config.ts`, `cypress.config.js` in `apps/<app-name>/`
- Also check for e2e-related scripts in `apps/<app-name>/package.json` (e.g., `test:e2e`)

If no e2e configuration is found for any changed app, report "No e2e test configuration found for changed apps" and stop.

## Step 4: Install Dependencies

For each app with e2e configuration:

1. Ensure all project dependencies are up to date:
   ```bash
   pnpm install
   ```
2. If using Playwright, ensure browsers are installed:
   ```bash
   pnpm --filter <app-name> exec playwright install --with-deps chromium
   ```

## Step 5: Run E2E Tests

For each app with e2e configuration:

1. Run the e2e tests:
   ```bash
   pnpm --filter <app-name> test:e2e
   ```
2. If all tests pass, report success and move to Step 7.

## Step 6: Analyze and Fix Failures

If e2e tests fail, repeat the following up to 3 times:

### 6-1. Analyze

1. Identify which test(s) failed from the output.
2. Read the **error context file** (`apps/<app-name>/test-results/<test-name>/error-context.md`) — this contains a page snapshot showing the actual DOM state and rendered text at the time of failure. This is the most reliable source of truth for what the UI actually displayed.
3. Check for video artifacts in `apps/<app-name>/test-results/` if more context is needed.

### 6-2. Determine Root Cause

Compare the test expectations against the actual page snapshot from the error context:
- **Test expects text that doesn't exist in the DOM**: The test expectation is wrong, or the app renders different text. Check the app's validation schemas, error maps, and rendering logic to understand what text is actually produced.
- **Selector doesn't match**: UI structure changed (class names, element hierarchy, roles).
- **Timing issue**: Element appears after the timeout. Add proper `waitFor` or increase timeout.
- **App bug**: The branch changes broke functionality. Fix the app code.
- **Environment issue**: Missing env vars, server not starting.

### 6-3. Read Source Files

- Read the failing test file(s)
- Read the application code the test exercises (components, validation schemas, error maps, server actions)
- Trace the full chain from user action to rendered output to understand what the UI actually shows

### 6-4. Fix

- If the app code has a bug: fix the application code
- If the test expectation doesn't match actual (correct) app behavior: update the test
- If it's a flaky test: add proper waits or assertions

### 6-5. Re-run

```bash
pnpm --filter <app-name> test:e2e
```

If tests still fail after 3 fix attempts, report the remaining failures with detailed analysis and stop.

## Step 7: Report Results

Provide a summary report:
- List of changed apps detected
- Which apps had e2e configuration
- Test results per app (pass/fail/skipped counts)
- If fixes were applied: what was changed and why
- If tests were skipped due to missing env vars: list the required variables
- If failures remain: detailed explanation of unresolved issues

**Important:**
- Always read the error context file (`error-context.md`) in test-results — it shows the actual rendered DOM and is more reliable than guessing from source code alone.
- Do not modify tests just to make them pass if the underlying app behavior is genuinely broken — fix the app code instead.
- When updating tests, ensure the new assertions still validate meaningful behavior.
- If env vars are required for e2e tests (e.g., `TEST_USER_EMAIL`), check `apps/<app-name>/e2e/env.ts` or similar config files and warn if they are not set.
