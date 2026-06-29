---
id: PLAN-0005
title: PieHQ-Controlled Public PGS Implementation
type: plan
status: active
canonical: true
owner: ai-assisted
created: 2026-06-29
last_reviewed: 2026-06-29
domain: governance
tags:
  - public-boundary
  - portfolio
  - piehq
  - skills
  - pro-gov
pinned: false
related:
  - SPEC-0005
  - SPEC-0003
  - POLICY-SYNC-STRATEGY
  - POLICY-UPSTREAMING
---

# PLAN-0005: PieHQ-Controlled Public PGS Implementation

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development or superpowers:executing-plans to
> implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for
> tracking.

## Goal

Make Project Governance System a clean public execution engine while PieHQ owns
Yuanfei's private portfolio configuration and skill-placement policy.

## Architecture

Keep PGS and PieHQ as separate repositories. Add a public, config-driven
`pro-gov portfolio` command group to PGS; add PieHQ's private
`.pro-gov/portfolio.json` as the execution SSOT for the PieAI project fleet.
Move skill placement decisions into the PGS asset registry so each target
project receives consistent `.agents/skills` or `.agents/manual-skills`
symlinks.

## Tech Stack

Node.js 24, TypeScript, Node test runner, pnpm workspaces, existing PGS JSON
registries, absolute symlinks, no new runtime dependency unless validation
outgrows the small in-repo validators.

---

## File Structure

### PGS Files

- Modify `packages/pro-gov/src/assets.test.ts` for package leak and placement
  regression tests.
- Modify `packages/pro-gov/scripts/copy-assets.mjs` to avoid packaging private
  adoption registry data.
- Modify `packages/pro-gov/src/assets.ts` only if packaged asset discovery needs
  the same public/private boundary.
- Create `packages/pro-gov/src/portfolio/manifest.ts` for manifest loading and
  validation.
- Create `packages/pro-gov/src/portfolio/manifest.test.ts` for unit tests.
- Create `packages/pro-gov/src/commands/portfolio.ts` for CLI handling.
- Modify `packages/pro-gov/src/cli.ts` to expose `portfolio`.
- Modify `packages/pro-gov/src/asset-registry/registry.ts` to add
  `defaultPlacement` for skill assets.
- Modify `packages/pro-gov/src/asset-targets/install-plan.ts` to use per-asset
  placement.
- Modify `packages/pro-gov/src/asset-targets/check.ts` to report duplicate,
  unmanaged, and placement-drifted skill links.
- Modify `agent-assets/registry.json` and `public-agent-assets/registry.json`
  with skill `defaultPlacement` values.
- Modify `agent-assets/skills/pie-skills/my-skills-manager/SKILL.md` to clarify
  its boundary with `skill-installer`.
- Modify PGS docs under `docs/policy/**`, `docs/reference/adoption/**`,
  `packages/pro-gov/README.md`, and `packages/pro-gov/cli-guide.md` so public
  docs point to generic config-driven adoption rather than PieAI private
  registries.
- Modify `docs/governance/MANIFEST.yml` through `pnpm doc-gov scan`.

### PieHQ Files

- Create `/Users/yuanfei/PieAI/PieHQ/.pro-gov/portfolio.json`.
- Modify `/Users/yuanfei/PieAI/PieHQ/docs/canon/pie-managed-repositories.md`
  so the Markdown canon explains the JSON manifest instead of acting as the
  executable registry.
- Modify `/Users/yuanfei/PieAI/PieHQ/scripts/check-managed-repositories.mjs` if
  it still hardcodes the managed repository count or parses Markdown as the
  execution source.
- Modify `/Users/yuanfei/PieAI/PieHQ/package.json` scripts if needed so PieHQ
  can verify the portfolio connection.

### Downstream Files

- Inspect PieAI target projects from the PieHQ manifest.
- Remove retired `GEMINI.md` and `.gemini/` files where present.
- Fix skill symlink placement only after PGS checks can detect drift.
- Report every downstream project changed, every file removed, and every skill
  placement adjusted.

## Task 0: Baseline And Branch

- [x] Create implementation branch `codex/piehq-controlled-pgs`.
- [ ] Run `git status --short`.
  Expected: no uncommitted changes except this plan while planning.
- [ ] Run `pnpm typecheck`.
  Expected: pass before implementation.
- [ ] Run `pnpm test`.
  Expected: pass before implementation.

## Task 1: Commit This Plan

- [ ] Write this plan to
  `docs/plans/active/PLAN-0005-piehq-controlled-public-pgs.md`.
- [ ] Run `pnpm doc-gov check`.
  Expected: pass.
- [ ] Run `pnpm doc-gov scan --check`.
  Expected: if manifest drift is reported, run `pnpm doc-gov scan` and repeat.
- [ ] Run `git diff --check`.
  Expected: pass.
- [ ] Commit with:

```bash
git add docs/plans/active/PLAN-0005-piehq-controlled-public-pgs.md docs/governance/MANIFEST.yml
git commit -m "docs: plan PieHQ-controlled PGS implementation"
```

## Task 2: Harden The Public Package Boundary

- [ ] Add a failing test in `packages/pro-gov/src/assets.test.ts` proving packed
  assets do not include:
  - `/Users/yuanfei/PieAI/`
  - `PieHQ`
  - `docs/reference/adoption/downstream-project-registry.md`
  - `GEMINI.md`
  - `.gemini/`
- [ ] Run:

```bash
pnpm --filter @pieai/pro-gov test -- assets.test.ts
```

Expected: fail because current package still exposes adoption registry assets.

- [ ] Update `packages/pro-gov/scripts/copy-assets.mjs` and related asset
  discovery so public package assets include generic docs only.
- [ ] Replace public-facing downstream registry docs with either a generic
  example or a note that private portfolio registries live outside PGS.
- [ ] Run the same test again.
  Expected: pass.
- [ ] Run `pnpm --filter @pieai/pro-gov pack --dry-run`.
  Expected: no private adoption registry or retired Gemini assets.

## Task 3: Add Portfolio Manifest Validation

- [ ] Create failing tests in
  `packages/pro-gov/src/portfolio/manifest.test.ts` for:
  - valid manifest loads;
  - duplicate target IDs fail;
  - missing target path fails;
  - control plane and execution engine are not default bulk targets;
  - `assetBundles` must be an array of strings when present.
- [ ] Run:

```bash
pnpm --filter @pieai/pro-gov test -- portfolio/manifest.test.ts
```

Expected: fail because the module does not exist.

- [ ] Create `packages/pro-gov/src/portfolio/manifest.ts` with small
  TypeScript validators using `JSON.parse` and `node:fs`.
- [ ] Re-run the test.
  Expected: pass.

## Task 4: Add `pro-gov portfolio`

- [ ] Add failing CLI tests for:
  - `portfolio check --config <path> --json`;
  - `portfolio check` without `--config` fails clearly;
  - `portfolio plan --config <path> --target <id> --json` returns dry-run asset
    plans for the selected target.
- [ ] Run the CLI tests.
  Expected: fail because the command is not routed.
- [ ] Create `packages/pro-gov/src/commands/portfolio.ts`.
- [ ] Modify `packages/pro-gov/src/cli.ts` help and routing.
- [ ] Re-run the CLI tests.
  Expected: pass.

## Task 5: Move Skill Placement Into The Registry

- [ ] Add failing tests in `packages/pro-gov/src/asset-registry/registry.test.ts`
  proving every skill asset has `defaultPlacement: "auto" | "manual"`.
- [ ] Add failing tests in
  `packages/pro-gov/src/asset-targets/install-plan.test.ts` proving mixed
  bundles can place one skill under `.agents/skills` and another under
  `.agents/manual-skills` without a global `--placement`.
- [ ] Add failing tests in
  `packages/pro-gov/src/asset-targets/apply-check.test.ts` proving check reports
  duplicate auto/manual symlinks and placement drift.
- [ ] Update registry types and validators.
- [ ] Mechanically add `defaultPlacement` to skill entries in:
  - `agent-assets/registry.json`;
  - `public-agent-assets/registry.json`.
- [ ] Update install plan creation and lockfile shape while preserving backward
  compatibility for existing lockfiles.
- [ ] Update asset check logic.
- [ ] Re-run focused tests.
  Expected: pass.

## Task 6: Clarify `my-skills-manager`

- [ ] Update
  `agent-assets/skills/pie-skills/my-skills-manager/SKILL.md` to state:
  - `skill-installer` is for acquisition from supported public sources;
  - `my-skills-manager` is the SSOT for Yuanfei/PGS local governance;
  - normal downstream placement comes from PGS registry `defaultPlacement`;
  - `.agents/skills` is the workbench and `.agents/manual-skills` is the
    explicit cabinet;
  - bulk rewrites still require inspection and a plan.
- [ ] Run:

```bash
pnpm --filter @pieai/pro-gov test -- asset-registry/registry.test.ts
```

Expected: pass, proving the edited skill still validates as a registered asset.

## Task 7: Add PieHQ Private Portfolio Manifest

- [ ] Create `/Users/yuanfei/PieAI/PieHQ/.pro-gov/portfolio.json` from
  `/Users/yuanfei/PieAI/PieHQ/docs/canon/pie-managed-repositories.md`.
- [ ] Keep `piehq` as `controlPlane`.
- [ ] Keep `project-governance-system` as `executionEngine`.
- [ ] Put ordinary managed repos in `targets`.
- [ ] Run:

```bash
node packages/pro-gov/dist/cli.js portfolio check --config /Users/yuanfei/PieAI/PieHQ/.pro-gov/portfolio.json --json
```

Expected: pass after PGS build.

- [ ] Update PieHQ docs and scripts so JSON is execution SSOT and Markdown is
  human explanation.

## Task 8: Align PGS SSOT Docs

- [ ] Update `docs/policy/sync-strategy.md` so private downstream registries no
  longer belong in public PGS adoption docs.
- [ ] Update `docs/policy/upstreaming-policy.md` if needed to mention external
  portfolio manifests.
- [ ] Update `docs/reference/adoption/downstream-project-registry.md` by moving
  private content out of the public path or replacing it with a generic example.
- [ ] Update `packages/pro-gov/README.md` and `packages/pro-gov/cli-guide.md`
  with the `portfolio` command and public/private boundary.
- [ ] Archive obsolete docs only when they are actively misleading; otherwise
  shorten and point to the new SSOT.
- [ ] Run:

```bash
pnpm doc-gov check
pnpm doc-gov scan --check
node packages/doc-gov/dist/cli.js links
```

Expected: pass.

## Task 9: Downstream Cleanup

- [ ] Build PGS.
- [ ] Use the PieHQ manifest to list target projects.
- [ ] For each target, inspect:
  - `GEMINI.md`;
  - `.gemini/`;
  - `.agents/skills`;
  - `.agents/manual-skills`;
  - `.pro-gov/assets.lock.json`.
- [ ] Remove retired Gemini files and folders.
- [ ] Use PGS asset checks to identify placement drift before changing symlinks.
- [ ] Move or relink skills only when the registry and lockfile prove the
  intended target.
- [ ] Produce a cleanup report with project name, removed files, symlink
  changes, and verification command result.

## Task 10: Final Verification

- [ ] Run:

```bash
pnpm typecheck
pnpm test
pnpm build
node packages/doc-gov/dist/cli.js router-check
node packages/doc-gov/dist/cli.js check
node packages/doc-gov/dist/cli.js scan --check
node packages/doc-gov/dist/cli.js links
node packages/doc-gov/dist/cli.js audit
node packages/pro-gov/dist/cli.js doctor
node packages/pro-gov/dist/cli.js portfolio check --config /Users/yuanfei/PieAI/PieHQ/.pro-gov/portfolio.json --json
pnpm --filter @pieai/pro-gov pack --dry-run
git diff --check
```

Expected: pass.

- [ ] Inspect packed PGS assets for private leakage:

```bash
tmp="$(mktemp -d)"
pnpm --filter @pieai/pro-gov pack --out "$tmp/pro-gov.tgz"
tar -tzf "$tmp/pro-gov.tgz" | grep -E 'GEMINI.md|\\.gemini|downstream-project-registry' && exit 1 || true
tar -xOf "$tmp/pro-gov.tgz" package/assets/docs/reference/adoption/adoption-playbook.md | grep '/Users/yuanfei/PieAI/' && exit 1 || true
```

Expected: no matches.

## Task 11: User-Facing Change Report

- [ ] Explain what changed for using PGS:
  - where public commands live;
  - how `portfolio check` works;
  - what is no longer packaged;
  - how skill placement is decided.
- [ ] Explain what changed for using PieHQ:
  - where `.pro-gov/portfolio.json` lives;
  - how PieHQ controls PGS without containing PGS;
  - how to verify the connection.
- [ ] Explain downstream cleanup:
  - which projects changed;
  - which `GEMINI.md` or `.gemini/` files were removed;
  - which skill symlinks moved;
  - which projects need follow-up.
- [ ] Use beginner-friendly examples:
  - PieHQ as the dispatch office;
  - PGS as the public tool;
  - `portfolio.json` as the machine-readable dispatch sheet;
  - `.agents/skills` as the workbench and `.agents/manual-skills` as the
    labeled cabinet.
