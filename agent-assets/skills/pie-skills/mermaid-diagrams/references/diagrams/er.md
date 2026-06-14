# ER Diagram

**Keyword:** `erDiagram`
**Best for:** Database schemas, entity relationships

## Quick Template
```mermaid
erDiagram
    USER ||--o{ ORDER : places
    ORDER ||--|{ ITEM : contains
    
    USER {
        int id PK
        string email
        string name
    }
    
    ORDER {
        int id PK
        int user_id FK
        decimal total
    }
```

## Relationship Types
- `||--||` One to one
- `||--o{` One to many
- `}o--o{` Many to many

## Cardinality
- `||` Exactly one
- `o{` Zero or more
- `}|` One or more
- `o` Zero or one

## Tips
- PK = Primary Key
- FK = Foreign Key
- UK = Unique Key