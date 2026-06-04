---
id: POLICY-VERSIONING
title: Project Governance System Versioning Policy
type: policy
status: stable
canonical: true
owner: human
created: 2026-05-09
last_reviewed: 2026-06-04
domain: governance
tags:
  - versioning
  - migration
  - profiles
pinned: false
related:
  - POLICY-DESIGN-PRINCIPLES
  - REF-MIGRATION-V0-9
---

# Versioning Policy

Versioned governance files make migrations explicit. A downstream project can
hold `v0.9` and `v1.0` side by side during a short migration window instead of
silently changing the meaning of a file in place.

## Two Version Numbers

This repository has two different version lines:

- **Governance contract version**: `v0.9`, `v1.0`, etc. This appears in file
  names such as `ssot-v0.9.md`. Bump it when downstream projects must update
  required paths, startup reading, or agents-routing contracts.
- **CLI/package version**: `0.2.0`, `0.2.1`, `0.3.0`, etc. This appears in
  `package.json` and generated manifests. Bump it for implementation changes,
  bug fixes, tests, and packaging changes. A CLI/package bump does not always
  require downstream projects to change governance file names.

Beginner version: the governance contract is the road rule edition; the package
version is the road-sign machine version. Fixing the machine does not always
mean rewriting the road rules.

## Current Version

`v0.9` means the system is useful and enforced, but the install/sync model is
still Stage 0: projects may keep local `tools/doc-gov` copies until package
installation is deliberately enabled.

The currently versioned governance files are:

- `docs/governance/ssot-v0.9.md`
- `docs/governance/agents-routing/engineering-runtime-v0.9.md`
- `docs/governance/agents-routing/doc-only-v0.9.md`

## When To Bump

Bump the governance contract minor version when a project must update file
paths, startup reading, router wording, or required governance files.

Bump the governance contract major version only when the
lifecycle/schema/profile contract changes in a way that older projects cannot
safely ignore.

Do not bump versions for wording-only edits that do not change the required
shape.

## Migration Rule

When adding a new version:

1. Add the new versioned file in the central repo.
2. Update `starter/` to point at the new file.
3. Update `router-check` so projects cannot accidentally mix old and new
   required surfaces.
4. Write or update a migration checklist under `docs/reference/adoption/`.
5. Sync downstream projects intentionally.

Keep the old version only for the migration window. Once all active projects are
on the new version, remove the old required path from the current starter and
checks.
