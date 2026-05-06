# AI Agent Behavior Rules

## Before Creating Docs

Run:

```bash
pnpm doc-gov find <topic>
```

If a canonical document exists, update it instead of creating a parallel document.

## Closed Document Types

Use only:

- `policy`
- `decision`
- `spec`
- `plan`
- `canon`
- `reference`
- `archive`

## Status Machine

Normal documents:

```text
draft -> active -> completed -> stable -> superseded -> archived
```

Decision documents:

```text
proposed -> accepted -> rejected | superseded
```

`completed` is for finished execution records or specs that should no longer appear in active folders.

## Upstream Rule

Do not locally invent doc-gov core changes. Propose core changes upstream in `project-governance-system`.
