# 0001. Add e2e test generation skill for Claude Code

## Status

Proposed

## Date

2026-03-19

## Context

The project already has a `/e2e-test` skill that runs existing Playwright e2e tests and fixes failures. However, when developers implement new features or modify existing ones, they must manually write e2e tests from scratch. This is time-consuming and error-prone — developers may miss edge cases, deviate from established test patterns (Japanese descriptions, `data-testid` selectors, soft-delete cleanup), or skip e2e coverage entirely.

A skill that automatically generates e2e tests based on branch diffs would reduce this friction and ensure consistent test coverage for every feature branch.

Key constraints:
- The project uses Playwright with specific conventions (Japanese test names, `data-testid`, `e2eEnv`, try/finally cleanup)
- Only one app (`web`) currently has e2e infrastructure, but the monorepo may grow
- New apps may not have Playwright configured, so the skill must handle infrastructure bootstrapping

## Decision

Create a new `/add-e2e-test` skill that:

1. Detects changed files by diffing the current branch against `main`
2. Identifies which apps have changes and checks for existing e2e infrastructure
3. If no e2e infrastructure exists, proposes Playwright setup and asks for user confirmation before proceeding
4. Analyzes the diff to identify testable user-facing scenarios (pages, forms, auth flows, API routes)
5. Studies existing test patterns in the target app to ensure consistency
6. Adds `data-testid` attributes to source components where needed
7. Writes e2e tests following the project's established conventions
8. Runs and verifies the new tests, fixing failures up to 3 times

This is separate from the existing `/e2e-test` skill: `/add-e2e-test` writes new tests, while `/e2e-test` runs and fixes existing ones.

## Consequences

### Positive

- Reduces manual effort for writing e2e tests per feature branch
- Enforces consistent test patterns across the codebase (Japanese naming, `data-testid`, cleanup)
- Catches missing `data-testid` attributes early and adds them as part of the workflow
- Handles infrastructure bootstrapping for new apps, lowering the barrier to e2e adoption
- Integrable into the `/create-pr` workflow for automated test coverage before PR creation

### Negative

- Generated tests may need manual adjustment for complex business logic or multi-step flows
- Skill relies on diff analysis, which may not capture all testable scenarios (e.g., indirect behavioral changes)
- Adding `data-testid` to source components increases the surface area of changes in a PR

## Compliance

- The skill definition lives at `.claude/skills/add-e2e-test/SKILL.md` and is version-controlled
- Step 5 of the skill explicitly requires reading all existing tests before writing new ones
- Step 8 runs the tests to verify correctness before reporting success
- The existing `/e2e-test` skill remains the tool for running and fixing tests post-merge

## Notes

- Author: Claude Code
- Version: 0.1
- Changelog:
  - 0.1: Initial proposed version
