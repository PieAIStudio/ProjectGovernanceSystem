# PieIP Example

PieIP is the reference example for a doc-only / AI-media / asset-governance
project.

## Adopted Profile

`doc-only`

PieIP may contain many Markdown-like artifacts: prompts, image references,
audio notes, scripts, character sheets, and production packages. That does not
mean every Markdown file belongs under doc-gov. Governed docs are the AI
collaboration and durable decision layer; product artifacts stay in the
workbench or package where the project expects them.

## Central Reusable Pieces

- doc-gov lifecycle with `completed`
- `docs/governance/ssot-v0.9.md`
- `docs/governance/agents-routing/doc-only-v0.9.md`
- AI-in-the-Loop evidence rules linked from PieIP's external shared-rule source
- current work index when helpful

## PieIP-Local Pieces

- ModernFreaks canon
- character, script, audio, and visual asset provenance
- approval boundaries
- archive/delete policy

PieIP should not install engineering-runtime agents routing, Directed Development, or Superpowers TDD by default.

## Expected Downstream Shape

```text
PieIP/
├── AGENTS.md
├── docs/
│   ├── governance/
│   │   ├── boundary.md
│   │   ├── ssot-v0.9.md
│   │   ├── doc-agent-rules.md
│   │   ├── doc-types.md
│   │   └── agents-routing/doc-only-v0.9.md
│   ├── policy/
│   │   ├── best-practice-for-this-project.md
│   │   └── shared-rules/ai-in-the-loop.md  # symlink to external shared-rule source
│   ├── canon/
│   ├── reference/
│   └── reference/execution/current-work.md
└── tools/doc-gov/
```

## What Must Stay Out Of Doc-Gov By Default

Image prompts, generated media notes, production-package files, source assets,
and ModernFreaks workbench artifacts should not be moved into `docs/**` just
because they are text. They become governed docs only when the project
explicitly opts them into that layer.

## Validation Ladder

PieIP should run the shared governance checks plus any project-local content or
workbench validation:

```bash
pnpm doc-gov check
pnpm doc-gov router-check
pnpm doc-gov scan --check
pnpm doc-gov links
pnpm doc-gov audit
pnpm validate:modern-freaks
```
