---
id: REF-PROJECT-RELATIONSHIP
title: Project Governance System Project Relationship Model
type: reference
status: stable
canonical: true
owner: human
created: 2026-05-06
last_reviewed: 2026-05-07
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

> If Supa already has doc-gov, and this central repo now exists, who owns what?

## Short Answer

The central repo owns the **engine**. Each project owns its **local product content**.

| Thing | Owner |
| --- | --- |
| Status lifecycle, document types, SSOT, agents routing, CLI checks, templates | `project-governance-system` |
| Supa Phase03 plans, Boss Race canon, game runtime rules | Supa |
| PieFlow product truth, connector rules, browser lanes | PieFlow |
| PieIP character/script/asset governance | PieIP |

## Does Supa Now Import This Repo?

Not yet automatically.

Right now Supa, PieFlow, and PieIP have local working copies because the system was born inside active projects. This central repo is the new upstream source. The next migration step is to make each project compare against it, then eventually install or sync from it.

## Why Not Auto-Symlink Everything?

Because project governance has two kinds of files:

1. **Shared/core files** that can be linked or packaged.
2. **Project-local files** that must stay local.

The old `governance/` folder mixed both kinds. The clearer split is:

- `docs/governance/` contains doc-system rules, SSOT, agents-routing, document types, templates, and manifest.
- `docs/policy/` contains project-local AI development policy, lane wording, proof commands, and truth hierarchy.

Symlinking or copying the whole policy layer would be wrong because Supa and PieFlow need different local lane profiles. The safe rule:

- shared rules may be symlinked
- doc-gov core should become an installed/copied package
- project profiles are templates
- project-local best-practice files remain in each project's `docs/policy/`
- product artifacts outside `docs/**` stay in the product package unless a project explicitly opts them into doc-gov

## How Supa Improvements Flow Upstream

When Supa discovers a better governance rule:

1. Ask: is this core, profile, or Supa-local?
2. If core, update this repo.
3. If profile, update the relevant `profiles/**`.
4. If Supa-local, keep it in Supa.
5. Other projects then upgrade from this central source.

Example:

- Supa discovered active plans were piling up.
- The generic fix is a `completed` lifecycle state.
- Therefore `completed` belongs in this repo's doc-gov core.

## How PieFlow And PieIP Upgrade

Use an explicit migration task:

1. Pick the profile:
   - Supa: `profiles/engineering-runtime/` plus Supa-local game rules
   - PieFlow: `profiles/engineering-runtime/`
   - PieIP: `profiles/doc-only/`
2. Compare local `tools/doc-gov` against `packages/doc-gov`.
3. Compare local `docs/governance/` and `docs/policy/` starter docs against `starter/`.
4. Compare selected local agents-routing against `docs/governance/agents-routing/`.
5. Compare local shared AI work rules against their external SSOT targets, such
   as symlinked files under `docs/policy/shared-rules/`.
6. Keep project-local docs and product artifacts local.
7. Run project validation.

This is AI-assisted comparison now. Later it can become `doc-gov migrate`.
