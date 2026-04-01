---
name: create-pr
description: Create a pull request for the current branch.
---

Create a pull request for the current branch.

Follow these steps:
1. Run `/pre-push-check` command
2. Run `git status` to see all untracked files and changes
3. Run `git diff` to see both staged and unstaged changes
4. Check if the current branch tracks a remote branch and is up to date
5. Run `git log main...HEAD` to understand the full commit history for the current branch
6. Analyze all changes that will be included in the pull request
7. Run `/adr` to create an ADR documenting the architectural decisions behind this PR:
   - Based on the analyzed changes (steps 5-6), summarize the decision context, what was decided, and its consequences
   - If the changes lack sufficient background information to write a meaningful ADR (e.g., why this approach was chosen over alternatives, what constraints influenced the decision), ask the user for clarification before creating the ADR
   - The ADR should focus on the "why" behind the changes, not just the "what"
8. Draft a concise PR summary with:
   - **Title**: Clear, descriptive title summarizing the changes
   - **Summary**: 1-3 bullet points describing what changed and why
   - **Code Metrics**: Include the final `/code-metrics` results in a collapsible `<details>` section:
     - Summary table (total files, avg MI, files "Could be better")
     - Cognitive Complexity: top functions with CC >= 15 (if any remain)
     - Maintainability Index: worst MI files (bottom 10)
     - Threshold compliance status (all passed / which failed)
   - **Test plan**: Bulleted checklist of steps to test the changes
9. Run `/add-e2e-test` command to add E2E tests for the changes
10. Push to remote with `-u` flag if the branch doesn't track a remote yet
11. Create the PR using `gh pr create` with the drafted title and body
12. Return the PR URL
13. Run `/post-push-check` to request reviews from Copilot and Gemini

**Important:**
- **CRITICAL: This workflow has 13 steps. Execute every step in order from 1 to 13. Do NOT skip any step, even if it seems unnecessary. After completing each step, verify you are proceeding to the correct next step number before continuing.**
- Base branch should be `main` (the project's main branch)
- Include "🤖 Generated with [Claude Code](https://claude.com/claude-code)" at the end of PR body
- Make sure to analyze ALL commits that will be included in the PR, not just the latest one
