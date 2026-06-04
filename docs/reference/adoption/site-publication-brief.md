---
id: REF-SITE-PUBLICATION-BRIEF
title: Website Publication Brief
type: reference
status: stable
canonical: true
owner: human
created: 2026-06-04
last_reviewed: 2026-06-05
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

Project Governance System is an AI-native governance layer for projects that
work with AI agents over time.

Beginner-friendly description:

> Git remembers code history. AGENTS.md tells an AI how to enter a project.
> Superpowers gives engineering workflows. Project Governance System is the
> librarian and traffic desk: it decides where durable AI-created documents
> belong, which ones are current truth, which route a task should take, and
> when old documents should retire.

## What To Emphasize

- It keeps AI-generated specs, plans, decisions, references, and routing rules
  from becoming unmanaged clutter.
- It separates central governance rules from project-local truth.
- It has two practical profiles: engineering-runtime and doc-only.
- It provides `doc-gov` commands for schema checks, manifest freshness, link
  checks, router integrity, health checks, and read-only migration checks.
- It is designed to work with external workflow systems instead of replacing
  them.

## Do Not Overclaim

- Do not say it replaces Git.
- Do not say it replaces Superpowers.
- Do not say it automatically migrates every project.
- Do not imply product prompts, generated media, or runtime assets must move
  under `docs/**`.

## Suggested Website Prompt

```text
Read <local project-governance-system path> as the source project.

Add Project Governance System to <local PieAIStudio-Site path> as a
public project surface. Follow the existing project-page pattern, homepage card
pattern, translations, and sitemap conventions in that website repository.

Use the central repo's README.md, packages/doc-gov/README.md,
docs/reference/adoption/public-release-checklist.md, and
docs/reference/adoption/site-publication-brief.md as source material.

Position it for normal readers as an AI-era documentation governance system:
the librarian and traffic desk for AI-created project documents. Explain what
problem it solves, why it matters, how doc-gov checks work, and how it fits next
to Git, AGENTS.md, Superpowers, and project-local product truth.

Keep the copy confident but accurate. Do not claim automatic migration or
full replacement of existing workflow tools. npm publication is live, so include
the package install command for @pieai/doc-gov and link both the npm package and
the GitHub repository.

After implementation, run the site's normal quality/typecheck/build checks and
verify the new public route plus sitemap entry.
```
