# @pieai/doc-gov

Documentation governance CLI for PieAI projects.

This package is currently the upstream source for project-local `tools/doc-gov` copies in Supa, PieFlow, and PieIP. It is not published yet.

## Lifecycle

Normal documents:

```text
draft -> active -> completed -> stable -> superseded -> archived
```

Decision documents:

```text
proposed -> accepted -> rejected | superseded
```

`completed` means an execution artifact is done but still valuable as proof history. It is especially useful for:

- `docs/plans/completed/**`
- `docs/specs/completed/**`

Unlike `archived`, a `completed` document may remain `canonical: true`.

## Commands

```bash
pnpm doc-gov find <topic>
pnpm doc-gov new <type> <slug>
pnpm doc-gov check
pnpm doc-gov scan
pnpm doc-gov scan --check
pnpm doc-gov audit
pnpm doc-gov links
```

## Build

```bash
pnpm --filter @pieai/doc-gov build
pnpm --filter @pieai/doc-gov typecheck
```

## Current Status

This package is a central source, not yet the only runtime dependency. Projects should upgrade by comparing their local tool copy against this package until package-based installation is deliberately enabled.
