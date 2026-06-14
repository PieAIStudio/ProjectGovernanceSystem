# Experience Evidence Schema

Experience Capture packets use the same spirit as ScreenWalk packets, but with timestamped media evidence.

## Packet Shape

```json
{
  "issue_id": "EC-001",
  "run_id": "2026-05-08-project-journey",
  "source": "experience-capture",
  "surface_type": "app | game | mixed | unknown",
  "journey_step": "What the user is doing",
  "role": "first-time user | skeptical payer | UX designer | game-feel reviewer | project-specific role",
  "severity": "Blocker | High | Medium | Later",
  "layer": "UI | UX | Copy | Rules | AI behavior | Backend | Game feel | Monetization | Accessibility | Audio | Performance",
  "issue_type": "motion | audio | timing | loading | feedback | hesitation | state_transition | visual_hierarchy | obstruction_candidate | comprehension | other",
  "category": "transition-dead-time | no-hit-feedback | snap-update | unclear-next-action | cta-distance | tooltip-blocking | audio-missing | pacing | loading | other",
  "evidence_level": "video-visible | audio-visible | flow-inference | user-report | capture-blocked",
  "evidence_type": "video | trace | ordered-screenshots | audio | user-report | capture-blocked",
  "video_paths": ["/absolute/path/to/clip.webm"],
  "artifact_root": "/optional/project/or/run/artifact/root",
  "sequence_paths": [],
  "timestamp_start": "00:08",
  "timestamp_end": "00:09",
  "evidence_from_media": "What is visible/audible at the timestamp",
  "description": "What is wrong and why it matters",
  "suggested_fix": "Concrete direction, not a mandate",
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
  "merged_with": [],
  "needs_split": false,
  "owner_decision_required": false,
  "cascade_conflict": "none | target-user | phase-goal | charging-boundary | doctrine | business-model",
  "after_verification": null,
  "recommended_next": "fix-now | map-to-work-item | needs-more-evidence | defer | escalate-to-goalcascade | send-to-screenwalk"
}
```

## Required Fields

Every packet must include:

- `issue_id`
- `run_id`
- `source`
- `surface_type`
- `journey_step`
- `role`
- `severity`
- `issue_type`
- `category`
- `evidence_level`
- `evidence_type`
- `timestamp_start`
- `timestamp_end`
- `description`
- `source_hints`
- `related_packets`
- `recommended_next`

For `evidence_type: video`, `video_paths` must contain at least one path.

For `issue_type: obstruction_candidate`, set `recommended_next: send-to-screenwalk` unless the packet already has screenshot crop/bbox evidence from ScreenWalk.

If `recommended_next: send-to-screenwalk`, downstream ScreenWalk output must preserve the original EC id through `related_packets`.

If `needs_split: true`, the packet is not valid for repair. Split it into one observable phenomenon and one suggested fix per packet.

Prefer project-relative paths inside repo-local artifacts. Use absolute paths when packets will be read outside the project or by another workspace.

For observations about something absent or not happening, such as no loading indicator or missing hit feedback, use `evidence_level: flow-inference` unless the media directly makes the absence unambiguous enough for the project.

## After Verification

```json
{
  "after_verification": {
    "verdict": "fixed | weak_visual_delta | still_present | regressed | not_evaluable",
    "after_video_paths": ["/absolute/path/to/after.webm"],
    "timestamp_start": "00:08",
    "timestamp_end": "00:09",
    "critic_note": "What changed in the same action window",
    "checked_by": "experience-after-critic"
  }
}
```

Do not mark `fixed` unless the same action window was re-captured or otherwise re-observed.

`weak_visual_delta`, `still_present`, `regressed`, and `not_evaluable` are not fixed states. They must not appear in a changelog "fixed" section and must remain open until repaired or re-evidenced.
