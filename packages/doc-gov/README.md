# @pieai/doc-gov

CLI for Project Governance System: a thin documentation-governance layer for
AI-assisted projects.

It checks whether governed Markdown documents have the right frontmatter,
lifecycle status, links, manifest freshness, agents-routing, and project wiring.

`@pieai/doc-gov` is the validator package. For reusable starter/profile assets
and read-only project-level init/sync checks, use `@pieai/pro-gov` beside it.

## Install

```bash
pnpm add -D @pieai/doc-gov
```

Then add a script in your project:

```json
{
  "scripts": {
    "doc-gov": "doc-gov"
  }
}
```

## Common Commands

```bash
pnpm doc-gov init
pnpm doc-gov new spec first-spec
pnpm doc-gov check
pnpm doc-gov scan --check
pnpm doc-gov links
pnpm doc-gov audit
pnpm doc-gov router-check
pnpm doc-gov doctor
pnpm doc-gov migrate --profile doc-only --check
pnpm doc-gov migrate --profile engineering-runtime --check
```

## What It Governs

By default, Project Governance System governs:

- `docs/**`
- AI entry files/config adapters such as `AGENTS.md` and `CLAUDE.md`
- documentation-governance templates, manifest, and agents-routing files

It does not try to swallow product artifacts, prompts, generated media,
runtime notes, or source assets outside `docs/**` unless a project explicitly
opts them into doc-gov.

## Status

The CLI is in public preview. The read-only checks are the stable path:

- `check`
- `scan --check`
- `links`
- `audit`
- `router-check`
- `doctor`
- `migrate --profile <profile> --check`

Future write-mode migration or apply behavior should be added only after more
real projects prove the same migration shape. Project-level write behavior
belongs in `pro-gov`, not in the validator by default.
