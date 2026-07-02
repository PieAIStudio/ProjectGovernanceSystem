---
id: PLAN-0006
title: Portfolio Maintenance Doctor Implementation Plan
type: plan
status: completed
canonical: true
owner: ai-assisted
created: 2026-07-02
last_reviewed: 2026-07-02
domain: portfolio-governance
tags:
  - portfolio
  - maintenance
  - tdd
  - downstream-sync
pinned: false
related:
  - SPEC-0006
  - POLICY-SYNC-STRATEGY
---

# Portfolio Maintenance Doctor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:subagent-driven-development` or `superpowers:executing-plans` to
> implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Add one thin, offline portfolio health gate that detects package,
router, hook, asset, bundle, and managed-symlink drift without taking ownership
of third-party updaters or product Git history.

**Architecture:** Keep existing validators as atomic tools. Add focused modules
for expected asset-state comparison, safe managed removal actions, host tooling
inventory, and portfolio doctor orchestration. The command reads a user's
external portfolio manifest and returns a structured report; network updates
remain a separate reviewed maintenance activity.

**Tech Stack:** Node.js 24, TypeScript, built-in `node:test`, existing
`@pieai/doc-gov` and `@pieai/pro-gov` CLIs, native Codex/Claude plugin JSON
commands, upstream `npx skills` CLI.

---

### Task 1: Portfolio manifest host-tooling contract

**Files:**
- Modify: `packages/pro-gov/src/portfolio/manifest.ts`
- Test: `packages/pro-gov/src/portfolio/manifest.test.ts`

- [x] Add failing tests for valid Codex/Claude plugin baselines, duplicate host
  entries, unsupported hosts, empty plugin ids, and unknown fields.
- [x] Run `pnpm --filter @pieai/pro-gov test -- manifest.test.ts` and confirm the
  new valid fixture fails because `hostTooling` is unknown.
- [x] Add the minimal typed optional `hostTooling` parser and validation.
- [x] Re-run the targeted tests and confirm they pass.

### Task 2: Expected asset-state comparison

**Files:**
- Create: `packages/pro-gov/src/portfolio/asset-state.ts`
- Test: `packages/pro-gov/src/portfolio/asset-state.test.ts`

- [x] Add failing fixtures for matching state, bundle drift, asset-set drift,
  lock hash/path drift, and an old lock entry absent from the new bundle.
- [x] Confirm the targeted test fails because the comparison module is missing.
- [x] Implement a pure comparison function using current bundle resolution,
  registry metadata, `.pro-gov/assets.json`, and `.pro-gov/assets.lock.json`.
- [x] Return stable issue objects and orphan candidates without writing files.
- [x] Re-run the targeted tests and confirm they pass.

### Task 3: Safe removal plan and apply contract

**Files:**
- Modify: `packages/pro-gov/src/asset-targets/install-plan.ts`
- Modify: `packages/pro-gov/src/asset-targets/apply.ts`
- Test: `packages/pro-gov/src/asset-targets/install-plan.test.ts`
- Test: `packages/pro-gov/src/asset-targets/apply-check.test.ts`

- [x] Add failing tests proving an asset removed from the expected bundle emits
  `remove-symlink` before lock rewrite.
- [x] Add failing tests proving apply removes the old managed symlink but refuses
  a real file, directory, unmanaged path, or changed target.
- [x] Implement the minimal action type, managed-root validation, and apply-time
  revalidation.
- [x] Re-run the two targeted suites and confirm they pass.

### Task 4: Host tooling inventory

**Files:**
- Create: `packages/pro-gov/src/host-tooling/inventory.ts`
- Test: `packages/pro-gov/src/host-tooling/inventory.test.ts`

- [x] Add failing tests for installed, disabled, missing, malformed-output, and
  command-unavailable Codex and Claude plugins using injected command runners.
- [x] Confirm tests fail because inventory support is missing.
- [x] Implement native `codex plugin list --json` and
  `claude plugin list --json` adapters with no install/update behavior.
- [x] Re-run the targeted tests and confirm they pass.

### Task 5: Portfolio doctor report

**Files:**
- Create: `packages/pro-gov/src/portfolio/doctor.ts`
- Modify: `packages/pro-gov/src/commands/portfolio.ts`
- Modify: `packages/pro-gov/src/cli.ts`
- Test: `packages/pro-gov/src/commands/portfolio.test.ts`

- [x] Add failing CLI tests for a healthy target, expected-state drift,
  `--target`, missing target packages, target-local check failure, dirty Git
  evidence, and optional host tooling requirements.
- [x] Confirm the CLI does not yet recognize `portfolio doctor`.
- [x] Implement per-target package inspection, installed CLI execution, strict
  asset check reuse, expected-state comparison, Git status evidence, and host
  tooling aggregation.
- [x] Emit concise human output and stable JSON; return non-zero for governance
  failures but not merely for a dirty product worktree.
- [x] Re-run the portfolio CLI tests and confirm they pass.

### Task 6: Bound npx maintenance

**Files:**
- Modify: `packages/pro-gov/src/asset-npx/maintenance.ts`
- Test: `packages/pro-gov/src/asset-npx/maintenance.test.ts`

- [x] Add a failing test for an updater exceeding the configured timeout.
- [x] Add a failing test for a process termination signal with no numeric exit
  code.
- [x] Add a conservative default timeout and actionable timeout/signal errors by
  using the existing `spawnSync` timeout support.
- [x] Re-run the maintenance tests and confirm they pass.

### Task 7: Private portfolio baseline and end-to-end test

**Files:**
- Modify outside public repo: `/Users/yuanfei/PieAI/PieHQ/.pro-gov/portfolio.json`
- Test: private PieAI portfolio command output

- [x] Add optional Codex and Claude Code plugin requirements using current
  native plugin ids.
- [x] Run `portfolio check`, `portfolio assets-check`, and `portfolio doctor`
  against the PieAI manifest.
- [x] Treat missing host prerequisites as a real report; do not silently install
  them during this implementation.

### Task 8: Documentation and public boundary

**Files:**
- Modify: `README.md`
- Modify: `packages/pro-gov/README.md`
- Modify: `packages/pro-gov/cli-guide.md`
- Modify: `docs/policy/sync-strategy.md`
- Modify: `docs/reference/portfolio-technology-governance.md`
- Modify: `docs/reference/adoption/downstream-project-registry.md`
- Modify: `docs/reference/adoption/recommended-agent-tooling.md`
- Modify: `agent-assets/skills/pie-skills/my-skills-manager/SKILL.md`

- [x] Align the command reference and fleet maintenance flow.
- [x] State that host plugins are checked but updated by native hosts.
- [x] State that the daily doctor is offline and update discovery is low
  frequency.
- [x] Remove stale wording that says only independent checks exist.
- [x] Run a second pass by searching for `portfolio assets-check`, plugin update,
  npx maintenance, downstream sync, and orphan symlink wording.
- [x] Run a third pass using doc-gov checks and fix every discovered mismatch.

### Task 9: Full verification and simplification

**Files:**
- Review all changed production and test files

- [x] Run typecheck, all tests, build, router/check/scan/links/audit, both
  doctors, both package dry-runs, packed-consumer smoke test, and
  `git diff --check`.
- [x] Review the diff for duplicated orchestration, unnecessary configuration,
  and unsafe file deletion.
- [x] Simplify while preserving test behavior, then repeat full verification.

### Task 10: Release and downstream synchronization

**Files:**
- Modify: root and package `package.json` files
- Modify: all registered target package manifests and locks
- Modify: target PGS-managed starter/asset files only when plans require it

- [x] Bump the coordinated package patch version and update completed spec/plan
  status.
- [x] Commit and push PGS, then verify the trusted GitHub Actions npm release and
  registry versions.
- [x] Inventory every downstream worktree before editing; preserve unrelated
  changes, including Anvil's user-owned dirty files.
- [x] For each target, upgrade both packages, apply reviewed PGS asset changes,
  run target checks, stage only PGS-owned changes, commit, and push.
- [x] Run final `portfolio doctor`, `portfolio assets-check`, and per-repository
  clean/alignment inventory; report any preserved user changes separately.
