# Engineering Runtime Profile

Use for code-heavy projects: apps, games, runtimes, services, browser products, Electron apps, and multiplayer prototypes.

## Includes

- `packages/doc-gov`
- `docs/governance/ssot-v0.9.md`
- external AI-in-the-Loop policy linked by target projects under `docs/policy/shared-rules/ai-in-the-loop.md`
- `docs/governance/agents-routing/engineering-runtime-v0.9.md`
- `integrations/superpowers.md`
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

## Automation Boundary

This profile is a human/AI adoption contract. The CLI currently validates the
resulting project shape, but it does not consume this file as an installable
image. Until package/profile installation is deliberately added, use
`starter/`, this profile, and `manifest.yml` as the reference checklist.
