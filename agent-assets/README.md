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

Do not delete the original OneDrive sources during migration. OneDrive remains
a backup until the user manually removes it.
