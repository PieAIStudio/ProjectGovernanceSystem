# Gantt Chart

**Keyword:** `gantt`
**Best for:** Project timelines, task scheduling, milestones

## Quick Template
```mermaid
gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    
    section Phase 1
    Task A     :2026-03-01, 5d
    Task B     :after a1, 3d
    
    section Phase 2
    Task C     :2026-03-10, 7d
```

## Date Formats
- `YYYY-MM-DD` - Date
- `YYYY-MM-DD HH:mm` - Date with time
- `2026-03-01` - March 1, 2026

## Dependencies
- `after task_id` - Starts after another task

## Milestones
```mermaid
gantt
    Alpha :milestone, 2026-03-10, 0d
```

## Tips
- Duration: `5d` (days), `3h` (hours)
- Use sections to group tasks
- Milestones use `0d` duration