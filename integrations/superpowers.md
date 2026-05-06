# Superpowers Integration

Superpowers is an external plugin/system. This repository does not vendor or rewrite it.

## Boundary

Superpowers owns engineering workflows such as:

- brainstorming
- writing plans
- TDD
- debugging
- verification before completion
- worktree usage

Project Governance System owns:

- documentation lifecycle
- task routing
- current work index conventions
- shared AI evidence rules

## Rule

Use Superpowers inside the selected project lane. Do not let Superpowers create a separate durable document tree unless the project explicitly adopts one.

Durable outputs should map back to the project's doc-gov layers:

- specs -> `docs/specs/**`
- plans -> `docs/plans/**`
- durable references -> `docs/reference/**`
