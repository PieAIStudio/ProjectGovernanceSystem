# GoalCascade Project Adapter

Use this reference before the 8-layer cascade when the project is new, cross-project, doctrine-heavy, or commercial.

The adapter is intentionally small. Its job is to prevent one project's assumptions from leaking into every other project.

## Required adapter fields

| Field | Question | If missing |
|---|---|---|
| Doctrine / mission | What higher principle, brand promise, owner intent, or social purpose constrains this product? | Mark as `owner-assumption-needed`; do not invent a grand doctrine. |
| Product system | What larger system does this product serve: revenue engine, showcase, community, research, ecosystem, IP, tooling, learning? | Pick the most likely role and mark it as an assumption. |
| Commercial goal | Is the product meant to make money, reduce cost, build influence, learn, or support another product? | Say the cascade cannot decide pricing or scope confidently. |
| Target and non-target users | Who is this phase for, and who are we refusing to optimize for? | Force a tentative split; otherwise all later UX tradeoffs become fake. |
| Evidence surface | What real screens, logs, screenshots, playtests, demos, docs, or metrics can constrain the cascade? | Recommend `$screenwalk` only after evidence exists. |
| Work-item mapping | Where do real issues go after direction is clarified? | Use the project's governed issue/task system; do not default to any one project's terminology. |

## Common project adapters

## Pie / The Swimmer’s Guide to the AI Tsunami project

Use only when the project actually belongs to Pie's doctrine system.

- Doctrine / mission: user sovereignty, rookie sovereignty, and avoiding manipulative dependence on opaque AI.
- Commercial boundary: making money is allowed, but dark patterns, fear pressure, and deliberately confusing quotas are no-go zones.
- Downstream constraint: paid unlocks must feel like value exchange, not coercion.

## Non-Heroes game project

- Doctrine / mission: commercial game success, PieIP influence, and The Swimmer’s Guide to the AI Tsunami communication without turning the game into a sermon.
- Commercial boundary: monetization should be legible and non-disgusting; free play must show the core loop before pressure.
- Downstream constraint: game-feel, readable state changes, feedback, flow, and UI consistency are not cosmetic extras.

## Ordinary SaaS / tool project

- Doctrine / mission: usually trust, usefulness, workflow reliability, and clear value exchange.
- Commercial boundary: trial, quota, upgrade, and onboarding must explain value before asking for payment.
- Downstream constraint: do not optimize novelty if it reduces trust or task completion.

## AI-native high-cost product

- Doctrine / mission: user value must survive cost control.
- Commercial boundary: unit cost, free-tier ceiling, and paid conversion moment shape the product itself.
- Downstream constraint: read `economy-check.md`; do not hide cost under vague "premium" language.

## Adapter self-check

Before writing Layer 1, ask:

- Does this adapter reject at least one concrete product move?
- Does it separate current phase from long-term dream?
- Does it make at least one user, feature, or monetization option explicitly non-target?
- Does it avoid turning a local project doctrine into a universal rule?
