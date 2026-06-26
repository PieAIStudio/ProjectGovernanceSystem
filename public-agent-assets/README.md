# Public Agent Assets

This directory is the public promotion surface for Project Governance System agent assets.

It mirrors the high-level shape of the local `agent-assets/` source tree, but
it is not a second private source of truth. Public assets live here only after
the maintainer explicitly approves that a skill, rule, command, or bundle is
safe to publish.

Beginner version: `agent-assets/` is the maintainer workbench. This directory
is the clean public display shelf. A displayed item may be a cleaned-up version
of the workbench item, so the registry records where it came from and which
version was reviewed.

Current policy:

- `agent-assets/` is local-only and ignored by Git.
- `public-agent-assets/` is the only agent-asset tree intended for the public repository.
- Public assets must not depend on machine-local paths, unpublished third-party bodies, or personal workflow notes.
- Every publishable public asset must have `promotion` metadata in `registry.json`.
- Empty `.gitkeep` files exist only so Git can track the folder structure.

Promotion rule:

1. Review the local source asset.
2. Remove machine-local paths, personal notes, and non-redistributable third-party content.
3. Write the reviewed public version into the matching path under `public-agent-assets/`.
4. Register it in `public-agent-assets/registry.json` with:
   - `promotion.privateSourcePath`
   - `promotion.privateSourceHash`
   - `promotion.publicHash`
   - `promotion.sanitized`
   - `promotion.lastReviewed`
   - `promotion.reviewNotes`
5. Run `pro-gov assets public-check --json` before publishing.
6. Run the repository checks before publishing.

Do not use symlinks from this directory into `agent-assets/`. Public users do
not receive the private tree, so such links would break outside the maintainer
checkout.
