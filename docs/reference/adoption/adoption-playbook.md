---
id: REF-ADOPTION-PLAYBOOK
title: Project Governance System Adoption Playbook
type: reference
status: stable
canonical: true
owner: human
created: 2026-05-06
last_reviewed: 2026-06-05
domain: adoption
tags:
  - adoption
  - migration
  - profiles
pinned: false
related:
  - POLICY-SYNC-STRATEGY
  - REF-PROJECT-RELATIONSHIP
---

# Adoption Playbook

Use this when a project wants to migrate into the Project Governance System.

## The Short Version

1. Pick one profile.
2. Inventory the project's current docs/rules.
3. Install or copy doc-gov.
4. Add starter `docs/governance/` and `docs/policy/` files.
5. Add the selected `docs/governance/agents-routing/` profile rule.
6. Move current truth into the governed layers.
7. Archive or delete old systems.
8. Run validation.

Do not migrate by slowly adding random files. Migrate by making one clear current work surface.

## Step 1: Pick A Profile

| Project kind | Profile |
| --- | --- |
| App / game / runtime / service / browser product | `engineering-runtime` |
| IP / writing / research / AI media / asset library | `doc-only` |

If unsure, pick `doc-only` first. Add engineering agents routing only when the project has real runtime/code behavior that needs lane-specific proof.

## Step 2: Inventory Current Truth

Before moving anything, list:

- current project router files (`AGENTS.md`, `CLAUDE.md`, etc.)
- current docs index files
- current active plans/specs
- current canon/reference/archive locations
- old/legacy documentation roots
- project-local runtime truth, if any

## Step 3: Install The Governance Core

Current Stage 0 method:

- compare or sync `packages/doc-gov/` into the target project's `tools/doc-gov/`
  as a temporary local copy
- preserve project-local package scripts
- run `doc-gov migrate --profile <engineering-runtime|doc-only> --check` before
  changing files so profile mismatches fail early
- run `doc-gov router-check` after the sync so stale router/profile paths fail
  mechanically
- copy `starter/lefthook.template.yml` to `lefthook.yml` and
  `starter/.github/workflows/docs-check.yml` to `.github/workflows/docs-check.yml`
  when the target project is ready for standard guardrails
- run `doc-gov doctor` after wiring guardrails to verify they are actually
  connected
- treat the local copy as a downstream mirror, not an independent fork

Later Stage 2 method:

```bash
pnpm add -D @pieai/doc-gov
```

Do not jump to Stage 2 until package installation is deliberately enabled.
Do not use an absolute-path script as the default for collaborators; it is fine
for one local machine, but it is brittle once a repo moves or another person
checks it out.

## Step 4: Add Starter Structure

Use `starter/` as the reference, but keep local facts local.

Required concepts:

- `docs/reference/documentation-map.md`
- `docs/governance/boundary.md`
- `docs/governance/ssot-v0.9.md`
- `docs/governance/doc-agent-rules.md`
- `docs/governance/doc-types.md`
- `docs/governance/agents-routing/<selected-profile>-v0.9.md`
- `docs/governance/templates/*.md`
- `docs/policy/best-practice-for-this-project.md`
- `docs/reference/execution/current-work.md`
- `docs/plans/active/`
- `docs/plans/completed/`
- `docs/specs/active/`
- `docs/specs/completed/`
- `docs/archive/`
- `AGENTS.md` as the project router
- `CLAUDE.md` as a thin adapter that forwards to `AGENTS.md`

## Step 5: Apply The Profile

### Engineering Runtime

Add:

- `docs/governance/agents-routing/engineering-runtime-v0.9.md`
- engineering lane summary in `AGENTS.md`
- detailed lane profile in `docs/policy/best-practice-for-this-project.md`

The project must define local lanes and proof commands.
Do not copy the upstream root `integrations/` directory into target projects by default.
If a project needs local external-workflow guidance, keep it thin in `AGENTS.md` or put project-specific notes under `docs/reference/integrations/`.

### Doc-Only

Add:

- `docs/governance/agents-routing/doc-only-v0.9.md`
- `docs/governance/ssot-v0.9.md`
- AI-in-the-Loop rules linked from the project's external shared-rule source
- canon/provenance/archive rules in `docs/policy/best-practice-for-this-project.md`

Do not add Superpowers TDD or Directed Development by default.

## Step 6: Create Current Work

Create or update:

```text
docs/reference/execution/current-work.md
```

This file answers:

- What is active now?
- Which plan/spec is current?
- Where are completed proof records?
- What should a new AI session read next?

This is not the agents-routing algorithm.

## Step 7: Retire Old Systems

Old documentation systems must become one of:

- migrated into the governed layers
- archived under `docs/archive/`
- deleted if stale and misleading

Do not keep old and new current surfaces alive together.

Do not migrate product artifacts into `docs/**` just because they are Markdown.
Prompts, generated media notes, project-package canon, source assets, and
workbench files stay in their product package unless the project explicitly opts
them into doc-gov.

For the v0.9 structural migration, use
`docs/reference/adoption/migration-v0.9.md` as the checklist.

## Step 8: Validate

Minimum:

```bash
pnpm doc-gov check
pnpm doc-gov router-check
pnpm doc-gov scan --check
pnpm doc-gov links
pnpm doc-gov audit
pnpm doc-gov doctor
git diff --check
```

Engineering projects should also run their local verification ladder.

## Example: Migrating A Runtime Product

If the target project is an app/runtime project:

1. Pick `engineering-runtime`.
2. Inventory existing docs and current runtime truth.
3. Install `@pieai/doc-gov` or keep the existing local tool copy until the project is ready to move scripts and CI together.
4. Add governed `docs/governance/` and `docs/policy/` starter files.
5. Write `docs/policy/best-practice-for-this-project.md` with project-specific truth, stack, lanes, and verification commands.
6. Create `docs/reference/execution/current-work.md`.
7. Move current plans into `docs/plans/active/`; move finished plans into `docs/plans/completed/`.
8. Move stable product truth into `docs/canon/`; guides into `docs/reference/`; historical material into `docs/archive/`.
9. Delete or archive old parallel doc roots.
10. Run validation and commit the migration as a clean checkpoint.

If the project is mostly a docs/content workspace, start with `doc-only` instead and do not install engineering routing until real runtime work requires it.
