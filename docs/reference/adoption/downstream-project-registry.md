---
id: REF-DOWNSTREAM-PROJECT-REGISTRY
title: Downstream Project Registry
type: reference
status: active
canonical: true
owner: human
created: 2026-06-09
last_reviewed: 2026-06-13
domain: adoption
tags:
  - downstream
  - adoption
  - registry
pinned: false
related:
  - REF-PROJECT-RELATIONSHIP
  - POLICY-SYNC-STRATEGY
---

# Downstream Project Registry

This registry is the central Project Governance System ledger for known local
projects that have adopted this system.

It records governance adoption state, not product truth. Product plans, runtime
details, IP canon, audit outputs, and project-specific policies remain in the
downstream projects.

## Registry Rules

- Update this file when a project adopts, leaves, renames, or changes profile.
- Treat package versions as the versions installed in the downstream project's
  `package.json`. Existing rows may list only `doc-gov` until that project is
  intentionally synced to `pro-gov`.
- Treat health as a snapshot. A project can be on the latest version but still
  have local working-tree cleanup in progress.
- Do not add a project-specific profile here unless at least two projects need
  the same reusable profile.
- Do not use this registry to freeze the upstream local checkout path. The
  current local upstream folder may be `ProjectGovernanceSystem`, but downstream
  governed docs should prefer `@pieai/doc-gov`, `@pieai/pro-gov`, and "Project
  Governance System upstream repository" wording over machine-local paths.

## Current Downstream Projects

Checked on 2026-06-09.

| Project | Local path | Profile | Installed doc-gov | Health snapshot | Notes |
| --- | --- | --- | --- | --- | --- |
| Non-Heroes | `/Users/yuanfei/PieAI/Non-Heroes` | `engineering-runtime` | `0.3.2` | Partial | Package and router are current; local doc migration work is in progress, so `doctor` currently fails on moved/archive reference docs until that project is cleaned up. |
| Show | `/Users/yuanfei/PieAI/Show` | `engineering-runtime` | `0.3.2` | Healthy | `router-check` and `doctor` pass. |
| PieFlow | `/Users/yuanfei/PieAI/PieFlow` | `engineering-runtime` | `0.3.2` | Healthy | `router-check` and `doctor` pass. |
| story-creator | `/Users/yuanfei/PieAI/_NovelFrameworks/story-creator` | `engineering-runtime` | `0.3.2` | Healthy | Uses engineering routing because the repository contains a TypeScript CLI, tests, hooks, gates, and writing-system runtime. |
| PieAIStudio-Site | `/Users/yuanfei/PieAI/PieAIStudio-Site` | `engineering-runtime` | `0.3.2` | Healthy | `router-check` and `doctor` pass. |
| PieHQ | `/Users/yuanfei/PieAI/PieHQ` | `doc-only` | `0.3.2` | Healthy | `router-check` and `doctor` pass; unrelated FounderLogs work is present locally. |
| PieIP | `/Users/yuanfei/PieAI/PieIP` | `doc-only` | `0.3.2` | Healthy | `router-check` and `doctor` pass. |
| ProjectLens | `/Users/yuanfei/PieAI/ProjectLens` | `doc-only` | `0.3.2` | Healthy | `router-check` and `doctor` pass; ProjectLens is a project-level audit workspace, not a runtime product. |

## Representative Examples

The `examples/` directory is not the full registry. It contains representative
case studies:

- `examples/non-heroes/example.md` for an engineering-runtime product.
- `examples/pieflow/example.md` for a complex app/runtime product.
- `examples/pieip/example.md` for a doc-only AI media / asset-governance
  project.

Add a new example only when a project teaches a reusable adoption pattern that
the existing examples do not cover.

## Removal / Rename Notes

- `Supa` is no longer tracked here because that project was renamed/replaced by
  `Non-Heroes`.
- GitNexus is intentionally absent. It has been removed from the central system
  and should not be reintroduced through downstream policy links.
