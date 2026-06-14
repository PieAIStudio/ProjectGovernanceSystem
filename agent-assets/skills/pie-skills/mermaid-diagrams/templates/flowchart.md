# Flowchart Template

## When to Use
Process flows, decision trees, workflows with branches

## Template
```mermaid
flowchart TB
    accTitle: Your Title Here
    accDescr: One or two sentences explaining what this diagram shows

    start([🏁 Start]) --> step1[⚙️ First action]
    step1 --> decision{🔍 Check condition?}
    decision -->|Yes| success[✅ Positive path]
    decision -->|No| fallback[🔧 Alternative path]
    success --> done([🏁 Complete])
    fallback --> done

    classDef success fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d
    class success success
```

## Common Variations

### With Subgraphs
```mermaid
flowchart LR
    trigger([⚡ Trigger])
    
    subgraph phase1 ["📦 Phase 1"]
        a1[Task A] --> a2[Task B]
    end
    
    subgraph phase2 ["🚀 Phase 2"]
        b1[Task C] --> b2[Task D]
    end
    
    phase1 --> phase2
    phase2 --> done([✅ Done])
```

### Decision Tree
```mermaid
flowchart TD
    start([Start]) --> input{User input?}
    input -->|Valid| process[Process]
    input -->|Invalid| error[Show error]
    process --> check{Check result?}
    check -->|Pass| success[✅ Success]
    check -->|Fail| retry[🔄 Retry]
    retry --> process
    success --> end([End])
```

## Best Practices
- Use TB (top-bottom) for processes, LR (left-right) for pipelines
- Max 10 nodes per diagram
- Max 3 decision points
- Edge labels 1-4 words