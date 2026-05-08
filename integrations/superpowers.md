# Superpowers Integration

Superpowers is an external plugin/system. This repository does not vendor or rewrite it.

## Boundary

Superpowers owns engineering workflows such as:

- brainstorming
- writing plans
- TDD
- debugging
- verification before completion
- worktree usage

Project Governance System owns:

- documentation lifecycle
- task routing
- current work index conventions
- shared AI evidence rules

## Rule

Use Superpowers inside the selected project lane. Do not let Superpowers create a separate durable document tree unless the project explicitly adopts one.

Durable outputs should map back to the project's doc-gov layers:

- specs -> `docs/specs/**`
- plans -> `docs/plans/**`
- durable references -> `docs/reference/**`

## Execution Order

Task routing classifies first. Superpowers executes inside the selected lane.

```mermaid
flowchart TD
  A["Task arrives"] --> B["Read project router and current work"]
  B --> C["Classify profile and lane"]
  C --> D{"Does this lane need a Superpowers workflow?"}
  D -- "yes" --> E["Use the matching Superpowers skill"]
  D -- "no" --> F["Use the local non-Superpowers lane rules"]
  E --> G["Write durable outputs into doc-gov layers"]
  F --> G
```

If Superpowers suggests a default location such as `docs/superpowers/**`, project instructions may override that location. The durable project record should still land in the governed doc-gov layer unless the project has explicitly adopted a separate Superpowers document tree.
