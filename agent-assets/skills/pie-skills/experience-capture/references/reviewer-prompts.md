# Reviewer Prompts

Use these prompts as starting points. Fill project-specific goals and constraints from the user or project adapter.

When the project uses a persistent Gemini Gem or reviewer baseline, still include the current run packet and schema in the prompt. Read `reviewer-baseline.md` for the baseline-plus-run-packet pattern.

## Three-Reviewer Prompt

```text
You are a three-person review panel:
1. Senior UX/UI designer
2. Game feel or interaction designer
3. Frontend QA engineer

Review the uploaded app/game clip. Only use evidence visible or audible in the media.

Product goal:
- Target user:
- Desired feeling:
- Current concern:
- Technical stack:
- Do not change:

Run packet:
- project:
- run_id:
- clip_id:
- journey_step:
- surface_type:
- known constraints:
- relevant source hint keys:

Return a single JSON object with:
{
  "timeline_issues": [
    {
      "approximate_time": "MM:SS-MM:SS",
      "role": "",
      "severity": "Blocker|High|Medium|Later",
      "issue_type": "",
      "category": "",
      "observation": "",
      "why_it_matters": "",
      "suggested_fix": "",
      "evidence_from_video": ""
    }
  ],
  "top_fixes": [],
  "static_ui_findings": {},
  "dynamic_findings": {},
  "coding_agent_tasks": []
}

Rules:
- One `timeline_issue` must describe exactly one observable phenomenon and one suggested fix.
- If two issues happen at the same timestamp, output two separate `timeline_issues`.
- "X is blocked by Y and the CTA is far away" is two issues, not one.
- Do not merge layout distance, obstruction, copy, feedback, and timing into one issue just because they occur together.

Output strictly a single JSON object. No prose. No markdown fences.
```

## Game-Feel Prompt Add-On

```text
Pay special attention to:
- input response time
- hit / failure / reward feedback
- animation timing
- sound and silence
- transition dead time
- player hesitation or unclear next action
- whether the action feels like a game rather than a form
```

## App UX Prompt Add-On

```text
Pay special attention to:
- first 10 seconds comprehension
- primary CTA discoverability
- form and error recovery
- layout density
- transition feedback
- trust and conversion blockers
- mobile/responsive risk
```

## JSON Repair Prompt

Use when a reviewer returns prose instead of JSON:

```text
Convert your previous answer into one valid JSON object matching the requested schema.
Do not add markdown fences or commentary.
Preserve timestamps and evidence.
```

## Split Compound Issue Prompt

Use when `normalize-review-json.py` marks a packet `needs_split: true`.

```text
You combined multiple observable issues into one timeline_issue. Split the item below into the smallest set of independent timeline_issues.

Rules:
- Each timeline_issue must contain exactly one observable phenomenon and one suggested fix.
- Preserve the original timestamp range unless a split issue clearly needs a narrower range.
- Preserve evidence_from_video, but rewrite it so it supports only that one issue.
- Do not invent new issues that were not present in the original item.
- Output strictly one JSON object with {"timeline_issues": [...]}.
- No prose. No markdown fences.

Original timeline_issue:
<PASTE THE ORIGINAL OBJECT HERE>
```
