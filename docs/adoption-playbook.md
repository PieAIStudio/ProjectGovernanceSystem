# Adoption Playbook

Use this when a project wants to migrate into the Project Governance System.

## The Short Version

1. Pick one profile.
2. Inventory the project's current docs/rules.
3. Install or copy doc-gov.
4. Add starter docs/governance files.
5. Add the selected routing/profile rules.
6. Move current truth into the governed layers.
7. Archive or delete old systems.
8. Run validation.

Do not migrate by slowly adding random files. Migrate by making one clear current work surface.

## Step 1: Pick A Profile

| Project kind | Profile |
| --- | --- |
| App / game / runtime / service / browser product | `engineering-runtime` |
| IP / writing / research / AI media / asset library | `doc-only` |

If unsure, pick `doc-only` first. Add engineering routing only when the project has real runtime/code behavior that needs lane-specific proof.

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

- compare or copy `packages/doc-gov/` into the target project's `tools/doc-gov/`
- preserve project-local package scripts
- ensure `completed` exists in lifecycle/schema
- run the target project's doc-gov checks

Later Stage 2 method:

```bash
pnpm add -D @pieai/doc-gov
```

Do not jump to Stage 2 until package installation is deliberately enabled.

## Step 4: Add Starter Structure

Use `starter/` as the reference, but keep local facts local.

Required concepts:

- `docs/README.md`
- `governance/agent-rules.md`
- `governance/doc-types.md`
- `governance/best-practice-for-this-project.md`
- `docs/reference/execution/current-work.md`
- `docs/plans/active/`
- `docs/plans/completed/`
- `docs/specs/active/`
- `docs/specs/completed/`
- `docs/archive/`

## Step 5: Apply The Profile

### Engineering Runtime

Add:

- `routing/engineering-task-routing.md`
- `integrations/superpowers.md`
- `integrations/directed-development.md`
- engineering lane summary in `AGENTS.md`
- detailed lane profile in `governance/best-practice-for-this-project.md`

The project must define local lanes and proof commands.

### Doc-Only

Add:

- `routing/doc-only-routing.md`
- SSOT and AI-in-the-Loop rules
- canon/provenance/archive rules in `governance/best-practice-for-this-project.md`

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

This is not the task-routing algorithm.

## Step 7: Retire Old Systems

Old documentation systems must become one of:

- migrated into the governed layers
- archived under `docs/archive/`
- deleted if stale and misleading

Do not keep old and new current surfaces alive together.

## Step 8: Validate

Minimum:

```bash
pnpm doc-gov check
pnpm doc-gov scan --check
git diff --check
```

Engineering projects should also run their local verification ladder.

## Example: Migrating SupaChats

If SupaChats is an app/runtime project:

1. Pick `engineering-runtime`.
2. Inventory existing docs and current runtime truth.
3. Copy/sync `packages/doc-gov` into `SupaChats/tools/doc-gov` or wire the local package if package install is enabled.
4. Add governed `docs/` and `governance/` starter files.
5. Write `SupaChats/governance/best-practice-for-this-project.md` with SupaChats-specific truth, stack, lanes, and verification commands.
6. Create `docs/reference/execution/current-work.md`.
7. Move current plans into `docs/plans/active/`; move finished plans into `docs/plans/completed/`.
8. Move stable product truth into `docs/canon/`; guides into `docs/reference/`; historical material into `docs/archive/`.
9. Delete or archive old parallel doc roots.
10. Run validation and commit the migration as a clean checkpoint.

If SupaChats is mostly a docs/content workspace, start with `doc-only` instead and do not install engineering routing until real runtime work requires it.
