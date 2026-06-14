# Experience Capture Project Adapter Spec

Projects may provide an adapter in their own documentation system. Do not require a universal path.

Recommended locations:

- Governed docs: `docs/reference/experience-capture-adapter.md`
- Repo-local agent docs when the project has no doc system
- User-provided adapter in the prompt

## Suggested Sections

```markdown
# Experience Capture Adapter

## Frame
- project_id:
- default_surface_type:
- artifact_root:
- privacy_boundary:

## Journeys
| Journey | Clip length | Success criteria | Forbidden changes |

## Reviewer roles
| Role | Use when | What it protects | Auto-fix authority |

## Capture recipes
| Scenario | Steps | Evidence output |

## Reviewer backends
| Backend | URL or invocation | Use when | Notes |

## Source hints
| Surface/object/action | Hint |

## Auto-fix boundaries
- Green:
- Yellow:
- Red:

## GoalCascade escalation
- Escalate when:
```

## Rules

- Project adapters may define specific game/app journeys without changing the shared skill.
- Privacy boundaries override convenience. If upload is disallowed, use local evidence and mark reviewer limitations.
- Brand/style concerns should not become automatic fixes unless the adapter explicitly grants that authority.
- Dynamic findings can request ScreenWalk when static crop/bbox proof is needed.
