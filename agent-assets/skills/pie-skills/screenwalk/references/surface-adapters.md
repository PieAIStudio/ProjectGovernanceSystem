# ScreenWalk Surface Adapters

Use this reference to keep apps and games as first-class surfaces without splitting the skill.

Choose one:

```text
surface_type: app | game | mixed | unknown
```

If uncertain, mark `unknown`, inspect the first screens, then revise.

## App adapter

Use for SaaS, tools, dashboards, onboarding flows, marketplaces, media apps, and productivity apps.

Primary questions:

- Can the user tell where they are and what to do next?
- Is the value exchange clear before signup, payment, quota, or permissions?
- Does the interface reduce cognitive load at the key task moment?
- Are errors, empty states, loading, success, and account state visible?
- Does the visual hierarchy guide the task rather than decorate it?
- Are CTAs, forms, pricing, account state, modals, toasts, and sticky regions free of overlap or clipping?

Common layers:

- UI
- UX
- Copy
- Backend/account state
- AI behavior
- Monetization
- Accessibility

## Game adapter

Use for browser games, mobile games, prototypes with playable loops, battle screens, match flows, and reward/progression experiences.

Primary questions:

- Does the player understand the current objective, available action, and consequence?
- Does the screen communicate state changes: HP, resources, turn order, damage, reward, failure, progression?
- Does feedback feel satisfying enough for a game, not just technically correct?
- Are HUD, overlays, effects, modals, and text fighting for attention?
- Are character silhouettes, head/face areas, HP/status UI, cards, targets, rewards, and submit controls free of harmful obstruction?
- Does the loop feel like a normal game flow: enter, act, see result, learn, continue?
- If monetization appears, does it feel like value exchange rather than pressure or punishment?

Common layers:

- UI
- UX
- Rules
- Game feel
- Copy
- AI behavior
- Monetization
- Accessibility

Dynamic evidence is more important for games. For battle turns, result overlays, reward reveals, and motion complaints, prefer before/action/after/result screenshots or video.

Run `references/obstruction-pass.md` for game battle, HUD, card, result, and reward screens. Visual obstruction is not the same as brand taste.

## Mixed adapter

Use when the product is both an app and a game, or when a game has heavy app surfaces such as lobby, store, profile, settings, account, social, or creator tools.

Split the journey:

| Segment | Adapter |
|---|---|
| Landing, account, lobby, store, settings | app |
| Match, battle, reward, progression, game tutorial | game |
| AI chat, generated narration, NPC behavior | app + game, depending on the user goal |

Do not judge the entire product with one lens. A store screen can pass app clarity while failing non-disgusting monetization. A battle screen can pass visual polish while failing state-change readability.

## Output requirement

In the report frame, include:

```markdown
- surface_type:
- adapter decision:
- app segments:
- game segments:
```

In evidence packets, include `surface_type` so downstream repair agents know which standards apply.
