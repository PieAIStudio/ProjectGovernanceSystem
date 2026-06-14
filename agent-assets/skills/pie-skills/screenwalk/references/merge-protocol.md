# ScreenWalk Merge Protocol

Use this when findings start to repeat, conflict, or drift upward into strategy.

## Small merge

After every 4 to 6 screens:

1. merge duplicate problems
2. mark conflicts explicitly
3. separate "fix now" from "can defer"
4. convert emotional goals into concrete change directions
5. mark guesses as assumptions

When packet JSON files already exist, use `scripts/merge-evidence-packets.py` instead of hand-merging. It delegates to the shared AI Quality Loop merge script so ScreenWalk and Experience Capture use the same duplicate rules.

Do not merge distinct visual obstruction regions into one broad issue. If the HUD is dense and a character head is covered, keep them as separate issues because they need different evidence and likely different fixes.

If a ScreenWalk issue originated from another skill, preserve the link in `related_packets`, for example `{ "issue_id": "EC-003", "relation": "originated-from" }`.

## Conflict triggers

When a conflict appears, classify it with this table:

| Trigger | Action | Artifact | Rollback |
|---|---|---|---|
| Same problem, two incompatible fixes | Keep both options visible; write what each one is protecting | Conflict list with option A / option B | If later screens add no new evidence, keep both as unresolved |
| The same type of conflict appears across 2 groups | Pause local debate and check whether target user, stage goal, or charging stance is unclear | Upstream gap note | If upstream review still cannot decide, mark as strategic assumption rather than fake certainty |
| A suggestion depends mostly on taste, not the screens | Keep it out of the execution list for now | Assumption list | Revisit only if later evidence supports it |
| A local fix breaks the agreed experience spine | Protect the spine first | Experience-spine note | If the spine itself proves wrong, revise it globally rather than patching locally |
| Same obstruction appears in multiple evidence sources | Keep one canonical issue and list all evidence sources | Evidence packet with `source` and crop list | If future `VW-` video issues duplicate `SW-` screenshot issues, prefer the source with stronger evidence for that category |

## When to escalate to GoalCascade

Recommend `$goalcascade` when:

- repeated conflicts are really about who the product serves
- charging / free boundaries keep fighting UI suggestions
- local changes keep colliding with stage goals or product role
- screen-by-screen comments are no longer enough to decide tradeoffs

ScreenWalk should surface these conflicts, not silently settle them.
