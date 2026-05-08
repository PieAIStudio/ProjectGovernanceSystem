# Project Governance System AI Router

## Purpose

This repository is the upstream source for PieAI documentation governance, task routing, and workflow integration profiles.

## Read First

1. `README.md`
2. `docs/policy/design-principles.md`
3. `docs/reference/adoption/project-relationship.md`
4. `docs/policy/sync-strategy.md`
5. `docs/reference/adoption/adoption-playbook.md`
6. For routing/profile work, also read:
   - `routing/engineering-task-routing.md`
   - `routing/doc-only-routing.md`
   - `integrations/superpowers.md`
   - `integrations/directed-development.md`
   - `profiles/engineering-runtime/`
   - `profiles/doc-only/`

## Non-Negotiables

- Keep the system thin. Do not add a profile unless at least two projects need it.
- Do not copy project-local product truth into this repository.
- Do not vendor the Superpowers plugin body.
- Directed Development is optional and trigger-based, not a default ceremony.
- Core lifecycle/schema/routing changes belong here first, then projects sync from here.

## Current Profiles

| Profile | Use for |
| --- | --- |
| `profiles/engineering-runtime/` | Apps, games, runtimes, services, browser products |
| `profiles/doc-only/` | IP, research, writing, AI media, asset governance |

## Verification

For CLI changes:

```bash
pnpm install
pnpm typecheck
pnpm build
node packages/doc-gov/dist/cli.js router-check
```

For docs/profile changes, inspect links and keep the README/design-principles consistent.
