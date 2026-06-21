---
id: REF-RECOMMENDED-AGENT-TOOLING
title: Recommended Agent Tooling
type: reference
status: stable
canonical: true
owner: human
created: 2026-06-21
last_reviewed: 2026-06-21
domain: adoption
tags:
  - adoption
  - tooling
  - superpowers
  - ponytail
pinned: false
related:
  - REF-ADOPTION-PLAYBOOK
  - POLICY-DESIGN-PRINCIPLES
  - POLICY-SYNC-STRATEGY
---

# Recommended Agent Tooling

This page separates what a project needs from what may help it.

## The Beginner Version

Imagine a school workshop:

- PGS labels the shelves, routes each job, and checks that the record is complete.
- Superpowers gives the class a reliable build-and-test routine.
- Ponytail is the adviser who asks, "Can we make this with fewer unnecessary
  parts?"

Installing every tool does not mean every tool should run all the time.

## Recommendation Table

| Tool | Recommendation | Best fit | Default behavior |
| --- | --- | --- | --- |
| `@pieai/pro-gov` | Required for package-based PGS adoption | Projects adopting PGS starter/profile assets | Use its read-only discovery, init, sync, doctor, and Lens commands. |
| `@pieai/doc-gov` | Required for package-based PGS adoption | All governed PGS projects | Run document, router, manifest, link, hook, and CI checks. |
| Superpowers | Recommended for engineering/runtime projects | Apps, games, services, browser products, and other code-heavy work | Use the matching workflow when the selected PGS lane requires it. |
| Ponytail | Recommended as an installed, optional adviser | Projects that need help resisting unnecessary complexity | Keep the global mode `off`; activate it explicitly for a bounded task or review. |

## Superpowers

Superpowers owns engineering workflow discipline:

- brainstorming before creative implementation;
- implementation plans;
- test-driven development;
- systematic debugging;
- verification before completion;
- isolated worktree usage.

PGS routes the task first. Superpowers then runs inside the selected lane.

Engineering/runtime projects usually benefit from Superpowers. Doc-only
projects should not inherit the full engineering ceremony unless their current
task actually involves runtime or code behavior.

Read `integrations/superpowers.md` for the exact boundary.

## Ponytail

Ponytail advises the AI to prefer smaller, less speculative solutions. That can
reduce unnecessary code, files, dependencies, and abstractions.

Keep its global mode `off`. When a low-risk task needs a simplicity comparison,
test `lite` in an isolated session first. Use `full` only as an optional stress
test after checking that requirements, tests, verification, security,
accessibility, and durable evidence remain intact.

Ponytail is not a replacement for PGS or Superpowers. Shorter work is valuable
only when it is still the complete, proven work the project asked for.

Read `integrations/ponytail.md` for the mode policy and comparison protocol.

## A Practical Default

For an engineering/runtime project:

```text
install PGS packages
-> keep Superpowers available for engineering workflows
-> install Ponytail but keep global mode off
-> activate Ponytail only when a bounded simplicity review would help
```

For a doc-only project:

```text
install PGS packages
-> use doc-only routing and evidence rules
-> add engineering workflow tools only for a real engineering task
-> keep Ponytail optional and off by default
```

## What PGS Does Not Do

PGS does not automatically install, enable, update, or remove these external
plugins in another person's AI host. It documents the recommended boundary and
lets each project or user adopt tools deliberately.

