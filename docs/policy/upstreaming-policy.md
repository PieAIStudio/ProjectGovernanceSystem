---
id: POLICY-UPSTREAMING
title: Project Governance System Upstreaming Policy
type: policy
status: stable
canonical: true
owner: human
created: 2026-05-06
last_reviewed: 2026-06-13
domain: governance
tags:
  - upstreaming
  - boundaries
  - project-local
pinned: true
related:
  - POLICY-DESIGN-PRINCIPLES
  - REF-PROJECT-RELATIONSHIP
---

# Upstreaming Policy

Use this decision tree before moving a rule from a project into this repository.

## Core

Move to `docs/governance/`, `packages/doc-gov/`, `packages/pro-gov/`, or
`starter/` when the rule is
true for most projects and belongs to the governance system itself.

Examples:

- SSOT documentation behavior
- agents-routing rules
- document status lifecycle
- frontmatter schema
- forbidden temporary filenames
- manifest and link validation
- default `docs/` folders

## External Shared Rule

Keep project-agnostic AI working behavior in an external shared-rule source when
it is not part of the governance system's core structure. Target projects may
link that source under `docs/policy/shared-rules/`, but this repository should
not keep a second copy of the rule body.

Examples:

- AI-in-the-Loop evidence loop
- visual communication conventions

## Profile

Move to `profiles/**` when the rule is reusable for a class of projects, but not all projects.

Examples:

- app/game/runtime engineering lanes
- doc-only media/IP workspace behavior

## Project-Local

Keep it in the project when the rule is about that project's product, stack, runtime, or current phase.

Examples:

- Non-Heroes product/runtime canon
- PieFlow connector/write-back path safety
- PieIP ModernFreaks production pipeline

## Rule

If you cannot decide, keep the rule local first and write an upstream proposal. Premature centralization is worse than one deliberate local rule.
