---
id: REF-MIGRATION-V0-9
title: Project Governance System v0.9 Migration Checklist
type: reference
status: stable
canonical: true
owner: human
created: 2026-05-09
last_reviewed: 2026-06-04
domain: adoption
tags:
  - migration
  - v0.9
  - router-check
pinned: false
related:
  - REF-ADOPTION-PLAYBOOK
  - POLICY-VERSIONING
---

# v0.9 Migration Checklist

Use this checklist when moving a project from the older root `governance/` or
`routing/` shape to the current Project Governance System boundary.

## Required Moves

Move documentation governance into `docs/governance/`:

- `governance/agent-rules.md` -> `docs/governance/doc-agent-rules.md`
- `governance/doc-types.md` -> `docs/governance/doc-types.md`
- `governance/README.md` -> `docs/governance/boundary.md`
- `governance/MANIFEST.yml` -> `docs/governance/MANIFEST.yml`
- `governance/templates/` -> `docs/governance/templates/`

Move project AI/development policy into `docs/policy/`:

- `governance/best-practice-for-this-project.md` -> `docs/policy/best-practice-for-this-project.md`
- `governance/refactor-rules.md` -> `docs/policy/refactor-rules.md`
- eligible `governance/shared-rules/` entries -> `docs/policy/shared-rules/`,
  preferably as links to their external SSOT sources. Skip `ssot.md` and
  `task-routing.md`; those move into `docs/governance/` as listed below.

Move reusable governance rules into the new core:

- old SSOT rule -> `docs/governance/ssot-v0.9.md`
- old task routing rule -> selected file under `docs/governance/agents-routing/`

## Required Deletions

After the move, these should not exist:

- root `governance/`
- root `routing/`
- `starter/governance/`
- `docs/policy/shared-rules/ssot.md`
- `docs/policy/shared-rules/task-routing.md`
- non-root `README.md` under governed docs

## Required Checks

```bash
pnpm doc-gov check
pnpm doc-gov router-check
pnpm doc-gov scan --check
pnpm doc-gov links
pnpm doc-gov audit
pnpm doc-gov doctor
git diff --check
```

For engineering projects, also run the project's normal typecheck/test/build
ladder. For doc-only projects, run the project's content/workbench validation
commands.
