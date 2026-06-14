# GoalCascade Economy Check

Use this reference when the product has meaningful variable cost, especially AI-native products.

## Why this matters

For these products, free experience, charging logic, and cost structure are not downstream implementation details. They can change the entire product shape.

## The 3 required questions

## 1. Unit cost

- Roughly how much does one core action or one active user day cost?
- If only an estimate exists, say so.
- Good enough for this stage means: you can state an order of magnitude and what assumption drives it.

## 2. Free-tier ceiling

- How far can a free user go before the product asks for money or hits a quota?
- Where is the break point?
- Does that break point kill a normal first experience?

## 3. Monetization premise

- What concrete moment is supposed to create willingness to pay?
- What is the actual paid unlock or exchange?
- Is that moment already represented somewhere in the product or flow, or only imagined?

## Acceptable confidence levels

- `rough-estimate` - early directional estimate, clearly marked
- `working-estimate` - informed by current architecture or provider pricing
- `validated` - supported by real product usage, real billing, or real experiments

## What not to do

- Do not write "cost is low" without scale.
- Do not write "users will pay for premium features" without naming the trigger moment.
- Do not skip the free-tier break point just because it is not final yet.

If the product truly has no meaningful variable cost, say that explicitly and explain why this check is not central for this case.
