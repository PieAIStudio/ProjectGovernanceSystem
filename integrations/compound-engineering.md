# Compound Engineering Integration

Compound Engineering is an external plugin/system. This repository does not
vendor, rewrite, or require the Compound Engineering plugin.

## The Beginner Version

Think of an AI project as a workshop:

- PGS is the traffic desk and filing cabinet.
- Superpowers is the default cooking process for engineering work.
- Compound Engineering's `ce-compound` is the recipe notebook written after a
  non-trivial dish is proven to work.
- `pro-gov learn recall` is the recipe-card search before the next dish starts.
- Ponytail is the cost and complexity adviser.

The default path is one main process with one learning tail. Do not make every
task choose between two construction processes.

## Default Rule

For PGS-governed engineering/runtime projects, Superpowers remains the default
engineering workflow. Compound Engineering is installed for its knowledge
capture loop by default, not as a second default execution engine.

Use this order:

1. PGS routes the task and selects the project lane.
2. For non-trivial engineering work, run Learning Recall against the task
   summary and read relevant prior lessons.
3. Superpowers handles the normal engineering workflow when that lane needs one.
4. Ponytail may run as an explicit complexity review when useful.
5. The agent must pass the Compound Gate before final reporting.
6. Doc Gov validates governed documentation and ignores CE-owned external
   artifacts.

## Learning Recall

CE writes the reusable lesson. PGS recalls it.

Before non-trivial implementation, debugging, release, architecture, or
portfolio-sync work, run:

```bash
pro-gov learn recall --query "<task summary>"
```

Read the relevant hits before changing files. A no-hit result is acceptable;
do not scan every `docs/solutions/**` file by hand. The recall command is a
small search surface over `docs/solutions/**` and `CONCEPTS.md`, not a second
workflow engine, vector database, or CE replacement.

## Compound Gate

Every completed non-trivial engineering task must pass the Compound Gate:

```text
Was there reusable learning?
-> yes: run compound-engineering:ce-compound
-> no: report "Compound Gate: skipped" and give the reason
```

Use Compound Engineering's own capture criteria. Do not invent a separate PGS
scoring system.

Run `ce-compound` when the completed work produced a reusable lesson, such as:

- a non-obvious bug diagnosis;
- a repeated pattern or root cause;
- a wrong assumption about a shared dependency, framework, convention, or tool;
- a new reusable architecture, workflow, verification, or tooling pattern;
- owner intent that the lesson should be remembered.

Skip compounding when the work was:

- unverified or still in progress;
- a trivial typo or obvious one-line fix;
- mechanical formatting, dependency bumping, or bulk sync work;
- already covered by an existing `docs/solutions/**` learning.

The skip must be explicit in the final report. This prevents agents from
forgetting the gate while avoiding a low-value knowledge dump.

## When CE May Own The Main Flow

Use the full Compound Engineering flow only when the user explicitly names it,
for example `ce-plan`, `ce-work`, `lfg`, or "use Compound Engineering full
workflow."

Do not auto-select between Superpowers and Compound Engineering for routine
work. Automatic choice adds cognitive load and makes sessions harder to reason
about.

## CE-Owned Artifacts

The following paths are Compound Engineering external artifacts:

| Path | Owner | Rule |
| --- | --- | --- |
| `docs/solutions/**` | CE | Knowledge store written by `ce-compound`; uses CE frontmatter. |
| `docs/brainstorms/**` | CE | CE brainstorm artifacts; explicit CE use only. |
| `docs/pulse-reports/**` | CE | CE product-pulse reports; explicit CE use only. |
| `docs/plans/*` | CE | CE-native root plan artifacts; explicit CE full workflow only. |

PGS-owned plans remain:

```text
docs/plans/active/**
docs/plans/completed/**
```

Doc Gov must not require CE-owned artifacts to use PGS frontmatter. The
directory decides which schema applies:

```text
docs/solutions/** and other CE-owned paths -> CE schema
PGS governed docs -> Doc Gov schema
```

Do not try to make one YAML block satisfy both systems.

## Root Files

Compound Engineering may read project root files when present, but PGS-governed
projects keep these boundaries:

| File | Rule |
| --- | --- |
| `STRATEGY.md` | CE must not create or overwrite this by default in PGS-governed projects. Product strategy belongs in the project's canon/control plane unless explicitly adopted. |
| `CONCEPTS.md` | Allowed as a CE vocabulary helper, but it does not replace `docs/canon/**` or project runtime truth. |
| `AGENTS.md` / `CLAUDE.md` | CE discoverability edits must stay short and must not replace the PGS router. |
| `.compound-engineering/config.local.yaml` | Machine-local CE config; keep gitignored. |

## Completion Report

When a task finishes, report one of:

```text
Compound Gate: ran ce-compound -> docs/solutions/<category>/<file>.md
Compound Gate: skipped -> <reason>
```

This is the durable signal that the learning tail was considered.
