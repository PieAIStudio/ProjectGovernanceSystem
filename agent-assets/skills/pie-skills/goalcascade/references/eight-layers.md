# GoalCascade 8 Layers

Every layer must answer two things:

1. what is the conclusion here
2. what concrete constraint does this place on the next layer

If a layer cannot constrain anything below it, it is still too vague.

## Layer 1 · Doctrine / Mission Adapter

- What larger doctrine, mission, brand promise, business system, or owner intent does this product belong to?
- What values, commercial realities, resource constraints, or no-go zones come from that system?
- If the project has no explicit doctrine, what is the smallest honest owner assumption for this round?

Examples:

- Pie project example: The Swimmer’s Guide to the AI Tsunami / user sovereignty is a doctrine source, so monetization cannot depend on manipulation or fear.
- Game example: commercial fun matters, so UI clarity and feedback cannot be sacrificed for lore density.
- SaaS example: trust and reliability matter more than novelty, so risky AI automation stays behind confirmation.
- Portfolio example: the product is mostly a showcase, so polish and shareability outrank deep backend completeness.

Do not treat any example as the universal default. Load the current project's doctrine through `project-adapter.md`.

## Layer 2 · Product Role

- What role does this product play right now?
- Pick the primary role for this phase.

Possible roles:

- showcase
- cash-flow product
- rookie entry point
- community product
- experiment field
- support line

## Layer 3 · Phase Goal

- What is the most important thing this phase is trying to prove or achieve?
- What is explicitly not the current goal?

This should be time-bound and specific to the current phase.

## Layer 4 · Target User and Non-target User

Write both:

- target user
- non-target user

If you only write who you want, but not who you are refusing to optimize for, the strategy usually stays fake.

## Layer 5 · Win Logic

- What do we win on?
- What do we explicitly not try to win on?
- Compared to which alternative or competitor?

Avoid generic claims like "better experience" or "more AI-native."

## Layer 6 · Economy / Charging and Transparency

- Where does the money come from?
- What charging boundary exists?
- How transparent should pricing or cost logic be?
- If this is a high-variable-cost product, read `economy-check.md`.

## Layer 7 · Principles and No-go Zones

Compress the upper layers into:

- 3 to 5 principles
- 3 to 5 no-go zones

These should be operational enough to reject real options, not just sound righteous.

## Layer 8 · Success and Stop Conditions

- What tells us this phase worked?
- What tells us we should stop, downgrade, or rethink?

Use a small number of meaningful measures plus at least one stop condition.

## Fake-constraint check

Common fake constraints:

- "we want to balance X and Y"
- "we care about user experience"
- "we want transparency and flexibility"

A stronger constraint can usually answer:

- what specific option does this reject?
- what lower-layer decision changes because of this?
- what sacrifice does this force?

## Upward revision

GoalCascade is not a waterfall.

Go back up and revise higher layers when:

- lower layers keep colliding
- charging logic and target user keep fighting each other
- principles sound elegant but reject nothing
- real interface review shows the cascade is not landing in practice
