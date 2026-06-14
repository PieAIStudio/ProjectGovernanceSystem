---
name: screenwalk
description: 'Use when reviewing real screens, screenshots, prototypes, demo URLs, game UI, user journeys, UI/UX/copy/flow issues, visual blocking, motion/state feedback, onboarding friction, pricing friction, or requests like 看看这个页面, 跑一下用户动线, 评审截图, 流程顺不顺, 能跑了但不顺. Requires screen/prototype/evidence grounding. Use goalcascade instead when the main problem is product direction, target user, doctrine, or charging strategy.'
metadata:
  short-description: Screenshot-driven UX walkthrough
  version: "1.0.0"
---

# ScreenWalk Skill

ScreenWalk is a screenshot / prototype / real-page walkthrough for finding UX, UI, copy, flow, game-feel, and evidence-grounded product issues. Read `references/why-this-skill.md` once at the start.

It does not replace real user research, and it does not decide upstream strategy. It turns visible product experience into evidence packets another agent can inspect and act on.

Default mode is review-only. Do not edit product code, governed docs, assets, tests, or runtime configuration unless the user explicitly asks for repair or implementation after reviewing the findings.

## Core workflow

1. **Frame the run**
   - define surface type, user, goal, success standard, journey scope, and project-specific roles
   - supported surface types: `app`, `game`, `mixed`, `unknown`
   - read `references/surface-adapters.md` when the surface is a game, a mixed product, or unclear
   - if missing, ask once briefly; if unanswered, infer and label assumptions
   - if project-specific roles are needed, read `references/project-roles.md`

2. **Acquire or verify visual evidence**
   - arrange screenshots or screens by real journey, not by technical module
   - if a live URL/app is provided and tools are available, capture fresh screenshots
   - read `references/capture-tools.md` when deciding how to collect evidence
   - if no capture path exists, mark `capture_blocked`; do not pretend visual proof exists

3. **Run the visual obstruction pass**
   - read `references/obstruction-pass.md`
   - if a project adapter exists, read it before judging project-specific objects
   - for overlap, clipping, unreadable, off-canvas, head-covered, or cta-blocked issues, record crop or bbox evidence when possible
   - treat these obstruction categories as evidence-backed UI bugs, not taste or redesign debates

4. **Run the 7 questions on each screen**
   - always read `references/seven-questions.md`
   - answer the same 7 questions for every screen
   - split changes by layer: UI, UX, copy, rules, AI behavior, backend

5. **Create evidence packets**
   - read `references/evidence-packet.md`
   - every actionable issue needs screen id, journey step, role, severity, evidence type, evidence path or capture-blocked status, region, description, and repro steps
   - for motion, state transitions, overlays, timing, game flow, or visual blocking, use ordered screenshots or video when possible

6. **Merge every 4 to 6 screens**
   - combine duplicates, mark conflicts, separate "fix now" from "can defer"
   - if conflicts appear, read `references/merge-protocol.md`
   - if merging ScreenWalk with Experience Capture packets, use `scripts/merge-evidence-packets.py`
   - if an external packet such as `EC-003` routes to ScreenWalk, preserve it in `related_packets` with `relation: "originated-from"`

7. **Create the owner review brief**
   - read `references/owner-review-brief.md`
   - create `owner-review-brief.md` for multi-screen, multi-role, or multi-pass runs
   - include screenshot/crop/annotated evidence near each finding
   - use `scripts/annotate-image.py` for numbered boxes when the issue is visual and bbox/region data is available
   - use `scripts/build-owner-review-brief.py` as a scaffold when evidence packets already exist
   - do not treat the brief as permission to repair

8. **Escalate direction-level conflicts**
   - if repeated conflicts point to target user, phase goal, charging boundary, product role, doctrine, or business model, stop local UI debate and recommend `$goalcascade`

9. **Run after-fix critic pass when repair is claimed**
   - read `references/after-critic.md`
   - verify each fixed visual issue against the same region/crop when possible
   - tests, typecheck, or a full-page after screenshot are not enough to mark a visual issue fixed

## Advanced mode only when needed

Default mode is a single collaborative run. Use the challenge panel only for core funnel screens, high-risk pricing/trust moments, controversial redesigns, or places where owner taste may hide user confusion. In that case, read `references/personas.md`.

Do not replace existing personas with generic roles. Add project-specific roles through `references/project-roles.md` or the user's Project Adapter.

## Project adapters

If the current project has a ScreenWalk adapter, read it during framing and before the obstruction pass. Common locations include governed project docs such as `docs/reference/screenwalk-adapter.md` or a user-provided Project Adapter in the prompt.

Adapters may add roles, project-specific obstruction objects, source hints, and green-light auto-fix boundaries. They must not rewrite ScreenWalk's evidence rules.

## Output format

```markdown
# ScreenWalk Report

## 0. Frame
- surface_type: app | game | mixed | unknown
- adapter decision:
- user:
- goal:
- success standard:
- journey scope:
- roles:
- coverage: full | partial | capture-blocked
- assumptions:

## 1. Screen-by-screen findings
| Screen | Role | User Goal | Friction | Change Direction | Layer | Priority | Evidence |

## 2. Evidence packets
```json
[
  {
    "issue_id": "SW-001",
    "run_id": "",
    "source": "screenwalk",
    "screen_id": "",
    "screen_label": "",
    "surface_type": "",
    "journey_step": "",
    "role": "",
    "severity": "",
    "layer": "",
    "issue_type": "",
    "category": "",
    "evidence_level": "",
    "evidence_type": "",
    "evidence_paths": [],
    "crop_paths": [],
    "bbox": null,
    "visual_region": "",
    "obstruction_findings": [],
    "source_hints": [],
    "related_packets": [],
    "description": "",
    "repro_steps": [],
    "owner_decision_required": false,
    "cascade_conflict": "none",
    "after_verification": null,
    "recommended_next": "fix-now | map-to-work-item | needs-more-evidence | defer | escalate-to-goalcascade | send-to-experience-capture"
  }
]
```

## 3. Experience spine
## 4. Blockers
## 5. High-value changes
## 6. Conflicts and GoalCascade escalations
## 7. Execution list
## 8. What needs real-user validation
```

For multi-screen or multi-role runs, also create `owner-review-brief.md` using `references/owner-review-brief.md`. The brief is the owner-facing summary and should include Markdown-rendered screenshots or annotated copies.

## References

- `references/why-this-skill.md` - rationale + boundary with `$goalcascade`; read once at start
- `references/seven-questions.md` - always read for the exact 7-question lens
- `references/surface-adapters.md` - read for app/game/mixed product branches
- `references/obstruction-pass.md` - read before judging visual blocking, overlap, clipping, unreadable, off-canvas, head-covered, or cta-blocked issues
- `references/evidence-packet.md` - read before recording actionable issues
- `references/capture-tools.md` - read when capture method or evidence type is unclear
- `references/project-roles.md` - read when a project needs game/design/commercial/domain-specific roles
- `references/project-adapter-spec.md` - read when a project provides or needs a ScreenWalk adapter
- `references/owner-review-brief.md` - read when producing the final owner-facing summary, annotated screenshot brief, or decision queue
- `references/after-critic.md` - read when verifying repaired visual issues
- `references/merge-protocol.md` - read when conflicts appear
- `references/personas.md` - read only for advanced challenge-panel runs

## Hard rules

1. Never pretend AI-simulated reactions are real user evidence.
2. Never treat app UX and game feel as the same surface; choose an app/game/mixed adapter before judging.
3. Never claim a visual issue without a screenshot, sequence, video, explicit user-provided evidence, or `capture_blocked`.
4. Never let local screen suggestions silently rewrite product direction; escalate upstream conflicts to `$goalcascade`.
5. Never expand this skill into a giant product-plan document; stay on screens, journeys, evidence, and handoff-ready issues.
6. Never collapse distinct visual problems into one broad issue when they point to different screen regions or fixes.
7. Never classify overlap, clipping, unreadable text, off-canvas content, head-covered characters, or blocked CTAs as mere taste when screenshot evidence exists.
8. Never mark a visual issue fixed without an after-fix critic verdict and matching after evidence.
9. Never let the same agent act as both fixer and AfterCritic for the same issue. The critic must not invoke Edit, Write, patch, NotebookEdit, or any command that mutates the working tree, dependencies, migrations, generated docs, assets, or tests. Allowed: read/search/list tools, read-only comparison scripts such as `scripts/pair-compare.py`, and writing only verdict/evidence files into the agreed run folder.
10. Never auto-repair by default. Repair requires explicit user approval, selected issue IDs, or an explicit auto-repair request.
11. Never finish a multi-screen or multi-role ScreenWalk run without an owner-facing summary. Use `owner-review-brief.md` so the owner can learn, inspect evidence, and decide what to approve.
