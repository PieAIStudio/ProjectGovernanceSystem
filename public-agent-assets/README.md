# Public Agent Assets

This directory is the public promotion surface for Project Governance System agent assets.

It mirrors the high-level shape of the local `agent-assets/` source tree, but it does not mirror unpublished asset names or unpublished asset bodies. Add assets here only after Yuanfei explicitly decides that a skill, rule, command, or bundle is safe to publish.

Current policy:

- `agent-assets/` is local-only and ignored by Git.
- `public-agent-assets/` is the only agent-asset tree intended for the public repository.
- Public assets must not depend on machine-local paths, unpublished third-party bodies, or personal workflow notes.
- Empty `.gitkeep` files exist only so Git can track the folder structure.

Promotion rule:

1. Review the local source asset.
2. Remove machine-local paths, personal notes, and non-redistributable third-party content.
3. Copy the reviewed public version into the matching path under `public-agent-assets/`.
4. Register it in `public-agent-assets/registry.json` only when the public body is present.
5. Run the repository checks before publishing.
