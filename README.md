# Project Governance System

Central upstream for PieAI project documentation governance, task routing, and workflow integration profiles.

This repository is not a finished public package yet. It is the **single source of upstream design** for the system currently proven in Supa and being adapted into PieFlow and PieIP.

## What Belongs Here

| Layer | Purpose | Example |
| --- | --- | --- |
| `packages/doc-gov/` | CLI, schema, lifecycle, templates, validation logic | `completed` status, manifest scan, link checks |
| `starter/` | New-project starter files | `docs/`, `governance/`, `AGENTS.template.md` |
| `shared-rules/` | Project-agnostic AI rules | SSOT, AI-in-the-Loop |
| `routing/` | Project-agnostic task routing algorithms | engineering, doc-only |
| `integrations/` | How this system cooperates with external workflows | Superpowers, Directed Development |
| `profiles/` | Optional adoption profiles by project type | engineering-runtime, doc-only |
| `examples/` | Reference implementation notes | Supa, PieFlow, PieIP |

## What Does Not Belong Here

- Supa Phase03 gameplay truth.
- PieFlow v4 product rules.
- PieIP character, script, or asset canon.
- A fork or copy of the Superpowers plugin.
- The body of the Directed Development skill.

Those are project-local or external systems. This repo only defines how projects should integrate with them.

## Current Adoption Model

Stage 0 is intentionally conservative:

1. This repo records the upstream contract.
2. Projects keep their local working copies.
3. AI-assisted migrations compare a project against the matching profile.
4. After Supa and PieFlow both validate the same lifecycle, the package can become the install source.

Do not silently replace project-local governance with this repo. Use the adoption guides and run each project's doc checks.

For migration steps, read `docs/adoption-playbook.md`.

## Project Profiles

| Project | Profile | Uses routing? | Uses Directed Development? |
| --- | --- | --- | --- |
| Supa | `profiles/engineering-runtime/` plus Supa-local game rules | Yes, engineering routing | Yes, for mixed product/runtime work |
| PieFlow | `profiles/engineering-runtime/` | Yes, engineering routing | Yes, for mixed app/runtime work |
| PieIP | `profiles/doc-only/` | Yes, doc-only routing | No by default |

## Key Lifecycle Decision

Normal documents use:

```text
draft -> active -> completed -> stable -> superseded -> archived
```

`completed` is for execution artifacts that finished but remain useful as proof history, especially `docs/plans/completed/**`.

`completed` is not the same as `archived`:

- `completed`: no longer active, still useful proof/history, may remain canonical.
- `archived`: retired historical material, must be `canonical: false`.

Decision documents still use:

```text
proposed -> accepted -> rejected | superseded
```

## How A Local Improvement Flows Upstream

When a project discovers a better rule:

1. Decide whether it is **core**, **profile**, or **project-local**.
2. Core changes go to this repo first.
3. Profile changes update `profiles/**`.
4. Project-local changes stay in the project.
5. Other projects upgrade by comparing against the central profile, not by re-inventing the rule.

Example: Supa's active-plan pileup revealed a core lifecycle gap. The fix is `completed`, so it belongs in `packages/doc-gov/` and the starter templates, not only in Supa.

## Minimality Rule

This repo should remain a thin viable platform:

- keep only two profiles until a third is proven by multiple projects
- keep product/game/app truth out of the central repo
- keep Superpowers external and documented as an integration
- keep Directed Development as an optional workflow integration, not a mandatory default path
- prefer one-page routing rules over layered methodology docs
