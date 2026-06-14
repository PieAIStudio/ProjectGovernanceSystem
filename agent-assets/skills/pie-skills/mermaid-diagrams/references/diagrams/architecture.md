# Architecture Diagram

**Keyword:** `architecture-beta`
**Best for:** Cloud infrastructure, service topology

## Quick Template
```mermaid
architecture-beta
    cluster cloud[Cloud Provider] {
        service compute[Compute] in cloud
        service storage[Storage] in cloud
        service network[Network] in cloud
    }
    
    compute -[HTTPS]-> storage
    compute -[gRPC]-> network
```

## Syntax
- `cluster` - Groups components
- `service` - Defines component
- `in cluster` - Places in group
- `-[protocol]->` - Connection

## Tips
- Good for cloud architecture
- Shows infrastructure layout