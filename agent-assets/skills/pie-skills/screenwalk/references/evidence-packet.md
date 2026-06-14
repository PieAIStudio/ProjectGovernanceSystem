# ScreenWalk Evidence Packet

Use this reference before recording actionable issues.

An evidence packet must let another AI or human locate the issue without rereading the whole conversation.

Every packet should include `source_hints` and `related_packets`. Use empty arrays when no source hints or upstream links exist.

## Required fields

```json
{
  "issue_id": "SW-001",
  "run_id": "2026-05-07-project-journey",
  "source": "screenwalk",
  "screen_id": "screen-03",
  "screen_label": "Human-readable screen name",
  "surface_type": "app | game | mixed | unknown",
  "journey_step": "What the user is doing at this point",
  "role": "first-time user | skeptical payer | UIUX designer | project-specific role",
  "severity": "Blocker | High | Later",
  "layer": "UI | UX | Copy | Rules | AI behavior | Backend | Game feel | Monetization | Accessibility",
  "issue_type": "visual_obstruction | visual_hierarchy | comprehension | feedback | motion | copy | strategy_conflict | other",
  "category": "head-covered | cta-blocked | text-clipped | unreadable | off-canvas | overlap | hud-blocking | modal-blocking | none",
  "evidence_level": "screenshot-visible | flow-inference | assumption | real-user-data",
  "evidence_type": "single-screenshot | sequence | video | log | user-report | capture-blocked",
  "evidence_paths": [
    "/absolute/path/to/screenshot.png"
  ],
  "crop_paths": [
    "/absolute/path/to/crop.png"
  ],
  "bbox": {
    "image_ref": "/absolute/path/to/screenshot.png",
    "x": 0,
    "y": 0,
    "w": 100,
    "h": 100
  },
  "visual_region": "Where to look on the screen",
  "obstruction_findings": [
    {
      "obstructed": "Element being covered or degraded",
      "obstructor": "Element causing the obstruction",
      "category": "head-covered | cta-blocked | text-clipped | unreadable | off-canvas | overlap | hud-blocking | modal-blocking",
      "evidence_crop": "/absolute/path/to/crop.png"
    }
  ],
  "source_hints": [
    {
      "kind": "code-path",
      "path": "path/to/file[:symbol-or-line-hint]"
    }
  ],
  "related_packets": [
    {
      "issue_id": "EC-003",
      "relation": "originated-from | merged-from | duplicates | follow-up"
    }
  ],
  "description": "What is wrong and why it matters for this user's goal",
  "repro_steps": [
    "Step 1",
    "Step 2"
  ],
  "owner_decision_required": false,
  "cascade_conflict": "none | target-user | phase-goal | charging-boundary | doctrine | business-model",
  "after_verification": null,
  "recommended_next": "fix-now | map-to-work-item | needs-more-evidence | defer | escalate-to-goalcascade | send-to-experience-capture"
}
```

## Visual obstruction requirements

For `issue_type: visual_obstruction`, these fields are required:

- `category` must be one of `head-covered`, `cta-blocked`, `text-clipped`, `unreadable`, `off-canvas`, `overlap`, `hud-blocking`, or `modal-blocking`.
- If `category` is one of those obstruction enums, treat the packet as a visual obstruction issue even when `issue_type` names another layer such as `feedback` or `comprehension`.
- `crop_paths` must contain at least one crop unless capture is blocked.
- `bbox` must identify the region in the full screenshot when practical.
- `obstruction_findings` must name both the blocked element and the blocking element.
- `source_hints` must contain at least one `code-path`, `asset`, or `config` hint when a likely source is known.
- `recommended_next` should be `fix-now` unless the evidence is insufficient or the issue is project strategy rather than visual obstruction.

Do not use a top-level `visual_delta_verdict`. Put all repair verification in `after_verification`.

If the issue originated from Experience Capture, preserve the original `EC-` packet through `related_packets` with `relation: "originated-from"`.

## Evidence type rules

| Situation | Minimum evidence |
|---|---|
| Static layout, copy, hierarchy | `single-screenshot` with absolute path or user-provided image reference |
| Overlay, blocking, reveal, state transition | `sequence` with ordered screenshots; visual blocking also needs crop or bbox when possible |
| Animation timing, game-feel, motion absence | `sequence`; use `video` if the tool supports it |
| Game combat/turn/reward readability | `sequence` across before/action/after/result whenever possible |
| Backend or account state issue | screenshot plus log or repro steps; mark evidence level honestly |
| No capture ability | `capture-blocked` and a clear request for screenshots or tool access |

Use `recommended_next: send-to-experience-capture` when a static screen suggests a timing, audio, hesitation, loading, or game-feel issue that needs short video/audio evidence before repair.

## After verification shape

When a repair agent claims the issue is fixed, fill:

```json
{
  "after_verification": {
    "verdict": "fixed | weak_visual_delta | still_present | regressed | not_evaluable",
    "after_evidence_paths": [
      "/absolute/path/to/after.png"
    ],
    "after_crop_paths": [
      "/absolute/path/to/after-crop.png"
    ],
    "delta_ratio": 0.0,
    "critic_note": "What changed in the same visual region",
    "checked_by": "after-critic"
  }
}
```

`fixed` requires matching after evidence for the same region. Typechecks, browser tests, or a full-page after screenshot are not enough by themselves.

`weak_visual_delta`, `still_present`, `regressed`, and `not_evaluable` are not fixed states. They must not appear in a changelog "fixed" section and must remain open until repaired or re-evidenced.

## Severity

- `Blocker`: user cannot proceed, understand the core path, or finish the key step.
- `High`: user can continue, but trust, comprehension, conversion, delight, or game feel is meaningfully harmed.
- `Later`: useful, but not necessary for the first workable version.

## Common mistakes

- Writing "feels off" without screen id or visual region.
- Collapsing multiple screen regions into one issue when they need different fixes.
- Recording full screenshots while ignoring existing crops.
- Using a single screenshot for a timing, animation, or state-change problem.
- Treating AI agreement as real-user evidence.
- Recommending a fix when the issue is actually a target-user, pricing, doctrine, or phase-goal conflict.
