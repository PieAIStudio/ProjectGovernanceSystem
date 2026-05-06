# SSOT Documentation Rules

Shared rule for documentation work across PieAI projects.

## Core Behavior

- Discover the project's documentation system before editing.
- Keep one canonical source for each durable fact.
- Runtime/config wins over Markdown when the project has runtime truth.
- Do not keep old and new documentation systems alive in parallel unless the project explicitly says it is in a migration window.
- Do not create ad-hoc AI-name or temp dump folders.

## Doc-Gov Projects

When a project uses doc-gov:

```bash
pnpm doc-gov find <topic>
pnpm doc-gov check
pnpm doc-gov scan --check
```

## Default Layers

| Need | Usually belongs in |
| --- | --- |
| AI/project rules | `governance/` or `docs/policy/` |
| Feature requirements | `docs/specs/` |
| Implementation plans | `docs/plans/` |
| Durable product/world/system truth | `docs/canon/` |
| How-to and operating guides | `docs/reference/` |
| Retired history | `docs/archive/` |

If the project defines different layers, use the project-local rules.
