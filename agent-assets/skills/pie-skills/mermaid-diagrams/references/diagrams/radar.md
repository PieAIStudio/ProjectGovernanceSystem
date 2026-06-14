# Radar Chart

**Keyword:** `radar-beta`
**Best for:** Multi-dimensional comparisons, skills assessment

## Quick Template
```mermaid
radar-beta
    title Skills Assessment
    axis coding, design, communication, leadership
    curve A: [4, 3, 5, 2]
    curve B: [2, 5, 3, 4]
    max 5
```

## Syntax
- `axis id["Label"]` - Define axes
- `curve id["Name"]{val1, val2, ...}` - Data series
- `max N` - Scale max

## ⚠️ Note
Does NOT support accTitle/accDescr. Use italic paragraph above for accessibility.

## Tips
- 5-8 axes optimal
- 2-4 curves for readability