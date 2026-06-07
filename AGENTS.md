# Project Governance System AI Router

## PGS Router Block

<!-- PGS-ROUTER:BEGIN v0.9 -->

## Purpose

This repository is the upstream source for PieAI documentation governance, agents routing, and workflow integration profiles.

## Read First

`README.md` is the human-facing project introduction. Do not use it as the default AI startup path unless the task is about project positioning, public explanation, or the README itself.

1. All Markdown files under `docs/policy/**/*.md`, including files in
   subdirectories and symlinked shared-rule files.
2. `docs/governance/boundary.md`
3. `docs/governance/ssot-v0.9.md`
4. `starter/docs/governance/doc-agent-rules.md` if working on starter documentation governance.
5. `starter/docs/governance/doc-types.md` if working on document schema or placement.
6. For agents-routing/profile work, also read:
   - `docs/governance/agents-routing/engineering-runtime-v0.9.md`
   - `docs/governance/agents-routing/doc-only-v0.9.md`
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
- Keep `docs/governance/` for governance core rules, SSOT, agents-routing, templates, and manifest; keep project AI development policy in `docs/policy/`.
- Project Governance System governs `docs/**` and AI entry files by default. Do not move product artifacts, prompts, generated media, runtime notes, or project-package Markdown into `docs/**` unless the project explicitly opts them into doc-gov.

<!-- PGS-ROUTER:END -->

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
pnpm test
pnpm build
node packages/doc-gov/dist/cli.js router-check
node packages/doc-gov/dist/cli.js check
node packages/doc-gov/dist/cli.js scan --check
node packages/doc-gov/dist/cli.js links
node packages/doc-gov/dist/cli.js audit
git diff --check
```

For docs/profile changes, inspect links and keep the README/design-principles consistent.
