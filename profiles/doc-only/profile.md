# Doc-Only Profile

Use for non-runtime projects: IP development, AI media production, research vaults, writing systems, asset governance, and strategy libraries.

## Includes

- `packages/doc-gov`
- `docs/governance/ssot-v0.9.md`
- external AI-in-the-Loop policy linked by target projects under `docs/policy/shared-rules/ai-in-the-loop.md`
- `docs/governance/agents-routing/doc-only-v0.9.md`
- starter `docs/governance/` and `docs/policy/` templates

## Does Not Include By Default

- engineering-runtime agents routing
- Directed Development
- Superpowers TDD
- behavior-critical code lanes

## Requires Project-Local Rules

Each project must define:

- canon layers
- asset/provenance rules
- approval boundaries
- archive/delete policy
- current work index (required, kept lightweight when there is no active execution lane)

## Automation Boundary

This profile is a human/AI adoption contract. The CLI currently validates the
resulting project shape, but it does not consume this file as an installable
image. Until package/profile installation is deliberately added, use
`starter/`, this profile, and `manifest.yml` as the reference checklist.
