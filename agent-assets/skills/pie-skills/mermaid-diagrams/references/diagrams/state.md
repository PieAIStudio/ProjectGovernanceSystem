# State Diagram

**Keyword:** `stateDiagram-v2`
**Best for:** State machines, status transitions, lifecycle flows

## Quick Template
```mermaid
stateDiagram-v2
    accTitle: Title
    accDescr: Description
    
    [*] --> Idle
    Idle --> Processing: Start
    Processing --> Success: Complete
    Processing --> Failed: Error
    Success --> [*]
    Failed --> Retry: Retry
    Retry --> Processing
```

## States
```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Review: Submit
    Review --> Published: Approve
    Published --> [*]
```

## With Guards
```mermaid
stateDiagram-v2
    Pending --> Active: count > 0
    Active --> Paused: count == 0
```

## Tips
- `[*]` for start/end states
- Use `: Event` for transitions
- Guards in `[condition]`