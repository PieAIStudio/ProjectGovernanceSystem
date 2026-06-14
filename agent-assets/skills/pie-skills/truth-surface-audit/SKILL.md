---
name: truth-surface-audit
description: >-
  ProjectLens audit of whether a target project's "truth surface" is internally
  consistent — whether its entry/router files (AGENTS.md, CLAUDE.md, GEMINI.md),
  README, current-work, specs, canon, policy, documentation map, and active
  plans agree with each other, with the real git branch / main / origin state,
  and with the actual code. Use whenever ProjectLens must check things like "do
  our docs still match reality", "is the project's truth consistent", "which doc
  is canonical", "is current-work stale", "did main drift from what the
  spec/policy says is in scope", or after a big batch of work that may have
  outrun its documentation. Crucially, it separates "doc-gov / lint / link-check
  passed" from "the project's semantic truth is actually consistent" — those are
  not the same thing. Read-only observer lens; not for writing docs, fixing
  code, or ordinary PR review. For architecture / stack / dependency fit, use
  project-architecture-lens instead.
---

# Truth Surface Audit

Check whether everything a project *claims about itself* still agrees — across
its documents, and between its documents and reality. A project's truth surface
is the set of statements a new agent or human trusts on arrival. When those
statements quietly disagree, capable agents make confident wrong moves.

## Read-only by default

ProjectLens does not edit the target repository. You report conflicts and name
the canonical source; you do not rewrite the docs or the code. Fixing the truth
surface is an owner decision, not a side effect of auditing it.

## The distinction that makes this skill necessary

**Format-green ≠ truth-consistent.** doc-gov / lint / link-check / manifest can
all pass with zero warnings while the *meaning* has split. Those tools verify
shape — frontmatter, link targets, schema — not whether two documents tell the
same story, or whether a document still matches the code and git history.

Concrete pattern (from the first real audit): a target returned **0 doc-gov
warnings**, yet `AGENTS.md` and policy still listed payments/accounts/real
providers as *out of scope* while `main` had already shipped exactly those; and
`current-work` still said the work branch "could not be merged to main" when
`HEAD` already *was* that merge. Every format check was green. The truth surface
was broken. **Never report "checks pass" as "truth is healthy."**

## Truth sources to cross-check

- entry / router files: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` (and any equivalent)
- `README.md`
- `docs/reference/execution/current-work.md` (or the project's status file)
- active specs
- canon (durable product/decision truth)
- policy
- documentation map / SSOT table
- active plans / roadmap
- **the real git state**: actual branch, `main`, `origin/main`, `HEAD`, recent
  history — read with commands, never assumed
- **the actual code**: does it do what the docs say is in/out of scope?

## Method

1. **Extract claims.** From each truth source, pull the load-bearing claims a new
   agent would act on: current phase, what is in/out of scope, which branch is
   live, which doc is canonical, what "done" means, what to read next.
2. **Build a claim → source → reality matrix.** For each claim, record where it is
   stated and what reality (code, git, another doc) actually shows.
3. **Find the conflicts** (classes in `references/checklist.md`): stale scope
   boundaries, branch/main/origin claims vs `git` output, an active spec locked
   to retired assumptions, current-work bloated past the point where the current
   decision is findable, "end-to-end / green" that is actually mocked,
   format-gov green mistaken for SSOT health, the same fact duplicated in two
   places that have drifted.
4. **Verify against reality, not vibes.** Run the git commands. Open the code
   path. A conflict claim needs evidence on *both* sides.
5. **Name the canonical source.** For each conflict, say which statement should
   win and where the owner should make it true — but do not make the edit.

## Evidence rule

Every conflict cites both sides: `file:line` for each document involved, plus the
actual `git` command output or `code:line` for the reality side. A conflict
without both sides is a hypothesis — label it as one.

## Rank by impact, not by discovery order

Not every truth drift deserves the headline. Once you have the conflicts, rank
them by **what a wrong belief would cause**, not by the order you found them.
Reserve top priority for conflicts that would make someone act wrongly:

- wrongly implement or modify the target repo (acting on a stale scope boundary)
- redo work that is already done (a "not yet built" claim that is already built)
- misjudge launch / security / compliance readiness (e.g. a mocked "e2e" read as
  a live-chain proof)
- misjudge what is in or out of scope
- steer the owner toward a wrong-phase decision

Wording differences with no effect on what anyone would *do* stay out of the
headline. The full severity rubric is in `references/checklist.md`.

## Keep it absorbable

- **At most 3 high-priority conflicts** in the headline; the rest go in an
  appendix.
- For each, state the owner decision: which claim is true, and who updates the
  losing source.
- **Close with one single best next move** — usually the single conflict to
  resolve first, or the one reset that clears a whole cluster (e.g. "shrink
  current-work and re-align router / policy / spec with the real `main`"). If
  nothing rises above cosmetic, say the truth surface is healthy rather than
  inventing a problem.

## Output

Reuse the canonical finding format and report shape — do not invent a new one:

- Finding template + report shape:
  `docs/reference/project-lens/project-audit-protocol-v0.1.md`.
- For a large audit, produce the three-file bundle under
  `audits/<target>/<date>/`: `owner-brief.md`, `audit-brief.md`,
  `evidence-log.md`.
- `evidence-log.md` must record: target commit/state inspected; the exact git
  commands run and their output; the key files compared; external sources, if
  any; the skills, methods, and MCP tools used; and the limits of the evidence
  (e.g. "did not inspect private history outside the repo").

## Detailed conflict classes

Read `references/checklist.md` when you reach the matrix step — it enumerates the
recurring conflict classes and the git commands that expose the reality side.
