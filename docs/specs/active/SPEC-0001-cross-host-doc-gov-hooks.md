---
id: SPEC-0001
title: Cross-Host Doc-Gov Hooks
type: spec
status: draft
canonical: false
owner: ai-assisted
created: 2026-06-12
last_reviewed: 2026-06-12
domain: governance
tags:
  - hooks
  - codex
  - claude
  - antigravity
  - doc-gov
pinned: false
related:
  - POLICY-DESIGN-PRINCIPLES
  - GOV-SSOT-V0-9
  - REF-DOC-GOVERNANCE-BOUNDARY
  - REF-SELF-REVIEW
supersedes: []
superseded_by: null
---

# SPEC-0001: Cross-Host Doc-Gov Hooks

## Problem

Project Governance System currently relies on written instructions, `doc-gov`
CLI checks, Lefthook, and CI. That is strong at commit and integration time, but
it does not provide immediate feedback while an AI host is about to perform a
tool action that clearly violates the documentation governance boundary.

Codex, Claude Code, and Antigravity all support hooks, but their configuration
files, input JSON, output contracts, trust models, and event semantics differ.
The goal is therefore not to create one JSON file that every host consumes. The
goal is to create one shared policy engine that each host reaches through a thin
adapter.

## Decision

Adopt project-scoped AI host hooks for Project Governance System after this
draft is reviewed. The implementation should live in `@pieai/doc-gov` and expose
a small command surface:

```bash
doc-gov hooks run --host codex --event PreToolUse
doc-gov hooks run --host claude --event Stop
doc-gov hooks run --host antigravity --event PreToolUse
doc-gov hooks install --hosts codex,claude,antigravity
doc-gov hooks doctor
doc-gov hooks uninstall
```

The installer writes or merges the host-native config files:

| Host | Project config | Input shape | Output shape |
| --- | --- | --- | --- |
| Codex | `.codex/hooks.json` | snake_case tool fields | `hookSpecificOutput.permissionDecision` or `{}` |
| Claude Code | `.claude/settings.json` | Claude hook JSON | `hookSpecificOutput.permissionDecision` or `{}` |
| Antigravity | `.agents/hooks.json` | camelCase `toolCall` fields | required `decision` values |

The shared engine evaluates a normalized event:

```ts
type DocGovHookEvent = {
  host: 'codex' | 'claude' | 'antigravity';
  event: 'PreToolUse' | 'Stop';
  toolName?: string;
  operation: 'read' | 'write' | 'shell' | 'unknown';
  cwd?: string;
  command?: string;
  directTargets: string[];
  rawInput: unknown;
};
```

The engine returns a host-neutral decision:

```ts
type DocGovHookDecision =
  | { action: 'allow' }
  | { action: 'deny'; reason: string }
  | { action: 'continue'; reason: string };
```

Host-specific output rendering must happen only at the edge.

## Non Goals

- Do not treat hooks as a complete security sandbox.
- Do not duplicate all `doc-gov check`, Lefthook, or CI behavior before every
  tool call.
- Do not use hooks to read AI transcript files by default.
- Do not use hooks to auto-rewrite governed documents after every edit.
- Do not block normal edits to pinned or canonical docs at tool time. Commit
  message rules remain the better place for explicit human override markers.
- Do not add a new profile or lifecycle state for hooks unless at least two
  downstream projects need the same surface.
- Do not create a top-level `docs/research/` directory as part of this work.

## Evidence

Official host documentation confirms the useful common denominator:

- Codex supports project hooks, exact hook definition trust, `PreToolUse`, and
  `Stop`, but documents that `PreToolUse` is not a complete enforcement boundary.
- Claude Code supports project hooks, `PreToolUse`, `PostToolUse`, and `Stop`;
  its own guidance emphasizes input validation, shell quoting, path traversal
  protection, and stop-loop guardrails.
- Antigravity supports workspace `.agents/hooks.json`, `PreToolUse`, `Stop`,
  and additional invocation events. `PostToolUse` returns only `{}`, so it is not
  a portable control point.

Two public cross-host projects provide useful implementation lessons:

- `destructive_command_guard` separates shared policy from host protocols,
  tests host protocol contracts, and documents Codex interception limitations.
- `graphify` treats installation, idempotent merge, diagnostics, and uninstall
  ownership as first-class features instead of assuming users will hand-edit
  host config files correctly.

The local reference implementation in
`/Users/yuanfei/PieAI/_NovelFrameworks/story-creator` confirms the right broad
shape:

```text
three host configs -> one shared command -> host-specific output rendering
```

It also exposes failure cases that this spec must avoid.

## Reference Implementation Findings

The `story-creator` hook implementation is architecturally useful, but it is not
yet a sufficiently strong guardrail. Confirmed issues:

1. `PostToolUse` and `Stop` are configured, but the shared evaluator only applies
   policy for `PreToolUse`; other events return allow decisions.
2. Codex `apply_patch` input that targets a protected `gate-result.json` returns
   `{}`, so the hook allows the change.
3. The mutation detector recognizes commands such as `rm`, `mv`, `sed -i`,
   `python`, and `node`, but it does not parse patch headers.
4. `git apply /tmp/file.patch` can hide the protected target path outside the
   visible command string.
5. Tests cover direct protected paths and a `sed -i` shell command, but not patch
   payloads, external patch files, redirections, shell scripts, or host protocol
   drift.
6. Runtime cost is high for a hot path. Repeated local measurements showed
   `pnpm --silent story -- host-hook` at about 0.54 to 0.56 seconds per call.
7. Matching by free-form strings makes the policy brittle when host field names
   or tool names change.
8. Configuring events that have no current behavior creates overhead and false
   confidence.

These findings should become PGS acceptance fixtures rather than merely notes in
this document.

## Hook Modes

PGS should use three policy modes.

### Prevent

Runs during `PreToolUse`. This mode denies only deterministic, low-false-positive
violations:

- Direct writes to `docs/governance/MANIFEST.yml` unless the tool invocation is
  clearly the `doc-gov` command that owns manifest generation.
- Creation of ad-hoc AI dump folders under governed docs, including `Temp/`,
  `Drafts/`, `Codex/`, `Claude/`, `Opus/`, and similar AI-host folders.
- Creation of non-root `README.md` files under `docs/**`.
- Creation or modification of known legacy governance roots during a migrated
  project flow, such as `governance/`, `starter/governance/`, and
  `starter/docs-governance/`.

If the engine cannot confidently determine that an action violates a hard rule,
it should allow the tool and rely on Stop, Lefthook, and CI to catch the result.

### Verify

Runs during `Stop`, only when governed files changed during the session. This
mode runs a fast validation set:

```bash
pnpm doc-gov router-check
pnpm doc-gov check
pnpm doc-gov scan --check
pnpm doc-gov links
pnpm doc-gov audit
git diff --check
```

If validation fails, the hook may continue the agent loop once with the exact
failing command and remediation. The implementation must include loop protection:

- one continuation per session and failure fingerprint;
- respect host-provided stop-loop flags when available;
- no continuation when the host reports max steps, system error, or active
  background tasks that make verification unreliable.

### Observe

Observation-only hooks are reserved for a separate diagnostics spec and remain
out of scope for Phase 1. PGS should not configure `PostToolUse` until it has a
concrete behavior and a host-portable reason to exist.

## Architecture

Recommended files, subject to implementation planning:

```text
packages/doc-gov/src/hooks/
  cli.ts
  installer.ts
  doctor.ts
  types.ts
  normalize/
    codex.ts
    claude.ts
    antigravity.ts
  render/
    codex.ts
    claude.ts
    antigravity.ts
  policy/
    prevent.ts
    verify.ts
    path-classifier.ts
    shell-targets.ts
  state/
    stop-loop.ts
  fixtures/
    codex-pretooluse.json
    claude-pretooluse.json
    antigravity-pretooluse.json
```

Keep the hot path fast:

- `PreToolUse` must not run full repository scans.
- `PreToolUse` should target p95 under 100 ms on this repository.
- Use the bundled `doc-gov` CLI instead of project-local `tsx` or `pnpm`
  startup paths in installed downstream hooks.

## Installer Rules

`doc-gov hooks install` must be conservative:

- create only PGS-owned hook entries;
- preserve unrelated user hooks;
- be idempotent;
- use stable owned entry names;
- support uninstalling only PGS-owned entries;
- print the exact config paths changed;
- fail with actionable errors if a host config file is invalid JSON;
- avoid hard-coded absolute paths to this source checkout in downstream projects.

`doc-gov hooks doctor` must report:

- which host configs are present;
- whether PGS-owned hooks are installed;
- whether the command resolves to a usable `doc-gov` binary;
- whether the project appears trusted where the host requires trust;
- whether the installed hook version is older than the local `@pieai/doc-gov`
  version.

## Research Directory Decision

Do not add top-level `docs/research/`.

Current doc-gov has a closed type set:

```text
policy, decision, spec, plan, canon, reference, archive
```

Research is a work phase, not a durable document identity. The preferred
lifecycle is:

```text
research question and task scope -> docs/plans/active/
evidence and synthesis -> docs/reference/research/ when a durable reference is needed
final product truth -> docs/decisions/, docs/specs/, docs/canon/, or stable docs/reference/
retired material -> docs/archive/
```

`docs/reference/research/` may be documented as an optional subdirectory, but it
should not be pre-created in the starter until real content needs it.

## Acceptance

This spec is ready for implementation planning when the following review checks
are accepted:

- The scope stays limited to `PreToolUse`, `Stop`, installer, doctor, and tests.
- `PostToolUse` remains unconfigured in Phase 1.
- The engine denies only deterministic hard-rule violations at tool time.
- Stop verification has a one-continuation loop guard.
- The installer preserves unrelated user hooks.
- The implementation includes contract fixtures for Codex, Claude Code, and
  Antigravity.
- The implementation includes bypass regression tests for patch payloads,
  external patch files, redirections, shell scripts, nested JSON target paths,
  and host field-name drift.
- Existing `doc-gov` commands, Lefthook, and CI remain authoritative final gates.

## Review State

This is a draft design for human review. Implementation must not start until the
draft is either approved as written or revised into an approved spec.
