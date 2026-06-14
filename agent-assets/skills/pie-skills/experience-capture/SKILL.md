---
name: experience-capture
description: Capture and normalize dynamic product experience evidence from short app or game clips, recordings, traces, ordered screenshots, or user-provided media. Use when reviewing motion, timing, audio, loading, hesitation, game feel, onboarding rhythm, state transitions, or any UX issue that a single screenshot cannot prove. Use with Playwright/video capture, real-profile browser reviewers such as Gemini via Chrome Extension, Gemini API, or user-provided multimodal review output. Produces timestamped evidence packets for ScreenWalk, GoalCascade, QA, or coding-agent handoff.
---

# Experience Capture

Capture short dynamic evidence and convert it into timestamped, actionable experience packets. This skill complements `$screenwalk`: use ScreenWalk for static layout, crop/bbox obstruction, and per-screen visual proof; use Experience Capture for motion, audio, pacing, waiting, state transitions, hesitation, and game feel.

Default mode is review-only. Do not edit product code, governed docs, assets, tests, or runtime configuration unless the user explicitly asks for repair or implementation after reviewing the findings.

## Hard Rules

1. Do not review from imagination. Every finding must point to a clip, trace, ordered screenshot sequence, or explicit user-provided media.
2. Keep clips short and scoped. Prefer 30-120 seconds; split anything over 5 minutes unless the reviewer backend explicitly supports longer context.
3. Separate capture from review. Playwright, the project test lane, or the user usually captures; Gemini/Chrome/API or another multimodal model reviews; scripts normalize output.
4. Treat external reviewer output as hypotheses with evidence, not product truth. The owner or downstream planning step decides what to fix.
5. Do not upload private media to third-party services without confirming the target service and data boundary.
6. When using a real browser profile, confirm host/profile/tab and avoid inspecting cookies, passwords, session storage, or unrelated history.
7. If the user wants to watch, run the browser visibly in the foreground and say so. Background browser work is valid only when visibility is not needed.
8. Output packets with `source: "experience-capture"` and `issue_id` prefix `EC-`.
9. If `after_verification.verdict` is `weak_visual_delta`, `still_present`, `regressed`, or `not_evaluable`, do not list that issue as fixed and do not put it in a changelog "fixed" section. Route it back to repair or evidence collection.
10. The AfterCritic role must be tool-separated from the fixer. The critic must not invoke Edit, Write, patch, NotebookEdit, or any command that mutates the working tree, dependencies, migrations, generated docs, assets, or tests. Allowed: read/search/list tools, read-only comparison scripts, and writing only verdict/evidence files into the agreed run folder.
11. Never auto-repair by default. Repair requires explicit user approval, selected issue IDs, or an explicit auto-repair request.
12. Never finish a multi-clip, multi-role, or multimodal review without an owner-facing `owner-review-brief.md` that links clips, screenshots/keyframes, raw reviews, normalized packets, and candidate decisions.

## Workflow

1. Frame the run:
   - project/app/game name
   - journey or scenario
   - reviewer roles
   - success criteria
   - forbidden changes
   - evidence destination

2. Choose capture lane:
   - Read `references/capture-recipes.md` when deciding how to record.
   - Prefer project Playwright/video/trace for repeatable evidence.
   - Accept user-provided videos when automation is unavailable.
   - Use ordered screenshots only when video capture is blocked.

3. Choose reviewer backend:
   - Read `references/reviewer-backends.md` before using Gemini App, Gemini API, Chrome Extension, or a manual reviewer.
   - Read `references/reviewer-baseline.md` when repeated Gemini/Gemini-like reviews need stable taste, role, or project memory.
   - Use Chrome Extension / real-profile browser only when login state, Gems, existing tabs, provider account, or file-upload UI matters.
   - Use API backends when deterministic automation is more important than the user's browser account.

4. Prompt the reviewer:
   - Read `references/reviewer-prompts.md`.
   - Attach or paste the project's per-run context pack even when using a persistent Gem; do not rely only on hidden Gem instructions.
   - Require timestamped findings.
   - Require strict JSON when possible.
   - Ask for at most 5-10 high-signal issues per clip.

5. Normalize and validate:
   - Use `scripts/normalize-review-json.py` for Gemini-like JSON review output.
   - Pass `--adapter <path>` when the project provides an Experience Capture adapter with source hints.
   - Use `scripts/validate-experience-packets.py` before handing packets to another agent.
   - If parsing fails, save the raw response and mark `review_parse_failed`; do not pretend it succeeded.
   - If a packet has `needs_split: true`, follow Compound Issue Recovery before repair. Do not hand compound issues to a coding agent.

6. Handoff:
   - Send static visual obstruction issues to `$screenwalk` if they need crop/bbox confirmation.
   - Send doctrine/business/target-user conflicts to `$goalcascade`.
   - Send validated `fix-now` packets to the coding agent only after evidence is attached.
   - When `recommended_next` is `send-to-screenwalk`, preserve the original `EC-` id. The resulting ScreenWalk issue must include `related_packets: [{ "issue_id": "EC-...", "relation": "originated-from" }]`.
   - Use `scripts/merge-evidence-packets.py` to merge ScreenWalk and Experience Capture packets before owner decision or repair scoping.

7. Owner review brief:
   - Read `references/owner-review-brief.md`.
   - Create `owner-review-brief.md` for multi-clip, multi-role, Gemini/manual reviewer, or cross-skill runs.
   - Include Markdown-rendered keyframes or annotated screenshots near each finding.
   - Use `scripts/annotate-image.py` for numbered boxes when keyframes or screenshots exist.
   - Use `scripts/build-owner-review-brief.py` as a scaffold when packets already exist.
   - Stop before repair if any packet has `needs_split: true` or if the owner has not selected issue IDs.

8. Regression:
   - Re-capture the same short journey after fixes.
   - Compare the same timestamp/action, not just "the app still opens".
   - Mark `after_verification.verdict` as `fixed`, `weak_visual_delta`, `still_present`, `regressed`, or `not_evaluable`.
   - Only `fixed` may move to a fixed list. All other verdicts remain open.

## Packet Contract

Use `references/evidence-schema.md` for the packet shape. Dynamic issues should include:

- `video_paths` or `sequence_paths`
- `timestamp_start` and `timestamp_end`
- `evidence_from_media`
- `recommended_next`
- `source_hints` when likely code/assets/config locations are known

For multi-clip or multi-role runs, also create `owner-review-brief.md` using `references/owner-review-brief.md`. The brief is the owner-facing summary and should include Markdown-rendered screenshots/keyframes or annotated copies.

## Project Adapters

Read `references/project-adapter-spec.md` when a project has its own adapter. A project adapter may define journeys, reviewer roles, capture recipes, forbidden suggestions, source hints, and privacy limits.

## Compound Issue Recovery

Use this only when validation finds `needs_split: true`.

Recommended path:

1. Use `references/reviewer-prompts.md` "Split Compound Issue Prompt" with the original reviewer item.
2. Ask for separate `timeline_issues`, each with one observable phenomenon and one suggested fix.
3. Re-run `scripts/normalize-review-json.py` and `scripts/validate-experience-packets.py`.
4. Continue only after every split packet has `needs_split: false`.

Manual fallback:

1. Split the packet into `EC-xxxA`, `EC-xxxB`, etc.
2. Keep the original timestamp/media evidence.
3. Write `split_from: "EC-xxx"` and `split_decided_by: "owner|reviewer|agent"`.
4. Re-run validation before handoff.

Use `scripts/validate-experience-packets.py --allow-needs-split` only to inspect intermediate output. Do not use that mode for repair handoff.

## Privacy And Risk

Read `references/privacy-and-risk.md` before uploading clips to external services, using real-profile Chrome, or handling account-bound products.

## References

- `references/capture-recipes.md` - read when deciding clip length, slicing, and capture lanes
- `references/reviewer-backends.md` - read before selecting Gemini App, Gemini API, Chrome Extension, manual review, or local-only review
- `references/reviewer-baseline.md` - read when creating or using a persistent Gemini Gem / reviewer baseline for consistent taste
- `references/reviewer-prompts.md` - read before asking a multimodal reviewer to analyze clips
- `references/evidence-schema.md` - read before normalizing or validating packets
- `references/project-adapter-spec.md` - read when a project provides an adapter
- `references/owner-review-brief.md` - read when producing the owner-facing summary, keyframe/annotation brief, or decision queue
- `references/privacy-and-risk.md` - read before external upload or real-profile browser use
