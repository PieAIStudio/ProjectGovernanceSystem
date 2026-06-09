---
id: REF-PROJECT-RELATIONSHIP
title: Project Governance System Project Relationship Model
type: reference
status: stable
canonical: true
owner: human
created: 2026-05-06
last_reviewed: 2026-06-05
domain: adoption
tags:
  - ownership
  - upstream
  - project-local
pinned: false
related:
  - POLICY-UPSTREAMING
  - POLICY-SYNC-STRATEGY
---

# Project Relationship Model

This file answers the most important beginner question:

> If Non-Heroes already has doc-gov, and this central repo now exists, who owns what?

## Short Answer

The central repo owns the **engine**. Each project owns its **local product content**.

| Thing | Owner |
| --- | --- |
| Status lifecycle, document types, SSOT, agents routing, CLI checks, templates | `project-governance-system` |
| Non-Heroes product plans, runtime canon, product rules | Non-Heroes |
| PieFlow product truth, connector rules, browser lanes | PieFlow |
| PieIP character/script/asset governance | PieIP |
| Current downstream adoption list and health snapshot | `docs/reference/adoption/downstream-project-registry.md` |

## Does Non-Heroes Now Import This Repo?

Not yet automatically.

Known downstream projects are listed in
`docs/reference/adoption/downstream-project-registry.md`.

Originally Non-Heroes, PieFlow, and PieIP had local working copies because the
system was born inside active projects. This central repo is now the upstream
source, and downstream projects should use `@pieai/doc-gov` plus their selected
profile instead of keeping a private CLI copy.

## Why Not Auto-Symlink Everything?

Because project governance has two kinds of files:

1. **Shared/core files** that can be linked or packaged.
2. **Project-local files** that must stay local.

The old `governance/` folder mixed both kinds. The clearer split is:

- `docs/governance/` contains doc-system rules, SSOT, agents-routing, document types, templates, and manifest.
- `docs/policy/` contains project-local AI development policy, lane wording, proof commands, and truth hierarchy.

Symlinking or copying the whole policy layer would be wrong because Non-Heroes and PieFlow need different local lane profiles. The safe rule:

- shared rules may be symlinked
- doc-gov core should become an installed/copied package
- project profiles are templates
- project-local best-practice files remain in each project's `docs/policy/`
- product artifacts outside `docs/**` stay in the product package unless a project explicitly opts them into doc-gov

## How Non-Heroes Improvements Flow Upstream

When Non-Heroes discovers a better governance rule:

1. Ask: is this core, profile, or Non-Heroes-local?
2. If core, update this repo.
3. If profile, update the relevant `profiles/**`.
4. If Non-Heroes-local, keep it in Non-Heroes.
5. Other projects then upgrade from this central source.

Example:

- An active project discovered active plans were piling up.
- The generic fix is a `completed` lifecycle state.
- Therefore `completed` belongs in this repo's doc-gov core.

## How PieFlow And PieIP Upgrade

Use an explicit migration task:

1. Pick the profile:
   - engineering-runtime projects: apps, services, runtimes, websites, games,
     CLIs, and behavior-critical systems
   - doc-only projects: IP, research, audit, media, and asset-governance
     workspaces without behavior-critical runtime work
2. Confirm the project uses `@pieai/doc-gov` as its CLI source.
3. Compare local `docs/governance/` and `docs/policy/` starter docs against `starter/`.
4. Compare selected local agents-routing against `docs/governance/agents-routing/`.
5. Compare local shared AI work rules against their external SSOT targets, such
   as symlinked files under `docs/policy/shared-rules/`.
6. Keep project-local docs and product artifacts local.
7. Run project validation.

This is AI-assisted comparison now. Later it can become `doc-gov migrate`.
