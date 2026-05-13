# Supa Example

Supa is the reference example for a real game/runtime project.

Use it when you need to understand how Project Governance System fits a
code-heavy product without absorbing product truth into the central repo.

## Adopted Profile

`engineering-runtime`

Supa has behavior-critical runtime work: game rules, match flow, multiplayer
state, server/client boundaries, and browser-visible UI behavior. It therefore
needs an engineering route, but that route only decides workflow depth. Supa's
actual game truth stays in Supa.

## Central Reusable Pieces

- doc-gov lifecycle with `completed`
- `docs/governance/ssot-v0.9.md`
- `docs/governance/agents-routing/engineering-runtime-v0.9.md`
- Superpowers integration
- Directed Development integration
- AI-in-the-Loop evidence rules linked from Supa's external shared-rule source

## Supa-Local Pieces

- Phase03 Boss Race product truth
- clay Q-version visual direction
- React / Phaser / Colyseus / Supabase runtime boundaries
- game-specific browser proof ladder

## Expected Downstream Shape

```text
Supa/
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
└── tools/doc-gov/
```

## What Must Stay Out Of The Central Repo

Do not upstream Supa's card rules, visual direction, boss mechanics, content
canon, Phaser scene details, Supabase schema decisions, or current phase plans
unless at least one other project needs the same governance rule.

## Validation Ladder

Supa should run the shared governance checks plus its product proof commands:

```bash
pnpm doc-gov check
pnpm doc-gov router-check
pnpm doc-gov scan --check
pnpm doc-gov links
pnpm doc-gov audit
pnpm typecheck
pnpm test
pnpm validate-content
```
