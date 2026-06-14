---
id: REF-DOWNSTREAM-PROJECT-REGISTRY
title: Downstream Project Registry
type: reference
status: active
canonical: true
owner: human
created: 2026-06-09
last_reviewed: 2026-06-14
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
- Keep only projects that currently exist and are expected to receive future
  governance updates. Remove deleted or superseded projects instead of keeping
  stale health rows.
- Treat package versions as the versions installed in the downstream project's
  `package.json`. Record both packages when the project has completed
  package-based adoption.
- Treat health as a snapshot. A project can be on the latest version but still
  have local working-tree cleanup in progress.
- Do not add a project-specific profile here unless at least two projects need
  the same reusable profile.
- Do not use this registry to freeze the upstream local checkout path. The
  current local upstream folder may be `ProjectGovernanceSystem`, but downstream
  governed docs should prefer `@pieai/doc-gov`, `@pieai/pro-gov`, and "Project
  Governance System upstream repository" wording over machine-local paths.

## Current Downstream Projects

The current downstream set was checked on 2026-06-14.

| Project | Local path | Profile | Installed doc-gov | Installed pro-gov | Health snapshot | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Anvil | `/Users/yuanfei/PieAI/Anvil` | `engineering-runtime` | `0.3.3` | `0.3.3` | Healthy | `docs:check` passes with 0 warnings. Existing unrelated local writing work was preserved. |
| Collapse | `/Users/yuanfei/PieAI/Collapse` | `engineering-runtime` | `0.3.3` | `0.3.3` | Healthy | Adopted the thin placeholder-phase runtime profile. `docs:check` and the production build pass. |
| Non-Heroes | `/Users/yuanfei/PieAI/Non-Heroes` | `engineering-runtime` | `0.3.3` | `0.3.3` | Healthy | `docs:check` passes with 0 warnings. |
| PieAIStudio-Site | `/Users/yuanfei/PieAI/PieAIStudio-Site` | `engineering-runtime` | `0.3.3` | `0.3.3` | Healthy | `docs:check` passes with 0 warnings. Existing unrelated local skill links were preserved. |
| PieHQ | `/Users/yuanfei/PieAI/PieHQ` | `doc-only` | `0.3.3` | `0.3.3` | Healthy | `docs:check` passes with 0 warnings. |
| Sea | `/Users/yuanfei/PieAI/Sea` | `engineering-runtime` | `0.3.3` | `0.3.3` | Healthy | `docs:check` passes with 0 warnings across the large governed-doc set. |
| Show | `/Users/yuanfei/PieAI/Show` | `engineering-runtime` | `0.3.3` | `0.3.3` | Healthy | `docs:check` passes with 0 warnings. |
| SupaLuv | `/Users/yuanfei/PieAI/SupaLuv` | `engineering-runtime` | `0.3.3` | `0.3.3` | Healthy | Migrated from the vendored `doc-gov@0.2.0` copy. `docs:check` and `cloud:check` pass; unrelated local content work was preserved. |
| YaZu | `/Users/yuanfei/PieAI/YaZu` | `engineering-runtime` | `0.3.3` | `0.3.3` | Healthy | `docs:check` passes with 0 warnings. |
| TuringPact | `/Users/yuanfei/PieAI/TuringPact` | `engineering-runtime` | `0.3.3` | `0.3.3` | Healthy | Migrated the legacy `Docs/` system into current, completed, and archive layers. `docs:check` and `verify:web` pass. |
| ProjectLens | `/Users/yuanfei/PieAI/ProjectLens` | `doc-only` | `0.3.3` | `0.3.3` | Healthy | `docs:check` passes with 0 warnings. ProjectLens is a project-level audit workspace, not a runtime product. |

## Representative Examples

The `examples/` directory is not the full registry. It contains representative
case studies:

- `examples/non-heroes/example.md` for an engineering-runtime product.

Add a new example only when a project teaches a reusable adoption pattern that
the existing examples do not cover.

## Removal / Rename Notes

- `Supa` is no longer tracked here because that project was renamed/replaced by
  `Non-Heroes`.
- `story-creator` is no longer tracked because the repository was renamed and
  replaced by `Anvil`.
- `PieFlow` and `PieIP` were removed from the current registry on 2026-06-14
  because those projects were deleted.
- GitNexus is intentionally absent. It has been removed from the central system
  and should not be reintroduced through downstream policy links.
