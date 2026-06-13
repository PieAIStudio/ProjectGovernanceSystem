# pro-gov CLI Guide

`pro-gov` is the project-level companion to `doc-gov`.

Use it to inspect packaged Project Governance System assets, plan a starter
installation, compare reusable governance files, and run package health checks.

The validator remains `doc-gov`.

## Commands

```bash
pro-gov assets list
pro-gov init --profile engineering-runtime --dry-run
pro-gov init --profile doc-only --dry-run
pro-gov sync --check
pro-gov doctor
```

`init` and `sync` are read-only in the first release. They report planned files,
missing files, or changed files, but they do not overwrite target projects.

## Typical Adoption Flow

```bash
pnpm add -D @pieai/pro-gov @pieai/doc-gov
pnpm pro-gov assets list
pnpm pro-gov init --profile engineering-runtime --dry-run
pnpm pro-gov sync --check
pnpm doc-gov migrate --profile engineering-runtime --check
pnpm doc-gov doctor
```

Use `doc-only` instead of `engineering-runtime` for writing, research, IP, AI
media, and asset-governance workspaces that do not need runtime engineering
proof lanes.
