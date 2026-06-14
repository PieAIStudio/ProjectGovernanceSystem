---
id: SPEC-0003
title: Project Lens And Agent Asset Manager
type: spec
status: draft
canonical: false
owner: ai-assisted
created: 2026-06-15
last_reviewed: 2026-06-15
domain: governance
tags:
  - project-lens
  - agent-assets
  - skills
  - pro-gov
pinned: false
related:
  - SPEC-0002
  - POLICY-DESIGN-PRINCIPLES
  - POLICY-SYNC-STRATEGY
  - POLICY-UPSTREAMING
---

# SPEC-0003: Project Lens And Agent Asset Manager

## Problem

Project Governance System currently distributes documentation governance and
project starter assets, but two adjacent systems still sit outside the central
repository:

- `ProjectLens`, a read-only project inspection workflow with reusable skills
  and report protocol.
- Yuanfei's manually maintained skills, rules, and commands, currently spread
  across OneDrive roots and linked into projects by hand.

That split creates avoidable cognitive load. The same central system that
installs or checks governance files also needs to understand which AI-facing
assets belong in a target project. Manual symlink management has already
drifted: some links point at missing files, similar skills are mounted through
different source paths, and host-specific skill folders are inconsistent.

Beginner version: PGS is becoming the house manager. It should know where the
tools live, which room needs which tools, and whether the tools were placed
correctly. It should not leave the user to remember every shelf and every
shortcut by hand.

## Decisions

### 1. Absorb ProjectLens As A Pro-Gov Capability

Move the reusable ProjectLens parts into Project Governance System:

- project inspection protocol;
- architecture lens skill;
- truth-surface audit skill;
- report templates;
- CLI-visible `lens` commands.

Do not migrate old Show or Non-Heroes audit evidence. Those records are not
current product truth and are not needed for the new system. The old
`ProjectLens` repository may be deleted after the PGS replacement passes user
acceptance.

Start with `pro-gov lens ...` inside `@pieai/pro-gov`. A separate
`@pieai/project-lens` package remains a future extraction option, not the first
implementation. Package count should not grow before there is a real external
audience that wants Lens without the rest of Pro-Gov.

### 2. Make PGS The Canonical Home For Agent Assets

Move the current OneDrive-based skills, rules, commands, and third-party skill
cache into this repository. Directory names should follow the asset's source
family, because that is how the user actually reasons about them. Visibility
and publishability belong in the registry, not in the top-level directory name.

```text
agent-assets/
  README.md
  registry.json
  bundles/
  skills/
    pie-skills/
    dokobot/
    npx-skills/
      skills-lock.json
      .agents/
        skills/
  rules/
    pie-rules/
  commands/
    pie-commands/
```

OneDrive remains untouched during migration and becomes a backup until the user
manually deletes it. After acceptance, the PGS checkout is the canonical source.

The `npx-skills` directory is a special case: it must stay a native
`npx skills` project root. Future third-party skill additions and updates must
run from that directory so the tool writes the correct `skills-lock.json` and
`.agents/skills/<skill-name>/` files.

Do not create a second human-friendly compatibility symlink layer inside
`agent-assets/skills/npx-skills`. Internal symlink mirrors would add another
truth surface and make later debugging harder.

### 3. Use Source Family Plus Registry Visibility

Every asset must be classified before it can be installed:

| Registry field | Meaning | Published to npm by default |
| --- | --- | --- |
| `public` | Reusable assets intended for other projects and users | yes, after review |
| `private` | Yuanfei-specific skills, rules, and commands | no |
| `third-party` | Mirrored skills from external sources | no |

Third-party skills may be mirrored into PGS so OneDrive is no longer canonical,
but their source metadata, original lock data, and content hashes must be kept.
They cannot be promoted into a public package without a separate license,
security, and usefulness review.

Use these source families:

| Family | Path | Meaning |
| --- | --- | --- |
| `pie-skills` | `agent-assets/skills/pie-skills/` | Yuanfei-authored or AI-coauthored skills. |
| `dokobot` | `agent-assets/skills/dokobot/` | The local Dokobot skill pack, preserved as a pack when skills share support files. |
| `npx-skills` | `agent-assets/skills/npx-skills/` | The native `npx skills` managed root. |
| `pie-rules` | `agent-assets/rules/pie-rules/` | Yuanfei-authored rules before promotion or conversion. |
| `pie-commands` | `agent-assets/commands/pie-commands/` | Yuanfei-authored commands before skill conversion. |

### 4. Keep AI Advisory, Keep Writes Deterministic

The AI may inspect a project and recommend assets. It must not silently install,
delete, overwrite, or prune assets. The CLI writes only from an explicit plan.

Required flow:

```text
discover target
-> recommend bundles/assets with reasons
-> write plan
-> user approves
-> apply deterministic symlink operations
-> check host visibility and lockfile drift
```

### 5. Prefer Cross-Host Skill Targets

Use the Agent Skills format as the common unit. Codex, Gemini CLI, and
Antigravity can share `.agents/skills`. Claude Code receives an adapter through
`.claude/skills`.

Commands should usually become skills unless they are truly host-specific shell
entrypoints. Rules should split into:

- always-on project policy, which belongs in `AGENTS.md` or governed policy;
- on-demand methodology, which belongs in a skill;
- personal global preference, which belongs in private user-level assets.

### 6. Track Managed State In Target Projects

Target projects get a small managed state area:

```text
.pro-gov/
  assets.json
  assets.lock.json
```

`assets.json` records desired bundles and host targets. `assets.lock.json`
records exactly which links or copied files were created by Pro-Gov. The apply
command may only update paths it owns or paths that are absent. It must stop on
unmanaged conflicts.

### 7. Keep NPM Packages Clean

`@pieai/pro-gov` may publish public ProjectLens capability and public asset
metadata. It must not publish private assets, OneDrive history, raw audit
evidence, target-project reports, or third-party mirrored skill bodies by
default.

## Requirements

1. Add an asset registry with stable IDs, visibility, source kind, host support,
   tags, bundle membership, and content path.
2. Import existing OneDrive assets into `agent-assets/` without deleting the
   original OneDrive copies.
3. Preserve source metadata for npx-installed third-party skills, including the
   existing `skills-lock.json` data.
4. Preserve `agent-assets/skills/npx-skills` as a native `npx skills` work root
   with `skills-lock.json` and `.agents/skills/`.
5. Do not create internal compatibility symlinks inside
   `agent-assets/skills/npx-skills`.
6. Add read-only asset commands before write-mode commands:
   - `pro-gov assets list`
   - `pro-gov assets check`
   - `pro-gov assets discover`
   - `pro-gov assets recommend`
   - `pro-gov assets plan`
7. Add write mode only as explicit plan application:
   - `pro-gov assets apply --plan <file>`
8. Do not overwrite unmanaged project files or symlinks.
9. Detect dangling links, duplicate asset IDs, missing `SKILL.md`, unsupported
   host targets, and package-publish leaks.
10. Add ProjectLens reusable skills and protocol into PGS and expose
   `pro-gov lens` commands.
11. Exclude private and third-party assets from npm tarballs unless a future spec
   explicitly promotes them.
12. Keep the old ProjectLens repository intact until the user confirms the new
    system is usable.
13. Add a safe wrapper workflow for third-party skill maintenance so updates can
    be tried in a temporary copy, reviewed as a diff, and applied only after
    approval.

## Non Goals

- Do not delete OneDrive sources during this implementation.
- Do not delete the old `ProjectLens` root during this implementation.
- Do not install assets into every downstream project automatically.
- Do not add a cloud LLM dependency inside the CLI.
- Do not make APM a hard dependency. Its lockfile and multi-host ideas may
  inform the design, but PGS should keep its own stable contract.
- Do not publish `private` or `third-party` assets to npm.

## CLI Shape

```bash
pro-gov lens inspect --target <path> --format text|json
pro-gov lens report --target <path> --out <path>

pro-gov assets list [--visibility public|private|third-party|all] [--json]
pro-gov assets check [--target <path>] [--json]
pro-gov assets discover --target <path> --json
pro-gov assets recommend --target <path> --json
pro-gov assets plan --target <path> --bundle <id> --host <host> --out <file>
pro-gov assets apply --plan <file>
pro-gov assets npx add <source> [--skill <name>]
pro-gov assets npx update [--skill <name>] --plan
```

`recommend` should be deterministic and explainable. Rich AI reasoning can
layer on top of its JSON output in Codex, Claude Code, or Antigravity.

## Safety Model

- All write commands require an explicit plan file.
- Plan files list exact source and destination paths.
- Symlinks are absolute by default to match the user's current operating model.
- Existing unmanaged files stop the operation.
- Existing managed links can be updated only when the lockfile proves ownership.
- `check` must be able to run before and after apply.
- `pack --dry-run` must prove private and third-party bodies are not included.
- Third-party updates must first run against a temporary copy of
  `agent-assets/skills/npx-skills` and produce a reviewable diff.

## Acceptance

- PGS has a clean active specification and implementation plan for ProjectLens
  absorption and agent asset management.
- Work happens on an isolated `codex/` worktree branch.
- Existing PGS verification passes before implementation begins.
- ProjectLens reusable capabilities are available from PGS without carrying old
  audit evidence.
- OneDrive assets are copied into `agent-assets/` and classified.
- `npx-skills` remains updatable through its native work root structure without
  adding internal compatibility symlink mirrors.
- Asset commands can inventory, recommend, plan, apply, and verify target
  project mounts.
- Tests cover registry parsing, bundle selection, host adapters, conflict
  handling, lockfile drift, dangling links, package exclusions, and lens output.
- `@pieai/pro-gov` package dry-run excludes private and third-party asset
  bodies.
- The old `ProjectLens` root is ready for user-approved deletion, but is not
  deleted by this implementation.
