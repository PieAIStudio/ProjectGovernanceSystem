# Engineering Runtime Profile

Use for code-heavy projects: apps, games, runtimes, services, browser products, Electron apps, and multiplayer prototypes.

## Includes

- `packages/doc-gov`
- `packages/pro-gov`
- `docs/governance/ssot-v0.9.md`
- external AI-in-the-Loop policy linked by target projects under `docs/policy/shared-rules/ai-in-the-loop.md`
- `docs/governance/agents-routing/engineering-runtime-v0.9.md`
- `integrations/superpowers.md`
- `integrations/compound-engineering.md`
- `integrations/directed-development.md`
- starter `docs/governance/` and `docs/policy/` templates

## Requires Project-Local Rules

Each project must define:

- current runtime truth hierarchy
- lane profile
- behavior-critical paths
- verification command ladder
- current work index

## Does Not Include

- product canon
- stack-specific rules
- game/app-specific lane wording
- Superpowers plugin body
- Compound Engineering plugin body

## Automation Boundary

This profile is a human/AI adoption contract. `doc-gov` validates the resulting
project shape. `pro-gov init --apply` can install it into a fresh target, but
refuses all writes when any destination already exists. `sync --check` compares
shared core files while leaving project-local router, policy, and current-work
content under the target project's ownership.
