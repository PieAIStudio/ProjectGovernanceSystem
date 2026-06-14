---
name: my-skills-manager
description: Use when managing local Codex or agent skills on Yuanfei's Mac, including installing Vercel/npx skills, adding self-authored skills, updating central skill caches, choosing user-level vs project-level symlinks, or verifying skill discovery without disturbing existing skill folders.
---

# My Skills Manager

## Core Rule

Keep one canonical source for each skill, then expose it through absolute symlinks. Never clone or copy random skill repos into project `.agents/skills` unless explicitly asked.

Third-party / online skills with an official repository belong to the npx-managed root. Self-authored or AI-coauthored custom skills belong to the custom roots.

## Roots

| Kind | Path |
|---|---|
| npx/Vercel third-party source | `/Users/yuanfei/Library/CloudStorage/OneDrive-Personal/MyProjectSkills/_npx_skills` |
| global custom source | `/Users/yuanfei/Library/CloudStorage/OneDrive-Personal/MyGlobalSkills` |
| project custom source, self-authored only | `/Users/yuanfei/Library/CloudStorage/OneDrive-Personal/MyProjectSkills` |
| user Codex target | `/Users/yuanfei/.agents/skills` |
| project Codex target | `<project>/.agents/skills` |

npx skills expose actual skills under `$NPX_ROOT/.agents/skills/<skill>`.
The npx lock is `$NPX_ROOT/skills-lock.json`; preserve this by installing online repos with `npx skills add` from `$NPX_ROOT`.

## Decision Table

| Request | Do |
|---|---|
| Update npx skills | `cd "$NPX_ROOT" && npx --yes skills update -y`; use `experimental_install` only to restore lock |
| Install online / third-party skill repo | `cd "$NPX_ROOT" && npx --yes skills add <repo-or-url> --agent codex --skill '*' -y`; canonical source is then `$NPX_ROOT/.agents/skills/<skill>` |
| Create global custom skill | create `$GLOBAL_ROOT/<name>/SKILL.md`, then link to user or project target |
| Create project custom skill | create `$PROJECT_SKILL_ROOT/<name>/SKILL.md`, then link to requested project target |
| User did not specify target | ask: user-level `/Users/yuanfei/.agents/skills` or current project `.agents/skills` |

## Link Pattern

```bash
SRC="<canonical-skill-dir>"
DST="<target-skills-dir>/<skill-name>"
test -f "$SRC/SKILL.md"
mkdir -p "$(dirname "$DST")"
if [ -e "$DST" ] || [ -L "$DST" ]; then
  echo "STOP: target exists: $DST" >&2
  ls -la "$DST" >&2
  exit 1
fi
ln -s "$SRC" "$DST"
test "$(readlink "$DST")" = "$SRC"
```

## Verify Every Change

```bash
test -f "$SRC/SKILL.md"
sed -n '1,20p' "$SRC/SKILL.md"
ls -la "$DST"
find "$DST" -maxdepth 2 -name SKILL.md -print
```

For npx skills also run:

```bash
cd "$NPX_ROOT"
npx --yes skills list --json || npx --yes skills list
test -f "$NPX_ROOT/skills-lock.json"
```

For online skills with supporting docs or tools, verify the installed npx target is self-contained:

```bash
find "$SRC" -maxdepth 2 -type f | sort | head -80
```

If `SKILL.md` references files such as `docs/...`, `tools/...`, or `references/...`, those files must exist under the same `$SRC` directory. If the upstream repo keeps support files outside the nested skill folder and `npx skills add` copied only `SKILL.md`, repair only the npx target or ask the user whether to patch/fork upstream. Do not create a duplicate third-party copy under `$PROJECT_SKILL_ROOT`.

## Red Flags

Stop if about to:

- `git clone` an online skill repo directly into `.agents/skills`.
- Put an online / third-party repo under `/Users/yuanfei/Library/CloudStorage/OneDrive-Personal/MyProjectSkills`; that root is for self-authored custom skills.
- Link an entire repo when real skills are nested under `skills/<name>`.
- Link a project target to `$PROJECT_SKILL_ROOT/<skill>` for a third-party skill that should be npx-managed.
- Invent installer commands; check `npx skills --help` first.
- Use `ln -sfn` over an existing skill without inspection.
- Bulk delete or rewrite `.agents/skills`, `MyGlobalSkills`, or `MyProjectSkills`.
- Copy when the user wants shared updates.
- Claim success before checking `SKILL.md` and final symlink.
- Claim an npx-installed skill is usable before checking any files referenced by `SKILL.md`.

## Known Failure Fixes

| Failure | Fix |
|---|---|
| `agent-sprite-forge` linked as one fake skill | install centrally, then expose `generate2dsprite` and `generate2dmap` |
| non-existent `@vercel/agents` command | use current `npx skills` CLI |
| project-local copies | canonical source + absolute symlink |
| third-party repo copied to `MyProjectSkills/<skill>` | verify `$NPX_ROOT/skills-lock.json` and `$NPX_ROOT/.agents/skills/<skill>`, repoint symlinks there, then remove the mistaken custom-root copy |
| npx-installed nested skill missing root-level `docs/` or `tools/` | keep the npx lock, then mirror required support files into `$NPX_ROOT/.agents/skills/<skill>` only; after future `skills update`, re-run the self-contained check |
| existing target overwritten | stop and report conflict |
