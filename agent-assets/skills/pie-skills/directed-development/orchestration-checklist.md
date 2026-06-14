# Directed Development Structural Checklist

Load this when generating or reviewing a Directed Development plan or Feature Block sequence.

This checklist verifies structure. It does not decide where artifacts live.

## Artifact Boundary

- [ ] DD did not create or choose artifact locations.
- [ ] Artifact names, paths, commands, and status labels come from Superpowers or project instructions.
- [ ] No parallel DD-only document system was created.

## Global Plan / Task Surface

- [ ] The work is split into ordered Feature Blocks or equivalent tasks.
- [ ] Every block has a clear goal.
- [ ] Every block lists dependencies or says none.
- [ ] Blocks are ordered by dependency: foundations and contracts before consumers, integration after individual pieces.
- [ ] High-risk unknowns are placed early enough to fail fast.
- [ ] Visual/game-feel blocks are separated from behavior-critical rules/protocol work unless deliberately bundled.
- [ ] Current status is visible for each block.
- [ ] Known pre-start concerns are recorded as risks/notes, not as execution blockers.

## Per-Block Contract

Check each active block:

- [ ] Source-of-truth context is clear.
- [ ] BDD acceptance scenarios are present when behavior needs human-readable acceptance.
- [ ] Each scenario has Given / When / Then or an equivalent observable acceptance format.
- [ ] Implementation steps are small enough to execute and verify.
- [ ] Behavior-critical steps name the intended TDD target or test lane.
- [ ] Visual/game-feel steps name the browser/screenshot/interaction/owner-review evidence.
- [ ] Verification commands or evidence requirements are explicit.
- [ ] Completion gate is explicit.
- [ ] Handoff notes identify what the next block needs to know.

## Progressive Context

- [ ] Executor only needs global constraints plus the current block's context.
- [ ] Future blocks are not required reading except for dependency checks.
- [ ] Large references are linked or named instead of copied wholesale.

## Completion Audit

Run after a block completes, stalls, or is deferred:

- [ ] Status matches actual execution state.
- [ ] Evidence was recorded according to Superpowers and project instructions.
- [ ] Files changed or systems affected are summarized.
- [ ] Tests/browser/device/owner-review proof matches the completion gate.
- [ ] Any accepted or rejected cross-AI review feedback is recorded.
- [ ] Downstream blocks were updated if scope, contracts, or dependencies changed.
