# Mermaid Quick Reference

## Node Shapes

| Shape | Syntax | Meaning |
|-------|--------|---------|
| Rectangle | `[text]` | Process/step |
| Rounded | `(text)` | Start/end |
| Diamond | `{text}` | Decision |
| Cylinder | `[(text)]` | Database |
| Hexagon | `{{text}}` | Preparation |
| Event | `>[text]` | Trigger |

## Arrows

| Type | Syntax | Meaning |
|------|--------|---------|
| Normal | `-->` | Arrow |
| Dashed | `-- -->` | Dashed |
| Open | `-->>` | Open arrow |
| Thick | `==>` | Thick arrow |

## Labels

| Type | Syntax | Example |
|------|--------|---------|
| Edge label | `-->\|text\|` | `-->|Yes|` |
| Multi-line | `<br/>` | `["Line 1<br/>Line 2"]` |

## Styling

| Type | Syntax |
|------|--------|
| Inline style | `style ID fill:#color` |
| Class def | `classDef name fill:#color` |
| Apply class | `class ID name` |

## Accessibility

```
accTitle: Short title
accDescr: Description
```

## Common Errors

- ❌ Nested quotes: `["text "inner" text"]`
- ❌ Missing quotes in quadrantChart
- ❌ Unicode escapes: `\u5B89`
- ❌ Subgraph with special chars in ID