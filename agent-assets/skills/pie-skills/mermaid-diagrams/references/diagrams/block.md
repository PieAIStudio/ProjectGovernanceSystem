# Block Diagram

**Keyword:** `block`
**Best for:** Component layout, spatial arrangement

## Quick Template
```mermaid
block-beta
    columns 3
    
    db[("Database")]
    api[API]
    ui[UI]
    
    db --> api
    api --> ui
```

## With Labels
```mermaid
block-beta
    columns 2
    
    left: "Input"
    right: "Output"
    center: "Processing"
    
    left --> center
    center --> right
```

## Tips
- `columns N` sets layout
- Use `["Label"]` for text