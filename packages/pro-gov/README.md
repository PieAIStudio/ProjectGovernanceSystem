# @pieai/pro-gov

`@pieai/pro-gov` is the project-level setup kit for
[Project Governance System](https://github.com/PieAIStudio/ProjectGovernanceSystem).
It helps AI-assisted projects stay understandable after many plans, documents,
tools, and AI sessions have accumulated.

Think of Project Governance System as a librarian, traffic desk, and inspection
station:

- `pro-gov` shows which reusable project-governance parts are present or missing;
- `@pieai/doc-gov` checks documents, routing, links, hooks, and CI;
- Superpowers may provide the engineering process;
- Ponytail may provide an optional simplicity review.

The current `pro-gov` release is conservative by design. Public init and sync
commands inspect and compare; they do not silently overwrite another project's
router or local truth.

## Install

Requires Node.js `22.12.0` or newer.

```bash
pnpm add -D @pieai/pro-gov @pieai/doc-gov
```

Optional project scripts:

```json
{
  "scripts": {
    "pro-gov": "pro-gov",
    "doc-gov": "doc-gov"
  }
}
```

## Public Commands

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

What these commands do:

| Command group | Purpose | Writes project files? |
| --- | --- | --- |
| `assets list` | Shows packaged assets and public registry metadata. | No |
| `assets discover` | Detects local project signals. | No |
| `assets recommend` | Suggests relevant asset bundles with reasons. | No |
| `lens inspect` | Produces ProjectLens-style local evidence. | No |
| `lens report` | Writes the requested report file. | Only the explicit output |
| `init --dry-run` | Shows starter/profile files that would be needed. | No |
| `sync --check` | Compares local starter files with packaged assets. | No |
| `doctor` | Checks required packaged assets and whether `doc-gov` is available. | No |

## Full Checkout Commands

A full Project Governance System checkout may also manage Yuanfei's local
agent-asset registry through reviewed plans:

```bash
pro-gov assets plan --bundle base-governance --target . --out .pro-gov/asset-plan.json
pro-gov assets apply --plan .pro-gov/asset-plan.json
pro-gov assets check --target .
pro-gov assets npx update --plan
```

The plan is the safety gate. `apply` may update managed targets described by the
plan; it must not overwrite an unrelated unmanaged file.

These checkout-only workflows depend on the upstream `agent-assets/` registry.
The public npm package intentionally excludes private and mirrored third-party
skill bodies.

## Package Boundary

- `pro-gov` distributes starter, profile, integration, and adoption assets.
- `pro-gov assets discover|recommend` provides read-only project evidence and
  deterministic recommendations.
- `pro-gov assets plan|apply|check` manages local assets only from an explicit,
  reviewable plan in a full upstream checkout.
- `pro-gov lens inspect|report` provides read-only inspection and an explicit
  report output.
- `doc-gov` remains the document, router, manifest, link, hook, CI, and migration
  validator.
- Product truth stays in the target project.
- Write-mode `pro-gov init --apply` is not enabled in this release.
- Superpowers and Ponytail are external tools, not bundled runtime dependencies.

## Recommended Companion Tools

Superpowers is recommended for engineering/runtime projects that need
brainstorming, plans, TDD, debugging, verification, and worktree discipline.

Ponytail can be installed as an optional complexity adviser. Keep its global mode
`off`; test `lite` in one isolated task before considering a stronger mode.
Ponytail must not remove requested scope, tests, safety, accessibility, or proof.

Read the
[full project introduction](https://github.com/PieAIStudio/ProjectGovernanceSystem#readme)
for beginner examples, profiles, adoption guidance, and exact integration
boundaries.
