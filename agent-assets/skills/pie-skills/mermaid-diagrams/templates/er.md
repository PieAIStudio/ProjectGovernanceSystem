# ER Diagram Template

## When to Use
Database schemas, entity relationships, data modeling

## Basic Template
```mermaid
erDiagram
    USER ||--o{ ORDER : places
    ORDER ||--|{ LINE_ITEM : contains
    PRODUCT ||--o{ LINE_ITEM : includes

    USER {
        int id PK
        string email UK
        string name
        datetime created_at
    }

    ORDER {
        int id PK
        int user_id FK
        decimal total
        status string
    }
```

## Relationship Types
```mermaid
erDiagram
    A ||--|| B : one-to-one
    A ||--o{ B : one-to-many
    A }o--o{ B : many-to-many
```

## Cardinality Symbols
- `||` - Exactly one
- `o{` - Zero or more (many)
- `}|` - One or more
- `o` - Zero or one

## Best Practices
- PK = Primary Key
- FK = Foreign Key
- UK = Unique Key
- Use meaningful entity names