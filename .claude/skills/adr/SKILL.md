---
name: adr
description: Create an Architectural Decision Record (ADR) document.
---

Create an Architectural Decision Record (ADR) document.

Follow these steps:

1. Check the `.claude/docs/adr/` directory for existing ADRs to determine the next sequential number
   - If the directory doesn't exist, create it
   - ADR files follow the naming pattern: `NNNN-kebab-case-title.md` (e.g., `0001-use-gitflow-workflow.md`)
2. If the user did not provide enough context, ask clarifying questions about:
   - What architectural decision needs to be documented
   - What alternatives were considered
   - What constraints or forces influenced the decision
3. Create the ADR file using the template below
4. Return the file path of the created ADR

## ADR Template

```markdown
# NNNN. Title

## Status

<!-- One of: Proposed | Accepted | Deprecated | Superseded -->
Proposed

## Date

YYYY-MM-DD

## Context

<!-- Describe the problem, constraints, and forces driving this decision. -->

## Decision

<!-- Describe the chosen approach and its details. -->

## Consequences

### Positive

<!-- List the positive outcomes of this decision. -->

### Negative

<!-- List the negative outcomes or trade-offs of this decision. -->

## Compliance

<!-- Describe how this decision will be enforced or verified. -->

## Notes

- Author:
- Version: 0.1
- Changelog:
  - 0.1: Initial proposed version
```

**Important:**
- Use the current date for the Date field
- Set Status to "Proposed" for new ADRs unless the user specifies otherwise
- Keep the Title concise and descriptive (statement of the decision, not a question)
- The Context section should explain WHY the decision is needed
- The Decision section should explain WHAT was decided
- List both positive and negative consequences honestly
- The Compliance section should describe concrete steps to verify adherence
