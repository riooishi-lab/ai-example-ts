---
name: review
description: Perform a comprehensive code review of the current branch changes using multiple perspectives.
---

Perform a comprehensive code review of the current branch changes using three different perspectives.

Follow these steps:

## Step 1: Self-Review (Current Session with Context)
1. Run `git status` to see current state
2. Run `git diff main...HEAD` to see all changes in the current branch since it diverged from main
3. Run `git log main...HEAD` to understand the commit history
4. Review the changes against CLAUDE.md guidelines and best practices:
   - Multi-tenant security (tenantId filtering)
   - Biome code style compliance
   - No Firestore usage for new features
   - Type safety (no explicit any)
   - Import type usage
   - Environment variable handling
   - Proper error handling
   - Code organization and readability
3. Identify potential issues, improvements, and risks
4. Document findings with specific file paths and line numbers

## Step 2: Fresh Agent Review (New Session without Context)
1. Launch a new general-purpose agent using the Task tool
2. Provide the agent with:
   - Full git diff output (`git diff main...HEAD`)
   - CLAUDE.md content
   - Relevant .claude/rules/* if applicable
3. Ask the agent to perform an unbiased code review focusing on:
   - Code quality and maintainability
   - Potential bugs or edge cases
   - Security concerns
   - Performance implications
   - Testing considerations
4. Collect the agent's findings

## Step 3: GitHub Copilot Review
1. Use `gh copilot` to review the changes:
   ```bash
   gh copilot -p "Review the following git diff for code quality, security issues, bugs, and best practices. Provide specific feedback with line numbers: $(git diff main...HEAD)" --allow-tool 'shell(git)'
   ```
2. Collect Copilot's suggestions

## Step 4: Codex CLI Review
1. Use `codex` CLI to review the changes:
   ```bash
   codex review "$(git diff main...HEAD)"
   ```
2. Collect Codex's analysis and suggestions
3. Note any additional insights not covered by previous reviews

## Step 5: Consolidate Results
1. Compare and contrast findings from all four reviews
2. Prioritize issues by severity:
   - **Critical**: Security vulnerabilities, data leakage risks, breaking changes
   - **High**: Bugs, performance issues, missing tests
   - **Medium**: Code style, maintainability, documentation
   - **Low**: Minor improvements, suggestions
3. Create a consolidated review report with:
   - Summary of changes reviewed
   - Critical/High priority issues that must be fixed
   - Medium/Low priority suggestions
   - Positive observations (what was done well)
   - Unique insights from each review method (Self, Agent, GitHub Copilot, Codex)

**Important:**
- Be thorough but constructive in feedback
- Provide specific file paths and line numbers for all issues
- Suggest concrete solutions for identified problems
- If no issues found, explicitly state that the code looks good
