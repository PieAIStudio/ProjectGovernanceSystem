# Upstreaming Policy

Use this decision tree before moving a rule from a project into this repository.

## Core

Move to `packages/doc-gov/` or `starter/` when the rule is true for most projects.

Examples:

- document status lifecycle
- frontmatter schema
- forbidden temporary filenames
- manifest and link validation
- default `docs/` folders

## Shared Rule

Move to `shared-rules/` when the rule is project-agnostic AI behavior.

Examples:

- SSOT documentation behavior
- AI-in-the-Loop evidence loop
- task routing algorithm
- visual communication conventions

## Profile

Move to `profiles/**` when the rule is reusable for a class of projects, but not all projects.

Examples:

- app/game/runtime engineering lanes
- doc-only media/IP workspace behavior

## Project-Local

Keep it in the project when the rule is about that project's product, stack, runtime, or current phase.

Examples:

- Supa Phase03 Boss Race
- PieFlow connector/write-back path safety
- PieIP ModernFreaks production pipeline

## Rule

If you cannot decide, keep the rule local first and write an upstream proposal. Premature centralization is worse than one deliberate local rule.
