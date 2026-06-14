---
id: PLAN-0002
title: Ten Project Governance Adoption Refresh
type: plan
status: completed
canonical: true
owner: ai-assisted
created: 2026-06-14
last_reviewed: 2026-06-14
domain: adoption
tags:
  - adoption
  - downstream
  - migration
  - package-sync
pinned: false
related:
  - REF-ADOPTION-PLAYBOOK
  - REF-DOWNSTREAM-PROJECT-REGISTRY
  - POLICY-SYNC-STRATEGY
  - POLICY-VERSIONING
supersedes: []
superseded_by: null
---

# Ten Project Governance Adoption Refresh

> **For agentic workers:** Execute this plan task by task. Keep downstream
> project facts local, preserve dirty working trees, and do not commit or push
> without explicit user approval.

**Goal:** Bring the ten named PieAI projects onto one current Project Governance
System contract: governance v0.9, `@pieai/doc-gov@0.3.3`,
`@pieai/pro-gov@0.3.3`, a predictable `docs:check` entrypoint, and standard
hooks/CI where missing.

**Architecture:** Use a tiered migration. Healthy adopters receive package and
script updates only. SupaLuv leaves its vendored validator and completes
package-based adoption. Collapse receives the thinnest valid runtime profile.
TuringPact receives a semantic migration from its legacy `Docs/` system so
current truth, active work, completed proof, and archive history are no longer
mixed.

**Safety:** Never overwrite project-local product truth with starter text.
Treat `pro-gov sync --check` as an informational comparison because local
project policy is expected to differ from the starter. Use `doc-gov` checks and
project verification as the acceptance gates.

## Task 1: Freeze The Audit Baseline

- [x] Confirm current npm versions for both governance packages.
- [x] Record profile, package source, package version, router state, hooks, CI,
  diagnostics, and working-tree state for all ten repositories.
- [x] Re-run diagnostics with `@pieai/doc-gov@0.3.3`.
- [x] Confirm archive link-check behavior from validator source.
- [x] Confirm package write-mode installation is not available.

## Task 2: Refresh Healthy Existing Adopters

Repositories:

- Anvil
- Non-Heroes
- PieAIStudio-Site
- PieHQ
- Sea
- Show
- YaZu

- [x] Add `@pieai/pro-gov@0.3.3`.
- [x] Upgrade `@pieai/doc-gov` from `0.3.2` to `0.3.3`.
- [x] Add a `pro-gov` package script.
- [x] Make `docs:check` start with `pnpm pro-gov doctor`.
- [x] Preserve all unrelated working-tree changes.
- [x] Run each repository's governance verification.

## Task 3: Adopt Collapse

- [x] Install both governance packages and Lefthook.
- [x] Add the engineering-runtime starter contract.
- [x] Keep the router and project policy limited to the placeholder phase.
- [x] Replace machine-local archive references with portable wording.
- [x] Add `docs:check`, hooks, and docs CI.
- [x] Generate the governance manifest.
- [x] Run governance checks and the existing production build.

## Task 4: Complete SupaLuv Package Migration

- [x] Install both governance packages and Lefthook.
- [x] Replace the vendored `tools/doc-gov` command with package CLIs.
- [x] Remove only the obsolete vendored validator package.
- [x] Keep `tools/storygraph` and all unrelated local work intact.
- [x] Make policy startup reading recursive and symlink-aware.
- [x] Remove the machine-local upstream path from governed routing.
- [x] Add hooks and docs CI.
- [x] Regenerate the manifest with the current validator.
- [x] Run governance checks and the repository's existing cloud verification.

## Task 5: Semantically Migrate TuringPact

- [x] Install both governance packages and Lefthook.
- [x] Add the engineering-runtime governance core, router, hooks, and docs CI.
- [x] Replace the legacy router with a PGS router plus project-local runtime
  facts.
- [x] Keep the active commercialization plan as the current execution source.
- [x] Move stable product and architecture truth into current governed layers.
- [x] Move completed engineering plans into `docs/plans/completed/`.
- [x] Move gate evidence, old reports, old research, and historical runtime
  proof into `docs/archive/`.
- [x] Rename nested archive `README.md` files to purpose-specific names.
- [x] Add valid frontmatter to every governed Markdown file.
- [x] Repair current-layer internal links.
- [x] Retire the legacy `Docs/` root and broken machine-local rule links.
- [x] Generate the manifest.
- [x] Run governance checks and `pnpm verify:web`.

## Task 6: Update The Upstream Registry

- [x] Record all ten requested projects.
- [x] Record both installed package versions.
- [x] Refresh health snapshots from actual verification results.
- [x] Preserve existing registered projects not in this migration batch.
- [x] Regenerate packaged assets and the upstream manifest.

## Task 7: Final Verification

- [x] Re-check all ten `package.json` files for exact package versions.
- [x] Re-check all ten routers and profiles.
- [x] Run `docs:check` in all ten repositories.
- [x] Run `git diff --check` in all ten repositories.
- [x] Run the full Project Governance System verification ladder.
- [x] Review every downstream diff for unrelated or destructive changes.
- [x] Move this plan to `docs/plans/completed/` and record actual results.

## Acceptance

- [x] All ten projects use governance contract v0.9.
- [x] All ten projects install `@pieai/doc-gov@0.3.3` and
  `@pieai/pro-gov@0.3.3`.
- [x] All ten projects expose `pnpm docs:check`.
- [x] All ten projects pass current governance diagnostics.
- [x] Collapse and TuringPact no longer have parallel current documentation
  systems.
- [x] SupaLuv no longer runs a vendored validator.
- [x] Dirty working trees retain all pre-existing unrelated changes.
- [x] The upstream registry matches the verified downstream state.

## Closeout

Completed on 2026-06-14.

- All ten repositories use governance contract v0.9 and exact package versions
  `@pieai/doc-gov@0.3.3` and `@pieai/pro-gov@0.3.3`.
- All ten `pnpm docs:check` runs passed with 0 warnings.
- Collapse passed its production build.
- SupaLuv passed `cloud:check` after completing package migration.
- TuringPact passed `verify:web` with 42 test files and 139 tests.
- TuringPact migration preservation checks found all 89 tracked legacy files:
  56 binary/non-Markdown files were byte-identical, 24 archived Markdown bodies
  were unchanged, and 9 current documents retained their substantive content.
- Pre-existing unrelated changes in dirty repositories were preserved.
- Project Governance System passed typecheck, 49 tests, build, router/check/scan,
  links, audit, doctor, both package dry-runs, and `git diff --check`.
