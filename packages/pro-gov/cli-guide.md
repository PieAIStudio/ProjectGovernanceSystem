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
pro-gov portfolio check --config /path/to/portfolio.json
pro-gov portfolio plan --config /path/to/portfolio.json --target web-app --json
pro-gov portfolio assets-check --config /path/to/portfolio.json --json
pro-gov portfolio doctor --config /path/to/portfolio.json --json
pro-gov learn recall --query "release downstream sync" --target .
pro-gov lens inspect --target .
pro-gov lens report --target . --out .pro-gov/lens-report.md
pro-gov lens audit init --target /path/to/project --out audits/project/2026-07-01
pro-gov lens audit check --dir audits/project/2026-07-01
pro-gov init --profile engineering-runtime --dry-run
pro-gov init --profile engineering-runtime --apply
pro-gov init --profile doc-only --dry-run
pro-gov sync --check [--profile engineering-runtime|doc-only]
pro-gov doctor
```

`init --apply` is safe for a fresh target: it preflights every destination and
refuses the entire operation if any target file already exists. It never merges
or overwrites an existing router or project-local policy. Existing projects
should use `--dry-run` and migrate deliberately. Optional Lefthook and GitHub
Actions references stay packaged but are not installed by default.

`sync --check` is read-only. It compares shared governance core files strictly,
but checks project-local seeds such as `AGENTS.md`, project policy, and current
work for presence only. It infers the installed profile when exactly one route
exists; `--profile` resolves an empty or temporarily ambiguous target.

`learn recall` is the pre-work companion to Compound Engineering's post-work
`ce-compound` learning records. It searches `docs/solutions/**` and
`CONCEPTS.md` in the target repository and returns the most relevant prior
lessons for the current task. Use it before non-trivial implementation,
debugging, release, architecture, or portfolio-sync work. It is read-only and
does not require a full local PGS checkout.

Full upstream-checkout commands:

```bash
pro-gov assets list --json
pro-gov portfolio check --config /path/to/control-repo/.pro-gov/portfolio.json --json
pro-gov portfolio plan --config /path/to/control-repo/.pro-gov/portfolio.json --target web-app --json
pro-gov portfolio assets-check --config /path/to/control-repo/.pro-gov/portfolio.json --json
pro-gov portfolio doctor --config /path/to/control-repo/.pro-gov/portfolio.json --json
pro-gov assets plan --bundle base-governance --target . --out .pro-gov/asset-plan.json
pro-gov assets plan --bundle project-lens --target /path/to/project --host codex --placement manual --out /tmp/project-lens-plan.json
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
Skill placement normally comes from the asset registry. Use `--placement
auto|manual` only as a migration override when deliberately moving an existing
target.

Portfolio manifests are external configuration files owned by a user or
organization. PGS provides the format and commands; it does not publish a real
user's private downstream project list. A normal npm user can omit
`controlPlane` and `executionEngine`; `portfolio plan` will use the reviewed
public assets packaged with `@pieai/pro-gov`. Add `executionEngine.path` only
when a full local checkout should provide a private asset registry for strict
maintainer checks.

`portfolio assets-check` verifies that the currently recorded lock and managed
links are healthy. `portfolio doctor` additionally compares each target with the
current portfolio `assetBundles`, registry hashes, package versions, target-local
router/hook checks, and optional `hostTooling` requirements. The doctor is
offline and read-only by default. A dirty product worktree is reported as
evidence but is not itself a governance failure.

Third-party update discovery is deliberately separate and low frequency:

```bash
pro-gov assets npx update --plan
codex plugin marketplace upgrade
codex plugin list --json
claude plugin update <plugin>
claude plugin list --json
```

The native tools own fetching and installation. PGS reviews resulting asset
changes, regenerates plans, and verifies the fleet; it does not implement a
second plugin marketplace or silently accept upstream changes.

`lens audit init` creates a raw-first audit package for Project Lens plus
Ponytail reviews. For a "read-only project audit", the target repository remains
read-only, but the audit package is still the required output record. `lens
audit check` fails when the package is missing required artifacts, when
artifacts are still marked pending, or when generated template text was not
replaced with real audit output. It also requires method records for the
read-only boundary, agent execution, subagent trace, Project Lens/Ponytail
sources, target status, and audit package status. Use
`lens audit check --mode fresh` when this session must prove it created the raw
passes; use `--mode reuse` when it only verifies an existing audit package.

## Typical Adoption Flow

```bash
pnpm add -D @pieai/pro-gov @pieai/doc-gov
pnpm pro-gov assets list
pnpm pro-gov assets discover --target .
pnpm pro-gov assets recommend --target .
pnpm pro-gov init --profile engineering-runtime --dry-run
pnpm pro-gov init --profile engineering-runtime --apply
pnpm doc-gov scan
pnpm pro-gov sync --check --profile engineering-runtime
pnpm doc-gov migrate --profile engineering-runtime --check
pnpm doc-gov doctor
```

Use `doc-only` instead of `engineering-runtime` for writing, research, IP, AI
media, and asset-governance workspaces that do not need runtime engineering
proof lanes.
