# Visual Obstruction Pass

Run this pass after collecting screenshots and before writing issue packets.

Goal: find visible overlap, clipping, unreadable, off-canvas, head-covered, and cta-blocked problems as concrete UI bugs, not vague "feels crowded" feedback.

## Universal checklist

Check every screen for:

- Primary CTA or next action blocked, cropped, hidden below overlays, or visually drowned out.
- Main title, current task, or primary status text clipped, too small, low contrast, or placed on noisy art.
- Modal, toast, tooltip, banner, sticky header, sticky footer, or floating helper covering the current task.
- Important content off-canvas, under safe-area/notch regions, behind browser chrome, or outside the visible viewport.
- Multiple overlays competing in the same visual band.

## App adapter checklist

For `surface_type: app`, also check:

- Form fields and validation messages do not cover each other.
- Drawer, sidebar, popover, or dropdown does not block the primary task.
- Pricing, quota, permission, and account-state messages remain readable and honest.
- Empty, loading, success, and error states do not hide recovery actions.

## Game adapter checklist

For `surface_type: game`, also check:

- Character head, face, silhouette, weapon hand, and readable pose are not covered by nameplates, HP bars, status chips, damage numbers, tooltips, or HUD.
- HUD, resource bars, turn state, and timers do not cover the battlefield center, boss, current target, or next action area.
- Cards, hand rails, skill buttons, target highlights, and submit/lock controls are not blocked by guidance, dialogue, effects, or reward overlays.
- Damage, healing, status, combo, and reward feedback is close enough to the affected object without blocking the next action.
- Battle result and reward screens preserve the ceremony before dense report or ledger detail.

## Evidence requirements

For every obstruction issue:

- Make it atomic: one issue should identify one blocked element and one main blocking cause.
- Provide full screenshot evidence plus `crop_paths` or a `bbox` whenever possible.
- Fill `obstruction_findings` with `obstructed`, `obstructor`, `category`, and `evidence_crop`.
- Use `recommended_next: fix-now` unless the issue lacks evidence or is truly an upstream strategy conflict.

## Project adapter extension

If a project adapter defines stricter objects, use it after this checklist. Project rules may add domain objects and source hints, but they must not weaken these evidence requirements.
