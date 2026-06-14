# Capture Recipes

Use this reference when deciding what evidence to record.

## Clip Length

- Smoke clip: 10-30 seconds for "does this moment have feedback?"
- Focus clip: 30-90 seconds for one journey step or failure mode.
- Main journey clip: 2-5 minutes for first-run onboarding, one game round, checkout, signup, or creation flow.
- Longer clips: split by scenario unless the reviewer backend explicitly supports the length and the task needs continuity.

## Capture Lanes

| Lane | Use When | Output |
|---|---|---|
| Project Playwright / E2E | Repeatable app/game proof is needed | video, trace, screenshots |
| AI client's native browser | Fast localhost/public-page preview is enough | screenshot or manual clip |
| Real-profile Chrome Extension | Login state, provider account, Gems, extensions, existing tabs, or file upload UI matters | uploaded clip plus reviewer response |
| User-provided media | Automation is blocked or the user has already recorded the issue | raw video/audio/screenshots |
| Ordered screenshots | Video is unavailable but state change still matters | numbered before/action/after frames |

## App Recipes

- First-run onboarding: from landing screen to first completed meaningful action.
- Conversion path: pricing/signup/checkout up to the decision point, not real payment unless explicitly requested.
- Form/error flow: trigger one realistic mistake, then recover.
- Mobile/responsive: capture the same task at the intended viewport.
- Account-bound workflow: capture only the target page; do not expose unrelated account data.

## Game Recipes

- First playable minute: title/lobby -> core interaction -> first feedback.
- One turn / one action loop: choose input -> confirm -> resolve -> reward/failure.
- Failure and retry: make one mistake, observe feedback, retry.
- Game feel micro-clip: hit, animation, sound, transition, reward, or loading moment.
- Economy/monetization moment: offer display -> comprehension -> decision, without real purchase unless explicitly authorized.

## Naming

Use stable names:

```text
<run-id>/<surface>-<journey>-<role>-<clip-index>.<ext>
20260508/supa-battle-first-turn-owner-01.webm
20260508/app-onboarding-first-user-01.mp4
```

Record the exact path in the evidence packet. Prefer absolute paths when the packet will be read outside the current repo.
