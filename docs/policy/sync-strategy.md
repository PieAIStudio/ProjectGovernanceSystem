---
id: POLICY-SYNC-STRATEGY
title: Project Governance System Sync Strategy
type: policy
status: stable
canonical: true
owner: human
created: 2026-05-06
last_reviewed: 2026-05-07
domain: adoption
tags:
  - sync
  - adoption
  - stage-0
pinned: true
related:
  - REF-ADOPTION-PLAYBOOK
  - REF-PROJECT-RELATIONSHIP
---

# Sync Strategy

## Stage 0: AI-Assisted Sync

Use this now.

Projects keep local copies. An AI migration task compares the project against this repo and applies only the relevant profile.

Benefits:

- safest while the system is young
- no accidental breakage across Supa, PieFlow, and PieIP
- project-local differences stay visible

Drawback:

- requires explicit migration prompts

## Stage 1: Scripted Copy / Diff

Add a script that can show:

```bash
doc-gov migrate --profile engineering-runtime --check
doc-gov migrate --profile engineering-runtime --apply
```

This should update core/starter files while preserving local profile sections.

## Stage 2: Package Install

Projects depend on `@pieai/doc-gov` instead of keeping local CLI source:

```bash
pnpm add -D @pieai/doc-gov
pnpm doc-gov check
```

This should happen only after Supa and PieFlow have both validated the same lifecycle.

## Stage 3: Published Template / Init

New projects can start with:

```bash
pnpm dlx @pieai/doc-gov init --profile doc-only
pnpm dlx @pieai/doc-gov init --profile engineering-runtime
```

Do not jump here before Stage 0 and Stage 1 prove stable.
