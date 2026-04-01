---
name: pre-push-check
description: Check for potential issues before pushing code to the remote repository.
---

Check for potential issues before pushing code to the remote repository.

1. Run `/find-unused-deps` command to find and remove unused dependencies
2. Run `/suggest-deduplication` command to identify and fix code duplication
3. Run `/lint-and-fix` command to check and fix code style violations
4. Run `/review` command to perform comprehensive code review
5. Review the code review results and fix any issues identified:
   - Address security vulnerabilities
   - Fix bugs and logic errors
   - Improve code quality based on suggestions
   - Commit the fixes with an appropriate message
6. Run `/code-metrics` command to analyze code complexity
   - Check if there are any files with Maintainability Index (MI) < 10
   - These files are in the "red zone" and need immediate attention
7. Refactor files based on Maintainability Index and Cognitive Complexity thresholds:
   - **Critical (MI < 10)**: All files must be refactored to MI >= 10
   - **Warning (MI <= 30)**: Ensure less than 5% of total files are in this range
   - **Cognitive Complexity >= 30**: All functions must be refactored to CC < 30 (no exceptions)
   - **Cognitive Complexity >= 25**: Ensure less than 5% of total functions are in this range
   - For files needing refactoring:
     - Break down large functions/components
     - Reduce cyclomatic complexity
     - Simplify logic and improve readability
     - Split functions with high cognitive complexity into smaller, focused functions
   - Re-run `/code-metrics` to verify:
     - No files have MI < 10 (red zone)
     - Files with MI <= 30 are less than 5% of total files
     - No function has Cognitive Complexity >= 30
     - Functions with Cognitive Complexity >= 25 are less than 5% of total functions
   - If threshold not met, refactor the worst offenders until targets are achieved
8. If there are any changes from the previous commands, commit them with an appropriate message

**CRITICAL: This workflow has 8 steps. Execute every step in order from 1 to 8. Do NOT skip any step, even if it seems unnecessary. After completing each step, verify you are proceeding to the correct next step number before continuing.**
