# Truth Surface — Conflict Classes & Reality Checks

Use this at the matrix step. Each class names a recurring way a truth surface
splits, the question to ask, and how to verify the reality side. Convert
confirmed conflicts into findings using the canonical finding format in
`docs/reference/project-lens/project-audit-protocol-v0.1.md`.

## Reality-side commands (run, do not assume)

Read the *actual* git state before trusting any document that describes it:

```bash
git -C <target> status -sb
git -C <target> rev-parse --abbrev-ref HEAD
git -C <target> log --oneline -n 15
git -C <target> rev-list --left-right --count main...origin/main
git -C <target> log -1 --format='%H %s'
```

Then open the code paths the docs make claims about (scope, features, "done").

## Conflict classes

### A. Stale scope boundary

Entry file or policy says feature X is "out of scope / future / not yet," but the
code and git history show X already shipped. Evidence: the doc line + the
file/commit that implements X.

### B. Branch / main / origin drift

`current-work` (or a plan) describes a branch state — "pushed, cannot
auto-merge," "next session continues PLAN-N" — that contradicts the real
`HEAD` / `main` / `origin/main`. Evidence: the doc line + git command output.

### C. Active spec locked to retired assumptions

The only *active* spec still encodes an earlier era (old stack, all-mock backend,
a since-abandoned core mechanic) while the project has moved on. Either the spec
should be retired/superseded or it is silently misleading. Evidence: the spec
line + the current reality that contradicts it.

### D. Canonical-source ambiguity / duplication

The documentation map / SSOT names one canonical source per fact, but the same
load-bearing fact is *also* maintained elsewhere and the two have drifted. Or no
doc is marked canonical for a fact a new agent must act on. Evidence: the two
diverging locations.

### E. Status-file bloat hides the current decision

`current-work` has grown into an implementation diary so long that the *current*
phase, blocker, and next decision are no longer findable near the top. A new
agent reading it would miss what matters now. Evidence: line count + where the
real current decision actually lives vs. where the file points.

### F. "End-to-end / green" that is actually narrow

A check named like full-stack/e2e proves less than its name: it mocks the
backend, starts only the frontend, or skips the real integration. Treating its
green as proof of a working live chain is a truth conflict between the *name* and
what it *exercises*. Evidence: the test/config lines that reveal the mock + any
doc that cites the green as end-to-end proof.

### G. Format-gov green mistaken for SSOT health

doc-gov / lint / link / manifest all pass, and someone (a doc, a habit, an agent)
treats that as "truth is consistent." Make the distinction explicit in the
report: list which semantic conflicts exist *despite* all format checks passing.

### H. Entry-file drift between hosts

`AGENTS.md`, `CLAUDE.md`, `GEMINI.md` are meant to route to one truth, but one of
them carries stale or divergent instructions (a forwarder that no longer
forwards, a host file with its own scope claims). Evidence: the diverging lines
across the entry files.

## Severity / impact ranking

Rank confirmed conflicts by the worst thing a wrong belief would cause, and let
that — not discovery order — choose the ≤3 headline conflicts:

1. **Wrong implementation** — a stale scope/boundary claim that would make an
   agent change the target repo incorrectly.
2. **Redundant work** — a "not yet built" claim, already built, that would make
   an agent redo finished work.
3. **Readiness misjudgment** — a name-vs-reality gap (mocked "e2e", an unproven
   remote self-check) read as proof of a live / secure / compliant chain.
4. **Scope misjudgment** — in/out-of-scope claims that no longer match the code.
5. **Owner decision risk** — drift that would steer the owner's phase decision
   wrong (e.g. current-work bloat hiding the real current decision).

Below this line sits cosmetic drift: out-of-date labels with no behavioral
effect. Keep it out of the headline; note it in an appendix at most.

## Stop / downgrade conditions

- The project's current truth is genuinely undecided (not drifted) — that is an
  owner question, not a conflict to "fix."
- You cannot reach the reality side (no git access, code not present) — report
  the limit instead of guessing.
- The conflicts are cosmetic wording differences with no effect on what an agent
  would *do* — keep them out of the high-priority list.
