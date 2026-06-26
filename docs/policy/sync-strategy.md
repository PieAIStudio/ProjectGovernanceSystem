---
id: POLICY-SYNC-STRATEGY
title: Project Governance System Sync Strategy
type: policy
status: stable
canonical: true
owner: human
created: 2026-05-06
last_reviewed: 2026-06-15
domain: adoption
tags:
  - sync
  - adoption
  - package-install
pinned: true
related:
  - REF-ADOPTION-PLAYBOOK
  - REF-PROJECT-RELATIONSHIP
---

# Sync Strategy

## Stage 0: Legacy AI-Assisted Sync

Use this only for legacy projects that still have a local CLI copy and should
not be disturbed mid-flight.

Projects temporarily keep local copies. An AI migration task compares the project against this repo and applies only the relevant profile.

Benefits:

- safest while the system is young
- no accidental breakage across known downstream projects
- project-local differences stay visible

Drawback:

- requires explicit migration prompts

## Stage 1: Package Install + Read-Only Diff

Partially available now as a read-only check:

```bash
pro-gov init --profile engineering-runtime --dry-run
pro-gov sync --check
doc-gov migrate --profile engineering-runtime --check
```

New migration work should install `@pieai/pro-gov` as the project-level
starter/profile asset source and `@pieai/doc-gov` as the validator source. Use
`pro-gov init --dry-run`, `pro-gov sync --check`, `doc-gov migrate --check`,
`router-check`, and `doctor` to verify local files, hooks, and CI.

This does not update files yet. It verifies that the target project structurally
matches the selected profile before a human or AI sync task edits anything.

Project evidence and agent-asset recommendation are also read-only at this
stage:

```bash
pro-gov assets discover --target .
pro-gov assets recommend --target .
pro-gov lens inspect --target .
```

The future write mode should update core/starter files while preserving local
profile sections:

```bash
pro-gov init --profile engineering-runtime --apply
```

## Stage 2: Package-Based Adoption

Projects depend on the packages instead of keeping local CLI or starter copies:

```bash
pnpm add -D @pieai/pro-gov @pieai/doc-gov
pnpm pro-gov doctor
pnpm doc-gov check
```

This is now the preferred direction for new adoption work and for projects that
can update scripts, local hooks, and CI in one deliberate change. Record adopted
projects in `docs/reference/adoption/downstream-project-registry.md`. Do not
switch only the package command while leaving old guardrails behind; that
creates a half-migrated project.

## Package Naming Model

`@pieai/doc-gov` is the stable validator subsystem: the command-line tool that
checks governed docs, router integrity, manifest freshness, links, health, and
read-only migration readiness.

`@pieai/pro-gov` is the project-level distribution subsystem: the package that
ships starter files, profiles, agents-routing references, adoption references,
and read-only init/sync/doctor commands.

Do not rename `@pieai/doc-gov` to `pro-gov`. They do different jobs:

| Package | Role |
| --- | --- |
| `@pieai/doc-gov` | Validate governed docs, router integrity, manifest, links, hooks, CI, and migration readiness. |
| `@pieai/pro-gov` | Distribute project-level governance assets and run conservative read-only init/sync checks. |

Beginner version: `doc-gov` is the inspection machine. `pro-gov` is the setup
kit and parts catalog. The first `pro-gov` release still keeps write behavior
off by default, because overwriting another project's router or policies without
a review is too risky.

## Local Agent Asset Registry

`agent-assets/` is the local-only upstream registry for Yuanfei's skills,
npx-installed skills, non-npx third-party skill packs, rules, commands, bundles,
and ProjectLens skills. It is ignored by Git in the public repository. Reviewed,
publishable agent assets are promoted into `public-agent-assets/`.

`public-agent-assets/` is not a second private source of truth. It is the
reviewed public release surface. A public asset may be byte-for-byte identical
to its private source, or it may be a cleaned-up version with machine-local
paths, private wording, and non-redistributable material removed.

Every publishable public asset must record its promotion metadata in
`public-agent-assets/registry.json`: private source path, private source hash,
public hash, whether it was sanitized, review date, and review notes. Maintainer
checkouts should run:

```bash
pro-gov assets public-check --json
```

Beginner version: `agent-assets/` is the workbench; `public-agent-assets/` is
the clean display shelf. The registry receipt proves which workbench item the
display item came from and whether either side changed after review.

This keeps two concerns separate:

| Surface | Contains |
| --- | --- |
| Public `@pieai/pro-gov` package | starter/profile/adoption assets, read-only discovery, ProjectLens evidence commands |
| Maintainer local checkout | local-only private and third-party skill bodies plus explicit asset plan/apply/check commands |
| Public repository | `public-agent-assets/` promotion surface only; no unpublished asset bodies |

Use managed asset writes only through reviewable plans:

```bash
pro-gov assets plan --target /path/to/project --bundle base-governance --host codex --out /tmp/pro-gov-asset-plan.json
pro-gov assets apply --plan /tmp/pro-gov-asset-plan.json
pro-gov assets check --target /path/to/project
```

For manual-only skills, keep the same plan-gated flow and choose manual
placement:

```bash
pro-gov assets plan --target /path/to/project --bundle <bundle-id> --host codex --placement manual --out /tmp/pro-gov-asset-plan.json
```

This writes managed symlinks under `.agents/manual-skills/` so broad or
meta-level skills stay explicit instead of auto-discoverable.

Do not run `npx skills` inside every target project. Maintainers may keep a
native npx root in local `agent-assets/skills/npx-skills/` through
`pro-gov assets npx ... --plan` and then review the generated diff before
changing the local registry. Promote only reviewed public assets into
`public-agent-assets/`.

## Checkout Path Boundary

The local checkout folder and GitHub repository slug are currently
`ProjectGovernanceSystem`. The private workspace package identity is `pro-gov`,
and the installed package identities are `@pieai/doc-gov` and
`@pieai/pro-gov`.

Do not hard-code a machine-local upstream checkout path into downstream project
scripts, routers, or governed docs. Use package commands for executable wiring,
the canonical GitHub repository URL for public links, repository-relative paths
inside this repo, and plain "Project Governance System upstream repository"
wording when a downstream project needs to name the source. If a one-off
handoff prompt needs a local clone, use a placeholder such as
`<local ProjectGovernanceSystem checkout path>`.

## Stage 3: Write-Mode Template / Init

Future projects may start with a write-mode command such as:

```bash
pnpm dlx @pieai/pro-gov init --profile doc-only --apply
pnpm dlx @pieai/pro-gov init --profile engineering-runtime --apply
```

Do not add this until Stage 1 proves the selected profile is structurally ready
across multiple downstream projects and the command has safe non-overwrite or
merge behavior.
