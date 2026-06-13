---
id: PLAN-0001
title: Pro-Gov Project Package Implementation
type: plan
status: completed
canonical: true
owner: ai-assisted
created: 2026-06-13
last_reviewed: 2026-06-13
domain: governance
tags:
  - pro-gov
  - npm
  - packaging
pinned: false
related:
  - SPEC-0002
supersedes: []
superseded_by: null
---

# Pro-Gov Project Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the `@pieai/pro-gov` npm package and `pro-gov` CLI as the
project-level distribution surface for Project Governance System.

**Architecture:** Keep `@pieai/doc-gov` as the validator. Add a separate
workspace package that bundles reusable project-governance assets and exposes
read-only project-level commands by default.

**Tech Stack:** Node.js 22, TypeScript, esbuild, Node test runner, pnpm
workspaces, npm package metadata.

---

## File Structure

- Create `packages/pro-gov/package.json` for package metadata and publish
  surface.
- Create `packages/pro-gov/README.md` and `packages/pro-gov/cli-guide.md` for
  package documentation.
- Create `packages/pro-gov/tsconfig.json` for package type checking.
- Create `packages/pro-gov/src/cli.ts` as the executable entrypoint.
- Create `packages/pro-gov/src/assets.ts` for reusable asset inventory and path
  helpers.
- Create `packages/pro-gov/src/commands/assets.ts` for `assets list`.
- Create `packages/pro-gov/src/commands/init.ts` for read-only init planning.
- Create `packages/pro-gov/src/commands/sync.ts` for read-only sync checks.
- Create `packages/pro-gov/src/commands/doctor.ts` for package-level health.
- Create `packages/pro-gov/src/**/*.test.ts` for behavior tests.
- Modify root `package.json` scripts so build, test, and typecheck include all
  packages.
- Modify `CHANGELOG.md`, root `README.md`, and adoption/release docs to explain
  the `doc-gov` / `pro-gov` split.

## Task 1: Package Skeleton

**Files:**

- Create: `packages/pro-gov/package.json`
- Create: `packages/pro-gov/tsconfig.json`
- Create: `packages/pro-gov/README.md`
- Create: `packages/pro-gov/cli-guide.md`
- Create: `packages/pro-gov/src/cli.ts`

- [x] **Step 1: Write a failing CLI smoke test**

Create `packages/pro-gov/src/cli.test.ts` with a subprocess test that expects
`node packages/pro-gov/dist/cli.js --help` to print `pro-gov`.

- [x] **Step 2: Run the test and verify it fails**

Run:

```bash
pnpm --filter @pieai/pro-gov test
```

Expected: failure because `@pieai/pro-gov` and `dist/cli.js` do not exist yet.

- [x] **Step 3: Add the minimal package skeleton**

Add the package files, a bundled CLI build script, and a help command that
prints the command list.

- [x] **Step 4: Run the focused test and verify it passes**

Run:

```bash
pnpm --filter @pieai/pro-gov build
pnpm --filter @pieai/pro-gov test
```

Expected: the smoke test passes.

## Task 2: Asset Inventory

**Files:**

- Create: `packages/pro-gov/src/assets.ts`
- Create: `packages/pro-gov/src/commands/assets.ts`
- Create: `packages/pro-gov/src/assets.test.ts`
- Modify: `packages/pro-gov/src/cli.ts`
- Modify: `packages/pro-gov/package.json`

- [x] **Step 1: Write failing inventory tests**

Tests must assert that the inventory includes:

- `starter/AGENTS.template.md`
- `starter/lefthook.template.yml`
- `profiles/engineering-runtime/profile.md`
- `profiles/doc-only/profile.md`
- `integrations/superpowers.md`
- `docs/reference/adoption/adoption-playbook.md`

- [x] **Step 2: Run the test and verify it fails**

Run:

```bash
pnpm --filter @pieai/pro-gov test
```

Expected: failure because asset inventory is missing.

- [x] **Step 3: Implement asset inventory and `assets list`**

Implement deterministic asset listing from packaged directories. Include the
asset directories in the package `files` field.

- [x] **Step 4: Run the focused tests and CLI**

Run:

```bash
pnpm --filter @pieai/pro-gov build
pnpm --filter @pieai/pro-gov test
node packages/pro-gov/dist/cli.js assets list
```

Expected: tests pass and the CLI prints packaged asset paths.

## Task 3: Init Dry-Run

**Files:**

- Create: `packages/pro-gov/src/commands/init.ts`
- Create: `packages/pro-gov/src/init.test.ts`
- Modify: `packages/pro-gov/src/cli.ts`

- [x] **Step 1: Write failing dry-run tests**

Tests must assert:

- valid profiles are `engineering-runtime` and `doc-only`;
- invalid profiles return exit code `1`;
- dry-run reports planned files;
- dry-run does not create files in an empty temp project.

- [x] **Step 2: Run the test and verify it fails**

Run:

```bash
pnpm --filter @pieai/pro-gov test
```

Expected: failure because init command is missing.

- [x] **Step 3: Implement `init --profile <profile> --dry-run`**

Implement read-only planning for starter files and selected profile files.

- [x] **Step 4: Run focused tests**

Run:

```bash
pnpm --filter @pieai/pro-gov test
```

Expected: init tests pass.

## Task 4: Sync Check And Doctor

**Files:**

- Create: `packages/pro-gov/src/commands/sync.ts`
- Create: `packages/pro-gov/src/commands/doctor.ts`
- Create: `packages/pro-gov/src/sync.test.ts`
- Create: `packages/pro-gov/src/doctor.test.ts`
- Modify: `packages/pro-gov/src/cli.ts`

- [x] **Step 1: Write failing sync and doctor tests**

Tests must assert:

- `sync --check` reports missing reusable files in an empty project;
- `sync --check` reports changed files without modifying them;
- `doctor` passes package asset checks;
- `doctor` does not fail solely because `doc-gov` is absent from a temp project.

- [x] **Step 2: Run the test and verify it fails**

Run:

```bash
pnpm --filter @pieai/pro-gov test
```

Expected: failure because sync and doctor commands are missing.

- [x] **Step 3: Implement read-only sync and doctor**

Implement stable summaries and non-mutating checks. `doctor` may report `doc-gov`
availability as a warning when absent.

- [x] **Step 4: Run focused tests**

Run:

```bash
pnpm --filter @pieai/pro-gov test
```

Expected: all pro-gov tests pass.

## Task 5: Docs, Release Metadata, And Whole-Repo Gates

**Files:**

- Modify: `package.json`
- Modify: `README.md`
- Modify: `CHANGELOG.md`
- Modify: `packages/doc-gov/package.json`
- Modify: `packages/doc-gov/README.md`
- Modify: `packages/doc-gov/cli-guide.md`
- Modify: `docs/reference/adoption/adoption-playbook.md`
- Modify: `docs/reference/adoption/public-release-checklist.md`

- [x] **Step 1: Update package metadata**

Align both packages for a future `0.3.3` release and fix the `@pieai/doc-gov`
repository slug metadata to `ProjectGovernanceSystem`.

- [x] **Step 2: Update docs**

Explain that `doc-gov` is the validator package and `pro-gov` is the
project-level distribution package.

- [x] **Step 3: Run full verification**

Run:

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm doc-gov router-check
pnpm doc-gov check
pnpm doc-gov scan --check
pnpm doc-gov links
pnpm doc-gov audit
pnpm --filter @pieai/doc-gov pack --dry-run
pnpm --filter @pieai/pro-gov pack --dry-run
git diff --check
```

Expected: all commands exit `0`; pack dry-runs show only intended files.

## Acceptance

- [x] `@pieai/pro-gov` package exists.
- [x] `pro-gov --help` works after build.
- [x] `pro-gov assets list` lists packaged reusable assets.
- [x] `pro-gov init --profile <profile> --dry-run` is read-only.
- [x] `pro-gov sync --check` is read-only and detects missing/different files.
- [x] `pro-gov doctor` checks package health and reports `doc-gov` availability.
- [x] `@pieai/doc-gov` metadata points at `ProjectGovernanceSystem`.
- [x] Full verification passes.

## Closeout

Completed on 2026-06-13. This plan was moved to `docs/plans/completed/`,
kept `canonical: true`, and retained as the implementation proof record.
