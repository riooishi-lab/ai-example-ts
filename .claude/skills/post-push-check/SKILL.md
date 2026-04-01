---
name: post-push-check
description: Check for an existing PR after push, and request reviews from Copilot and Gemini.
---

Check for an existing PR after push, and request reviews from Copilot and Gemini.

Follow these steps:

1. Get the current branch name with `git branch --show-current`
2. Check if a PR exists for the current branch:
   ```bash
   gh pr view --json number,url 2>/dev/null
   ```
3. If no PR exists, print "No PR found for this branch. Skipping post-push-check." and stop
4. If a PR exists, run the following two steps in parallel:
   a. Add `copilot` as a reviewer. If already assigned, re-request the review:
      ```bash
      gh pr edit --add-reviewer @copilot || true
      ```
   b. Post `/gemini review` as a comment on the PR:
      ```bash
      gh pr comment --body "/gemini review"
      ```
5. Print the PR URL and confirm both actions completed
