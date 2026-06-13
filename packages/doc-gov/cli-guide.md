# @pieai/doc-gov

Documentation governance CLI for PieAI projects.

This package is the upstream CLI source for Project Governance System. It can
be installed by downstream projects as `@pieai/doc-gov` so scripts, hooks, and
CI all use the same CLI source.

It is intentionally the validator package. Install `@pieai/pro-gov` beside it
when a project needs packaged starter/profile assets or read-only init/sync
planning.

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
pnpm doc-gov router-check
pnpm doc-gov doctor
pnpm doc-gov migrate --profile doc-only --check
```

`init` creates the directory skeleton and writes default templates under
`docs/governance/templates/`, so `doc-gov init` followed by
`doc-gov new spec test-spec` is a supported first-user path.

`router-check` is intentionally thin:

- In this upstream repo, it verifies that `AGENTS.md`,
  `docs/governance/agents-routing/`, `profiles/`, and
  `integrations/superpowers.md` stay connected in the expected order.
- In a downstream project, it verifies the project router block,
  `docs/governance/ssot-v0.9.md`, the selected agents-routing file, and old
  shared SSOT/task-routing leftovers.
- It also checks that local paths written in backticks inside router-facing
  files such as `AGENTS.md`, `CLAUDE.md`, `README.md`, and the starter
  `AGENTS.template.md` can actually be opened, which catches stale startup
  instructions early.

It does not choose a workflow for a specific task.

`doctor` is the one-command health check:

- It runs router integrity, governed-doc schema, manifest freshness, and local
  Markdown link checks.
- It checks whether `lefthook.yml` is both present and installed into
  `.git/hooks/`.
- It checks whether `.github/workflows/docs-check.yml` runs the standard
  doc-gov gate, including `router-check` and `links`.

`migrate --profile <engineering-runtime|doc-only> --check` is intentionally
read-only. It checks whether the target project is structurally ready for the
selected profile. It does not move files or rewrite local project truth yet.

## Build

```bash
pnpm --filter @pieai/doc-gov build
pnpm --filter @pieai/doc-gov test
pnpm --filter @pieai/doc-gov typecheck
```

## Current Status

This package is the preferred CLI source for new adoption work. Existing
legacy projects should move from local CLI copies to `@pieai/doc-gov` when
their scripts, local hooks, and CI are updated together. Use `@pieai/pro-gov`
for the project-level asset surface instead of copying the whole upstream
repository into each target project.
