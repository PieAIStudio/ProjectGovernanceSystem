# Requirement Diagram

**Keyword:** `requirementDiagram`
**Best for:** Requirements traceability

## Quick Template
```mermaid
requirementDiagram
    
    requirement test_req {
        id: 1
        text: the system does x
        risk: medium
        verifymethod: test
    }
    
    system test_system
    
    test_req - tests-> test_system
```

## Properties
- `id:` Requirement ID
- `text:` Description
- `risk:` low/medium/high
- `verifymethod:` test/manual/analysis

## Relationships
- `req -tests-> system`
- `req -refines-> req`
- `req -copies-> req`