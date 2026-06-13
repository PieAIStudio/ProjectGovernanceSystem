---
id: REF-PUBLIC-RELEASE-CHECKLIST
title: Public Release Checklist
type: reference
status: stable
canonical: true
owner: human
created: 2026-06-04
last_reviewed: 2026-06-13
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
- maintainer is authenticated to npm
- registry is the official npm registry, not a mirror
- scoped publish uses public access

Recommended commands:

```bash
npm whoami --registry https://registry.npmjs.org/

pnpm --filter @pieai/doc-gov pack --dry-run
pnpm --filter @pieai/pro-gov pack --dry-run

pnpm --filter @pieai/doc-gov publish --access public --registry https://registry.npmjs.org/
npm view @pieai/doc-gov version --registry https://registry.npmjs.org/

pnpm --filter @pieai/pro-gov publish --access public --registry https://registry.npmjs.org/
npm view @pieai/pro-gov version --registry https://registry.npmjs.org/
```

Important: do not claim an npm package is live until its `npm view <package>
version` command resolves from the public registry.

## After Release

After GitHub and npm are live:

- verify the GitHub URL in a browser or with `gh repo view`
- verify npm versions with `npm view @pieai/doc-gov version` and
  `npm view @pieai/pro-gov version`
- update downstream projects only through an explicit sync task
- update public website copy from the current README and this checklist, not
  from stale chat history

## Future: Trusted Publishing

The first release may be published from a logged-in maintainer machine. Future
releases should move to npm Trusted Publishing through GitHub Actions.

Recommended future setup:

1. On npmjs.com, open the package settings for `@pieai/doc-gov` and
   `@pieai/pro-gov`.
2. Add a Trusted Publisher for GitHub Actions to each package:
   - owner: `PieAIStudio`
   - repository: `ProjectGovernanceSystem` (GitHub slug)
   - workflow file: `npm-publish.yml`
3. Keep the workflow as manual `workflow_dispatch` until the first trusted
   publishing run succeeds.
4. After that, optionally add a release-tag trigger such as `v0.3.1`.

Trusted Publishing gives npm a verifiable GitHub build origin and avoids
long-lived npm tokens.
