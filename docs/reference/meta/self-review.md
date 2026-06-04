---
id: REF-SELF-REVIEW
title: Project Governance System Self Review
type: reference
status: stable
canonical: true
owner: human
created: 2026-05-06
last_reviewed: 2026-06-04
domain: meta
tags:
  - self-review
  - risks
  - minimality
pinned: false
related:
  - POLICY-DESIGN-PRINCIPLES
  - POLICY-UPSTREAMING
---

# Self Review

## Is This Too Complex?

Current answer: no, if it stays at two profiles and one central core.

The system is justified because it replaces repeated project-by-project reinvention with:

- one lifecycle
- one doc-gov core
- two agents-routing modes
- one current work convention
- optional workflow integrations

## What Was Cut

- Removed a central `game-runtime` profile.
- Avoided vendoring Superpowers.
- Kept Directed Development optional.
- Renamed the "current router" concept to `current-work.md`.
- Kept project-specific product truth out of the central repo.
- Added `doc-gov migrate --check` as a read-only profile readiness check, while
  keeping `--apply` deferred until repeated migrations prove the exact safe
  update shape.
- Kept router integrity rules in TypeScript for now instead of adding a YAML
  router-spec layer. The current check is small enough that another config
  layer would add more cognitive load than it removes.

## Current Test Coverage

The CLI now has regression coverage for the first-user journey and the commands
that mutate governed docs:

- `init -> new -> check`
- fallback templates when project templates are missing
- `approve`
- `supersede`
- `archive`
- `verify-commit-msg` for `Pinned-Override` and `Approves`
- `doctor` for core health plus local/CI guardrail wiring
- `migrate --check` for selected profile readiness
- router integrity, non-root README rejection, governed docs paths, and link checks

This does not make the CLI finished, but it protects the workflows most likely
to damage document state if they regress.

## Remaining Risks

| Risk | Mitigation |
| --- | --- |
| Central repo grows into a bureaucracy | Apply the cut line: only upstream rules that reduce repeated confusion in at least two projects |
| Projects drift from central core | Use explicit AI-assisted sync until `doc-gov migrate` exists |
| Users confuse agent routing and current work | Use separate names: `agents-routing` files vs `current-work.md` |
| Doc-only projects get engineering ceremony | Keep `doc-only` separate and exclude DD/Superpowers by default |
| Doc-gov swallows product artifacts | Govern `docs/**` by default; require explicit opt-in for extra governed roots |
| Router-check becomes too brittle | Keep it thin and add focused tests before adding a separate router spec format |

## Current Verdict

This is close to the thinnest useful form. Do not add more profiles or lifecycle states without a second-project proof.
