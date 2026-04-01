---
name: fix-ci
description: Fix CI failures reported on the pull request for the current branch.
---

Fix CI failures reported on the pull request for the current branch.

Follow these steps:

## Step 1: Find the Pull Request
1. Get the current branch name
2. Find the PR for this branch using:
   ```bash
   gh pr list --head $(git branch --show-current) --json number,title,url,author
   ```
3. If no PR exists, inform the user and exit
4. Display PR number, title, and URL

## Step 2: Retrieve CI Check Results
1. Get all check runs for the PR:
   ```bash
   gh pr checks {PR_NUMBER} --json name,state,conclusion,startedAt,completedAt,detailsUrl
   ```
2. If all checks passed, report "All CI checks passed" and exit
3. Identify failed checks and display:
   - Check name
   - Conclusion (failure, cancelled, timed_out, etc.)
   - Details URL

## Step 3: Retrieve Failed Job Logs
For each failed check:
1. Get the workflow run ID from the check details:
   ```bash
   gh run list --branch $(git branch --show-current) --status failure --json databaseId,name,conclusion,headSha --limit 5
   ```
2. Download the logs for the failed run:
   ```bash
   gh run view {RUN_ID} --log-failed
   ```
3. If `--log-failed` output is too large or insufficient, download the full log:
   ```bash
   gh run view {RUN_ID} --log
   ```

## Step 4: Analyze Failures
1. Parse the log output and categorize each failure:
   - **Lint/Format errors**: Biome check failures, formatting issues
   - **Type errors**: TypeScript compilation errors (`tsc`, type mismatches)
   - **Unit test failures**: Jest/Vitest test failures
   - **E2E test failures**: Playwright/Cypress test failures
   - **Build errors**: Next.js build failures, module resolution errors
   - **Database errors**: Prisma migration failures, schema mismatches
   - **Dependency errors**: Missing packages, version conflicts, lockfile mismatch
   - **Environment errors**: Missing env vars, service connection failures
   - **Timeout errors**: Job exceeded time limit
2. For each failure, extract:
   - Error message and stack trace
   - File path and line number (if available)
   - The failing step name in the workflow
3. Create a prioritized list:
   - **Critical**: Errors that block the entire pipeline (dependency, build)
   - **High**: Test failures, type errors
   - **Medium**: Lint/format errors
   - **Low**: Warnings, non-blocking issues

## Step 5: Check for E2E Test Artifacts
If the failure includes e2e tests:
1. Check for uploaded artifacts (test reports, videos):
   ```bash
   gh run view {RUN_ID} --json jobs --jq '.jobs[] | {name: .name, steps: [.steps[] | select(.name | test("Upload")) | {name: .name, conclusion: .conclusion}]}'
   ```
2. If artifacts are available, download them for analysis:
   ```bash
   gh run download {RUN_ID} --name playwright-report --dir /tmp/ci-artifacts/
   ```
3. Read the Playwright HTML report or error context files for DOM snapshots and failure details

## Step 6: Fix Failures
For each failure (starting with Critical priority):

### Lint/Format errors
1. Run the linter locally to reproduce:
   ```bash
   pnpm --filter <app-name> lint
   ```
2. Auto-fix where possible:
   ```bash
   pnpm --filter <app-name> lint:fix
   ```
3. Manually fix any remaining issues

### Type errors
1. Run type checking locally:
   ```bash
   pnpm --filter <app-name> typecheck
   ```
2. Read the relevant source files and fix type issues
3. Ensure `import type` is used for type-only imports

### Unit test failures
1. Run the failing tests locally:
   ```bash
   pnpm --filter <app-name> test <test-file>
   ```
2. Read the test file and the source code it tests
3. Determine if the fix belongs in the test or the source code
4. Apply the fix

### E2E test failures
1. Read the error context file (`error-context.md`) from artifacts if available
2. Read the failing test file and the application code it exercises
3. Determine the root cause (see `/e2e-test` skill for detailed guidance):
   - Test expectation mismatch vs actual UI
   - Selector changes
   - Timing issues
   - App bug introduced by branch changes
4. Apply the fix

### Build errors
1. Run the build locally:
   ```bash
   pnpm build
   ```
2. Fix module resolution, import errors, or compilation issues
3. Ensure Prisma client is generated if needed:
   ```bash
   pnpm --filter database db:generate
   ```

### Dependency errors
1. Ensure lockfile is up to date:
   ```bash
   pnpm install
   ```
2. If `--frozen-lockfile` failed in CI, check for uncommitted lockfile changes
3. Fix version conflicts in `package.json`

## Step 7: Verify Fixes Locally
1. Reproduce the CI pipeline steps locally as closely as possible:
   ```bash
   pnpm install --frozen-lockfile
   pnpm --filter database db:generate
   pnpm --filter web lint
   pnpm build
   ```
2. Run the specific tests that failed:
   ```bash
   pnpm --filter <app-name> test:e2e  # for e2e failures
   pnpm --filter <app-name> test      # for unit test failures
   ```
3. Review all changes:
   ```bash
   git diff
   ```

## Step 8: Commit and Push
1. Stage the changes (prefer specific files over `git add .`):
   ```bash
   git add <specific-files>
   ```
2. Create a commit with a clear message:
   ```bash
   git commit -m "Fix CI failures

   - Fixed [specific failure description]
   - Fixed [specific failure description]

   Fixes CI for PR #{PR_NUMBER}"
   ```
3. Push changes:
   ```bash
   git push
   ```

## Step 9: Confirm CI Re-run
1. Check that the push triggered a new CI run:
   ```bash
   gh run list --branch $(git branch --show-current) --limit 1 --json databaseId,status,name
   ```
2. Report the new run ID and URL so the user can monitor progress

## Step 10: Summary Report
Provide a summary including:
- Total failed checks: X
- Failures fixed: Y
- Failures requiring manual intervention: Z (with reasons)
- Files modified: [list]
- Key changes made: [bullet points]
- New CI run: [run ID and URL]
- Remaining action items (if any)

**Important:**
- Always reproduce failures locally before attempting fixes
- Read the full CI log output carefully — the root cause may be earlier in the log than the error message
- For e2e failures, artifacts (reports, videos, error-context.md) are the most reliable source of truth
- Do not blindly retry CI — always identify and fix the root cause
- If a failure is caused by a flaky test (passes locally, fails in CI), note it clearly but still investigate
- If a failure is caused by missing CI secrets or environment configuration, report it as requiring manual intervention
- Verify fixes locally before pushing to avoid unnecessary CI cycles
- If the CI workflow file itself needs changes (`.github/workflows/`), confirm with the user before modifying
