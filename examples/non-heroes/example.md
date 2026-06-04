# Non-Heroes Example

Non-Heroes is the reference example for a real engineering-runtime product.

Use it when you need to understand how Project Governance System fits a
code-heavy product without absorbing product truth into the central repo.

## Adopted Profile

`engineering-runtime`

Non-Heroes has behavior-critical runtime work, product rules, server/client
boundaries, and browser-visible UI behavior. It therefore needs an engineering
route, but that route only decides workflow depth. Non-Heroes product truth
stays in Non-Heroes.

## Central Reusable Pieces

- doc-gov lifecycle with `completed`
- `docs/governance/ssot-v0.9.md`
- `docs/governance/agents-routing/engineering-runtime-v0.9.md`
- Superpowers integration
- Directed Development integration
- AI-in-the-Loop evidence rules linked from Non-Heroes' external shared-rule source

## Non-Heroes-Local Pieces

- product canon
- runtime boundaries
- visual and content direction
- browser proof ladder
- current phase plans

## Expected Downstream Shape

```text
Non-Heroes/
├── AGENTS.md
├── docs/
│   ├── governance/
│   │   ├── boundary.md
│   │   ├── ssot-v0.9.md
│   │   ├── doc-agent-rules.md
│   │   ├── doc-types.md
│   │   └── agents-routing/engineering-runtime-v0.9.md
│   ├── policy/
│   │   ├── best-practice-for-this-project.md
│   │   └── shared-rules/ai-in-the-loop.md  # symlink to external shared-rule source
│   └── reference/execution/current-work.md
└── tools/doc-gov/ or @pieai/doc-gov package wiring
```

## What Must Stay Out Of The Central Repo

Do not upstream Non-Heroes product rules, visual direction, content canon,
runtime implementation details, database schema decisions, or current phase
plans unless at least one other project needs the same governance rule.

## Validation Ladder

Non-Heroes should run the shared governance checks plus its product proof
commands:

```bash
pnpm doc-gov check
pnpm doc-gov router-check
pnpm doc-gov scan --check
pnpm doc-gov links
pnpm doc-gov audit
pnpm typecheck
pnpm test
```
