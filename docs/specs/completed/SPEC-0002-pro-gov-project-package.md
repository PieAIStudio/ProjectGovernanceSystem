---
id: SPEC-0002
title: Pro-Gov Project Package
type: spec
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
  - adoption
pinned: false
related:
  - POLICY-DESIGN-PRINCIPLES
  - POLICY-VERSIONING
  - REF-ADOPTION-PLAYBOOK
  - REF-PUBLIC-RELEASE-CHECKLIST
  - REF-DOWNSTREAM-PROJECT-REGISTRY
supersedes: []
superseded_by: null
---

# SPEC-0002: Pro-Gov Project Package

## Problem

`@pieai/doc-gov` is the published documentation-governance CLI. It is useful,
but it intentionally packages only the executable validator and its CLI guide.
It does not ship the complete Project Governance System project skeleton:

- `starter/`
- `profiles/`
- `integrations/`
- adoption references
- a project-level init or sync surface

That split has become confusing. Downstream projects need the `doc-gov` machine,
but they also need the correct project-level shelves, profile rules, starter
routers, hook/CI templates, and a safe way to compare their local governance
files against the central source.

## Decision

Add a new project-level npm package named `@pieai/pro-gov` with a `pro-gov`
binary.

`pro-gov` is the project-level distribution surface for Project Governance
System. It should depend on `@pieai/doc-gov` instead of reimplementing document
validation.

Use this relationship:

| Package | Binary | Purpose |
| --- | --- | --- |
| `@pieai/doc-gov` | `doc-gov` | Validate governed docs, manifest, router, links, hooks, and CI wiring. |
| `@pieai/pro-gov` | `pro-gov` | Ship starter/profile/integration assets and provide safe project-level init/sync/doctor commands. |

Beginner version: `doc-gov` is the inspection machine. `pro-gov` is the project
setup kit that brings the inspection machine plus the filing cabinet, labels,
profile instructions, and migration checklist.

## Package Scope

The first `@pieai/pro-gov` release should package only reusable upstream
governance assets:

```text
starter/
profiles/
integrations/
docs/reference/adoption/
README.md
LICENSE
```

It should not package project-local truth, downstream project copies, generated
manifests as live downstream state, or product artifacts.

## CLI Surface

The first CLI surface should be conservative and mostly read-only:

```bash
pro-gov --help
pro-gov init --profile engineering-runtime --dry-run
pro-gov init --profile doc-only --dry-run
pro-gov sync --check
pro-gov doctor
pro-gov assets list
```

### `pro-gov init --profile <profile> --dry-run`

Reports which starter files would be created in the current project. It must not
write unless `--apply` is explicitly provided in a future version or explicitly
implemented with non-overwrite defaults.

### `pro-gov sync --check`

Compares the target project's checked-in governance files against the packaged
starter/profile/integration assets. It reports missing files and changed files,
but does not overwrite local files.

### `pro-gov doctor`

Runs the project-level checks that prove the project can use the package:

- `pro-gov assets list`
- package asset availability
- profile availability
- `doc-gov doctor` when `doc-gov` is installed or resolvable

### `pro-gov assets list`

Prints the packaged reusable assets so an adopter can see what the package
actually contains.

## Safety Defaults

The first implementation must be safe for downstream projects:

- default to read-only commands;
- never overwrite local project files without an explicit future `--apply`;
- preserve project-local product truth;
- keep `doc-gov` as the authoritative validator;
- make package contents visible through `assets list`;
- fail with clear messages when profile names are invalid;
- keep package startup fast enough for `pnpm dlx @pieai/pro-gov --help`.

## Non Goals

- Do not rename or replace `@pieai/doc-gov`.
- Do not publish the root private workspace package.
- Do not make `pro-gov` a copy of the whole Git repository.
- Do not add automatic downstream rewrite behavior in the first release.
- Do not auto-sync all known downstream projects from this package in one step.
- Do not add a third governance profile.

## Versioning

`@pieai/pro-gov` should start at the same package version as the current central
system release line when published. If it lands alongside a new `@pieai/doc-gov`
metadata patch, publish both packages with aligned versions:

```text
@pieai/doc-gov@0.3.3
@pieai/pro-gov@0.3.3
```

The packages may diverge in future releases if one changes without the other,
but the first release should be aligned to make downstream adoption easier to
reason about.

## Downstream Sync Strategy

After `@pieai/pro-gov` is implemented and dry-run packaging is verified, update
downstream projects in stages:

1. one low-risk doc-only project;
2. one healthy engineering-runtime project;
3. special projects such as `story-creator`;
4. partial or actively migrating projects such as `Non-Heroes`.

Each downstream sync must run the target project's governance gate:

```bash
pnpm doc-gov migrate --profile <profile> --check
pnpm doc-gov router-check
pnpm doc-gov check
pnpm doc-gov scan --check
pnpm doc-gov links
pnpm doc-gov audit
pnpm doc-gov doctor
git diff --check
```

Engineering projects must also run their local typecheck/test/build ladder.

## Acceptance

The first implementation is complete when:

- `packages/pro-gov/package.json` publishes as `@pieai/pro-gov`.
- the package exposes a `pro-gov` binary.
- `pro-gov --help` prints the command list.
- `pro-gov assets list` proves `starter/`, `profiles/`, `integrations/`, and
  adoption references are packaged.
- `pro-gov init --profile <profile> --dry-run` reports planned starter writes
  without changing files.
- `pro-gov sync --check` detects missing or different reusable governance files
  without changing files.
- `pro-gov doctor` runs project-level package checks and delegates to
  `doc-gov doctor` when available.
- tests cover the CLI, asset inventory, profile validation, dry-run behavior,
  and sync-check differences.
- `pnpm --filter @pieai/pro-gov pack --dry-run` shows only intended files.
- central doc-gov gates pass.

## Review State

This spec was implemented on 2026-06-13 as the first `@pieai/pro-gov` package
surface. Keep the first release conservative and read-only by default until
multiple downstream projects prove the same write-mode sync shape.
