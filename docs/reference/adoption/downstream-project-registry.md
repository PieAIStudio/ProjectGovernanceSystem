---
id: REF-DOWNSTREAM-PROJECT-REGISTRY
title: Portfolio Manifest Guide
type: reference
status: active
canonical: true
owner: human
created: 2026-06-09
last_reviewed: 2026-07-02
domain: adoption
tags:
  - downstream
  - adoption
  - registry
  - portfolio
pinned: false
related:
  - REF-PROJECT-RELATIONSHIP
  - POLICY-SYNC-STRATEGY
  - SPEC-0005
---

# Portfolio Manifest Guide

Project Governance System is a public execution engine. It does not keep a
real user's private downstream repository list in this repository or in the npm
package.

Use an external portfolio manifest when one control repository needs PGS to
inspect or plan changes across multiple target repositories.

Beginner version: PGS is the public tool. The portfolio manifest is your private
dispatch sheet. PGS can read the dispatch sheet, but the public toolbox should
not ship one user's private project map.

## Manifest Location

Each organization or user chooses where to store their private manifest.

Recommended shape:

```text
<control-plane repo>/
  .pro-gov/
    portfolio.json
```

The real control-plane instance is intentionally not copied into this public
PGS reference.

## Minimal Example

For a normal npm-package user, the manifest can be this small. There is no
required private headquarters repository and no required local PGS checkout:

```json
{
  "schemaVersion": 1,
  "portfolioId": "example-org",
  "targets": [
    {
      "id": "web-app",
      "path": "/path/to/web-app",
      "profile": "engineering-runtime",
      "assetBundles": ["base-governance", "frontend-app"]
    }
  ]
}
```

If a user has a separate control repository or full PGS checkout, they may add
those as metadata:

```json
{
  "schemaVersion": 1,
  "portfolioId": "example-org",
  "controlPlane": {
    "id": "headquarters",
    "path": "/path/to/headquarters"
  },
  "executionEngine": {
    "id": "project-governance-system",
    "path": "/path/to/ProjectGovernanceSystem"
  },
  "targets": [
    {
      "id": "web-app",
      "path": "/path/to/web-app",
      "profile": "engineering-runtime",
      "assetBundles": ["base-governance", "frontend-app"]
    }
  ]
}
```

## Fields

| Field | Meaning |
| --- | --- |
| `schemaVersion` | Manifest format version. Current value is `1`. |
| `portfolioId` | Short identifier for this user's portfolio. |
| `controlPlane` | The private coordination repository. It is metadata, not a default downstream target. |
| `executionEngine` | The PGS checkout or package source used to run commands. It is metadata, not a default downstream target. |
| `targets` | Repositories PGS may inspect, check, or plan for by default. |
| `profile` | Optional target profile. Current values are `engineering-runtime` and `doc-only`. |
| `assetBundles` | PGS asset bundles to plan for that target. |

Do not add `sharedRules` to the manifest yet. Shared rules are real, but this
manifest does not plan, apply, or check them today; keeping a field for them
would create a false sense of management.

`controlPlane` and `executionEngine` are not part of the default target set.
They may also use PGS packages, but portfolio automation should not treat them
as ordinary downstream repositories unless the operator explicitly chooses to do
so. This keeps the public PGS engine reusable for organizations that do not
have a separate headquarters-style repository.

## Commands

```bash
pro-gov portfolio check --config /path/to/portfolio.json
pro-gov portfolio check --config /path/to/portfolio.json --json
pro-gov portfolio plan --config /path/to/portfolio.json --target web-app --json
pro-gov portfolio assets-check --config /path/to/portfolio.json --json
```

`check` validates the manifest and local paths.

`plan` creates dry-run target asset plans. It does not write files. If a target
already has unmanaged files or symlinks at a planned destination, the plan fails
instead of guessing whether it is safe to overwrite.

When `executionEngine` is omitted, `plan` uses the reviewed public assets
packaged with `@pieai/pro-gov`. That is the normal path for npm users.

`assets-check` runs central strict asset verification for the selected targets.
It uses `executionEngine.path/agent-assets` when that private registry exists,
so a control repository can validate private skill ids and placement without
bundling those private assets into the public npm package.

For engineering-runtime targets, run this after installing or syncing host hook
configuration:

```bash
pro-gov doctor --strict-hooks
```

That check proves the target has the cross-host Compound Gate wiring expected by
PGS: Codex, Claude Code, and Antigravity each have a Stop/SubagentStop path into
`pro-gov host-hook`. It does not simulate the hosts themselves; PGS keeps
per-host contract tests in the package test suite for the supported
Stop/SubagentStop input and output shapes.

## Public Boundary

Do not commit real user portfolio manifests into the public PGS package unless
they are sanitized examples.

Public examples should use placeholder paths such as `/path/to/web-app`, not
machine-local paths like `/Users/name/company/private-project`.

Private portfolio status, health snapshots, exact local paths, and target
project cleanup reports belong in the user's control-plane repository.
