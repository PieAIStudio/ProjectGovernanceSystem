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
- Create `agent-assets/skills/pie-skills/` for Yuanfei-authored or coauthored
  skills.
- Create `agent-assets/skills/dokobot/` for the local Dokobot skill pack.
- Create `agent-assets/skills/npx-skills/` as a native `npx skills` work root.
- Create `agent-assets/skills/npx-skills/.agents/skills/` for mirrored
  npx-installed skills.
- Create `agent-assets/skills/npx-skills/skills-lock.json` from the current npx
  lock.
- Create `agent-assets/rules/pie-rules/` for private rule documents.
- Create `agent-assets/commands/pie-commands/` for private command documents
  before conversion.
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
- [x] Run `pnpm doc-gov check`.
- [x] Run `pnpm doc-gov scan --check`.
- [x] Commit the initial spec and plan after governance checks pass.
- [x] Ask the user to approve the written plan before implementation begins.
- [x] Incorporate the follow-up directory decision:
  - use `agent-assets/skills/pie-skills/`;
  - use `agent-assets/skills/dokobot/`;
  - keep `agent-assets/skills/npx-skills/` as a native `npx skills` work root
    with `skills-lock.json` and `.agents/skills/`;
  - do not create an internal human-facing compatibility symlink layer.
- [ ] Run governance checks after this plan update.
- [ ] Commit the follow-up plan/spec update.

## Task 2: Asset Inventory Snapshot

- [x] Create a read-only inventory script or test helper that scans:
  - `/Users/yuanfei/Library/CloudStorage/OneDrive-Personal/MyProjectSkills`
  - `/Users/yuanfei/Library/CloudStorage/OneDrive-Personal/MyGlobalSkills`
  - `/Users/yuanfei/Library/CloudStorage/OneDrive-Personal/MyProjectSkills/_npx_skills/.agents/skills`
  - `/Users/yuanfei/Library/CloudStorage/OneDrive-Personal/MyProjectSkills/_npx_skills/skills-lock.json`
  - `/Users/yuanfei/Library/CloudStorage/OneDrive-Personal/MyProjectSkills/dokobot`
  - `/Users/yuanfei/Library/CloudStorage/OneDrive-Personal/MyGlobalRules`
  - `/Users/yuanfei/Library/CloudStorage/OneDrive-Personal/MyProjectRules`
  - `/Users/yuanfei/Library/CloudStorage/OneDrive-Personal/MyProjectCommands`
  - `/Users/yuanfei/Library/CloudStorage/OneDrive-Personal/MyGlobalCommands`
- [x] Exclude `.DS_Store`, `.git`, `node_modules`, temp files, and generated
  output.
- [x] Produce an inventory report with counts, missing `SKILL.md` files,
  dangling symlinks, duplicate names, and likely command-to-skill candidates.
- [x] Classify source families as `pie-skills`, `dokobot`, `npx-skills`,
  `pie-rules`, or `pie-commands`.
- [x] Report npx lock entries whose skill directory is missing and skill
  directories missing from the lock.
- [x] Do not modify the OneDrive sources.

Result on 2026-06-15:

- `pie-skills`: 19
- `dokobot`: 5
- `npx-skills`: 39
- `pie-rules`: 5
- `pie-commands`: 4
- total assets: 72
- issues: 5

Issues found:

- Dangling npx compatibility symlink:
  `/Users/yuanfei/Library/CloudStorage/OneDrive-Personal/MyProjectSkills/_npx_skills/skills/webapp-testing`
- Directories missing root `SKILL.md` and therefore not treated as skills:
  `founder-log-automation-workspace`, `knowledge-node-workspace`,
  `novel-creator-skill`, `superpowers`

## Task 3: Agent Asset Storage Skeleton

- [x] Add `agent-assets/README.md` explaining canonical source rules,
  visibility, promotion, and npm exclusion.
- [x] Add empty `.gitkeep` files for the new storage directories.
- [x] Add `agent-assets/registry.json` with schema version and empty asset list.
- [x] Add `agent-assets/skills/npx-skills/README.md` explaining that this
  directory is a native `npx skills` root and must not have an internal
  compatibility symlink mirror.
- [x] Add seed bundles:
  - `agent-assets/bundles/base-governance.json`
  - `agent-assets/bundles/frontend-app.json`
  - `agent-assets/bundles/novel-writing.json`
  - `agent-assets/bundles/research-docs.json`
- [x] Add tests that fail when registry IDs duplicate, paths escape
  `agent-assets/`, or private assets are marked publishable.

Result on 2026-06-15:

- Created source-family directories under `agent-assets/`.
- Created `agent-assets/skills/npx-skills` as a native npx root with
  `skills-lock.json` and `.agents/skills/`.
- Verified `agent-assets/skills/npx-skills/skills` does not exist, so there is
  no internal compatibility symlink layer.
- Added registry validation tests for duplicate IDs, unsafe source paths,
  publishable private/third-party assets, and the checked-in registry.

## Task 4: Import Source-Family Assets

- [x] Copy Yuanfei-authored skills into `agent-assets/skills/pie-skills/`.
- [x] Copy Dokobot into `agent-assets/skills/dokobot/`, preserving shared
  support files.
- [x] Copy private rules into `agent-assets/rules/pie-rules/`.
- [x] Copy private commands into `agent-assets/commands/pie-commands/`.
- [x] Mirror npx-installed third-party skills into
  `agent-assets/skills/npx-skills/.agents/skills/`.
- [x] Copy the current npx `skills-lock.json` into
  `agent-assets/skills/npx-skills/skills-lock.json`.
- [x] Do not create `agent-assets/skills/npx-skills/skills/<skill-name>`
  compatibility symlinks.
- [x] Preserve original names first; rename only when a collision would make
  host discovery ambiguous.
- [x] Register every imported asset in `agent-assets/registry.json` with:
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
- [x] Run the inventory report again and compare source count to imported
  count.

Execution record:

- Imported 72 assets into `agent-assets/`:
  - 19 `pie-skills`
  - 5 `dokobot`
  - 39 `npx-skills`
  - 5 `pie-rules`
  - 4 `pie-commands`
- Preserved the native npx root shape:
  `agent-assets/skills/npx-skills/skills-lock.json` plus
  `agent-assets/skills/npx-skills/.agents/skills/`.
- Verified `agent-assets/skills/npx-skills/skills` does not exist.
- Excluded `.DS_Store`, `.git`, `node_modules`, source workspaces without root
  `SKILL.md`, and the Superpowers plugin body.
- Marked imported assets as `private` or `third-party` with
  `publishable:false`.

## Task 5: Registry Runtime

- [x] Create registry types under
  `packages/pro-gov/src/asset-registry/`.
- [x] Write failing tests for duplicate IDs, invalid visibility, missing source
  paths, missing `SKILL.md`, unsupported hosts, and package-leak flags.
- [x] Add a registry loader under `packages/pro-gov/src/asset-registry/`.
- [x] Implement minimal registry validation with JSON only, no new YAML
  dependency.
- [x] Add content hashing for lockfile entries.
- [x] Add `pro-gov assets list --json`.
- [x] Keep the original plain `pro-gov assets list` behavior compatible.
- [x] Add registry checks that reject internal compatibility symlinks under
  `agent-assets/skills/npx-skills/skills/`.

Execution record:

- Added `loadAgentAssetRegistry()` and checked-in registry validation.
- Added stable content hashing for lockfile entries.
- Added `pro-gov assets list --json` and `--visibility`.
- Fixed the `@pieai/pro-gov` test script so root-level tests and nested tests
  both run.
- Verified the original plain `pro-gov assets list` still prints package asset
  paths.

## Task 5A: Npx Skills Maintenance Wrapper

- [ ] Add a wrapper module for third-party npx skills maintenance.
- [ ] Add `pro-gov assets npx add <source> [--skill <name>] --plan`.
- [ ] Add `pro-gov assets npx update [--skill <name>] --plan`.
- [ ] Implement these commands by copying
  `agent-assets/skills/npx-skills/` to a temp directory first.
- [ ] Run `npx --yes skills add ...` or
  `npx --yes skills update -p -y` only inside the temp copy.
- [ ] Produce a reviewable JSON plan and textual diff summary.
- [ ] Do not apply changes to the real `npx-skills` root without a separate
  explicit apply step.
- [ ] Test that `--help` never triggers an update.
- [ ] Test that the wrapper refuses to run if the npx work root lacks
  `skills-lock.json` or `.agents/skills/`.

## Task 6: Target Discovery And Recommendation

- [x] Create target discovery under `packages/pro-gov/src/asset-targets/`.
- [x] Detect project signals from:
  - `package.json`
  - `AGENTS.md`
  - `CLAUDE.md`
  - `GEMINI.md`
  - `docs/research`
  - `chapters`
  - README keywords for research and writing
- [ ] Add `pro-gov assets discover --target <path> --json`.
- [x] Add deterministic `pro-gov assets recommend --target <path> --json`.
- [x] Include recommendation reasons and confidence, but do not write files.
- [x] Test with temp fixtures for empty project, frontend app, research docs,
  and writing projects.
- [ ] Add conflict discovery for existing managed and unmanaged asset targets.

Execution record:

- Added `base-governance`, `frontend-app`, `research-docs`, and
  `novel-writing` bundle contents.
- Added recommendations based on local evidence only; no AI guessing and no
  writes.

## Task 7: Plan Generation

- [x] Create an initial asset plan JSON format.
- [x] Extend the plan operation model with exact operations:
  - create directory;
  - create symlink;
  - update managed symlink;
  - write `.pro-gov/assets.json`;
  - write `.pro-gov/assets.lock.json`;
  - stop on unmanaged conflict.
- [x] Add `pro-gov assets plan --target <path> --bundle <id> --host <host> --json`.
- [x] Support host:
  - `codex`
- [x] Support hosts:
  - `claude-code`
  - `gemini-cli`
  - `antigravity`
- [x] Map Codex project skills to `.agents/skills`.
- [x] Map Gemini CLI and Antigravity project skills to
  `.agents/skills`.
- [x] Map Claude Code project skills to `.claude/skills`.
- [x] Test dry-run plan output and verify target files are not written.
- [x] Add `--out <file>` to write a plan artifact without applying it.
- [x] Add conflict checks for unmanaged targets.
- [ ] Add exact plan output snapshots for each host.

Execution record:

- Added dry-run-only `createAssetInstallPlan()`.
- `pro-gov assets plan --json` now returns symlink actions plus
  `.pro-gov/assets.json` and `.pro-gov/assets.lock.json` write actions.
- No target files are written by `assets plan`; tests assert `.agents` and
  `.pro-gov` remain absent.
- Added `create-dir`, `symlink`, `update-symlink`, and `write-file` actions.
- Added host mapping for Codex, Gemini CLI, Antigravity, and Claude Code.
- Added `--out <file>` for reviewable plan artifacts.

## Task 8: Safe Apply And Check

- [x] Add `pro-gov assets apply --plan <file>`.
- [x] Use absolute symlinks.
- [x] Refuse to overwrite unmanaged files, unmanaged directories, and
  unmanaged symlinks.
- [x] Allow updates only when `.pro-gov/assets.lock.json` proves ownership.
- [x] Add `pro-gov assets check --target <path> --json`.
- [x] Check dangling symlinks, missing sources, hash drift, and unmanaged
  conflicts.
- [ ] Check unsupported host folders.
- [x] Test apply/check in temp target projects.
- [x] Test that apply works from PGS sources without touching OneDrive sources.

Execution record:

- Added `applyAssetInstallPlan()` and `checkInstalledAssets()`.
- `assets apply` applies a reviewed plan file only.
- `assets check` reads `.pro-gov/assets.lock.json` and reports missing lock,
  missing target, unmanaged conflict, dangling symlink, missing source,
  hash drift, and unknown asset issues.
- Tests verify absolute symlinks, managed metadata, unmanaged conflict refusal,
  clean check, hash drift, dangling symlink, and CLI plan/apply/check flow.

## Task 9: ProjectLens Absorption

- [x] Copy only reusable ProjectLens skills and protocol into PGS.
- [x] Do not copy `audits/show/**` or `audits/non-heroes/**`.
- [x] Add ProjectLens skills to the private asset layer.
- [x] Add `agent-assets/bundles/project-lens.json`.
- [x] Add `packages/pro-gov/src/lens/` with read-only inspection helpers.
- [x] Add `pro-gov lens scan --target <path> --json`.
- [ ] Add `pro-gov lens inspect --target <path> --format text|json` if scan
  is not enough after user testing.
- [ ] Add `pro-gov lens report --target <path> --out <path>`.
- [x] Test lens commands against temp projects.
- [ ] Test lens commands against one read-only local target.
- [ ] Add a retirement checklist documenting when the old ProjectLens root can
  be deleted.

Execution record:

- Imported `project-architecture-lens` and `truth-surface-audit` into
  `agent-assets/skills/pie-skills/`.
- Imported the reusable audit protocol into
  `docs/reference/project-lens/project-audit-protocol-v0.1.md`.
- Rewrote copied skill references to use the new PGS protocol path.
- Did not migrate historical Show or Non-Heroes audit evidence.
- Added `pro-gov lens scan`, which returns local read-only evidence for AI audit
  work instead of pretending to generate a full expert report by itself.

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
- [ ] Verify `agent-assets/skills/npx-skills` remains a native npx root and has
  no internal compatibility symlink mirror.
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
- [ ] `npx-skills` is managed as a native `npx skills` root inside PGS, with no
  internal compatibility symlink layer.
- [x] ProjectLens reusable capability works from PGS.
- [x] Historical ProjectLens audits are not migrated.
- [ ] `pro-gov assets` can list, discover, recommend, plan, apply, and check.
- [ ] `pro-gov lens` can inspect and report.
- [ ] All tests and governance checks pass.
- [ ] The old ProjectLens root is ready for user-approved deletion.

## Closeout

When complete, move this plan to `docs/plans/completed/` and set `status: completed`.
