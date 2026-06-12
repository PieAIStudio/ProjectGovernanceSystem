---
id: REF-PUBLIC-RELEASE-CHECKLIST
title: Public Release Checklist
type: reference
status: stable
canonical: true
owner: human
created: 2026-06-04
last_reviewed: 2026-06-12
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

Use this before making the repository public or publishing `@pieai/doc-gov`.

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
- package has a README
- package has a license
- `dist/cli.js` is built and executable
- `npm pack --dry-run` shows only intended files
- maintainer is authenticated to npm
- registry is the official npm registry, not a mirror
- scoped publish uses public access

Recommended commands:

```bash
cd packages/doc-gov
npm whoami --registry https://registry.npmjs.org/
npm pack --dry-run
npm publish --access public --registry https://registry.npmjs.org/
npm view @pieai/doc-gov version --registry https://registry.npmjs.org/
```

Important: do not claim the npm package is live until `npm view @pieai/doc-gov
version` resolves from the public registry.

## After Release

After GitHub and npm are live:

- verify the GitHub URL in a browser or with `gh repo view`
- verify the npm version with `npm view @pieai/doc-gov version`
- update downstream projects only through an explicit sync task
- update public website copy from the current README and this checklist, not
  from stale chat history

## Future: Trusted Publishing

The first release may be published from a logged-in maintainer machine. Future
releases should move to npm Trusted Publishing through GitHub Actions.

Recommended future setup:

1. On npmjs.com, open `@pieai/doc-gov` package settings.
2. Add a Trusted Publisher for GitHub Actions:
   - owner: `PieAIStudio`
   - repository: `ProjectGovernanceSystem` (GitHub slug)
   - workflow file: `npm-publish.yml`
3. Keep the workflow as manual `workflow_dispatch` until the first trusted
   publishing run succeeds.
4. After that, optionally add a release-tag trigger such as `v0.3.1`.

Trusted Publishing gives npm a verifiable GitHub build origin and avoids
long-lived npm tokens.
