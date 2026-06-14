# After-Fix Critic Pass

Use this only after a repair agent claims visual issues were fixed.

The critic verifies evidence. The critic is not the fixer.

## Tool boundary

The critic must be tool-separated from the fixer. The same agent may not act as both fixer and critic for the same issue.

Allowed:

- read before/after screenshots and crops
- read/search/list source files and existing docs
- run read-only comparison scripts such as `scripts/pair-compare.py`
- create or update verdict/evidence files in the agreed run folder
- report `fixed`, `weak_visual_delta`, `still_present`, `regressed`, or `not_evaluable`

Not allowed:

- change source code
- invoke Edit, Write, patch, NotebookEdit, or any file-write tool outside the agreed run folder
- run mutating shell commands such as `git checkout`, `git reset`, `pnpm install`, `npm install`, `pnpm format`, `lint --fix`, migrations, file move/delete, or dependency updates
- change the issue scope
- mark an issue fixed only because tests passed
- hide missing after evidence behind prose

## Verification steps

For each repaired issue:

1. Locate the original full screenshot, crop, and bbox.
2. Capture or find the matching after screenshot.
3. Generate an after crop for the same region when possible.
4. Compare before/after crops with `scripts/pair-compare.py` if available.
5. Fill `after_verification` in the evidence packet or a separate critic result file.

## Verdicts

| Verdict | Meaning |
|---|---|
| `fixed` | The original visual problem is gone in the same region and after crop evidence exists. |
| `weak_visual_delta` | Something changed, but the original visual issue is not materially improved or the crop delta is too small to support the claim. |
| `still_present` | The same issue remains visible. |
| `regressed` | The change made the issue worse or introduced a new obstruction in the same area. |
| `not_evaluable` | Matching after evidence is missing or the app state cannot be reproduced. |

## Hard rules

- Full-page after screenshots are not enough for obstruction fixes; use crop or bbox evidence.
- If the before/after crop difference is tiny and the blocked object is still blocked, use `weak_visual_delta` or `still_present`, not `fixed`.
- If a fix touches only copy or tests while the issue was visual obstruction, the critic must verify the visual region anyway.
- `weak_visual_delta`, `still_present`, `regressed`, and `not_evaluable` must remain open and must not be listed as fixed in a changelog.
- `delta_ratio` is mean pixel difference, not perceptual similarity. Use it as evidence support only; the critic must still inspect the before/after crop visually.
