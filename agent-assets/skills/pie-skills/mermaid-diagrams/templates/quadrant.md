# Quadrant Chart Template

## When to Use
Comparison, prioritization, positioning, categorization

## Basic Template (Chinese - MUST quote)
```mermaid
quadrantChart
    title "项目优先级"
    x-axis "低优先级" --> "高优先级"
    y-axis "高成本" --> "低成本"
    quadrant-1 "优先做"
    quadrant-2 "委托做"
    quadrant-3 "最后做"
    quadrant-4 "考虑做"
    项目A: [0.3, 0.8]
    项目B: [0.8, 0.6]
    项目C: [0.2, 0.3]
```

## English Version
```mermaid
quadrantChart
    title "Priority Matrix"
    x-axis "Low Priority" --> "High Priority"
    y-axis "High Effort" --> "Low Effort"
    quadrant-1 "Do First"
    quadrant-2 "Delegate"
    quadrant-3 "Eliminate"
    quadrant-4 "Consider"
    Project A: [0.3, 0.8]
    Project B: [0.8, 0.6]
    Project C: [0.2, 0.3]
```

## CRITICAL Rules
- ALL Chinese text MUST be in double quotes
- Title, axis labels, quadrant labels all need quotes
- No quotes = won't render
- Values are [x, y] coordinates (0-1 scale)