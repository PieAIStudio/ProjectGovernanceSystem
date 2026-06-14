---
name: goalcascade
description: 'Use when product direction, positioning, phase priority, target vs non-target users, commercial boundaries, doctrine/mission fit, AI-native cost, free-tier limits, or feature yes/no tradeoffs are unclear. Trigger for Chinese requests like 产品方向不清, 定位模糊, 给谁做, 现阶段优先做什么, 要不要做这个功能, 收费边界, 靠什么赢, 牺牲什么, AI 海啸游泳指南如何落地. Do not use for concrete screen critique; use screenwalk there.'
metadata:
  version: "1.0.0"
---

# GoalCascade Skill

GoalCascade turns fuzzy product ambition into constraints that can reject concrete options. It is a direction and tradeoff skill, not a business-plan generator or a replacement for user feedback.

Default mode is review-only. It may recommend owner decisions, rejected options, and downstream evidence needs, but it must not silently authorize implementation or repair.

## Relationship to `$screenwalk`

- Use `goalcascade` for upstream direction: why this exists, who it serves, what this phase proves, what must be sacrificed, and which options are forbidden.
- Use `$screenwalk` for downstream evidence: what a real user sees on actual screens, where they hesitate, and what should change in the flow.
- If `$screenwalk` reveals repeated conflicts about target user, charging boundary, product role, or doctrine, escalate back to `goalcascade`.
- If `goalcascade` finishes with actionable constraints and real screens exist, recommend `$screenwalk`.

## Ask only what is necessary

Before starting, establish:

1. product or product idea
2. current time window
3. project doctrine / mission source, if any

If missing, ask once briefly. If the user does not answer, infer the minimum workable frame and label it as an assumption.

## Core workflow

1. **Set the time window**
   - current release, next 30 to 60 days, current quarter, or similar
   - never answer as eternal strategy unless the user explicitly asks for doctrine work

2. **Create a project adapter**
   - read `references/project-adapter.md`
   - identify doctrine / mission, commercial goal, target users, non-target users, evidence surfaces, and downstream work-item mapping
   - do not hardcode Pie, The Swimmer’s Guide to the AI Tsunami, SaaS, games, or any other project type as the default

3. **Work top-down through 8 layers**
   - always read `references/eight-layers.md`
   - after each layer, write what constraint it places on the next layer
   - if a layer rejects no concrete option, rewrite it

4. **Handle Economy explicitly when applicable**
   - if this is AI-native, high-variable-cost, ad-funded, paid, freemium, or otherwise commercial, read `references/economy-check.md`
   - answer unit cost, free-tier ceiling, monetization premise, and transparency boundary
   - rough estimates are allowed; hiding uncertainty is not

5. **Run the smoke test**
   - read `references/smoke-test.md`
   - use it to catch slogan walls, fake balance, and constraints that reject nothing

6. **Recommend the next move**
   - if direction is clear enough to inspect real screens, recommend `$screenwalk`
   - if direction is still rootless, say so and name the missing adapter input
   - if a concrete implementation task is implied, map it to the project's governed work-item system

7. **Create or update the owner review brief when part of a loop**
   - read `references/owner-review-brief.md`
   - link upstream principles to concrete `SW-` or `EC-` issue IDs when available
   - separate safe fix scope, owner-taste decisions, evidence gaps, and forbidden moves
   - do not turn the brief into an implementation plan unless the owner explicitly asks

## Output format

```markdown
# GoalCascade

## 0. Frame
- product:
- time window:
- project adapter:
- assumptions:

## 1. Eight-layer cascade
### Layer 1 · Doctrine / Mission Adapter
- conclusion:
- constraints on next:

### Layer 2 · Product Role
- conclusion:
- constraints on next:

[continue through Layer 8]

## 2. Economy and transparency
- applicable: yes | no
- unit cost:
- free-tier ceiling:
- monetization premise:
- transparency boundary:
- confidence:

## 3. Sacrifices and non-targets
- sacrifices:
- non-target users:
- forbidden moves:

## 4. Success and stop conditions
- success:
- stop:

## 5. Smoke-test notes
- counterfactual:
- rejection:
- time:
- opposition:

## 6. Downstream handoff
- recommended next:
- screenwalk frame, if applicable:
- governed work-item mapping, if applicable:

## 7. Owner decision brief, if applicable
- linked issue_ids:
- approved candidate decisions:
- owner-taste decisions:
- evidence gaps:
- forbidden moves:
```

## References

- `references/project-adapter.md` - read when establishing doctrine / mission and project-specific mapping
- `references/eight-layers.md` - always read for the 8-layer structure
- `references/economy-check.md` - read when the product has meaningful cost, charging, or commercial exposure
- `references/smoke-test.md` - read before finalizing the cascade
- `references/owner-review-brief.md` - read when GoalCascade participates in a wider quality loop or owner decision packet

## Hard rules

1. Do not let the cascade become a slogan wall.
2. Do not turn one project's doctrine into a universal default.
3. Do not confuse organizational ideals with direct user value.
4. Do not hide uncertainty behind strategic language.
5. Do not skip Economy when charging, AI cost, quotas, ads, or paid conversion affect product shape.
6. Do not decide screen-level fixes without evidence; hand concrete interface questions to `$screenwalk`.
7. If the cascade cannot reject concrete options, it is not finished.
8. Do not treat strategy recommendations as repair approval. The owner still selects issue IDs, a governed work item, or an explicit implementation scope.
9. When evidence packets are available, link decisions to concrete `SW-` or `EC-` issue IDs instead of writing abstract strategy in isolation.
10. When participating in a wider AI Quality Loop, create or append an owner-facing brief section before implementation so the owner can approve issue IDs and tradeoffs explicitly.
