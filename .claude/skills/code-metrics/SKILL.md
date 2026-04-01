---
name: code-metrics
description: Analyze code complexity metrics using Cognitive Complexity TS and FTA (Fast TypeScript Analyzer).
---

Analyze code complexity metrics using Cognitive Complexity TS and FTA (Fast TypeScript Analyzer).

Calculate and display the following metrics:
- **Cognitive Complexity** (per function/class/file)
- **Halstead Metrics** (volume, difficulty, effort, bugs)
- **Cyclomatic Complexity**
- **Lines of Code**
- **Maintainability Index**: MAX(0, (171 - 5.2 * ln(Halstead Volume) - 0.23 * (Cyclomatic Complexity) - 16.2 * ln(Lines of Code)) * 100 / 171)

Follow these steps:

1. Ask the user which path to analyze (default: current directory `.`)

2. **Cognitive Complexity Analysis** — Run `npx -p cognitive-complexity-ts -- ccts-json <path>` to measure cognitive complexity per function/class/file using [Cognitive-Complexity-TS](https://github.com/Deskbot/Cognitive-Complexity-TS)
   - **IMPORTANT**: `ccts-json` is a binary provided by the `cognitive-complexity-ts` package. You must use `npx -p cognitive-complexity-ts -- ccts-json <path>` (not `npx ccts-json`), because `ccts-json` is not a package name itself.
   - The command accepts a file or directory path as its argument. When a directory is given, it recursively analyzes all TypeScript/JavaScript files in it and returns a single nested JSON object.
   - The JSON output is a nested object mirroring the directory structure. Each file node has `kind: "file"`, a `score` (file total), and an `inner` array of function/class/type nodes each with their own `score`.
   - Parse the JSON output to extract cognitive complexity scores for each function, class, namespace, and file
   - Flag functions with high cognitive complexity (> 15 = high, > 25 = very high)

3. **FTA Analysis** — Run `npx fta-cli@latest <path> --json` to get detailed metrics
   - **IMPORTANT**: FTA does NOT use an `analyze` subcommand. The correct syntax is `npx fta-cli@latest <path> --json` (pass the path directly as the first positional argument).
   - Parse the JSON output to extract:
     - Halstead Volume
     - Cyclomatic Complexity
     - Lines of Code (total lines)
     - Other Halstead metrics (unique/total operators and operands, difficulty, effort, bugs)

4. Calculate the Maintainability Index using the formula:
   - MI = MAX(0, (171 - 5.2 * ln(Halstead Volume) - 0.23 * (Cyclomatic Complexity) - 16.2 * ln(Lines of Code)) * 100 / 171)

5. Display a summary report with:
   - File/directory analyzed
   - **Cognitive Complexity** per function (highlight any exceeding thresholds)
   - All Halstead Metrics
   - Cyclomatic Complexity
   - Lines of Code
   - Calculated Maintainability Index
   - Interpretation:
     - Cognitive Complexity: <= 15 = good, 16-25 = consider refactoring, > 25 = refactoring recommended
     - Maintainability Index: > 85 = highly maintainable, 65-85 = moderately maintainable, < 65 = difficult to maintain

6. If analysis fails or tools are not available, provide clear error messages and installation instructions

**Notes:**
- Both tools analyze TypeScript/JavaScript files
- Both tools are installed via npx, so no manual installation is required
- For large codebases, consider analyzing specific directories or files
- Cognitive complexity measures how difficult code is to **understand** (based on the SonarSource whitepaper), while cyclomatic complexity measures the number of independent paths
- The Maintainability Index provides a 0-100 scale where higher is better
- When analyzing `.` (current directory), always target source directories (e.g. `apps/web/src`, `packages/database`) explicitly to avoid scanning `node_modules`
- The ccts-json output can be very large. Pipe it through a Node.js script to extract and sort the top-N functions/files by score rather than trying to read the raw JSON
- Auto-generated files (e.g. Prisma generated client under `generated/`) will have high scores but are not actionable — exclude or note them in the report
