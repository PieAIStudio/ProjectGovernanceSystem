# ScreenWalk Capture Tools

Use this reference when deciding how to collect or label visual evidence.

ScreenWalk is tool-agnostic. Use whatever capture surface the current environment actually provides.

## Capture options

| Source | Use when | Evidence label |
|---|---|---|
| User-provided screenshots | The user already supplied screenshots or a report with images | `single-screenshot` or `sequence` |
| Browser screenshot tool | A web app, localhost, preview URL, or game can be opened by the agent | `single-screenshot` or `sequence` |
| Playwright / browser automation | The journey requires repeatable clicks, multiple steps, or regression proof | `sequence` |
| Mobile device / simulator tool | The target is iOS, Android, or native app UI | `single-screenshot` or `sequence` |
| Screen recording | Motion, timing, game feel, animation, or transition is central | `video` |
| Logs or console | Visual symptom depends on backend/account/runtime state | pair with screenshot; do not use logs alone for visual claims |

## If no capture tool exists

Do not fake certainty.

Write:

```json
{
  "evidence_type": "capture-blocked",
  "evidence_paths": [],
  "recommended_next": "needs-more-evidence"
}
```

Then ask for screenshots, a demo URL, or permission/tooling to capture the product.

## Dynamic evidence rule

For these issues, prefer ordered screenshots or video:

- animation missing or feels abrupt
- state changes are unclear
- overlays cover important game/app state
- turn/result/checkout/onboarding transitions confuse the user
- loading, disabled, success, error, or reward feedback is missing

If only one screenshot exists, mark the dynamic conclusion as `flow-inference`, not `screenshot-visible`.
