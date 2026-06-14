# Owner Review Brief

Use this reference when GoalCascade is part of a larger quality loop or when the user needs a readable decision document before implementation.

GoalCascade usually has no screenshots of its own. Its brief should connect upstream principles to downstream evidence packets from ScreenWalk or Experience Capture when available.

## Default Contract

Create or append a GoalCascade section in `owner-review-brief.md` when:

- a run includes product doctrine, target user, monetization, phase-goal, or strategy tradeoffs
- ScreenWalk or Experience Capture escalates packets to GoalCascade
- the user asks what to approve, reject, defer, or study

Do not turn the cascade into an implementation plan unless the owner explicitly asks.

## Required Sections

```markdown
# GoalCascade Owner Review Brief

## 0. Frame
- product:
- time window:
- doctrine / mission source:
- commercial goal:
- evidence inputs:
- assumptions:

## 1. Decision Principles
| Principle | What it rejects | What it permits | Confidence |

## 2. Evidence Links
| Issue ID | Evidence source | Why it escalated | Cascade question |

## 3. Tradeoff Decisions
| Decision | Recommended owner choice | Reason | Risk if wrong |

## 4. Allowed Fix Scope
- safe to fix now:
- needs owner taste:
- needs more evidence:
- forbidden moves:

## 5. Downstream Handoff
- issue_ids approved for repair:
- issue_ids deferred:
- issue_ids needing ScreenWalk / Experience Capture:
- governed work item target:
```

## Evidence Link Rules

- Reference concrete issue IDs when available.
- If no evidence packets exist, say the cascade is direction-only.
- Do not invent screen evidence to make the strategy feel grounded.
- When the cascade rejects a UI/UX suggestion, state the upstream reason in plain language.

## Repair Boundary

GoalCascade may recommend what the owner should approve, but it must not silently authorize repair. The owner still selects issue IDs or a governed work item.
