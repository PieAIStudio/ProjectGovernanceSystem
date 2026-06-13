# @pieai/pro-gov

Project-level distribution kit for Project Governance System.

`@pieai/doc-gov` remains the validator package. `@pieai/pro-gov` ships reusable
project-governance assets and a conservative project-level CLI. It is the
package that answers: "What starter/profile material does this project need,
and what would change if we adopted it?"

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

```bash
pro-gov assets list
pro-gov init --profile engineering-runtime --dry-run
pro-gov init --profile doc-only --dry-run
pro-gov sync --check
pro-gov doctor
```

The first release is read-only by default. It reports what would change before
any future write path is added.

## Package Boundary

- `pro-gov` lists and compares starter/profile/integration assets.
- `doc-gov` validates governed Markdown, router integrity, manifest freshness,
  links, local hooks, and CI wiring.
- Project-local product truth stays in the target project.
- Write-mode install or upgrade behavior is intentionally not enabled in the
  first release.
