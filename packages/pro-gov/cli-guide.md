# pro-gov CLI Guide

`pro-gov` is the project-level companion to `doc-gov`.

Use it to inspect packaged Project Governance System assets, plan a starter
installation, compare reusable governance files, inspect local projects, and run
package health checks.

The validator remains `doc-gov`.

## Commands

Public package-safe commands:

```bash
pro-gov assets list
pro-gov assets discover --target .
pro-gov assets recommend --target .
pro-gov lens inspect --target .
pro-gov lens report --target . --out .pro-gov/lens-report.md
pro-gov init --profile engineering-runtime --dry-run
pro-gov init --profile doc-only --dry-run
pro-gov sync --check
pro-gov doctor
```

`init` and `sync` are read-only in the first release. They report planned files,
missing files, or changed files, but they do not overwrite target projects.

Full upstream-checkout commands:

```bash
pro-gov assets list --json
pro-gov assets plan --bundle base-governance --target . --out .pro-gov/asset-plan.json
pro-gov assets plan --bundle loop-library --target /path/to/project --host codex --placement manual --out /tmp/loop-library-plan.json
pro-gov assets apply --plan .pro-gov/asset-plan.json
pro-gov assets check --target .
pro-gov assets public-check --json
pro-gov assets npx add <source> --plan
pro-gov assets npx update --plan
```

These commands use a maintainer-local `agent-assets/` registry when local-only
assets are present. Publicly reviewed assets live under `public-agent-assets/`;
the public npm package excludes unpublished asset bodies by design.
`public-check` is the maintainer drift check for the promotion receipt recorded
in `public-agent-assets/registry.json`.
Use manual placement for skills that should live under `.agents/manual-skills/`
and be loaded only when explicitly requested.

## Typical Adoption Flow

```bash
pnpm add -D @pieai/pro-gov @pieai/doc-gov
pnpm pro-gov assets list
pnpm pro-gov assets discover --target .
pnpm pro-gov assets recommend --target .
pnpm pro-gov init --profile engineering-runtime --dry-run
pnpm pro-gov sync --check
pnpm doc-gov migrate --profile engineering-runtime --check
pnpm doc-gov doctor
```

Use `doc-only` instead of `engineering-runtime` for writing, research, IP, AI
media, and asset-governance workspaces that do not need runtime engineering
proof lanes.
