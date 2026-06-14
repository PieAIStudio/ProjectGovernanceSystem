# State Diagram Template

## When to Use
State machines, status transitions, lifecycle flows, workflow automation

## Basic Template
```mermaid
stateDiagram-v2
    accTitle: State Transitions
    accDescr: How an object changes states over time

    [*] --> Idle
    Idle --> Processing: Start
    Processing --> Success: Complete
    Processing --> Failed: Error
    Success --> [*]
    Failed --> Retry: Retry
    Retry --> Processing
```

## With Multiple States
```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Review: Submit
    Review --> Changes: Request changes
    Changes --> Review: Resubmit
    Review --> Approved: Approve
    Approved --> Published: Publish
    Published --> [*]
    
    Review --> Rejected: Reject
    Rejected --> Draft: Edit
```

## With Guards
```mermaid
stateDiagram-v2
    [*] --> Pending
    Pending --> Active: count > 0
    Active --> Paused: count == 0
    Paused --> Active: count > 0
    Active --> Completed: done
    Completed --> [*]
```

## Best Practices
- Use `[*]` for start/end states
- Transition format: `StateA --> StateB: Trigger`
- Guards in square brackets: `StateA --> StateB: Event[condition]`