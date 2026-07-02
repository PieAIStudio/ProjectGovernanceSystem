---
title: Use Learning Recall before non-trivial work
date: 2026-07-02
category: workflow-issues
module: Learning recall
problem_type: workflow_issue
component: development_workflow
severity: medium
applies_when:
  - "An AI agent starts implementation, debugging, release, architecture, or portfolio-sync work"
  - "The repository has reusable learnings under docs/solutions or vocabulary in CONCEPTS.md"
  - "Compound Engineering is used as a post-work learning tail rather than a default workflow"
tags: [learning-recall, compound-gate, docs-solutions, workflow, knowledge-reuse]
---

# Use Learning Recall before non-trivial work

## Context

The Compound Gate made agents record reusable lessons after verified work, but
recording is only half of the compounding loop. A future session also needs a
cheap way to find the relevant lesson before it starts changing files.

Making the full Compound Engineering workflow default would solve discovery by
adding a second main process, but that reintroduces the workflow-choice burden
PGS deliberately avoided.

## Guidance

Keep the boundary thin:

```text
CE writes the reusable lesson.
PGS recalls the reusable lesson.
```

Before non-trivial implementation, debugging, release, architecture, or
portfolio-sync work, run:

```bash
pro-gov learn recall --query "<task summary>"
```

Read relevant hits from `docs/solutions/**` or `CONCEPTS.md` before changing
files. A no-hit result is acceptable. Do not make every agent read the entire
knowledge store, and do not enable the full CE workflow unless the user
explicitly asks for it.

## Why This Matters

Post-work capture without pre-work recall creates a notebook nobody opens. The
system appears to be learning, but the next agent still repeats old mistakes.

Learning Recall closes that loop without turning CE into a competing execution
engine. It gives agents a small, query-shaped doorway into stored knowledge, so
the default engineering path stays understandable:

```text
read router -> recall relevant lessons -> do verified work -> compound new lesson if useful
```

## When to Apply

- The task is non-trivial and will modify code, docs, release state, hooks, or
  portfolio-managed targets.
- The task is a bug investigation where prior dead ends or root causes may
  matter.
- The task affects areas already covered by `docs/solutions/**` or named in
  `CONCEPTS.md`.

## Examples

Good startup check:

```bash
pro-gov learn recall --query "npm trusted publishing downstream sync"
```

Good no-hit handling:

```text
Learning Recall: 0 hits
No relevant learning records found.
```

Continue the normal workflow after a no-hit result. Do not create filler
learning records just to make recall return something.

## Related

- `integrations/compound-engineering.md`
- `integrations/superpowers.md`
- `docs/reference/adoption/recommended-agent-tooling.md`
