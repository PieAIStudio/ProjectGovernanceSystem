---
id: REF-DOWNSTREAM-PROJECT-REGISTRY
title: Downstream Project Registry
type: reference
status: active
canonical: true
owner: human
created: 2026-06-09
last_reviewed: 2026-06-21
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

The current downstream set was checked on 2026-06-21.

| Project | Local path | Profile | Installed doc-gov | Installed pro-gov | Health snapshot | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Anvil | `/Users/yuanfei/PieAI/Anvil` | `engineering-runtime` | `0.3.5` | `0.3.5` | Healthy | Synchronized at commit `787d37a`. `docs:check`, `typecheck`, `test`, and `lint` pass. Existing unrelated local writing work was preserved. |
| Collapse | `/Users/yuanfei/PieAI/Collapse` | `engineering-runtime` | `0.3.5` | `0.3.5` | Healthy | Synchronized at commit `2e220df`. `docs:check`, `test`, and `build` pass. |
| Non-Heroes | `/Users/yuanfei/PieAI/Non-Heroes` | `engineering-runtime` | `0.3.5` | `0.3.5` | Healthy | Synchronized at commit `f3b9b02`. `docs:check`, `typecheck`, `test`, and `build` pass after refreshing pnpm workspace links. |
| PieAIStudio-Site | `/Users/yuanfei/PieAI/PieAIStudio-Site` | `engineering-runtime` | `0.3.5` | `0.3.5` | Healthy | Synchronized at commit `5501c84`. `docs:check`, `typecheck`, `lint`, and `build` pass after clearing stale `.next` generated types. Existing unrelated local site docs were preserved. |
| PieHQ | `/Users/yuanfei/PieAI/PieHQ` | `doc-only` | `0.3.5` | `0.3.5` | Healthy | Synchronized at commit `0a58cd7`. `docs:check` passes with 0 warnings. Existing unrelated local FounderLogs and `.DS_Store` changes were preserved. |
| Sea | `/Users/yuanfei/PieAI/Sea` | `engineering-runtime` | `0.3.5` | `0.3.5` | Governance healthy / project test warning | Synchronized at commit `0d95bd52b`. `docs:check` and `build:packages` pass. Full `test` still has unrelated business test failures in shell sidebar CSS expectations and workspace drawer mocks. Existing unrelated shared-rule deletion was preserved. |
| Show | `/Users/yuanfei/PieAI/Show` | `engineering-runtime` | `0.3.5` | `0.3.5` | Healthy | Synchronized at commit `c7eda40`. `docs:check`, `typecheck`, `test`, `lint`, and `build` pass. Existing unrelated local MCP/shared-rule changes were preserved. |
| SupaLuv | `/Users/yuanfei/PieAI/SupaLuv` | `engineering-runtime` | `0.3.5` | `0.3.5` | Healthy | Synchronized at commit `23c5b0c`. `docs:check`, `typecheck`, `test`, and `build` pass. Existing unrelated local skill and vendored-tool cleanup work was preserved. |
| YaZu | `/Users/yuanfei/PieAI/YaZu` | `engineering-runtime` | `0.3.5` | `0.3.5` | Healthy | Synchronized at commit `9a40f1f`. `docs:check`, `typecheck`, `test`, `lint`, and `build` pass. |
| TuringPact | `/Users/yuanfei/PieAI/TuringPact` | `engineering-runtime` | `0.3.5` | `0.3.5` | Healthy | Synchronized at commit `93bcf9c`. `docs:check`, `typecheck`, `test`, `lint`, and `build` pass. |

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
- ProjectLens is no longer tracked as a downstream repository because
  `/Users/yuanfei/PieAI/ProjectLens` no longer exists locally. Its reusable
  inspection capability now lives in this repository's `pro-gov lens` surface.
