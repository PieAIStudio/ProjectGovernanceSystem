---
id: REF-PUBLIC-RELEASE-CHECKLIST
title: Public Release Checklist
type: reference
status: stable
canonical: true
owner: human
created: 2026-06-04
last_reviewed: 2026-06-21
domain: adoption
tags:
  - release
  - npm
  - github
pinned: false
related:
  - POLICY-SYNC-STRATEGY
  - POLICY-VERSIONING
---

# Public Release Checklist

Use this before making the repository public or publishing `@pieai/doc-gov` or
`@pieai/pro-gov`.

## Mental Model

Making the GitHub repository public is like opening the workshop doors. People
can inspect the benches, the notes, and the commit history.

Publishing to npm is like putting a tool on a public shelf. People can install
it without cloning the workshop.

Both need checks, but they are not the same release.

## Repository Public Checklist

Before changing GitHub visibility:

- current working tree is clean
- current branch is pushed
- current files have no secrets
- Git history has no real secrets
- current files have no machine-local startup paths
- root README explains the project to outsiders
- license and security contact exist
- CI is present and runs the standard doc-gov gate

Recommended commands:

```bash
git status --short --branch
pnpm typecheck
pnpm test
pnpm build
pnpm doc-gov doctor
git diff --check
```

## npm Publish Checklist

Before publishing:

- `packages/doc-gov/package.json` has public package metadata
- `packages/pro-gov/package.json` has public package metadata
- each package has a README
- each package has a license
- each package has a built executable under `dist/cli.js`
- package dry-runs show only intended files
- publish `@pieai/doc-gov` before `@pieai/pro-gov` when both package versions
  are new, because `pro-gov` depends on the matching validator release
- npm Trusted Publisher is configured for both packages
- registry is the official npm registry, not a mirror
- scoped publish uses public access

Recommended local verification:

```bash
pnpm --filter @pieai/doc-gov pack --dry-run
pnpm --filter @pieai/pro-gov pack --dry-run
```

Recommended publish command:

```bash
gh workflow run npm-publish.yml --ref main
```

Important: do not claim an npm package is live until its `npm view <package>
version` command resolves from the public registry.

## Trusted Publishing Setup

npm publishing should use Trusted Publishing through GitHub Actions. This is the
smooth path: GitHub Actions proves to npm that a specific workflow in this
repository is publishing the package, so maintainers do not need to pass a
long-lived npm token around.

Set this once for each package on npmjs.com:

1. Open the package settings for `@pieai/doc-gov`.
2. Add a Trusted Publisher for GitHub Actions:
   - owner: `PieAIStudio`
   - repository: `ProjectGovernanceSystem`
   - workflow file: `npm-publish.yml`
   - allowed action: `npm publish`
3. Repeat the same setup for `@pieai/pro-gov`.
4. Keep the workflow as manual `workflow_dispatch` until several releases have
   succeeded.

The workflow must keep:

- `permissions.id-token: write`
- a GitHub-hosted runner
- npm CLI `11.5.1` or newer
- package `repository` fields that match the public GitHub repository
- `pnpm pack` before publish, so workspace dependencies are converted in the
  tarball
- `npm publish <tarball> --provenance --access public`

## After Release

After GitHub and npm are live:

- verify the GitHub URL in a browser or with `gh repo view`
- verify npm versions with `npm view @pieai/doc-gov version` and
  `npm view @pieai/pro-gov version`
- update downstream projects only through an explicit sync task
- update public website copy from the current README and this checklist, not
  from stale chat history
