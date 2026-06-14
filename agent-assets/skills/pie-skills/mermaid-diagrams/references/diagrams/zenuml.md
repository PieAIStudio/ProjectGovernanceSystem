# ZenUML

**Keyword:** `zenuml`
**Best for:** Code-style sequence diagrams

## ⚠️ Note
Requires external plugin. May not render on GitHub. Prefer standard `sequenceDiagram`.

## Quick Template
```mermaid
zenuml
    title Authentication Flow
    
    participant User
    participant Auth
    participant DB
    
    User->Auth: Login
    Auth->DB: Verify
    alt Success
        DB-->>Auth: User data
        Auth-->>User: Token
    else Failure
        Auth-->>User: Error
    end
```

## When to Use
- Complex code flow
- Full control over sequence

## Better Alternative
Use standard `sequenceDiagram` instead