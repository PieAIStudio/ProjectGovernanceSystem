# Changelog

## 0.2.0 - 2026-05-09

- Absorbed SSOT rules into `docs/governance/ssot-v0.9.md`.
- Moved reusable task routing into `docs/governance/agents-routing/*-v0.9.md`.
- Added router integrity checks for central and downstream project routers.
- Added default document templates for all doc-gov creatable document types.
- Added regression tests for `approve`, `supersede`, `archive`, and
  `verify-commit-msg`.
- Expanded the Supa, PieFlow, and PieIP examples from stubs into adoption case
  studies.
- Documented intentionally deferred work, including the migrate command and
  router YAML spec, in the self-review.
- Clarified that `docs/governance/` is for governance core, while
  `docs/policy/` is for project AI/development policy.
- Reworked starter paths so downstream projects can adopt the same boundary
  without root-level `governance/` or non-root `README.md` files.

## 0.1.0 - 2026-05-06

- Seeded central project governance system from the Supa/PieFlow doc-gov implementation.
- Added `completed` to the normal document lifecycle.
- Added starter/profile structure for `doc-only` and `engineering-runtime` projects.
- Documented the upstream/local relationship so projects do not hand-roll divergent governance systems.
