# Owner Review Brief

Use this reference when a ScreenWalk run spans more than one screen, role, pass, or evidence source, or when the owner asks for a readable summary before repair.

The brief is the owner-facing decision surface. It is not a changelog and not proof that anything was fixed.

## Default Contract

Create `owner-review-brief.md` in the run folder before any repair handoff.

The brief must:

- summarize what was reviewed and what was not reviewed
- group findings by owner decision, not by discovery order
- show the relevant screenshot, crop, or annotated screenshot near the finding
- keep original evidence paths visible so another agent can locate the source
- preserve `related_packets` / `merged_with` so cross-skill findings stay traceable
- mark every recommendation as a candidate until the owner selects it
- separate visual bugs from taste, doctrine, monetization, or phase-goal conflicts

Do not edit product code while producing this brief.

## Suggested Run Folder

```text
artifacts/quality-loop/tmp/<run-id>/
  owner-review-brief.md
  evidence-packets.json
  screenshot-index.md
  screenshots/
  crops/
  annotated/
```

## Required Sections

```markdown
# Owner Review Brief

## 0. Scope
- run_id:
- skill: screenwalk
- mode: review-only | owner-scoped-repair | auto-repair
- screens / journey steps reviewed:
- roles:
- capture limitations:
- project adapter:

## 1. Executive Summary
- strongest pattern:
- biggest blocker:
- safest quick win:
- owner decision needed:

## 2. Top Findings
| Rank | Issue | Severity | Why it matters | Recommended next | Related | Evidence |

## 3. Annotated Evidence
### SW-001 · Short title
![Annotated evidence](/absolute/path/to/annotated/SW-001.png)

Original evidence:
- `/absolute/path/to/original.png`
- `/absolute/path/to/crop.png`

Numbered notes:
1. What the boxed region shows.
2. Why this affects the current journey step.
3. Suggested direction, still pending owner approval.

Owner decision:
- [ ] fix-now
- [ ] needs more evidence
- [ ] defer
- [ ] escalate to goalcascade

## 4. Decision Queue
| Issue ID | Candidate decision | Owner decision | Related packets | Notes |

## 5. Deferred / Escalated
| Issue ID | Reason | Next skill / evidence needed |

## 6. Appendix
- screenshot index
- packet file path
- assumptions
```

## Annotation Rules

Prefer annotated duplicates over editing originals.

- Keep the unmodified original screenshot.
- Put marked-up images under `annotated/`.
- Use simple numbered boxes when arrows would clutter the image.
- In Markdown, place the annotated image first, then explain the numbers below it.
- If annotation tooling is unavailable, include the crop and describe `visual_region`; do not fake a marked image.

Use `scripts/annotate-image.py` when available:

```bash
python3 scripts/annotate-image.py \
  --image /absolute/path/to/source.png \
  --out /absolute/path/to/annotated/SW-001.png \
  --box "1,220,80,360,180,nameplate covers heads"
```

Use `scripts/build-owner-review-brief.py` as a scaffold when packets already exist:

```bash
python3 scripts/build-owner-review-brief.py \
  --packets /absolute/path/to/evidence-packets.json \
  --out /absolute/path/to/owner-review-brief.md \
  --title "Non-Heroes ScreenWalk Owner Review Brief"
```

The scaffold is a starting point. Review it before handing it to the owner.

## Repair Boundary

Only move from this brief to repair when the user explicitly approves issue IDs or explicitly asks for auto-repair.

If the user approves repair, keep the brief as the pre-repair decision record and create a separate repair plan or work item according to the project rules.
