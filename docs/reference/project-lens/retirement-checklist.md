---
id: REF-PROJECT-LENS-RETIREMENT-CHECKLIST
title: ProjectLens Retirement Checklist
type: reference
status: stable
canonical: true
owner: ai-assisted
created: 2026-06-15
last_reviewed: 2026-06-15
domain: governance
tags:
  - project-lens
  - retirement
  - pro-gov
pinned: false
related:
  - SPEC-0003
  - SPEC-PROJECT-AUDIT-PROTOCOL-V0-1
---

# ProjectLens Retirement Checklist

Use this before deleting `/Users/yuanfei/PieAI/ProjectLens`.

## Required Proof

- `agent-assets/skills/pie-skills/project-architecture-lens/` exists.
- `agent-assets/skills/pie-skills/truth-surface-audit/` exists.
- `docs/reference/project-lens/project-audit-protocol-v0.1.md` exists.
- `agent-assets/bundles/project-lens.json` includes the reusable ProjectLens
  skills.
- `pro-gov lens inspect --target <path>` works on a real local project.
- `pro-gov lens report --target <path> --out <path>` writes a Markdown evidence
  report.
- Historical ProjectLens `audits/show/**` and `audits/non-heroes/**` are not
  needed by the user.
- The old ProjectLens root has no uncommitted or unique reusable source that
  still needs migration.

## Delete Boundary

Delete only the old `/Users/yuanfei/PieAI/ProjectLens` root after the user has
tested the new PGS commands and explicitly approves deletion.

Do not delete timestamped OneDrive skill/rule/command archives as part of
ProjectLens retirement.
