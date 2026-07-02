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
- Compound Engineering may provide the post-work learning capture tail;
- Ponytail may provide an optional simplicity review.

The current `pro-gov` release is conservative by design. Public init and sync
commands inspect and compare; they do not silently overwrite another project's
router or local truth.

## Install

Requires Node.js `24.x`.

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
pro-gov portfolio check --config /path/to/portfolio.json
pro-gov portfolio plan --config /path/to/portfolio.json --target web-app --json
pro-gov lens inspect --target .
pro-gov lens report --target . --out .pro-gov/lens-report.md
pro-gov init --profile engineering-runtime --dry-run
pro-gov init --profile engineering-runtime --apply
pro-gov init --profile doc-only --dry-run
pro-gov sync --check --profile engineering-runtime
pro-gov doctor
```

What these commands do:

| Command group | Purpose | Writes project files? |
| --- | --- | --- |
| `assets list` | Shows packaged assets and public registry metadata. | No |
| `assets discover` | Detects local project signals. | No |
| `assets recommend` | Suggests relevant asset bundles with reasons. | No |
| `portfolio check` | Validates an external portfolio manifest owned by the user or organization. | No |
| `portfolio plan` | Builds dry-run asset plans for manifest targets, using packaged public assets unless a full checkout is supplied. | No |
| `lens inspect` | Produces ProjectLens-style local evidence. | No |
| `lens report` | Writes the requested report file. | Only the explicit output |
| `init --dry-run` | Shows starter/profile files that would be needed. | No |
| `init --apply` | Installs one profile into a fresh target; refuses the whole operation if any target file exists. Optional CI and Lefthook references are not installed. | Yes |
| `sync --check` | Strictly compares shared core files and checks only the presence of project-local seed files. | No |
| `doctor` | Checks required packaged assets and whether `doc-gov` is available. | No |

## Full Checkout Commands

The npm package can install reviewed public agent assets through an explicit
plan. A full Project Governance System checkout can additionally use its
maintainer-local asset registry:

```bash
pro-gov assets plan --bundle base-governance --target . --out .pro-gov/asset-plan.json
pro-gov assets apply --plan .pro-gov/asset-plan.json
pro-gov assets check --target .
pro-gov assets public-check --json
pro-gov assets npx update --plan
```

Skill placement normally comes from the asset registry. Use `--placement
manual` only as an explicit migration override for project-scoped skills that
should stay explicitly invoked instead of auto-discoverable:

```bash
pro-gov assets plan --bundle project-lens --target /path/to/project --host codex --placement manual --out /tmp/project-lens-plan.json
```

Codex manual placement writes managed skill links under
`.agents/manual-skills/` instead of `.agents/skills/`.
User-scoped skills, such as a personal loop library, are not installed into
project targets; link them once under the user's skill roots instead.

The plan is the safety gate. `apply` may update managed targets described by the
plan; it must not overwrite an unrelated unmanaged file.

These checkout-only workflows depend on a maintainer-local `agent-assets/`
registry when local-only assets are being used. The public repository and npm
package use `public-agent-assets/` as the reviewed promotion surface.
`assets public-check` verifies that every publishable public asset still matches
the private-source and public-copy hashes recorded during promotion.

## Package Boundary

- `pro-gov` distributes starter, profile, integration, and adoption assets.
- `pro-gov assets discover|recommend` provides read-only project evidence and
  deterministic recommendations.
- `pro-gov portfolio check|plan` reads an external portfolio manifest. Real
  downstream project lists belong in the user's control repository, not in this
  public package. The manifest does not require a private headquarters repo:
  npm users can omit `controlPlane` and `executionEngine`, and PGS will use the
  reviewed public assets packaged with `@pieai/pro-gov`.
- `pro-gov assets plan|apply|check` manages local assets only from an explicit,
  reviewable plan in a full upstream checkout.
- `pro-gov lens inspect|report` provides read-only inspection and an explicit
  report output.
- `doc-gov` remains the document, router, manifest, link, hook, CI, and migration
  validator.
- Product truth stays in the target project.
- `pro-gov init --apply` is intentionally fresh-target only. Existing projects
  use `--dry-run` and a deliberate migration so local truth is never overwritten.
- Superpowers, Compound Engineering, and Ponytail are external tools, not
  bundled runtime dependencies.

## Recommended Companion Tools

Superpowers is recommended for engineering/runtime projects that need
brainstorming, plans, TDD, debugging, verification, and worktree discipline.

Compound Engineering is recommended for knowledge capture after verified
engineering work. The default PGS pattern is a Compound Gate: run
`ce-compound` when there is reusable learning, or report why compounding was
skipped. Full CE workflows such as `ce-plan`, `ce-work`, and `lfg` remain
explicit user choices.

Engineering-runtime starters include cross-host Stop hooks for Codex,
Claude Code, and Antigravity. Those hooks call `pro-gov host-hook` and require
the final report to include either:

```text
Compound Gate: ran ce-compound -> <path>
Compound Gate: skipped -> <reason>
```

Use `pro-gov doctor --strict-hooks` after syncing an engineering project to
verify that the host configs are wired. This is a wiring check: it proves the
project calls `pro-gov host-hook` for Codex, Claude Code, and Antigravity. The
host behavior contract is covered by PGS package tests against recorded
per-host Stop/SubagentStop fixtures. Open a fresh AI session after installing or
changing hooks; old sessions may not reload host configuration.

Ponytail can be installed as an optional complexity adviser. Keep its global mode
`off`; test `lite` in one isolated task before considering a stronger mode.
Ponytail must not remove requested scope, tests, safety, accessibility, or proof.

Read the
[full project introduction](https://github.com/PieAIStudio/ProjectGovernanceSystem#readme)
for beginner examples, profiles, adoption guidance, and exact integration
boundaries.
