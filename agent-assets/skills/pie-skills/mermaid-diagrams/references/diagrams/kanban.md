# Kanban Board

**Keyword:** `kanban`
**Best for:** Work item status, task columns

## Quick Template
```mermaid
kanban
    title Project Board
    todo To Do
    inprogress In Progress
    done Done
    
    todo: Task A
    todo: Task B
    inprogress: Task C
    done: Task D
```

## With Limits
```mermaid
kanban
    todo[To Do: 5]
    doing[In Progress: 3]
    done[Done]
```

## Tips
- Columns = swimlanes
- Items listed under column
- Good for agile workflows