---
name: find-unused-deps
description: Search for unused dependencies across all apps and packages in the monorepo, and remove them.
---

Search for unused dependencies across all apps and packages in the monorepo, and remove them.

## Scope

Analyze every `package.json` in:
- `apps/*`
- `packages/*`

For each, check both `dependencies` and `devDependencies`.

## Step 1: Collect Dependencies

For each `package.json`, read the `dependencies` and `devDependencies` fields and list every package name.

## Step 2: Check Usage

For each dependency, determine whether it is actually used by searching the corresponding source directory.

### 2a. Source imports

Search for import statements that reference the package:

```
import ... from '<package-name>'
import ... from '<package-name>/...'
require('<package-name>')
require('<package-name>/...')
```

Use `Grep` with a pattern like `from ['"]<package-name>` and `require\(['"]<package-name>` across the app/package `src/` directory (and root config files).

### 2b. Config and tooling usage

Some dependencies are never imported in source code but are used by tooling or config files. Check these patterns:

| Dependency pattern | Where to check |
|---|---|
| `@types/*` | Always needed if the corresponding package is used — skip |
| `typescript` | Used by `tsc` — skip |
| `@biomejs/biome` | Used by biome CLI — skip |
| `vitest` | Used by test runner — skip |
| `prettier` | Used by formatter — skip |
| `@playwright/test` | Used by Playwright — skip |
| `prisma` | Used by Prisma CLI — skip |
| `tsx` | Used as script runner — skip |
| `next`, `react`, `react-dom` | Framework essentials — skip |
| `tailwindcss`, `postcss`, `autoprefixer` | Used via CSS/config — check `tailwind.config.*`, `postcss.config.*` |
| `dotenv` | Check config files like `prisma.config.ts`, `env.ts` |
| `babel-plugin-*` | Check `next.config.*` or `.babelrc` |
| Packages in `serverExternalPackages` | Check `next.config.ts` |

### 2c. Script usage

Check if the dependency is referenced in `scripts` field of `package.json`:

```json
"scripts": {
  "lint": "biome check",
  "test": "vitest run"
}
```

### 2d. Workspace dependencies

For `workspace:*` dependencies, verify that the package's exports are actually imported somewhere in the consuming app/package.

## Step 3: Report Findings

For each app/package, report:

```
## <app-or-package-name> (<path>/package.json)

### Unused dependencies
- `<package-name>` (^x.y.z) — No imports found in src/, not used in config/scripts

### Used dependencies (summary)
- `<package-name>` — imported in <file-path> (N files)
- ...
```

If no unused dependencies are found for a given app/package, report: "No unused dependencies found."

## Step 4: Remove Unused Dependencies

For each confirmed unused dependency:

1. Remove it using pnpm:
   ```bash
   pnpm --filter <app-or-package-name> remove <package-name>
   ```
2. Run `pnpm install` to sync the lockfile

## Step 5: Verify

1. Run builds for affected apps:
   ```bash
   pnpm --filter <app-name> build
   ```
2. Run tests for affected packages:
   ```bash
   pnpm --filter <package-name> test
   ```
3. If a build or test fails after removal, the dependency was actually needed — re-add it and note why it was not detected by import search.

## Step 6: Summary

Provide a final summary:

- Total dependencies checked: N
- Unused dependencies found: N
- Unused dependencies removed: N
- Files modified: list of package.json files
- Build/test verification: pass/fail

## Important Notes

- **Do NOT remove devDependencies that are used only by tooling** (TypeScript, Biome, Vitest, Playwright, Prisma CLI, tsx, etc.). These are never imported in source code but are essential.
- **Do NOT remove framework dependencies** (next, react, react-dom) even if they appear unused in direct imports — they are used by the framework itself.
- **Do NOT remove `@types/*` packages** unless the corresponding runtime package has also been removed.
- **Ask the user before removing** if you are uncertain whether a dependency is used implicitly (e.g., Babel plugins, PostCSS plugins, Tailwind plugins).
- **Peer dependencies** may not be directly imported but are required by other packages — check if any installed package lists them as `peerDependencies`.
- When in doubt, try removing and running the build. If it breaks, re-add immediately.
