---
id: PLAN-0003
title: Project Lens And Agent Asset Manager Implementation
type: plan
status: draft
canonical: false
owner: ai-assisted
created: 2026-06-15
last_reviewed: 2026-06-15
domain: governance
tags:
  - project-lens
  - agent-assets
  - skills
  - pro-gov
pinned: false
related:
  - SPEC-0003
---

# PLAN-0003: Project Lens And Agent Asset Manager Implementation

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development or superpowers:executing-plans to
> implement this plan task by task. Preserve OneDrive sources, preserve the old
> ProjectLens root, and keep all writes behind explicit plan/application gates.

## Goal

Make Project Governance System the canonical home and manager for ProjectLens
capabilities plus Yuanfei's agent-facing skills, rules, and commands.

## Architecture

Keep `@pieai/pro-gov` as the main project-level CLI. Add two internal
capabilities:

- `lens`, for read-only project inspection and report generation.
- `agent-assets`, for inventorying, recommending, planning, applying, and
  verifying host-visible skills, rules, and commands.

Private and third-party assets live in the repository but are excluded from npm
package tarballs by default.

## Tech Stack

Node.js 22, TypeScript, Node test runner, pnpm workspaces, esbuild, JSON
registries, absolute symlinks, existing `doc-gov` governance checks.

## Scope

In scope:

- create the isolated worktree and baseline proof;
- add active spec and plan docs;
- import ProjectLens reusable materials, excluding historical audits;
- import OneDrive skills, rules, commands, and npx skill cache into PGS;
- add registry, bundle, host-adapter, and lockfile code;
- add `pro-gov lens` and expanded `pro-gov assets` commands;
- test with temp target projects before touching real downstream projects;
- prepare the old ProjectLens root for user-approved deletion.

Out of scope:

- deleting OneDrive sources;
- deleting `/Users/yuanfei/PieAI/ProjectLens`;
- silently installing assets into every PieAI project;
- publishing private or third-party assets to npm;
- making Microsoft APM a hard dependency.

## File Structure

- Modify `.gitignore` to ignore local worktrees.
- Create `docs/specs/active/SPEC-0003-project-lens-agent-assets.md`.
- Create `docs/plans/active/PLAN-0003-project-lens-agent-assets.md`.
- Create `agent-assets/README.md` for asset storage rules.
- Create `agent-assets/registry.json` for all asset metadata.
- Create `agent-assets/bundles/*.json` for project-type bundles.
- Create `agent-assets/public/skills/` for curated public skills.
- Create `agent-assets/private/skills/` for Yuanfei-authored or coauthored
  skills.
- Create `agent-assets/private/rules/` for private rule documents.
- Create `agent-assets/private/commands/` for private command documents before
  conversion.
- Create `agent-assets/third-party/skills/` for mirrored npx-installed skills.
- Create `agent-assets/third-party/skills-lock.json` from the current npx lock.
- Create `packages/pro-gov/src/asset-registry/*` for registry parsing,
  validation, bundle lookup, and content hashing.
- Create `packages/pro-gov/src/asset-targets/*` for target-project discovery,
  host adapters, plan generation, plan application, and lockfile checks.
- Create `packages/pro-gov/src/lens/*` for ProjectLens protocol, inspection,
  and report output.
- Modify `packages/pro-gov/src/commands/assets.ts` to support list, check,
  discover, recommend, plan, and apply.
- Create `packages/pro-gov/src/commands/lens.ts`.
- Modify `packages/pro-gov/src/cli.ts` help and command routing.
- Modify `packages/pro-gov/scripts/copy-assets.mjs` so npm packages include
  only allowed public assets.
- Modify `packages/pro-gov/README.md`, `packages/pro-gov/cli-guide.md`, root
  `README.md`, and relevant adoption docs.
- Add tests under `packages/pro-gov/src/**/*.test.ts`.

## Steps

## Task 0: Isolation And Baseline

- [x] Add `.worktrees/` to `.gitignore`.
- [x] Commit the ignore-only setup change on `main`.
- [x] Create worktree
  `.worktrees/pro-gov-asset-lens-integration` on branch
  `codex/pro-gov-asset-lens-integration`.
- [x] Run `pnpm install`.
- [x] Run `pnpm typecheck`.
- [x] Run `pnpm test`.
- [x] Run `pnpm build`.
- [x] Run the full current verification ladder:

```bash
node packages/doc-gov/dist/cli.js router-check
node packages/doc-gov/dist/cli.js check
node packages/doc-gov/dist/cli.js scan --check
node packages/doc-gov/dist/cli.js links
node packages/doc-gov/dist/cli.js audit
node packages/pro-gov/dist/cli.js doctor
pnpm --filter @pieai/doc-gov pack --dry-run
pnpm --filter @pieai/pro-gov pack --dry-run
git diff --check
```

Expected: all pass before feature work begins.

## Task 1: Spec And Plan Gate

- [x] Create `SPEC-0003` with the public/private/third-party asset model.
- [x] Create this implementation plan as `PLAN-0003`.
- [ ] Run `pnpm doc-gov check`.
- [ ] Run `pnpm doc-gov scan --check`.
- [ ] Commit the spec and plan after governance checks pass.
- [ ] Ask the user to approve the written plan before implementation begins.

## Task 2: Asset Inventory Snapshot

- [ ] Create a read-only inventory script or test helper that scans:
  - `/Users/yuanfei/Library/CloudStorage/OneDrive-Personal/MyProjectSkills`
  - `/Users/yuanfei/Library/CloudStorage/OneDrive-Personal/MyGlobalSkills`
  - `/Users/yuanfei/Library/CloudStorage/OneDrive-Personal/MyProjectSkills/_npx_skills/.agents/skills`
  - `/Users/yuanfei/Library/CloudStorage/OneDrive-Personal/MyGlobalRules`
  - `/Users/yuanfei/Library/CloudStorage/OneDrive-Personal/MyProjectRules`
  - `/Users/yuanfei/Library/CloudStorage/OneDrive-Personal/MyProjectCommands`
  - `/Users/yuanfei/Library/CloudStorage/OneDrive-Personal/MyGlobalCommands`
- [ ] Exclude `.DS_Store`, `.git`, `node_modules`, temp files, and generated
  output.
- [ ] Produce an inventory report with counts, missing `SKILL.md` files,
  dangling symlinks, duplicate names, and likely command-to-skill candidates.
- [ ] Do not modify the OneDrive sources.

## Task 3: Agent Asset Storage Skeleton

- [ ] Add `agent-assets/README.md` explaining canonical source rules,
  visibility, promotion, and npm exclusion.
- [ ] Add empty `.gitkeep` files for the new storage directories.
- [ ] Add `agent-assets/registry.json` with schema version and empty asset list.
- [ ] Add seed bundles:
  - `agent-assets/bundles/base-governance.json`
  - `agent-assets/bundles/frontend-app.json`
  - `agent-assets/bundles/novel-writing.json`
  - `agent-assets/bundles/research-docs.json`
- [ ] Add tests that fail when registry IDs duplicate, paths escape
  `agent-assets/`, or private assets are marked publishable.

## Task 4: Import Private And Third-Party Assets

- [ ] Copy Yuanfei-authored skills into `agent-assets/private/skills/`.
- [ ] Copy private rules into `agent-assets/private/rules/`.
- [ ] Copy private commands into `agent-assets/private/commands/`.
- [ ] Mirror npx-installed third-party skills into
  `agent-assets/third-party/skills/`.
- [ ] Copy the current npx `skills-lock.json` into
  `agent-assets/third-party/skills-lock.json`.
- [ ] Preserve original names first; rename only when a collision would make
  host discovery ambiguous.
- [ ] Register every imported asset in `agent-assets/registry.json` with:
  - `id`
  - `title`
  - `visibility`
  - `sourceKind`
  - `sourcePath`
  - `hosts`
  - `tags`
  - `publishable`
  - `origin`
  - `notes`
- [ ] Run the inventory report again and compare source count to imported
  count.

## Task 5: Registry Runtime

- [ ] Create registry types and loader under
  `packages/pro-gov/src/asset-registry/`.
- [ ] Write failing tests for duplicate IDs, invalid visibility, missing source
  paths, missing `SKILL.md`, unsupported hosts, and package-leak flags.
- [ ] Implement minimal registry parsing with JSON only, no new YAML
  dependency.
- [ ] Add content hashing for lockfile entries.
- [ ] Add `pro-gov assets list --json`.
- [ ] Keep the original plain `pro-gov assets list` behavior compatible.

## Task 6: Target Discovery And Recommendation

- [ ] Create target discovery under `packages/pro-gov/src/asset-targets/`.
- [ ] Detect project signals from:
  - `package.json`
  - `AGENTS.md`
  - `CLAUDE.md`
  - `GEMINI.md`
  - existing `.agents/skills`
  - existing `.claude/skills`
  - existing `.gemini/skills`
  - existing `.pro-gov/assets.json`
- [ ] Add `pro-gov assets discover --target <path> --json`.
- [ ] Add deterministic `pro-gov assets recommend --target <path> --json`.
- [ ] Include recommendation reasons and confidence, but do not write files.
- [ ] Test with temp fixtures for empty project, frontend app, doc-only
  project, and project with existing skill conflicts.

## Task 7: Plan Generation

- [ ] Create an asset plan JSON format with exact operations:
  - create directory;
  - create symlink;
  - update managed symlink;
  - write `.pro-gov/assets.json`;
  - write `.pro-gov/assets.lock.json`;
  - stop on unmanaged conflict.
- [ ] Add `pro-gov assets plan --target <path> --bundle <id> --host <host> --out <file>`.
- [ ] Support hosts:
  - `codex`
  - `claude-code`
  - `gemini-cli`
  - `antigravity`
- [ ] Map Codex, Gemini CLI, and Antigravity project skills to
  `.agents/skills`.
- [ ] Map Claude Code project skills to `.claude/skills`.
- [ ] Test exact plan output snapshots for each host.

## Task 8: Safe Apply And Check

- [ ] Add `pro-gov assets apply --plan <file>`.
- [ ] Use absolute symlinks.
- [ ] Refuse to overwrite unmanaged files, unmanaged directories, and
  unmanaged symlinks.
- [ ] Allow updates only when `.pro-gov/assets.lock.json` proves ownership.
- [ ] Add `pro-gov assets check --target <path> --json`.
- [ ] Check dangling symlinks, missing sources, hash drift, unmanaged conflicts,
  and unsupported host folders.
- [ ] Test apply/check in temp target projects.
- [ ] Test that apply leaves OneDrive sources untouched.

## Task 9: ProjectLens Absorption

- [ ] Copy only reusable ProjectLens skills and protocol into PGS.
- [ ] Do not copy `audits/show/**` or `audits/non-heroes/**`.
- [ ] Add ProjectLens skills to the public or private asset layer based on
  review; default to public if they are generic and clean.
- [ ] Add `packages/pro-gov/src/lens/` with read-only inspection helpers.
- [ ] Add `pro-gov lens inspect --target <path> --format text|json`.
- [ ] Add `pro-gov lens report --target <path> --out <path>`.
- [ ] Test lens commands against temp projects and one read-only local target.
- [ ] Add a retirement checklist documenting when the old ProjectLens root can
  be deleted.

## Task 10: Package Boundary And Docs

- [ ] Update `packages/pro-gov/scripts/copy-assets.mjs` to include only public
  package-safe assets.
- [ ] Add package tests proving private and third-party bodies are excluded from
  `@pieai/pro-gov` tarballs.
- [ ] Update `packages/pro-gov/README.md` and `cli-guide.md`.
- [ ] Update root `README.md` to explain:
  - `doc-gov` validates docs;
  - `pro-gov` manages project governance, lens inspection, and agent assets;
  - private assets are local to Yuanfei's PGS checkout unless promoted.
- [ ] Update adoption docs with the new asset workflow.

## Task 11: Real-World Dry Runs

- [ ] Run `pro-gov assets discover --target` against selected local projects
  without applying:
  - `ProjectGovernanceSystem`
  - `ProjectLens`
  - one frontend project
  - one writing/doc-only project
- [ ] Run `pro-gov assets recommend --target` and inspect reasons.
- [ ] Run `pro-gov lens inspect --target` on ProjectLens and one downstream
  project.
- [ ] Use only temp fixture targets for `assets apply` unless the user
  explicitly approves a real target.

## Task 12: Final Verification And Closeout

- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm build`.
- [ ] Run:

```bash
node packages/doc-gov/dist/cli.js router-check
node packages/doc-gov/dist/cli.js check
node packages/doc-gov/dist/cli.js scan --check
node packages/doc-gov/dist/cli.js links
node packages/doc-gov/dist/cli.js audit
node packages/pro-gov/dist/cli.js doctor
pnpm --filter @pieai/doc-gov pack --dry-run
pnpm --filter @pieai/pro-gov pack --dry-run
git diff --check
```

- [ ] Verify npm tarball contents manually list no private or third-party asset
  bodies.
- [ ] Verify OneDrive sources still exist.
- [ ] Verify old ProjectLens root still exists.
- [ ] Move this plan to `docs/plans/completed/` only after implementation is
  complete.
- [ ] Prepare a final user report listing:
  - what moved;
  - what stayed private;
  - what is package-visible;
  - which checks passed;
  - whether ProjectLens can be deleted.

## Acceptance

- [ ] User approves `SPEC-0003` and `PLAN-0003`.
- [ ] The worktree branch remains isolated from `main`.
- [ ] OneDrive is no longer the canonical source after import, but remains
  untouched as backup.
- [ ] Private and third-party assets live in PGS and are excluded from npm.
- [ ] ProjectLens reusable capability works from PGS.
- [ ] Historical ProjectLens audits are not migrated.
- [ ] `pro-gov assets` can list, discover, recommend, plan, apply, and check.
- [ ] `pro-gov lens` can inspect and report.
- [ ] All tests and governance checks pass.
- [ ] The old ProjectLens root is ready for user-approved deletion.

## Closeout

When complete, move this plan to `docs/plans/completed/` and set `status: completed`.
