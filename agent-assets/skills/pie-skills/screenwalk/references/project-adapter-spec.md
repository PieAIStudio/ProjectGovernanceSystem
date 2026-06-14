# ScreenWalk Project Adapter Spec

Use this when a project supplies a ScreenWalk adapter or needs one.

A project adapter is not a replacement for ScreenWalk. It adds project-specific roles, visible objects, source hints, and auto-fix boundaries.

## Recommended location

Use the project's documentation system. Examples:

- Governed docs: `docs/reference/screenwalk-adapter.md`
- User-provided Project Adapter in the prompt
- Repository-local agent docs when the project has no governed docs

Do not require every project to use the same path. In the report frame, record which adapter was read.

## Required sections

```markdown
# ScreenWalk Adapter

## Frame
- project_id:
- default_surface_type:
- primary_journeys:

## Project roles
| Role | Use when | What it protects | Auto-fix authority |

## Visual obstruction rules
| Object | Must not be blocked by | Category | Recommended next | Source hints |

## Brand / style review
| Concern | Reviewer | Recommended next |

## Source hints
| Surface/object | Hint |

## Auto-fix boundaries
- Green:
- Yellow:
- Red:

## GoalCascade escalation
- Escalate when:
```

## Rules

- Visual obstruction rules can mark objective UI bugs as `fix-now`.
- Brand/style concerns should not become automatic fixes unless the adapter explicitly says so.
- `source_hints` use exactly: `[{ "kind": "code-path|asset|config", "path": "path/to/file[:symbol-or-line-hint]" }]`.
- Project adapters may tighten evidence requirements, but must not allow visual claims without screenshot, crop, bbox, video, explicit user evidence, or `capture_blocked`.
