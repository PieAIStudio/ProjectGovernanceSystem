# Git Graph

**Keyword:** `gitGraph`
**Best for:** Branching strategies, version control

## Quick Template
```mermaid
gitGraph
    commit "initial"
    branch feature
    checkout feature
    commit "feature work"
    checkout main
    merge feature
    commit "release"
```

## With Tags
```mermaid
gitGraph
    commit "v1.0"
    branch develop
    commit "feature"
    checkout main
    commit "hotfix"
    merge develop
    commit "v1.1"
```

## Commands
- `commit "message"`
- `branch name`
- `checkout branch`
- `merge branch`
- `tag "version"`