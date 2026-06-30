---
id: SPEC-0005
title: PieHQ-Controlled Public PGS
type: spec
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
  - POLICY-DESIGN-PRINCIPLES
  - POLICY-SYNC-STRATEGY
  - POLICY-UPSTREAMING
  - SPEC-0003
---

# SPEC-0005: PieHQ-Controlled Public PGS

## Problem

Project Governance System has two jobs that are easy to confuse:

- It is a public product that anyone should be able to install and use.
- It is also Yuanfei's local governance engine for the PieAI project portfolio.

Those jobs need a clean boundary. A public npm package must not ship PieAI-only
paths, PieHQ canon, downstream project lists, private registry details, or
retired host adapters. At the same time, PieHQ needs to control how PGS manages
the PieAI project fleet.

Beginner version: PGS is a tool that can be sold to anyone. PieHQ is Yuanfei's
office. The tool may read an instruction sheet from the office, but the public
tool box must not contain Yuanfei's private office map.

## Decisions

### 1. Keep PGS Physically Independent

Do not move the Project Governance System repository under PieHQ.

PGS remains an independent public repository and package source. PieHQ controls
PGS by owning private configuration, not by containing the PGS source tree.

This keeps the public product boundary clear:

```text
/Users/yuanfei/PieAI/PieHQ
  .pro-gov/portfolio.json        # private PieAI control configuration

/Users/yuanfei/PieAI/ProjectGovernanceSystem
  packages/pro-gov               # public execution engine
  packages/doc-gov               # public document validator
  public-agent-assets            # reviewed public asset surface
  agent-assets                   # local maintainer asset source
```

PieHQ may reference PGS as the execution engine. PGS must not assume PieHQ
exists.

### 2. Make PieHQ The Private Control Plane

PieHQ owns the PieAI portfolio configuration. PGS reads that configuration
through an explicit `--config` path.

Initial shape:

```json
{
  "schemaVersion": 1,
  "portfolioId": "pieai",
  "controlPlane": {
    "id": "piehq",
    "path": "/Users/yuanfei/PieAI/PieHQ"
  },
  "executionEngine": {
    "id": "project-governance-system",
    "path": "/Users/yuanfei/PieAI/ProjectGovernanceSystem"
  },
  "targets": [
    {
      "id": "ownmyspace",
      "path": "/Users/yuanfei/PieAI/OwnMySpace",
      "profile": "engineering-runtime",
      "assetBundles": ["web-3d"]
    }
  ]
}
```

`targets` contains repositories that PGS may inspect, plan for, or later apply
managed changes to. `controlPlane` and `executionEngine` are metadata and must
not be included in bulk downstream apply by default.

Beginner version: PieHQ is the tower, PGS is the maintenance team, and
`portfolio.json` is the dispatch sheet. The tower building can still be
inspected by normal safety rules, but it is not one of the flights.

### 3. Keep Markdown For Humans, JSON For Machines

PieHQ should keep a short human-readable Markdown page explaining the portfolio
model, but the executable truth for PGS should be JSON.

The JSON file is the execution SSOT. Markdown may summarize or link to it, but
Markdown must not become a second executable registry.

Reason: Markdown is excellent for humans and AI discussion. JSON is better for
repeatable CLI checks because fields have fixed names and machines do not need
to parse prose tables.

### 4. Public PGS Must Be Config-Driven

PGS commands that operate across projects must accept an external config path:

```bash
pro-gov portfolio check --config /path/to/portfolio.json
pro-gov portfolio plan --config /path/to/portfolio.json --target ownmyspace
pro-gov portfolio assets-check --config /path/to/portfolio.json
```

PGS may ship a generic example manifest and schema notes. It must not ship the
real PieHQ/PieAI project list inside the npm package.

The manifest must stay limited to fields PGS actually validates. For now,
`sharedRules` is intentionally not accepted because PGS does not yet plan,
apply, or check shared-rule placement from the portfolio manifest.

The existing PGS downstream-project registry should either move to PieHQ or be
replaced in public package assets by a generic example. Public package checks
must fail if packaged assets contain machine-local PieAI paths such as
`/Users/yuanfei/PieAI/`.

### 5. Remove Retired Gemini Distribution Artifacts

New downstream adoption must not create `GEMINI.md` or `.gemini/` files.

Gemini-related host strings may remain in historical private asset metadata only
where needed to describe imported legacy assets. They must not drive new starter
files or downstream initialization.

### 6. Make Skill Scope And Placement A Registry SSOT

Skill scope and placement must be decided once in the asset registry, not
separately in each target project.

Add one scope field and one placement field for skill assets:

```json
{
  "id": "npx-skills/loop-library",
  "kind": "skill",
  "defaultScope": "user",
  "defaultPlacement": "auto"
}
```

Allowed scope values:

| Value | Meaning |
| --- | --- |
| `project` | The skill belongs to a target repository and is managed through project asset plans. |
| `user` | The skill belongs to the user's global skill roots and must not be locked into a target repository. |

Allowed placement values for project-scoped Codex skills:

| Value | Target | Meaning |
| --- | --- | --- |
| `auto` | `.agents/skills/<name>` | The skill is safe to auto-discover during normal work. |
| `manual` | `.agents/manual-skills/<name>` | The skill is broad, meta-level, heavy, or should be invoked explicitly. |

Bundles should list assets only. They should not decide placement. The planner
derives each target path from the asset registry. User-scoped skills are linked
once under user skill roots, such as `/Users/yuanfei/.agents/skills` for Codex
and `/Users/yuanfei/.claude/skills` for Claude Code compatibility.

The current global `--placement` option should become a migration override, not
the normal path. Normal installs should use per-asset placement. Checks should
report:

- the same skill linked under both `.agents/skills` and `.agents/manual-skills`;
- registry-managed skills installed in the wrong placement;
- user-scoped skills still recorded in a project `.pro-gov/assets.lock.json`;
- dangling links;
- unmanaged PGS-looking skill links not recorded in `.pro-gov/assets.lock.json`.

Beginner version: `.agents/skills` is the workbench. `.agents/manual-skills` is
the labeled cabinet. User-level skills are the tool belt you carry between
rooms. The registry should say whether a tool belongs to a room or to the tool
belt, so each room does not invent a different shelf.

### 7. Clarify The Two Skill-Management Skills

There are two skill-management surfaces, but they should not both make the same
decisions.

| Surface | Role |
| --- | --- |
| `skill-installer` | Upstream/system acquisition helper for installing skills from supported public sources into the user's skill environment. |
| `my-skills-manager` | Yuanfei/PGS governance skill for canonical roots, private/public asset boundaries, symlink placement, npx cache discipline, and downstream project exposure. |

`my-skills-manager` is the SSOT for Yuanfei's local skill governance. It may
delegate acquisition to supported public installers when appropriate, but it
decides canonical source roots, placement, verification, and public promotion
rules.

The `my-skills-manager` skill should be updated to state this boundary
explicitly and to prefer PGS registry-driven placement once SPEC-0005 is
implemented.

### 8. Prefer Existing Tools, But Do Not Add A Dependency Prematurely

The first implementation should use Node's built-in JSON parsing plus small
TypeScript validators, matching the existing asset registry code.

If the manifest grows beyond simple validation, switch to a standard JSON
Schema validator such as Ajv and publish the schema as a public contract.

Do not introduce Zod just for this manifest unless PGS already adopts it for
other runtime configuration. A TypeScript-first schema library is useful inside
apps, but a public CLI configuration contract should stay language-neutral.

## Requirements

1. PGS remains an independent public repository.
2. PieHQ owns the private PieAI portfolio manifest.
3. PGS portfolio commands read an explicit external config path.
4. Public PGS package assets must not include PieAI private project lists or
   machine-local paths.
5. New PGS starter/init flows must not create `GEMINI.md` or `.gemini/`.
6. Skill assets gain a registry-level default placement.
7. Bundles stop being the source of placement truth.
8. Asset checks report duplicate auto/manual links, placement drift, dangling
   links, and unmanaged PGS-looking skill links.
9. `my-skills-manager` states its boundary with `skill-installer` clearly.
10. Downstream cleanup happens after the PGS/PieHQ contract and checks exist,
    so cleanup can be verified instead of performed by memory.

## Non Goals

- Do not move PGS into the PieHQ directory.
- Do not make PieHQ a dependency of the public PGS package.
- Do not bulk edit downstream projects before the portfolio manifest and asset
  placement checks are implemented.
- Do not add a database, server, or cloud service.
- Do not turn PGS into a general project-management platform.

## Implementation Shape

### PGS Public Changes

- Add `portfolio` command group to `@pieai/pro-gov`.
- Add a small portfolio manifest loader and validator.
- Add package leak checks for private PieAI paths and retired Gemini starter
  artifacts.
- Add `defaultPlacement` to asset registry skill entries.
- Update asset plan/check logic to use per-asset placement.
- Update public docs so downstream registry examples are generic.

### PieHQ Private Changes

- Add `.pro-gov/portfolio.json`.
- Convert the current managed repository list into the manifest, excluding
  `controlPlane` and `executionEngine` from default bulk apply targets.
- Keep the existing human canon page as explanation, or update it to reference
  the manifest as execution truth.

### Skill Governance Changes

- Update `agent-assets/skills/pie-skills/my-skills-manager/SKILL.md` with:
  - boundary versus `skill-installer`;
  - registry-driven placement rule;
  - warning against per-project placement drift;
  - migration note for existing `.agents/skills` and `.agents/manual-skills`
    inconsistencies.

## Safety And Verification

Before implementation is accepted:

- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `node packages/pro-gov/dist/cli.js doctor`
- `node packages/pro-gov/dist/cli.js assets check --target <temp target> --json`
- `node packages/pro-gov/dist/cli.js portfolio check --config <temp manifest>`
- `pnpm --filter @pieai/pro-gov pack --dry-run`
- inspect packed files for:
  - `/Users/yuanfei/PieAI/`
  - `PieHQ`
  - `GEMINI.md`
  - `.gemini/`

Downstream project cleanup must report project-by-project removals and
placement fixes after the checks exist.

## Confidence And Loopholes

This strategy is decision-grade, not magic certainty.

Known loopholes and fixes:

| Loophole | Fix |
| --- | --- |
| JSON and Markdown drift apart. | JSON is execution SSOT; Markdown only explains or links. |
| Portfolio manifest grows into a second product database. | Keep only fields PGS executes: id, path, profile, asset bundles, shared rules. |
| Private paths leak into npm again. | Add package leak checks and make them part of release verification. |
| Global placement override reintroduces drift. | Treat `--placement` as migration-only; normal plans use registry placement. |
| PGS accidentally manages PieHQ as a downstream target. | Keep `controlPlane` metadata outside default `targets`. |
| `my-skills-manager` and `skill-installer` overlap again. | Document acquisition versus governance boundary in `my-skills-manager`. |

## Acceptance

- The user approves this spec as the root design.
- A follow-up implementation plan breaks the work into separate PGS, PieHQ, skill
  governance, and downstream cleanup tasks.
- Implementation does not start until the plan is approved.
