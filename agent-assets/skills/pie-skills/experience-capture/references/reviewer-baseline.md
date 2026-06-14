# Reviewer Baseline

Use this reference when Experience Capture runs repeated Gemini / Gem / multimodal reviews and the owner wants stable judgment instead of a fresh, random-feeling review every time.

The recommended pattern is **baseline plus run packet**:

- baseline: stable reviewer taste, product lens, output contract, and no-go rules
- run packet: the current clip, current goal, current constraints, source hints, and known open questions

Do not rely on a Gem alone. A persistent Gem helps consistency, but every run still needs the concrete project context and strict output schema in the chat.

## Why Not Only A Gem

Gemini Gems can save detailed instructions and attach knowledge files, which is useful for stable reviewer behavior. But Gems are still a product surface, not a versioned build artifact:

- the user may edit the Gem without the repo knowing
- the provider may change model behavior
- uploaded knowledge may be stale
- automation may run against a wrong Gem or wrong account
- hidden instructions are hard for downstream agents to audit

Therefore, a Gem is a reviewer convenience, not the single source of truth.

## Why Not Only Per-Run Prompts

Per-run prompts are explicit and auditable, but they can drift:

- one run says "casual mobile game", another forgets that direction
- one run asks for strong UI taste, another asks only for bugs
- one reviewer over-indexes on layout, another over-indexes on audio

Use a small persistent baseline so the reviewer keeps the same taste and role, then attach the per-run packet to keep the review grounded.

## Baseline Contents

Keep the baseline short enough to paste into a Gem instruction or a project reviewer file.

Required:

- reviewer identity, such as "casual game UX reviewer" or "B2B onboarding UX reviewer"
- desired product feeling, such as playful, fast, trustworthy, premium, calm, tactical, or arcade-like
- target user and non-target user
- strict JSON output contract
- one issue equals one observable phenomenon and one suggested fix
- never treat reviewer suggestions as owner approval
- when static proof is needed, route to ScreenWalk
- when doctrine/business conflict appears, route to GoalCascade

Optional:

- taste references, such as "lightweight casual mobile game", "tactile board-game UI", or "clean SaaS onboarding"
- banned suggestions
- severity calibration examples
- project-specific source hint keys
- brand/style criteria that require owner approval

## Run Packet Contents

Attach or paste this in every Gemini/Gem run, even when using a Gem.

```text
Run packet:
- project:
- run_id:
- clip_id:
- journey_step:
- surface_type: app | game | mixed
- target user:
- current owner concern:
- desired feeling for this clip:
- forbidden suggestions:
- relevant source hint keys:
- output schema:
- issue limit:
- if unsure:
```

For Non-Heroes-like games, include whether the clip is about onboarding, battle one-turn, locked-zone feedback, settlement, lobby/account, or shop/payment.

## Recommended Gemini Setup

Use this split:

- Gem instructions: stable reviewer role, taste, anti-drift rules, strict JSON discipline
- Gem knowledge files: stable product doctrine, reviewer baseline, adapter excerpts, style/taste references
- Per-run chat upload: current clip, current run packet, output schema, and any current known bugs

This gives the reviewer continuity without hiding the current task.

## Gem Instruction Skeleton

```text
You are a stable multimodal product reviewer for repeated Experience Capture runs.

Role:
- Senior UX/UI reviewer
- Game feel / interaction reviewer when surface_type includes game
- Frontend QA reviewer for observable implementation symptoms

Taste baseline:
- Prefer clear hierarchy, fast feedback, readable primary actions, and coherent visual language.
- For games, protect character readability, input responsiveness, reward/impact feedback, and first-session comprehension.
- For apps, protect first-10-second comprehension, trust, form recovery, and conversion clarity.

Rules:
- Only use visible or audible evidence from the uploaded media and run packet.
- Output strictly one JSON object. No prose. No markdown fences.
- One timeline_issue = one observable phenomenon + one suggested fix.
- If two issues occur at the same timestamp, output two timeline_issues.
- Static obstruction/crop/bbox problems should be marked send-to-screenwalk.
- Doctrine, monetization, audience, or brand-direction conflicts should be marked escalate-to-goalcascade.
- Your output is a candidate review, not owner approval.
```

## Per-Run Prompt Tail

Append this after the run packet and media upload:

```text
Return a single JSON object with timeline_issues.
Each issue must include approximate_time, role, severity, issue_type, category,
observation, why_it_matters, suggested_fix, evidence_from_video, and recommended_next.

Rules:
- Max 7 high-signal issues for this clip.
- Do not merge separate issues.
- If evidence is too weak, use needs-more-evidence.
- Output strictly JSON. No prose. No markdown fences.
```

## Anti-Drift Checklist

Before using a repeated reviewer, verify:

- the Gem or baseline name matches the project and surface type
- the current run packet is pasted or uploaded
- output schema is present in the current chat
- the reviewer knows this is review-only
- owner approval is still required before repair
- raw review and normalized packet paths will be saved

If any item is missing, treat the review as exploratory and do not hand it to a coding agent.
