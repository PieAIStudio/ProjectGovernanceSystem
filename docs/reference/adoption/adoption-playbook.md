---
id: REF-ADOPTION-PLAYBOOK
title: Project Governance System Adoption Playbook
type: reference
status: stable
canonical: true
owner: human
created: 2026-05-06
last_reviewed: 2026-06-15
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

Before choosing external AI workflow tools, read
`docs/reference/adoption/recommended-agent-tooling.md`. It explains which PGS
packages are required, when Superpowers is recommended, and why Ponytail should
remain globally `off` until it is tested in an isolated task.

## The Short Version

1. Pick one profile.
2. Inventory the project's current docs/rules.
3. Install the governance packages.
4. Run project and agent-asset discovery.
5. Add starter `docs/governance/` and `docs/policy/` files.
6. Add the selected `docs/governance/agents-routing/` profile rule.
7. Move current truth into the governed layers.
8. Archive or delete old systems.
9. Run validation.

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

Current package-based method:

- install `@pieai/pro-gov` as the target project's project-level asset source
- install `@pieai/doc-gov` as the target project's validator CLI source
- preserve project-local package scripts
- run `pro-gov init --profile <engineering-runtime|doc-only> --dry-run` to see
  the starter files that would be installed
- run `pro-gov sync --check` to compare reusable starter files without changing
  the project
- run `pro-gov assets discover --target <path>` and
  `pro-gov assets recommend --target <path>` to collect local project signals
  and suggested agent-asset bundles without changing the project
- run `pro-gov lens inspect --target <path>` when the project needs a
  ProjectLens-style local evidence packet
- run `doc-gov migrate --profile <engineering-runtime|doc-only> --check` before
  changing files so profile mismatches fail early
- run `doc-gov router-check` after the sync so stale router/profile paths fail
  mechanically
- copy `starter/lefthook.template.yml` to `lefthook.yml` and
  `starter/.github/workflows/docs-check.yml` to `.github/workflows/docs-check.yml`
  when the target project is ready for standard guardrails
- run `doc-gov doctor` after wiring guardrails to verify they are actually
  connected
- treat the npm package as the CLI source and the local `docs/governance/`
  files as the project's checked-in governance contract

Later Stage 2 method:

```bash
pnpm add -D @pieai/pro-gov @pieai/doc-gov
```

Do not jump to write-mode installation until package installation is
deliberately enabled and the read-only checks are understood.
Do not use an absolute-path script as the default for collaborators; it is fine
for one local machine, but it is brittle once a repo moves or another person
checks it out.

Keep the upstream checkout path out of reusable project wiring. The central
repository and local checkout currently use `ProjectGovernanceSystem`, while
the private workspace package name is `pro-gov`. Target projects should use
`@pieai/pro-gov` and `@pieai/doc-gov` for commands, use the canonical GitHub URL
for public links, and refer to the source as the Project Governance System
upstream repository.

### Optional: Managed Agent Assets

Agent assets are skills, rules, and commands exposed to AI hosts. They are not
the same as governed project docs.

Use this flow from a maintainer checkout that contains local-only
`agent-assets/`, or from reviewed public assets under `public-agent-assets/`.
The public npm package excludes unpublished asset bodies by design:

```bash
pro-gov assets discover --target /path/to/project --json
pro-gov assets recommend --target /path/to/project --json
pro-gov assets plan --target /path/to/project --bundle base-governance --host codex --out /tmp/pro-gov-asset-plan.json
pro-gov assets apply --plan /tmp/pro-gov-asset-plan.json
pro-gov assets check --target /path/to/project --json
```

The plan file is the safety gate. Review it before applying. It creates managed
symlinks and `.pro-gov/assets.lock.json`; it should not overwrite unmanaged
project files.

Managed symlinks are relative by default. A target project's normal
`assets check` validates the local lock and linked content without requiring the
public package to know a maintainer's private registry. Maintainers can add
`--strict-registry`, or run `pro-gov portfolio assets-check --config
/path/to/portfolio.json`, when they need central private-registry validation.

When a maintainer promotes a private asset into `public-agent-assets/`, the
public registry must record the private-source hash and the public-copy hash.
Run this in the upstream checkout before publishing:

```bash
pro-gov assets public-check --json
```

Downstream projects do not need the private `agent-assets/` tree for normal
package-based adoption.

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

Ponytail is also optional. If it is installed, keep its global mode `off` and
activate it only for a bounded task or review after reading
`integrations/ponytail.md`.

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
3. Install `@pieai/pro-gov` and `@pieai/doc-gov`, or keep the existing local
   tool copy until the project is ready to move scripts and CI together.
4. Add governed `docs/governance/` and `docs/policy/` starter files.
5. Write `docs/policy/best-practice-for-this-project.md` with project-specific truth, stack, lanes, and verification commands.
6. Create `docs/reference/execution/current-work.md`.
7. Move current plans into `docs/plans/active/`; move finished plans into `docs/plans/completed/`.
8. Move stable product truth into `docs/canon/`; guides into `docs/reference/`; historical material into `docs/archive/`.
9. Delete or archive old parallel doc roots.
10. Run validation and commit the migration as a clean checkpoint.

If the project is mostly a docs/content workspace, start with `doc-only` instead and do not install engineering routing until real runtime work requires it.
