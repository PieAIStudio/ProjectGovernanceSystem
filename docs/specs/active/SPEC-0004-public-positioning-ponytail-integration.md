---
id: SPEC-0004
title: Public Positioning And Ponytail Integration
type: spec
status: draft
canonical: false
owner: ai-assisted
created: 2026-06-21
last_reviewed: 2026-06-21
domain: governance
tags:
  - public
  - ponytail
  - superpowers
  - readme
  - i18n
pinned: false
related:
  - POLICY-DESIGN-PRINCIPLES
  - POLICY-SYNC-STRATEGY
  - REF-ADOPTION-PLAYBOOK
  - REF-SITE-PUBLICATION-BRIEF
---

# SPEC-0004: Public Positioning And Ponytail Integration

## Problem

Project Governance System now includes two published package surfaces,
ProjectLens-style inspection, agent-asset management, documentation governance,
agents routing, and external workflow integration. Its public introduction has
not caught up with that system. The current root README is accurate but reads
like an internal architecture inventory: it explains many pieces before giving
a new reader one memorable answer to "why should I care?"

The repository also needs a durable boundary for Ponytail. Ponytail 4.7.0 is
installed as an external plugin for Codex and Claude Code, while the user's
global Ponytail mode is `off`. Turning `lite` or `full` on globally without an
experiment would make a persistent minimization prompt influence every project
and every Superpowers workflow. That could reduce unnecessary code, but it could
also pressure an agent to shorten tests, explanations, evidence, or requested
scope.

Beginner version: PGS is the project's librarian and traffic desk. Superpowers
is the construction checklist. Ponytail is the cost and complexity adviser.
The adviser can help the team use fewer materials, but it must not cancel the
inspection, fire exits, or the part of the building the owner explicitly asked
for.

The public introduction must make this full picture understandable to a reader
with no assumed knowledge of CLI tools, JSON, hooks, or AI-agent architecture.
It must also provide first-class English, Simplified Chinese, Japanese,
Spanish, French, and German reading paths without creating six competing
sources of product truth.

## Goals

1. Define an evidence-based Ponytail operating policy that cooperates with PGS
   and Superpowers.
2. Add a clear recommendation surface for Superpowers and Ponytail.
3. Rewrite the GitHub introduction using the Pyramid Principle and
   beginner-friendly explanations.
4. Publish five maintained translations from one canonical English source.
5. Align the npm-facing `@pieai/pro-gov` README with the new public position.
6. Validate, publish, and leave a short handoff prompt for a separate downstream
   synchronization session.

## Decisions

### 1. Keep The Global Ponytail Default Off

PGS will not change `~/.config/ponytail/config.json` and will not tell users to
enable `lite`, `full`, or `ultra` globally by default.

The installed Ponytail implementation injects most of the shared minimalism
rules in both `lite` and `full`; only the intensity row and matching example are
filtered by mode. Therefore `lite` must not be described as equivalent to
"almost off." It remains a persistent influence on the same AI that runs
Superpowers.

The recommended order is:

```text
global off
-> explicit one-session or one-task trial
-> compare evidence
-> keep off or opt into a project-local/session mode deliberately
```

PGS documents the policy but does not own a user's global Ponytail setting.

### 2. Test Lite Before Full, In Isolation

Use the same bounded fixture or low-risk task in separate sessions/worktrees:

| Trial | Mode | Purpose |
| --- | --- | --- |
| Baseline | `off` | Record normal PGS + Superpowers behavior. |
| First comparison | `lite` | Measure whether complexity falls without losing requested scope or workflow gates. |
| Optional stress test | `full` | Detect whether stronger minimalism overrides planning, TDD, verification, documentation, or acceptance criteria. |

Every trial must end by returning Ponytail to `off`. `ultra` is outside the
recommended governed workflow and is not part of the first compatibility test.

Compare:

- requirement completeness;
- Superpowers workflow compliance;
- tests, security, accessibility, and error handling retained;
- files, dependencies, and lines changed;
- clarity of explanations and durable evidence;
- token/time data only when the host exposes trustworthy measurements.

No global mode change is accepted solely because one output is shorter.

### 3. Give Each System One Job

The precedence and responsibility model is:

1. User instructions and project safety requirements.
2. PGS routing, governance boundaries, and required evidence.
3. Superpowers workflow gates such as brainstorming, plans, TDD, debugging, and
   verification.
4. Ponytail advice about reducing optional scope, dependencies, files, and
   abstractions.

Ponytail may reduce what is unnecessary or how a requirement is implemented.
It may not remove an explicit requirement or reduce how correctness is proven.

Add `integrations/ponytail.md` as the canonical boundary. Keep Ponytail external
and do not vendor its skill or hook bodies. Update `integrations/superpowers.md`
to explain the companion relationship without making either plugin part of the
PGS package runtime.

### 4. Add One Recommended Tooling Reference

Create `docs/reference/adoption/recommended-agent-tooling.md` as the human
recommendation surface. It must distinguish:

- required PGS packages;
- recommended engineering workflow tooling such as Superpowers;
- optional complexity advisers such as Ponytail;
- project-type differences, especially that doc-only projects do not need the
  full engineering workflow by default.

Superpowers is recommended for engineering/runtime work. Ponytail is recommended
as an installed, opt-in adviser with global mode `off`, not as a mandatory
always-on policy.

Link this reference from the adoption playbook, root README, and relevant public
positioning material.

### 5. Rewrite The Root README As A Pyramid

The canonical English `README.md` will lead with the answer, then support it:

1. **Answer:** PGS keeps AI-assisted projects understandable and governable over
   time.
2. **Pain:** AI can create plans, specs, rules, and evidence faster than humans
   can organize them.
3. **Memorable model:** PGS is the librarian, traffic desk, and inspection
   machine for durable AI project work.
4. **Proof:** explain doc-gov, pro-gov, ProjectLens, profiles, agent assets, and
   external workflow boundaries.
5. **Action:** give a short evaluation path before the detailed reference.

The README must not assume that a GitHub visitor is an experienced programmer.
Technical terms may appear only after a plain-language explanation. Commands
remain available for readers who are ready to act, but the opening must explain
the value before presenting installation syntax.

Confident language and mild rhetorical exaggeration are allowed. False claims
are not. The README must not claim automatic migration, guaranteed token
savings, replacement of Git/Superpowers, or publication of private/third-party
skills.

### 6. Require Three Explicit README Passes

The implementation record must show three review passes:

1. **Pyramid pass:** answer first, pain before architecture, strongest benefits
   before repository inventory.
2. **Beginner pass:** explain every core concept with plain language, analogy,
   and at least one concrete scenario; remove unexplained jargon and walls of
   text.
3. **Truth and conversion pass:** cross-check claims against code/config,
   sharpen the highlights, verify links and commands, and ensure a reader can
   choose the next action.

The third pass is refinement, not permission to add unsupported marketing
claims.

### 7. Use English As The Translation Source Of Truth

Use a language switcher at the top of every public introduction:

```text
English | 简体中文 | 日本語 | Español | Français | Deutsch
```

Keep these files at the repository root for the most direct GitHub navigation:

- `README.md` (canonical English)
- `README.zh-CN.md`
- `README.ja-JP.md`
- `README.es.md`
- `README.fr.md`
- `README.de.md`

Each translation must state that English is canonical when wording drifts. The
translations preserve meaning, examples, headings, links, code, and safety
boundaries; they are not independent rewrites. A parity check must compare the
heading/link/code-block structure across all six files.

### 8. Keep GitHub And npm Introductions Aligned

Update `packages/pro-gov/README.md` with the same short answer, pain, boundary,
and beginner analogy, followed by package-specific install and command details.
It remains shorter than the root README and links to the canonical GitHub
introduction for the full story.

`@pieai/doc-gov` remains version `0.3.3` unless its own package body changes.
`@pieai/pro-gov` may ship the already-unpublished `0.3.4` release after the new
integration/reference assets are copied into its tarball. Private and
third-party `agent-assets/` bodies remain excluded.

### 9. Publish Only After Public Verification

Release remains paused until implementation and verification are complete.
The order is:

1. run local typecheck, tests, build, doc-gov checks, pro-gov doctor, translation
   parity, link checks, and both package dry-run packs;
2. commit and push a clean `main`;
3. wait for GitHub Actions success;
4. publish `@pieai/pro-gov@0.3.4` through the authenticated npm account;
5. verify the public npm registry and install the package in a temporary project;
6. create and verify GitHub release `v0.3.4`;
7. confirm `main` is clean and synchronized.

### 10. End With A Downstream Synchronization Handoff

The final response must include a short Chinese prompt for a separate session.
That session should inspect the downstream registry, compare each project
against the released central version, apply only relevant profile/integration
changes, preserve project-local truth, run each project's checks, and report
per-project results. It must not blindly copy every central file into every
project.

## Planned File Changes

| Surface | Planned change |
| --- | --- |
| `README.md` | Canonical English Pyramid Principle rewrite. |
| `README.<locale>.md` | Five full translations with language switcher. |
| `integrations/ponytail.md` | New external-plugin boundary and mode policy. |
| `integrations/superpowers.md` | Clarify workflow priority and Ponytail cooperation. |
| `docs/reference/adoption/recommended-agent-tooling.md` | New recommendation reference. |
| `docs/reference/adoption/adoption-playbook.md` | Link recommended tooling and preserve profile distinctions. |
| `docs/reference/adoption/site-publication-brief.md` | Align public claims and highlights. |
| `packages/pro-gov/README.md` | Beginner-friendly npm package introduction. |
| `packages/pro-gov/assets/**` | Generated by the existing build, not hand-edited. |

## Non Goals

- Do not change the user's global Ponytail configuration.
- Do not enable Ponytail automatically in downstream projects.
- Do not vendor Ponytail or Superpowers plugin bodies.
- Do not make Ponytail a dependency of `@pieai/pro-gov`.
- Do not promise a percentage reduction in code, tokens, time, or cost.
- Do not publish private or third-party agent skill bodies.
- Do not automatically modify downstream repositories in this implementation
  session; produce a controlled handoff prompt instead.
- Do not redesign doc-gov lifecycle/schema or add another project profile.

## Requirements

1. Keep global Ponytail mode `off` throughout implementation and release.
2. Document isolated `off`/`lite`/optional-`full` comparison instead of changing
   global mode.
3. State that Ponytail cannot override explicit requirements, safety,
   Superpowers gates, tests, verification, or PGS evidence.
4. Add Ponytail and Superpowers to one canonical recommended-tooling reference.
5. Rewrite the English README using answer-first Pyramid Principle structure.
6. Make the README understandable without assumed CLI, hook, JSON, or agent
   architecture knowledge.
7. Include concrete examples and the librarian/traffic-desk/inspection-machine
   analogy without allowing the analogy to replace accurate boundaries.
8. Complete and record three distinct README review passes.
9. Add Simplified Chinese, Japanese, Spanish, French, and German translations.
10. Put the same six-language switcher at the top of every README variant.
11. Treat English as canonical and verify translation structure parity.
12. Update the npm-facing pro-gov README and copied integration/reference assets.
13. Keep private and third-party assets out of the public tarball.
14. Run the complete repository verification and require successful GitHub CI.
15. Verify the public npm version and a clean temporary installation before
    creating the GitHub release.
16. Provide a short downstream synchronization prompt in the final report.

## Acceptance

- A new reader can answer what PGS is, what pain it solves, and how it differs
  from Git, AGENTS.md, Superpowers, and Ponytail after reading the opening.
- The root README leads with user value instead of repository internals.
- All six README files contain working mutual language links and equivalent
  major sections, examples, commands, and boundaries.
- `integrations/ponytail.md` identifies global `off` as the safe default and
  describes isolated testing of `lite` before optional `full`.
- The recommendation reference includes both Superpowers and Ponytail with
  different, accurate recommendation strength.
- The pro-gov npm tarball contains the new public integration/reference assets,
  resolves `@pieai/doc-gov` to the published dependency range, and excludes
  private/third-party assets.
- Local checks and GitHub Actions pass from the final commit.
- npm publicly resolves `@pieai/pro-gov@0.3.4`, and a temporary project can run
  its CLI.
- GitHub publishes `v0.3.4` only after npm verification.
- The final report includes the requested concise downstream sync prompt.
