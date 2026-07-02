---
id: SPEC-0001
title: Cross-Host Compound Gate Hooks
type: spec
status: completed
canonical: true
owner: ai-assisted
created: 2026-06-12
last_reviewed: 2026-07-02
domain: governance
tags:
  - hooks
  - codex
  - claude-code
  - antigravity
  - compound-gate
pinned: false
related:
  - POLICY-DESIGN-PRINCIPLES
  - POLICY-SYNC-STRATEGY
  - REF-DOC-GOVERNANCE-BOUNDARY
  - REF-PUBLIC-RELEASE-CHECKLIST
supersedes: []
superseded_by: null
---

# SPEC-0001: Cross-Host Compound Gate Hooks

## Problem

PGS-governed engineering projects use written routing rules, Superpowers, and
Compound Engineering's `ce-compound` as a post-work learning tail. Written rules
alone are too soft: an AI session can finish a non-trivial engineering task and
forget to decide whether reusable learning should be captured.

The hard gate must run when the agent is about to stop, not when it is about to
use a tool. Tool-time hooks are good for blocking unsafe commands; Compound Gate
is an exit check.

Beginner version: `AGENTS.md` is the sign on the wall. A Stop hook is the person
at the door who checks whether you signed the worksheet before leaving.

## Decision

PGS implements one shared host-hook command in `@pieai/pro-gov`:

```bash
pro-gov host-hook --host codex --event Stop
pro-gov host-hook --host claude-code --event Stop
pro-gov host-hook --host antigravity --event Stop
```

The same command also supports `SubagentStop` so subagents cannot silently skip
the same exit check.

The three host config files are thin adapters:

| Host | Project config | PGS command |
| --- | --- | --- |
| Codex App / CLI | `.codex/hooks.json` | `pro-gov host-hook --host codex --event Stop` |
| Claude Code | `.claude/settings.json` | `pro-gov host-hook --host claude-code --event Stop` |
| Antigravity | `.agents/hooks.json` | `pro-gov host-hook --host antigravity --event Stop` |

All real policy lives in `packages/pro-gov/src/host-hooks/`. Host config files
must stay boring and declarative.

## Gate Contract

For completed non-trivial engineering work, the final report must contain one
of these markers:

```text
Compound Gate: ran ce-compound -> <path>
Compound Gate: skipped -> <reason>
```

If the final assistant message appears to claim completed engineering work but
does not include one of the markers, the Stop hook asks the host to continue and
gives the agent the exact Compound Gate instruction.

The hook does not auto-run `ce-compound`. The agent must still decide whether
the work produced reusable learning. This keeps the knowledge base useful
instead of filling it with low-value notes.

## Scope

Included:

- `Stop` and `SubagentStop` enforcement.
- Host-specific output rendering for Codex, Claude Code, and Antigravity.
- Starter hook configs for `engineering-runtime` projects.
- `pro-gov doctor --strict-hooks` to verify that the three host configs are
  wired.
- Tests for continuation, skip/ran markers, loop guard behavior, profile
  filtering, CLI output, and doctor checks.

Excluded:

- `PreToolUse` mutation blocking.
- Automatic hook installation or merge into existing user hook files.
- Reading full transcripts by default.
- Making Compound Engineering the default main workflow.
- Installing hooks in `doc-only` projects by default.

## Public Package Boundary

The npm package must not hardcode a maintainer's private project list, private
control-plane paths, or local checkout paths. A public user can install
`@pieai/pro-gov`, run
`pro-gov init --profile engineering-runtime --apply` for a fresh project, and
receive generic hook configs that call the installed `pro-gov` binary.

Maintainer checkouts may fall back to the workspace command when the package
binary is not present:

```text
pnpm --silent --filter @pieai/pro-gov dev host-hook ...
```

That fallback is for this repository's own development shape; downstream
projects should normally use `./node_modules/.bin/pro-gov`.

## Verification

Use these commands for this spec's implementation:

```bash
pnpm --filter @pieai/pro-gov test -- --test-name-pattern "Stop hook|host-hook|strict-hooks|starter host hooks"
pnpm --filter @pieai/pro-gov typecheck
pnpm --filter @pieai/pro-gov build
node packages/pro-gov/dist/cli.js doctor --strict-hooks
```

Downstream engineering projects should run:

```bash
pnpm pro-gov doctor --strict-hooks
```

Old sessions may not load newly installed host configs. Validate this behavior
only from fresh sessions after the host has trusted or reloaded the project
configuration.
