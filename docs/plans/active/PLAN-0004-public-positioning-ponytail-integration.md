---
id: PLAN-0004
title: Public Positioning And Ponytail Integration Implementation
type: plan
status: active
canonical: true
owner: ai-assisted
created: 2026-06-21
last_reviewed: 2026-06-21
domain: governance
tags:
  - public
  - ponytail
  - readme
  - i18n
  - release
pinned: false
related:
  - SPEC-0004
  - POLICY-DESIGN-PRINCIPLES
  - POLICY-SYNC-STRATEGY
---

# PLAN-0004: Public Positioning And Ponytail Integration Implementation

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:subagent-driven-development` (recommended) or
> `superpowers:executing-plans` to implement this plan task-by-task. Steps use
> checkbox syntax for tracking.

**Goal:** Give PGS a beginner-friendly public story, a safe Ponytail/Superpowers
boundary, six synchronized README languages, and a verified `0.3.4` release.

**Architecture:** Keep PGS, Superpowers, and Ponytail separate. English is the
canonical public introduction; five root-level README translations mirror its
structure. Source integration and adoption documents are copied into the npm
package by the existing build, never edited inside generated package assets.

**Tech Stack:** Markdown, Mermaid, doc-gov CLI, pro-gov build, Node.js 22,
pnpm 10.26.0, GitHub Actions, npm registry.

---

## File Map

| File | Responsibility |
| --- | --- |
| `integrations/ponytail.md` | Canonical Ponytail mode and safety boundary. |
| `integrations/superpowers.md` | Superpowers workflow ownership and Ponytail cooperation. |
| `docs/reference/adoption/recommended-agent-tooling.md` | Human recommendation strength by tool and project type. |
| `docs/reference/adoption/adoption-playbook.md` | Route adopters to the recommendation reference. |
| `docs/reference/adoption/site-publication-brief.md` | Keep external public copy accurate. |
| `README.md` | Canonical English GitHub introduction. |
| `README.zh-CN.md` | Simplified Chinese translation. |
| `README.ja-JP.md` | Japanese translation. |
| `README.es.md` | Spanish translation. |
| `README.fr.md` | French translation. |
| `README.de.md` | German translation. |
| `packages/pro-gov/README.md` | npm-facing pro-gov introduction and commands. |
| `packages/pro-gov/assets/**` | Generated build output; never hand-edit. |
| `packages/doc-gov/src/commands/doctor.ts` | Correct Git hook discovery in linked worktrees. |
| `packages/doc-gov/src/commands/doctor.test.ts` | Real linked-worktree regression coverage. |
| `docs/governance/MANIFEST.yml` | Generated governed-document inventory. |

## Task 1: Establish The Isolated Execution Baseline

**Files:** no source edits.

- [x] **Step 1.1:** Create a `codex/public-positioning-ponytail` worktree from
  the approved plan commit using the worktree skill.
- [x] **Step 1.2:** Confirm the worktree starts clean with `git status -sb`.
- [x] **Step 1.3:** Confirm `~/.config/ponytail/config.json` still contains
  `"defaultMode": "off"`; do not edit it.
- [x] **Step 1.4:** Run `pnpm install --frozen-lockfile`.
- [x] **Step 1.5:** Run the baseline commands `pnpm typecheck`, `pnpm test`, and
  `pnpm build`; expected result is exit code 0 for each command.

## Task 2: Write The Ponytail And Superpowers Boundary

**Files:**

- Create: `integrations/ponytail.md`
- Modify: `integrations/superpowers.md`

- [x] **Step 2.1:** Write `integrations/ponytail.md` with these exact policy
  outcomes: external plugin, global `off`, isolated `lite` first, optional
  isolated `full`, no governed `ultra`, and no override of requirements,
  safety, tests, verification, or evidence.
- [x] **Step 2.2:** Include a beginner analogy and a mode table that does not
  describe `lite` as "almost off."
- [x] **Step 2.3:** Include the isolated comparison sequence and the measurements
  from SPEC-0004.
- [x] **Step 2.4:** Update `integrations/superpowers.md` so responsibility order
  is PGS routing, Superpowers workflow, then optional Ponytail minimization.
- [x] **Step 2.5:** Search both files for accidental claims that either plugin is
  bundled or required by the PGS runtime.

## Task 3: Add The Recommended Tooling Surface

**Files:**

- Create: `docs/reference/adoption/recommended-agent-tooling.md`
- Modify: `docs/reference/adoption/adoption-playbook.md`
- Modify: `docs/reference/adoption/site-publication-brief.md`

- [x] **Step 3.1:** Create the reference with valid doc-gov frontmatter and a
  beginner-first comparison table.
- [x] **Step 3.2:** Separate required PGS packages, recommended engineering
  workflow tools, and optional complexity advisers.
- [x] **Step 3.3:** Recommend Superpowers for engineering/runtime work while
  retaining the current rule that doc-only work does not receive full
  engineering ceremony by default.
- [x] **Step 3.4:** Recommend Ponytail installation with global `off` and
  explicit session/task activation only.
- [x] **Step 3.5:** Link the reference from the adoption playbook and public site
  brief without duplicating the full rule body.
- [x] **Step 3.6:** Run `pnpm doc-gov scan` to refresh the manifest.

## Task 4: Rewrite English README Pass 1, Pyramid Structure

**Files:**

- Modify: `README.md`

- [x] **Step 4.1:** Preserve the CI and npm badges and add a six-language switcher
  directly below the title/badges.
- [x] **Step 4.2:** Replace the architecture-first opening with one answer-first
  paragraph: PGS keeps long-running AI-assisted projects understandable and
  governable.
- [x] **Step 4.3:** Explain the pain before the components: AI creates useful
  artifacts faster than teams can organize, retire, and trust them.
- [x] **Step 4.4:** Present the librarian, traffic desk, and inspection-machine
  model before introducing doc-gov/pro-gov names.
- [x] **Step 4.5:** Move a short evaluation path before detailed repository and
  lifecycle references.
- [x] **Step 4.6:** Confirm the first screen answers what PGS is, who it helps,
  and why it matters.

## Task 5: Rewrite English README Pass 2, Beginner Clarity

**Files:**

- Modify: `README.md`

- [x] **Step 5.1:** Explain CLI as "a command you or an AI can run" on first use.
- [x] **Step 5.2:** Explain governance as "rules that keep current truth easy to
  find and old work from pretending to be current."
- [x] **Step 5.3:** Add one concrete before/after project story showing plan and
  document clutter becoming a governed current-work path.
- [x] **Step 5.4:** Add one Mermaid relationship diagram with plain-language
  labels for Git, PGS, Superpowers, and Ponytail.
- [x] **Step 5.5:** Break long text walls into tables, examples, and short
  paragraphs without deleting technical reference material.
- [x] **Step 5.6:** Search for unexplained `CLI`, `SSOT`, `hook`, `manifest`,
  `profile`, and `router`; explain, replace, or move each occurrence.

## Task 6: Rewrite English README Pass 3, Truth And Conversion

**Files:**

- Modify: `README.md`
- Read: `packages/pro-gov/src/cli.ts`
- Read: `packages/doc-gov/src/cli.ts`
- Read: `packages/pro-gov/src/commands/*.ts`

- [x] **Step 6.1:** Cross-check every named command against CLI source/help.
- [x] **Step 6.2:** Verify the package, ProjectLens, agent-assets, profile, and
  write-mode boundaries against code and policy.
- [x] **Step 6.3:** Strengthen truthful highlights and remove claims of automatic
  migration, guaranteed savings, or plugin replacement.
- [x] **Step 6.4:** Verify every relative link from the root README resolves.
- [x] **Step 6.5:** Record the three README passes in the implementation commit or
  final report.

## Task 7: Align The npm README And Publication Brief

**Files:**

- Modify: `packages/pro-gov/README.md`
- Modify: `docs/reference/adoption/site-publication-brief.md`

- [x] **Step 7.1:** Give the npm README the same short answer, pain, and beginner
  analogy as the root README.
- [x] **Step 7.2:** Keep package install, public commands, checkout-only commands,
  read-only behavior, and package boundary details.
- [x] **Step 7.3:** Link to the canonical GitHub README for the full introduction.
- [x] **Step 7.4:** Update the publication brief so an external website does not
  repeat the old architecture-first positioning.

## Task 8: Produce Five Faithful Translations

**Files:**

- Create: `README.zh-CN.md`
- Create: `README.ja-JP.md`
- Create: `README.es.md`
- Create: `README.fr.md`
- Create: `README.de.md`

- [x] **Step 8.1:** Freeze the reviewed English heading order and link targets.
- [x] **Step 8.2:** Write Simplified Chinese with natural beginner language, not
  word-for-word machine phrasing.
- [x] **Step 8.3:** Write Japanese with natural technical vocabulary and the
  same beginner explanations.
- [x] **Step 8.4:** Write Spanish, French, and German with equivalent claims,
  examples, commands, and boundaries.
- [x] **Step 8.5:** Put the same mutual language switcher at the top of all six
  files.
- [x] **Step 8.6:** State in every translation that English is canonical when
  wording drifts.
- [x] **Step 8.7:** Keep code blocks, package names, file paths, and commands
  unchanged across translations.

## Task 9: Validate Translation Parity

**Files:** no permanent script unless a reusable gap is discovered.

- [x] **Step 9.1:** Run a Node one-off check that all six files exist and contain
  links to all six language files.
- [x] **Step 9.2:** Run a Node one-off check that all six files contain the same
  number of level-2 headings, fenced code blocks, and Mermaid blocks.
- [x] **Step 9.3:** Compare package-name and command inventories across all six
  files; expected result is no missing command in any translation.
- [x] **Step 9.4:** Run `git diff --check` to catch Markdown whitespace damage.
- [x] **Step 9.5:** Manually inspect the beginning, example, quick start, boundary,
  and closing section in every language.

## Task 10: Cross-Validate Documents Against The System

**Files:** all changed documentation.

- [x] **Step 10.1:** Invoke `doc-cross-validator` and read its full instructions.
- [x] **Step 10.2:** Verify README and integration claims against package JSON,
  CLI source, Ponytail 4.7.0 source/config, Superpowers integration, and current
  npm/GitHub metadata.
- [x] **Step 10.3:** Correct every factual mismatch in the canonical English
  source first, then propagate the correction to all translations.
- [x] **Step 10.4:** Run `pnpm doc-gov scan` after governed-doc edits.
- [x] **Step 10.5:** Run `pnpm doc-gov router-check`, `check`, `scan --check`,
  `links`, `audit`, and `doctor`; expected result is exit code 0 and no warnings.

## Task 11: Run Full Repository And Package Verification

**Files:** generated package assets only through build.

- [x] **Step 11.1:** Run `pnpm install --frozen-lockfile`.
- [x] **Step 11.2:** Run `pnpm typecheck`; expected result is both packages pass.
- [x] **Step 11.3:** Run `pnpm test`; expected result is all doc-gov and pro-gov
  tests pass.
- [x] **Step 11.4:** Run `pnpm build`; expected result is both CLIs build and
  new integration/reference files appear under generated pro-gov assets.
- [x] **Step 11.5:** Run `node packages/pro-gov/dist/cli.js doctor`.
- [x] **Step 11.6:** Run both package `pack --dry-run` commands.
- [x] **Step 11.7:** Inspect both tarballs: versions `0.3.4`, pro-gov dependency
  `@pieai/doc-gov ^0.3.4`, Ponytail integration included, and private and
  third-party agent bodies plus operating-system metadata excluded.
- [x] **Step 11.8:** Install both packed tarballs into a temporary project and
  run `doc-gov --help`, `pro-gov --help`, `pro-gov assets list`, and
  `pro-gov doctor`.

## Task 12: Complete Governance Records And Commits

**Files:**

- Modify: `docs/plans/active/PLAN-0004-public-positioning-ponytail-integration.md`
- Modify: `docs/governance/MANIFEST.yml`

- [x] **Step 12.1:** Mark completed plan checkboxes as evidence accumulates.
- [ ] **Step 12.2:** Move the plan to `docs/plans/completed/`, set
  `status: completed`, and keep it canonical as proof history.
- [ ] **Step 12.3:** Run `pnpm doc-gov scan` and the complete doc-gov suite.
- [ ] **Step 12.4:** Review `git diff --stat`, `git diff --check`, and every
  changed file; do not stage unrelated user changes.
- [ ] **Step 12.5:** Create focused commits with governance trailers when
  required.

## Task 13: Merge, Push, And Verify GitHub

**Files:** Git history and release metadata.

- [ ] **Step 13.1:** Use the finishing-branch workflow to merge the isolated
  worktree into local `main` without discarding user changes.
- [ ] **Step 13.2:** Confirm local `main` contains the approved design, plan, and
  implementation commits and has no uncommitted changes.
- [ ] **Step 13.3:** Push `main` to `origin`.
- [ ] **Step 13.4:** Update the GitHub repository description with the same
  answer-first, beginner-readable public position as the README.
- [ ] **Step 13.5:** Wait for the exact-head `docs-check` GitHub Actions run.
- [ ] **Step 13.6:** Inspect failed logs if any step fails; do not publish until
  the exact-head run concludes `success`.

## Task 14: Publish npm And GitHub Release

**Files:** public npm and GitHub release state.

- [ ] **Step 14.1:** Confirm public npm still reports both packages at `0.3.3`
  and neither package already has `0.3.4`.
- [ ] **Step 14.2:** Configure npm Trusted Publisher for both packages when the
  package settings do not already trust `.github/workflows/npm-publish.yml`.
- [ ] **Step 14.3:** Publish `@pieai/doc-gov@0.3.4` first, verify it, then
  publish `@pieai/pro-gov@0.3.4` through the GitHub Actions publish workflow.
- [ ] **Step 14.4:** Poll the official registry until both `npm view` commands
  return `0.3.4`.
- [ ] **Step 14.5:** Install both `0.3.4` packages from the public registry in a
  clean temporary project and run CLI smoke checks.
- [ ] **Step 14.6:** Create GitHub release `v0.3.4` at the verified final commit
  with beginner-friendly release notes and package links.
- [ ] **Step 14.7:** Verify the public release, tag target, npm dist-tag, exact
  GitHub head, and clean synchronized `main`.

## Task 15: Produce The Downstream Session Prompt

**Files:** final response only.

- [ ] **Step 15.1:** Write a short Chinese prompt that tells a separate session
  to read the downstream registry, compare versions/profiles, apply only
  relevant central changes, preserve project truth, run each project's tests,
  and report per-project results.
- [ ] **Step 15.2:** Include released package versions and central commit/tag so
  the downstream session has an exact synchronization target.
- [ ] **Step 15.3:** Keep the prompt short enough to paste directly.

## Acceptance

- [ ] SPEC-0004 requirements 1 through 16 each map to a completed task above.
- [ ] Global Ponytail configuration remains `off`.
- [ ] Six README languages pass parity and factual checks.
- [ ] All local and GitHub checks pass from the final commit.
- [ ] npm and GitHub publicly expose the verified `0.3.4` release.
- [ ] Main is clean and synchronized.
- [ ] Final response includes the downstream synchronization prompt.

## Closeout

When complete, move this plan to `docs/plans/completed/` and set `status: completed`.
