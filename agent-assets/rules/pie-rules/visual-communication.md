# Visual Communication Rule

## Purpose

When a task involves interface layout, game screens, composition, visual hierarchy, motion, art style, character pose, scene staging, or any "hard to describe in words" visual feeling, the AI must not keep solving only through prose. The default move is to create or request visual evidence so the user and future AI sessions can check whether the visual understanding is correct.

This rule is cross-project. Do not hardcode project URLs, phase names, asset paths, or product-specific vocabulary here. Project-specific visual rules belong in that repo's local `BestPractice-ForThisProject.md` or phase docs.

---

## Core Principle

Use a two-track visual handoff whenever possible:

1. **Machine-readable structure**: HTML/CSS, SVG, Pencil `.pen`, Mermaid, JSON layout, or another format that an AI can inspect, diff, and modify.
2. **Human-readable preview**: PNG/JPG screenshot, exported preview, short recording, or annotated reference image that the user can judge at a glance.

If only one artifact is possible, prefer the machine-readable structure for cross-AI handoff; add a preview as soon as feasible.

---

## When AI Should Proactively Switch To Visual Communication

Do this when any of the following is true:

- The user describes layout, UI hierarchy, game battle staging, camera angle, character placement, HUD, animation timing, or art direction in long prose.
- The user says things like "像某个游戏", "不像游戏", "这个感觉不对", "我说不清楚", "你看这个截图", or "别误解我的意思".
- Multiple agents/sessions need to align on the same visual direction.
- The current implementation risks becoming a web/app/dashboard surface when the target is a game, film, poster, deck, or other visual medium.
- A code change is visually important enough that text-only test output cannot prove success.
- The user has already corrected visual direction once; the next iteration should use a visual proof loop.

Suggested sentence:

> 这个继续用文字容易误读。我建议先做一个可读结构稿，再导出截图给你确认；你确认后我再让实现继续深入。

---

## When AI Should Ask The User For Visual Input

Ask for visual input instead of guessing when:

- The user says a style is wrong, but the desired style has multiple plausible interpretations.
- The decision depends on taste, not only correctness.
- The AI cannot tell whether the user wants layout, mood, material, camera, typography, iconography, or motion changed.
- The task references a private/local asset folder, screenshot, video, design file, or purchased UI kit that has not been inspected yet.

Good requests are specific and lightweight:

- "请给我 1-3 张你觉得更接近的参考图。"
- "如果方便，直接在截图上圈出：保留什么、删掉什么、哪里换位置。"
- "你可以给我一个本地路径；我会读取图片并把它整理成结构稿。"

Do not ask for visuals when enough reference material already exists locally and can be inspected by the AI.

---

## Artifact Selection

| Need | Best default | Notes |
| --- | --- | --- |
| Layout, hierarchy, screen regions, HUD, responsive placement | HTML/CSS or SVG | Easiest for any AI to read, modify, diff, and screenshot. |
| Reusable vector design, precise canvas layout, design-system style exploration | Pencil `.pen` + exported PNG | Use Pencil CLI when available. Enable Pencil MCP only for live canvas/selection work. |
| Game scene staging, map, character pose, mood, concept art | AI-generated image + written breakdown | Treat as style/reference, not runtime SSOT. Split into usable layers before implementation. |
| Motion timing, interaction feel, browser proof | Short video/GIF + notes | Keep clips short and identify the exact behavior under review. |
| User correction | Annotated screenshot or rough sketch | Convert it into machine-readable notes/HTML/Pencil after reading. |

---

## Required Contents For A Visual Draft

A visual draft should include:

- **Title + scope + status**: what it covers, and whether it is a reference draft, implementation target, or final asset.
- **Named regions**: each major area labeled with its responsibility.
- **Do / Don't**: the direction to pursue and the trap to avoid.
- **Asset/runtime boundary**: reference-only, or must be copied into project runtime assets/manifest? Mark placeholder vs. structural.
- **Handoff + verification**: one instruction for the next AI, plus what screenshot/browser/device proof should look like when done.

---

## Runtime Asset Rule

A visual reference is not automatically a runtime asset.

Before using it in a product/game/app, the AI must check the project-specific asset pipeline. In general:

- Copy actual runtime assets into the project, not into a random external reference folder.
- Register them in the project's manifest or content system when that project has one.
- Keep prompts, source paths, license/ownership notes, and generated variants traceable.
- Do not let a single composite concept image become the only source of truth for layered UI/game implementation.

---

## Visual Feedback Loop

For substantial visual work: **inspect existing refs first** -> draft a low-cost
structure/proof -> export a preview the user can judge -> iterate on their
correction (**do not defend a mismatched draft with prose**) -> only after the
direction is aligned, implement -> **verify with a real browser/app/game
screenshot or recording, not only unit tests**.

---

## Don't

- Do not keep explaining a visual disagreement only in text.
- Do not hand an executor one pretty image and expect it to infer layout, layers, hit targets, or runtime constraints.
- Do not treat screenshots as the only truth source; pair them with readable structure or notes.
- Do not make Pencil MCP a default always-on dependency; prefer CLI/export unless live canvas operations are necessary.
- Do not force the user to learn a new design tool when a marked screenshot or quick sketch would communicate faster.
- Do not hardcode one project's URL, account, phase, or asset path into this shared rule.
