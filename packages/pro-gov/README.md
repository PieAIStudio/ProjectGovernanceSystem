# @pieai/pro-gov

Project-level distribution kit for Project Governance System.

`@pieai/doc-gov` remains the validator package. `@pieai/pro-gov` ships reusable
project-governance assets and a conservative project-level CLI. It is the
package that answers:

- what starter/profile material this project needs;
- what agent-facing skills, rules, or commands are recommended;
- what symlinks would be installed before anything is written;
- what ProjectLens-style local evidence is available for review.

## Install

```bash
pnpm add -D @pieai/pro-gov @pieai/doc-gov
```

Add scripts in the target project:

```json
{
  "scripts": {
    "pro-gov": "pro-gov",
    "doc-gov": "doc-gov"
  }
}
```

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

Full upstream-checkout commands, for Yuanfei's private `agent-assets/` registry:

```bash
pro-gov assets plan --bundle base-governance --target . --out .pro-gov/asset-plan.json
pro-gov assets apply --plan .pro-gov/asset-plan.json
pro-gov assets check --target .
pro-gov assets npx update --plan
```

`init` and `sync` remain read-only. Agent asset writes are intentionally a
separate reviewed flow: generate a plan, inspect it, then apply that plan
explicitly. `lens` commands are read-only and produce evidence, not judgement.

The public npm package does not include private or third-party skill bodies.
Those live only in a full Project Governance System checkout unless promoted in
a future release.

## Package Boundary

- `pro-gov` lists and compares starter/profile/integration assets.
- `pro-gov assets discover|recommend|plan|apply|check` manages local
  agent-facing assets through explicit plans and managed symlinks.
- `pro-gov lens inspect|report` absorbs the reusable ProjectLens inspection
  capability as a read-only evidence surface.
- `doc-gov` validates governed Markdown, router integrity, manifest freshness,
  links, local hooks, and CI wiring.
- Project-local product truth stays in the target project.
- Private and third-party skill bodies live in the upstream PGS checkout under
  `agent-assets/`. They are excluded from the public npm package unless a future
  promotion explicitly marks them publishable.
- `init` and `sync` write-mode install or upgrade behavior is intentionally not
  enabled in this release.
