# Complex Examples

This file shows advanced combinations of multiple diagram types.

## Flowchart with Sequence Combo
```mermaid
flowchart TB
    subgraph API
        POST[POST /api] --> VAL{Valid?}
        VAL -->|No| ERR[400 Error]
        VAL -->|Yes| PROC[Process]
    end
    
    PROC --> DB[(Database)]
    
    %% Call sequence for detailed interaction
    note right of PROC
        See sequence.md for
        detailed API flow
    end
```

## Multi-Document Reference

For complex systems, use multiple diagrams:
1. **Architecture:** C4 diagram for system view
2. **API Flow:** Sequence diagram for interactions
3. **Data Model:** ER diagram for database
4. **State Flow:** State diagram for status transitions
5. **Timeline:** For chronological events

## Best Practices
- One diagram per concept
- Reference other diagrams for details
- Keep each diagram focused