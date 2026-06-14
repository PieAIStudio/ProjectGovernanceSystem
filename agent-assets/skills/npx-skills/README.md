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

Project-level installs into downstream repositories are handled by `pro-gov`
plans and managed symlinks, not by running `npx skills` inside each target
project.
