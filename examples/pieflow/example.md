# PieFlow Example

PieFlow is the reference example for an app/runtime product with complex
browser, native, and connector proof lanes.

## Adopted Profile

`engineering-runtime`

PieFlow has runtime behavior, browser-visible UI, connector/write-back risk, and
native/app shell work. It should therefore use engineering agents routing, while
keeping product strategy and v4/v4.2/v4.3 truth inside PieFlow.

## Central Reusable Pieces

- doc-gov lifecycle with `completed`
- `docs/reference/execution/current-work.md`
- `docs/governance/ssot-v0.9.md`
- `docs/governance/agents-routing/engineering-runtime-v0.9.md`
- Directed Development for mixed product/runtime work
- Superpowers integration for planning, TDD, debugging, and verification
- AI-in-the-Loop evidence rules linked from PieFlow's external shared-rule source

## PieFlow-Local Pieces

- product canon
- connector/write-back safety rules
- browser/native evidence lanes
- v4/v4.2/v4.3 current truth boundaries

## Expected Downstream Shape

```text
PieFlow/
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
│   │   ├── refactor-rules.md
│   │   └── shared-rules/ai-in-the-loop.md  # symlink to external shared-rule source
│   ├── canon/
│   ├── specs/
│   ├── plans/
│   └── reference/execution/current-work.md
└── tools/doc-gov/
```

## What Must Stay Out Of The Central Repo

Do not upstream PieFlow-specific product doctrine, v4 roadmap details,
BlockSuite/editor implementation truth, connector API safety rules, deployment
targets, or current FB plans. The central repo owns the reusable governance
machinery, not PieFlow's product.

## Validation Ladder

PieFlow should run shared governance checks and then its product/runtime proof
commands:

```bash
pnpm doc-gov check
pnpm doc-gov router-check
pnpm doc-gov scan --check
pnpm doc-gov links
pnpm doc-gov audit
pnpm typecheck
pnpm test
pnpm format:check
```
