# Npx Skills Root

This directory is a native `npx skills` project root.

Keep this shape:

```text
skills-lock.json
.agents/
  skills/
    <skill-name>/
      SKILL.md
```

Run `npx skills add` or `npx skills update -p -y` only from this directory or
from a temporary copy of this directory. Do not create a second internal
human-facing symlink mirror such as `skills/<skill-name> -> .agents/skills`.

Preferred maintenance flow:

```bash
pro-gov assets npx add <source> [--skill <name>] --plan
pro-gov assets npx update [--skill <name>] --plan
```

Those commands copy this root to a temporary directory, run `npx skills` inside
the copy, and print a reviewable change plan. They do not mutate this real root
without a separate explicit registry update.

Project-level installs into downstream repositories are handled by `pro-gov`
plans and managed symlinks, not by running `npx skills` inside each target
project.
