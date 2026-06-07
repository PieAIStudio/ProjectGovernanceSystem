# Changelog

## 0.3.2 - 2026-06-07

- Clarified AI startup routing so agents must read all
  `docs/policy/**/*.md` files, including subdirectories and symlinked
  shared-rule files.
- Added router integrity regression checks that reject the narrower
  "directly under docs/policy/" wording in central and downstream routers.
- Updated the starter AGENTS template so new projects inherit the recursive
  policy-read rule.

## 0.3.1 - 2026-06-05

- Changed the central and starter lefthook templates to keep pre-commit checks
  read-only: hooks now use manifest freshness checks instead of regenerating
  and staging `docs/governance/MANIFEST.yml`.
- Removed stale starter CI references to vendored `tools/doc-gov` copies.
- Updated adoption and package docs to treat `@pieai/doc-gov` as the preferred
  CLI source for new migration work.

## 0.3.0 - 2026-06-04

- Prepared the repository for public release by adding license, security,
  contribution, package README, npm metadata, and release checklist docs.
- Added `doc-gov doctor` to run a combined governance health check for router
  integrity, docs, manifest freshness, links, local lefthook installation, and
  CI guardrail wiring.
- Added read-only `doc-gov migrate --profile <profile> --check` so projects can
  detect profile/agents-routing mismatch before any sync work changes files.
- Added standard starter guardrail templates for `lefthook.yml` and
  `.github/workflows/docs-check.yml`, both including `router-check` and `links`.
- Tightened router integrity checks to reject machine-local absolute paths and
  parent-directory escape paths in router-facing files.
- Changed manifest sync comparison so `generator_version` patch drift no longer
  creates false `scan --check` failures.

## 0.2.1 - 2026-05-14

- Removed the central `shared-rules/` copy and clarified that external shared
  AI work rules are linked into target projects under `docs/policy/shared-rules/`.
- Added router integrity protection against reintroducing central shared-rule
  copies.
- Added `starter/CLAUDE.template.md` and downstream router checks for thin
  host-specific adapters.
- Tightened the first-user path by creating `docs/reference/execution/` during
  `doc-gov init` and treating `current-work.md` as required but lightweight.

## 0.2.0 - 2026-05-09

- Absorbed SSOT rules into `docs/governance/ssot-v0.9.md`.
- Moved reusable task routing into `docs/governance/agents-routing/*-v0.9.md`.
- Added router integrity checks for central and downstream project routers.
- Added default document templates for all doc-gov creatable document types.
- Added regression tests for `approve`, `supersede`, `archive`, and
  `verify-commit-msg`.
- Expanded the Non-Heroes, PieFlow, and PieIP examples from stubs into adoption case
  studies.
- Documented intentionally deferred work, including the migrate command and
  router YAML spec, in the self-review.
- Clarified that `docs/governance/` is for governance core, while
  `docs/policy/` is for project AI/development policy.
- Reworked starter paths so downstream projects can adopt the same boundary
  without root-level `governance/` or non-root `README.md` files.

## 0.1.0 - 2026-05-06

- Seeded central project governance system from early active project doc-gov implementations.
- Added `completed` to the normal document lifecycle.
- Added starter/profile structure for `doc-only` and `engineering-runtime` projects.
- Documented the upstream/local relationship so projects do not hand-roll divergent governance systems.
