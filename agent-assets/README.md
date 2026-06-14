# Agent Assets

This directory is the Project Governance System home for agent-facing assets:
skills, rules, commands, and bundle metadata.

Directory names follow source families:

- `skills/pie-skills/` stores Yuanfei-authored or AI-coauthored skills.
- `skills/dokobot/` stores the local Dokobot skill pack.
- `skills/npx-skills/` is a native `npx skills` work root.
- `rules/pie-rules/` stores Yuanfei-authored rules before promotion.
- `commands/pie-commands/` stores Yuanfei-authored commands before conversion.

Publication and sharing are controlled by `registry.json`, not by directory
names. Private and third-party assets are not published to npm by default.

Downstream installation is plan-gated:

```bash
pro-gov assets discover --target /path/to/project --json
pro-gov assets recommend --target /path/to/project --json
pro-gov assets plan --target /path/to/project --bundle <bundle-id> --host codex --out /tmp/pro-gov-asset-plan.json
pro-gov assets apply --plan /tmp/pro-gov-asset-plan.json
pro-gov assets check --target /path/to/project --json
```

The plan creates managed symlinks and `.pro-gov/assets.lock.json`. It must not
overwrite unmanaged project files.

Do not delete the original OneDrive sources during migration. OneDrive remains
a backup until the user manually removes it.
