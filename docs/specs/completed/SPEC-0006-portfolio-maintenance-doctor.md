---
id: SPEC-0006
title: Portfolio Maintenance Doctor
type: spec
status: completed
canonical: true
owner: ai-assisted
created: 2026-07-02
last_reviewed: 2026-07-02
domain: portfolio-governance
tags:
  - portfolio
  - maintenance
  - agent-assets
  - host-tooling
  - downstream-sync
pinned: false
related:
  - SPEC-0003
  - SPEC-0005
  - POLICY-SYNC-STRATEGY
  - REF-PORTFOLIO-TECHNOLOGY-GOVERNANCE
---

# SPEC-0006: Portfolio Maintenance Doctor

## Problem

PGS already has asset locks, bundle plans, router checks, host-hook checks, and a
portfolio manifest. The pieces work independently, but there is no single
read-only command that proves a managed fleet still matches its declared PGS
state after skills, packages, hooks, or bundles change.

The missing lifecycle is most visible when a third-party update removes,
renames, or merges skills. A new lock can describe the replacement correctly
while a previously managed symlink remains in the target repository. The old
link is no longer in the new lock, so a lock-only check can miss it.

Beginner version: PGS has good inspection tools, but the operator still walks
around the garage remembering which gauge to read. This change adds one
dashboard. It does not build another garage.

## Decisions

### 1. Add One Offline Portfolio Gate

Add:

```bash
pro-gov portfolio doctor --config /path/to/portfolio.json [--target <id|all>] [--json]
```

The default doctor is deterministic, read-only, and network-free. It combines
existing PGS checks and expected-state comparison into one exit code. It must
not install packages, update plugins, fetch Git remotes, modify locks, or edit a
target repository.

For each target it checks:

- target existence and readable `package.json`;
- declared and locally installed `@pieai/pro-gov` and `@pieai/doc-gov` versions;
- required PGS entry, router, profile, CI, and hook surfaces by running the
  target's installed package CLIs;
- strict managed-asset integrity;
- portfolio `assetBundles` versus `.pro-gov/assets.json` and
  `.pro-gov/assets.lock.json`;
- managed asset ids, paths, hashes, and placement;
- previously managed symlinks that are no longer part of the expected bundle;
- local Git cleanliness as reported evidence, without modifying or blocking a
  health-only inspection solely because product work is present.

### 2. Compare Desired State, Not Only Lock Integrity

`portfolio assets-check` answers whether the current lock and linked content
are internally healthy. `portfolio doctor` additionally answers whether that
lock is still the state declared by the portfolio manifest and current bundle
registry.

The doctor reports stable issue codes so CI and future agents do not parse
English prose. Required issue families are:

- `target-missing`;
- `package-declaration-missing`;
- `package-version-drift`;
- `target-check-failed`;
- `bundle-drift`;
- `asset-set-drift`;
- `asset-lock-drift`;
- `orphaned-managed-symlink`;
- `host-tooling-missing`;
- `host-tooling-disabled`.

### 3. Make Removal Explicit And Safe

Asset plans may include a `remove-symlink` action only when all of these are
true:

1. the path was recorded in the target's previous asset lock;
2. the asset is absent from the newly resolved bundle state;
3. the current path is still a symbolic link;
4. the path is inside a PGS-managed asset root;
5. the link has not been replaced by a real file or directory.

Apply must refuse removal if any condition no longer holds. It must never
delete unmanaged files, directories, or links discovered only by filename.

### 4. Keep Host Plugins Outside Project Sync

Codex, Claude Code, and Antigravity own their plugin or skill installation
mechanisms. PGS must not silently upgrade another person's host environment.

The portfolio manifest may optionally declare an operator-machine baseline for
host tooling. The first public contract supports Codex and Claude Code plugin
inventory because both expose machine-readable native commands. Antigravity
remains supported by project hook contract tests and target hook checks; PGS
must not invent an unofficial Antigravity plugin database.

Example optional configuration:

```json
{
  "hostTooling": [
    {
      "host": "codex",
      "plugins": [
        "superpowers@openai-curated",
        "compound-engineering@compound-engineering-plugin",
        "ponytail@ponytail"
      ]
    },
    {
      "host": "claude-code",
      "plugins": [
        "superpowers@superpowers-marketplace",
        "compound-engineering@compound-engineering-marketplace",
        "ponytail@ponytail"
      ]
    }
  ]
}
```

The doctor checks installed and enabled state and reports observed versions. It
does not require "latest" and does not compare unrelated marketplace version
schemes. Version upgrades remain reviewed native-host maintenance.

### 5. Separate Fast Health From Slow Updates

Daily and CI checks must stay offline. Low-frequency maintenance may use:

- `pro-gov assets npx update --plan` for an isolated third-party skill diff;
- `codex plugin marketplace upgrade` and `codex plugin list --json` for Codex;
- `claude plugin update` and `claude plugin list --json` for Claude Code.

The npx maintenance runner must have a bounded timeout and actionable timeout
error. It must not leave an apparently frozen PGS process forever. PGS reuses
the upstream CLI instead of reimplementing repository discovery or update
semantics.

### 6. Preserve Public/Private Separation

The public package owns the generic schema, checks, plans, and output contract.
A user's portfolio manifest owns private target paths, bundle selections, and
optional host-tooling requirements. No PieAI path or private project list is
compiled into the npm package.

## Requirements

1. `portfolio doctor` is offline and read-only by default.
2. JSON output is stable enough for CI and includes per-target checks and issue
   codes.
3. `--target` follows the existing portfolio command semantics.
4. Expected bundle state is compared with both asset manifest and lock.
5. A removed or merged skill produces a safe removal plan for its old managed
   symlink.
6. Apply refuses to remove any path that is no longer a managed symlink.
7. Existing target-local custom files and hooks remain untouched.
8. Host tooling checks use native machine-readable host commands.
9. Antigravity hook support remains first-class without inventing unsupported
   plugin lifecycle APIs.
10. Slow network update discovery is never part of the default doctor.
11. Public npm consumers can use the feature with their own external manifest.
12. Documentation explains the maintenance cycle without creating a second
    checklist SSOT.

## Non-Goals

- No daemon, scheduler, web dashboard, database, or hosted control service.
- No automatic third-party update acceptance.
- No silent plugin installation, enabling, removal, or version pinning.
- No Git merge, branch deletion, stash, reset, or automatic product commit.
- No management of every dependency in every downstream product.
- No replacement for Renovate, Dependabot, native plugin managers, or
  `npx skills`.

## Verification

- Unit tests replay healthy, drifted, merged-skill, dirty-repository, missing
  host-tooling, and unsafe-removal fixtures.
- CLI tests prove JSON and human output plus non-zero failure exit codes.
- Existing pro-gov and doc-gov suites remain green.
- Packed-consumer smoke tests prove the feature works without PieAI paths.
- The private PieAI portfolio runs the doctor before and after downstream sync.
