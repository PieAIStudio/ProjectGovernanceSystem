# Owner Review Brief

Use this reference when an Experience Capture run reviews multiple clips, reviewer roles, Gemini/Gemini-like outputs, Playwright recordings, traces, or ordered screenshots.

The brief turns scattered dynamic evidence into an owner-readable decision packet. It does not authorize repair by itself.

## Default Contract

Create `owner-review-brief.md` in the run folder before repair handoff.

The brief must:

- list every reviewed clip, trace, or screenshot sequence
- include representative screenshots or keyframes near the finding
- preserve links to raw reviewer output and normalized packets
- preserve `related_packets` / `merged_with` so ScreenWalk-routed issues remain traceable
- show timestamps for dynamic issues
- distinguish reviewer hypotheses from owner-approved decisions
- identify packets that need ScreenWalk crop/bbox confirmation
- stop before repair if any packet has `needs_split: true`

Do not edit product code while producing this brief.

## Suggested Run Folder

```text
artifacts/quality-loop/tmp/<run-id>/
  owner-review-brief.md
  experience-packets.json
  screenshot-index.md
  clips/
  screenshots/
  keyframes/
  annotated/
  review-prompts/
  raw-reviews/
  normalized/
```

## Required Sections

```markdown
# Owner Review Brief

## 0. Scope
- run_id:
- skill: experience-capture
- mode: review-only | owner-scoped-repair | auto-repair
- capture backend:
- reviewer backend:
- clips reviewed:
- roles:
- limitations:

## 1. Executive Summary
- strongest dynamic pattern:
- biggest blocker:
- safest quick win:
- needs ScreenWalk confirmation:
- owner decision needed:

## 2. Clip Index
| Clip | Journey step | Duration | Reviewer roles | Raw review | Normalized packets |

## 3. Top Findings
| Rank | Issue | Timestamp | Severity | Why it matters | Recommended next | Related | Evidence |

## 4. Annotated / Keyframe Evidence
### EC-001 · Short title
Timestamp: `00:08-00:11`

![Keyframe or annotation](/absolute/path/to/annotated/EC-001.png)

Media:
- `/absolute/path/to/clip.webm`
- `/absolute/path/to/keyframe.png`

Numbered notes:
1. What happens in the clip at this moment.
2. Why the timing, feedback, sound, or state transition matters.
3. Suggested direction, still pending owner approval.

Owner decision:
- [ ] fix-now
- [ ] send-to-screenwalk
- [ ] needs more evidence
- [ ] defer
- [ ] escalate to goalcascade

## 5. Split / Validation Queue
| Packet | Problem | Required recovery |

## 6. Decision Queue
| Issue ID | Candidate decision | Owner decision | Related packets | Notes |

## 7. Appendix
- raw reviewer output paths
- normalized packet paths
- assumptions
```

## Annotation And Keyframe Rules

- Keep the original video or trace untouched.
- Extract or capture representative keyframes for findings whenever possible.
- Put marked-up images under `annotated/`.
- Use numbered boxes for visual/timing moments; explain the numbers below the image.
- If no keyframe can be extracted, link the clip and timestamp; do not fake image evidence.

Use `scripts/annotate-image.py` when available:

```bash
python3 scripts/annotate-image.py \
  --image /absolute/path/to/keyframes/EC-001.png \
  --out /absolute/path/to/annotated/EC-001.png \
  --box "1,120,340,240,80,button responds late"
```

Use `scripts/build-owner-review-brief.py` as a scaffold when packets already exist:

```bash
python3 scripts/build-owner-review-brief.py \
  --packets /absolute/path/to/experience-packets.json \
  --out /absolute/path/to/owner-review-brief.md \
  --title "Experience Capture Owner Review Brief"
```

The scaffold is a starting point. Review it before handing it to the owner.

## Repair Boundary

Only move from this brief to repair when the user explicitly approves issue IDs or explicitly asks for auto-repair.

If an issue needs static crop/bbox confirmation, route it to ScreenWalk and preserve `related_packets`.
