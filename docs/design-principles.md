# Design Principles

This system exists to reduce project and AI-session cognitive load, not to create a larger governance hobby.

## External Anchors

- Team Topologies' **Thinnest Viable Platform** idea: a platform should absorb repeated complexity while staying as thin as possible.
- Platform engineering **golden paths**: provide a paved path for common work, without forcing every project into one workflow.
- ADR practice: record durable decisions close to the work, in lightweight text, so future agents can understand why a rule exists.
- Twelve-Factor style dev/prod parity: keep the install/sync model close enough across projects that "works in one project" is meaningful in another.

## Local Rules

### 1. Two Profiles Until Proven Otherwise

Only two profiles exist now:

- `engineering-runtime`
- `doc-only`

Supa's game-specific rules stay in Supa. Do not create a central `game-runtime` profile until at least two game projects need the same reusable layer.

### 2. Rename "Current Router" To "Current Work"

Task routing and current work are different:

- routing decides workflow depth
- current work tells the agent what is active now

Use `current-work.md` in starters and future migrations to avoid "two routers" confusion.

### 3. Upstream Core Changes First

Do not locally invent new doc-gov statuses, schema fields, document types, shared routing semantics, or shared AI rules.

If a project discovers a core gap, update this repo first, then sync projects from it.

### 4. Keep Superpowers External

This repo integrates with Superpowers but does not vendor it.

### 5. Directed Development Is Optional

DD is for mixed, cross-lane, interdependent product work. It is not a default ceremony and it is not part of doc-only projects unless explicitly opted in.

### 6. Prefer One-Page Rules

Shared rules should be short. If a rule needs a long explanation, put examples in `examples/` or project-local docs.

## Cut Line

If a proposed addition does not reduce repeated confusion in at least two projects, keep it project-local.
