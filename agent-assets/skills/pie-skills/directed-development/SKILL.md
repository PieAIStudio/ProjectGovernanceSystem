---
name: directed-development
description: Use when a product task is mixed, cross-domain, or spans interdependent capabilities that need dependency-ordered implementation blocks before coding begins
---

# Directed Development

**Version:** v7.1

## Core Idea

Directed Development (DD) is a BDD orchestration patch for Superpowers. It splits a large requirement into ordered Feature Blocks with acceptance scenarios, verification gates, and handoff notes.

DD has no artifact-location rules. Where specs, plans, reviews, tasks, or evidence live is decided by Superpowers and the active project's own instructions, not by DD.

Entry condition: design exploration is already approved. If the work is still fuzzy, use `superpowers:brainstorming` first.

Required background: `superpowers:writing-plans`, `superpowers:test-driven-development`.

## What DD Adds

- dependency ordering across multiple capabilities
- BDD scenarios for human-readable acceptance
- block-level completion gates
- progressive context loading
- explicit evidence and handoff discipline

DD does not add document paths, file names, branch names, product URLs, test commands, or runtime architecture decisions.

## When To Use

Use DD when all are true:

- The task is product work, not just mechanical cleanup.
- It crosses domains or spans multiple capabilities.
- Those capabilities have dependency, sequencing, or shared-contract risk.
- A single implementation plan would hide too much ordering risk.

Usually skip DD for one small feature, one isolated bug, pure cleanup, broad rename, simple docs edits, or fast visual/game-feel exploration where screenshots and owner judgment are the main gate.

## Workflow

1. Collect source truth: approved requirements, constraints, current planning context, and affected runtime contracts.
2. Split Feature Blocks: one outcome per block; dependencies named; behavior, visual work, and pure refactor separated unless intentionally bundled.
3. Order blocks: foundations before consumers, contracts before callers, high-risk unknowns early, integration last.
4. Add BDD scenarios:

```gherkin
Feature: <block name>

  Scenario: <observable behavior>
    Given <starting condition>
    When <user/system action>
    Then <observable result>
```

5. Define each block's contract: goal, dependencies, scenarios, steps, verification, completion gate, handoff notes.
6. Execute one block at a time with Superpowers: use `writing-plans` when detail is needed, TDD for behavior-critical work, and browser/device/owner evidence for user-facing game feel.
7. Record completion evidence according to Superpowers and project instructions before moving on.

Load only global constraints plus the current block's needed context. Skim future blocks only for dependency checks.

## Completion Gate Pattern

Adapt to Superpowers and project instructions, but make sure:

- acceptance scenarios are proven or explicitly deferred
- behavior-critical changes used TDD or a recorded exception
- required checks ran
- user-visible changes have fresh visual/interaction evidence
- refactor stayed behavior-preserving or was split into its own block
- evidence and next-block handoff are recorded

## Cross-AI Review

Use another AI review when ordering risk, acceptance coverage, or architecture risk is high.

```text
Review this Directed Development plan for missing acceptance scenarios, dependency-order mistakes, oversized Feature Blocks, and verification gates that do not prove the stated behavior. Do not propose artifact locations; those are outside DD.
```

Director judgment remains final.

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Letting DD choose document locations | Follow Superpowers and project instructions |
| Turning BDD into implementation details | Keep scenarios observable to users or systems |
| Loading every future block | Load current block context only; skim future dependencies |
| Treating game feel like backend protocol | Use screenshots, interaction proof, and owner judgment |
| Skipping TDD for behavior-critical code | Use Superpowers TDD unless the project records an exception |
| Letting DD override project rules | Project rules and runtime truth win |

## Support File

For structural review, use `orchestration-checklist.md` next to this skill.
