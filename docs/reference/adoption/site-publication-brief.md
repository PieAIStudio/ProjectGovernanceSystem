---
id: REF-SITE-PUBLICATION-BRIEF
title: Website Publication Brief
type: reference
status: stable
canonical: true
owner: human
created: 2026-06-04
last_reviewed: 2026-06-13
domain: adoption
tags:
  - website
  - public
  - handoff
pinned: false
related:
  - REF-PUBLIC-RELEASE-CHECKLIST
  - REF-PROJECT-RELATIONSHIP
---

# Website Publication Brief

Use this when asking the PieAI Studio website project to add Project Governance
System as a public project page.

## Public Positioning

Project Governance System keeps long-running AI-assisted projects understandable
and governable.

Beginner-friendly description:

> AI can create plans, specifications, rules, and reports faster than people can
> organize them. Project Governance System is the librarian, traffic desk, and
> inspection machine: it keeps current truth easy to find, sends each task down
> the right route, and checks that important project evidence is still connected.

## What To Emphasize

- It reduces the cognitive load of returning to an AI-assisted project after
  days, weeks, or many different AI sessions.
- It keeps AI-generated specs, plans, decisions, references, and routing rules
  from becoming unmanaged clutter.
- It separates central governance rules from project-local truth.
- It has two practical profiles: engineering-runtime and doc-only.
- It provides `doc-gov` commands for schema checks, manifest freshness, link
  checks, router integrity, health checks, and read-only migration checks.
- It provides `pro-gov` commands for packaged starter/profile assets, guarded
  fresh-target installation, read-only sync checks, and package health checks.
- It includes ProjectLens-style read-only inspection and a governed local agent
  asset registry without publishing private or third-party skill bodies.
- It works with external workflow systems instead of replacing them:
  Superpowers owns engineering process, while Ponytail may act as an optional
  complexity adviser with global mode `off`.

## Do Not Overclaim

- Do not say it replaces Git.
- Do not say it replaces Superpowers.
- Do not say it requires or automatically enables Ponytail.
- Do not promise a fixed percentage reduction in code, tokens, time, or cost.
- Do not say it automatically migrates every project.
- Do not imply product prompts, generated media, or runtime assets must move
  under `docs/**`.

## Suggested Website Prompt

```text
Read <local ProjectGovernanceSystem checkout path> as the source project.

Add Project Governance System to <local PieAIStudio-Site path> as a
public project surface. Follow the existing project-page pattern, homepage card
pattern, translations, and sitemap conventions in that website repository.

Use the central repo's README.md, packages/doc-gov/README.md,
packages/pro-gov/README.md, docs/reference/adoption/public-release-checklist.md,
and docs/reference/adoption/site-publication-brief.md as source material.

Position it for normal readers as the system that keeps long-running AI-assisted
projects understandable and governable. Lead with the pain: AI creates useful
plans, specs, rules, and evidence faster than people can organize and retire
them. Use the librarian, traffic desk, and inspection-machine analogy before
technical package details. Explain how it fits next to Git, AGENTS.md,
Superpowers, optional Ponytail advice, pro-gov starter/profile distribution,
ProjectLens inspection, and project-local product truth.

Keep the copy confident but accurate. Do not claim automatic migration or
full replacement of existing workflow tools. npm publication is live, so include
the package install commands for @pieai/doc-gov and @pieai/pro-gov, and link the
npm packages plus the GitHub repository.

After implementation, run the site's normal quality/typecheck/build checks and
verify the new public route plus sitemap entry.
```
