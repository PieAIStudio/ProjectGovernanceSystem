---
id: POLICY-SYNC-STRATEGY
title: Project Governance System Sync Strategy
type: policy
status: stable
canonical: true
owner: human
created: 2026-05-06
last_reviewed: 2026-06-05
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

## Stage 1: Package Install + Scripted Diff

Partially available now as a read-only check:

```bash
doc-gov migrate --profile engineering-runtime --check
```

New migration work should install `@pieai/doc-gov` as the CLI source and use
`migrate --check`, `router-check`, and `doctor` to verify the local files,
hooks, and CI.

This does not update files yet. It verifies that the target project structurally
matches the selected profile before a human or AI sync task edits anything.

The future `--apply` mode should update core/starter files while preserving
local profile sections:

```bash
doc-gov migrate --profile engineering-runtime --apply
```

## Stage 2: Package Install

Projects depend on `@pieai/doc-gov` instead of keeping local CLI source:

```bash
pnpm add -D @pieai/doc-gov
pnpm doc-gov check
```

This is now the preferred direction for new adoption work and for projects that
can update scripts, local hooks, and CI in one deliberate change. Record adopted
projects in `docs/reference/adoption/downstream-project-registry.md`. Do not
switch only the package command while leaving old guardrails behind; that
creates a half-migrated project.

## Package Naming Roadmap

`@pieai/doc-gov` is the first npm package because it is the stable executable
subsystem: the command-line tool that checks governed docs, router integrity,
manifest freshness, links, health, and read-only migration readiness.

Project Governance System is larger than `doc-gov`. It also includes starter
files, profiles, agents-routing rules, adoption strategy, and integration
boundaries. Those pieces are public in the GitHub repository, but they are not
yet a safe one-command npm install.

Do not rename `@pieai/doc-gov` to the full system name just because the GitHub
project is called Project Governance System. That would overpromise. A full
system package should wait until it can safely provide:

- profile-aware `pgs init`
- non-destructive `pgs upgrade`
- starter/profile installation
- safe AGENTS/CLAUDE/GEMINI merge behavior
- guardrail wiring for local hooks and CI
- clear rollback and migration checks

Future package options:

- keep `@pieai/doc-gov` as the low-level CLI engine
- add `@pieai/pgs` or `@pieai/project-governance-system` later as the full
  system installer that depends on `@pieai/doc-gov`

Beginner version: publish the engine first. Publish the whole car only after it
has doors, seats, steering, and safe upgrade instructions.

## Stage 3: Published Template / Init

New projects can start with:

```bash
pnpm dlx @pieai/doc-gov init --profile doc-only
pnpm dlx @pieai/doc-gov init --profile engineering-runtime
```

Do not jump here before Stage 1 proves the selected profile is structurally
ready.
