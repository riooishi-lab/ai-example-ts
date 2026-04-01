---
name: address-pr-comments
description: Address all review comments on the pull request for the current branch.
---

Address all review comments on the pull request for the current branch.

Follow these steps:

## Step 1: Find the Pull Request
1. Get the current branch name
2. Find the PR for this branch using:
   ```bash
   gh pr list --head $(git branch --show-current) --json number,title,url,author
   ```
3. If no PR exists, inform the user and exit
4. Display PR number, title, and URL

## Step 2: Retrieve All Comments
1. Get review comments (code-specific, line-level comments):
   ```bash
   gh api repos/:owner/:repo/pulls/{PR_NUMBER}/comments --jq '.[] | {id: .id, path: .path, line: .line, body: .body, user: .user.login, created: .created_at}'
   ```
2. Get general PR comments:
   ```bash
   gh pr view {PR_NUMBER} --json comments --jq '.comments[] | {author: .author.login, body: .body, createdAt: .createdAt}'
   ```
3. Get review summaries:
   ```bash
   gh pr view {PR_NUMBER} --json reviews --jq '.reviews[] | {author: .author.login, state: .state, body: .body}'
   ```

## Step 3: Analyze Comments
1. Parse and categorize all comments:
   - **Action Required**: Comments requesting changes, bug reports, security issues
   - **Suggestions**: Improvement suggestions, refactoring ideas
   - **Questions**: Clarification requests
   - **Informational**: Acknowledgments, praise, bot notifications
2. For each action-required comment:
   - Identify the file path and line number (if specified)
   - Extract the specific issue or request
   - Determine if it's a critical issue (security, bugs) or enhancement
3. Create a prioritized list with:
   - Comment ID
   - Author
   - File path (if applicable)
   - Issue summary
   - Priority (Critical/High/Medium/Low)

## Step 4: Address Comments
For each action-required comment (starting with Critical/High priority):
1. Read the relevant file(s)
2. Understand the current implementation
3. Apply the requested fix or improvement
4. Verify the change addresses the comment
5. Mark the comment as addressed in your tracking

## Step 5: Verify Changes
1. Run linting to ensure code quality:
   ```bash
   pnpm lint:fix
   ```
2. Run type checking if TypeScript files were modified:
   ```bash
   pnpm typecheck
   ```
3. Run relevant tests if available:
   ```bash
   pnpm test
   ```
4. Review all changes made:
   ```bash
   git diff
   ```

## Step 6: Commit Changes
1. Stage the changes:
   ```bash
   git add .
   ```
2. Create a commit with a clear message referencing the addressed comments:
   ```bash
   git commit -m "Address PR review comments

   - Fixed [specific issue from comment]
   - Improved [specific issue from comment]
   - Resolved [specific issue from comment]

   Addresses comments from PR #[PR_NUMBER]"
   ```
3. Push changes:
   ```bash
   git push
   ```

## Step 7: Summary Report
Provide a summary including:
- Total comments found: X
- Comments addressed: Y
- Comments requiring manual intervention: Z
- Files modified: [list]
- Key changes made: [bullet points]
- Remaining action items (if any)

**Important:**
- Always read the full context of files before modifying them
- For security-critical comments, prioritize and address immediately
- If a comment is unclear, note it in the summary for manual review
- Use the Edit tool for precise changes to existing code
- Verify all changes compile and pass linting before committing
- Include comment IDs or references in commit messages for traceability
