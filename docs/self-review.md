# Self Review

## Is This Too Complex?

Current answer: no, if it stays at two profiles and one central core.

The system is justified because it replaces repeated project-by-project reinvention with:

- one lifecycle
- one doc-gov core
- two routing modes
- one current work convention
- optional workflow integrations

## What Was Cut

- Removed a central `game-runtime` profile.
- Avoided vendoring Superpowers.
- Kept Directed Development optional.
- Renamed the "current router" concept to `current-work.md`.
- Kept project-specific product truth out of the central repo.

## Remaining Risks

| Risk | Mitigation |
| --- | --- |
| Central repo grows into a bureaucracy | Apply the cut line: only upstream rules that reduce repeated confusion in at least two projects |
| Projects drift from central core | Use explicit AI-assisted sync until `doc-gov migrate` exists |
| Users confuse task routing and current work | Use separate names: routing files vs `current-work.md` |
| Doc-only projects get engineering ceremony | Keep `doc-only` separate and exclude DD/Superpowers by default |

## Current Verdict

This is close to the thinnest useful form. Do not add more profiles or lifecycle states without a second-project proof.
