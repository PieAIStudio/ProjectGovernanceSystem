# Gantt Chart Template

## When to Use
Project timelines, task scheduling, milestone tracking

## Basic Template
```mermaid
gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    
    section Phase 1
    Task A           :a1, 2026-03-01, 5d
    Task B           :after a1, 3d
    
    section Phase 2
    Task C           :2026-03-10, 7d
    Task D           :2026-03-15, 5d
```

## With Dependencies
```mermaid
gantt
    title Project with Dependencies
    dateFormat YYYY-MM-DD
    
    section Development
    Design         :des1, 2026-03-01, 5d
    Implementation :after des1, 10d
    Testing        :after des1, 7d
    
    section Deployment
    Staging        :after Implementation, 3d
    Production     :after Staging, 2d
```

## With Milestones
```mermaid
gantt
    title Project with Milestones
    dateFormat YYYY-MM-DD
    
    section Tasks
    Phase 1    :2026-03-01, 10d
    Phase 2    :2026-03-11, 10d
    
    section Milestones
    Alpha      :milestone, 2026-03-10, 0d
    Beta       :milestone, 2026-03-20, 0d
    Launch     :milestone, 2026-03-25, 0d
```

## Best Practices
- Use `dateFormat YYYY-MM-DD` or `HH:mm`
- Dependencies: `after task_id`
- Duration: `Nd` (days), `Nh` (hours)
- Milestones: `milestone, date, 0d`