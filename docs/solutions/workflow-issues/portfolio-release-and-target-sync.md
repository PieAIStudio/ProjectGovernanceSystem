---
title: Publish PGS before syncing portfolio targets
date: 2026-07-02
category: workflow-issues
module: Portfolio governance
problem_type: workflow_issue
component: development_workflow
severity: medium
applies_when:
  - "A reusable PGS change must be rolled out to multiple target repositories"
  - "Engineering-runtime targets need cross-host Compound Gate hooks"
  - "The public npm package must remain usable without private portfolio state"
tags: [portfolio-governance, release, trusted-publishing, compound-gate, downstream-sync]
---

# Publish PGS before syncing portfolio targets

## Context

PGS is both a public npm product and a local execution engine for managed
portfolio work. That creates a tempting shortcut: change PGS locally, then
immediately edit every known target repository from the local checkout.

That shortcut is risky. A target repository should be able to reinstall its
governance tooling from the public registry and recover the same behavior. If
targets are synced against an unpublished local checkout, the portfolio can look
green on one machine while being unrecoverable for everyone else.

## Guidance

Use this order for portfolio-wide PGS upgrades:

1. Update PGS in the upstream repository.
2. Run local PGS verification.
3. Commit and push PGS.
4. Publish `@pieai/doc-gov` and `@pieai/pro-gov` through GitHub Actions Trusted
   Publishing.
5. Confirm the npm registry exposes the intended versions.
6. Sync the external portfolio targets to that published package version.
7. For engineering-runtime targets, install or merge the three host-hook files:
   `.codex/hooks.json`, `.claude/settings.json`, and `.agents/hooks.json`.
8. Run `pro-gov doctor --strict-hooks` in every engineering-runtime target.
9. Run the target's local governance checks.
10. Commit and push each target as its own checkpoint.
11. Run `pro-gov portfolio check`, `pro-gov portfolio assets-check`, and
    `pro-gov portfolio doctor` from the control-plane manifest.

Treat `controlPlane` and `executionEngine` in a portfolio manifest as metadata,
not ordinary downstream targets. They can have their own package updates, but
bulk target sync should operate on `targets` unless the operator explicitly
chooses otherwise.

## Why This Matters

The public package boundary is the recovery line. If a target can only work
because the operator's private checkout happens to exist, the rollout is not
portable. Publishing first turns the upgrade into a reproducible dependency
change rather than a local-machine ceremony.

The strict hook check is the second recovery line. It proves that Codex, Claude
Code, and Antigravity have Stop/SubagentStop paths into `pro-gov host-hook`, so
the Compound Gate is connected through host configuration instead of remembered
only in prompts. Package-level host contract tests cover the supported
Stop/SubagentStop input and output shapes.

## When to Apply

- A new PGS version changes starter files, profiles, host hooks, package
  assets, or portfolio commands.
- A private portfolio manifest is used to update multiple repositories.
- A target repository is expected to run PGS from npm rather than from a local
  upstream checkout.
- An engineering-runtime target should enforce the post-work Compound Gate.

## Examples

Good release order:

```bash
pnpm typecheck
pnpm test
pnpm build
gh workflow run npm-publish.yml --ref main
npm view @pieai/pro-gov version --registry https://registry.npmjs.org/
```

Good target verification:

```bash
pnpm install --lockfile-only
pnpm pro-gov doctor --strict-hooks
pnpm docs:check
git commit -m "chore: sync PGS 0.3.9"
git push
```

If a target's hooks call bare `pnpm` but the local runtime provides an older
version than the project requires, do not skip the hook. Run the commit or push
with a temporary `pnpm` shim that forwards to the required Corepack version, or
use the project's documented package-manager version.

## Related

- `docs/reference/adoption/public-release-checklist.md`
- `docs/reference/adoption/downstream-project-registry.md`
- `docs/reference/portfolio-technology-governance.md`
- `docs/specs/completed/SPEC-0001-cross-host-compound-gate-hooks.md`
