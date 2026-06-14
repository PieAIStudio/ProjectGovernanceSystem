# Sequence Diagram Template

## When to Use
API interactions, service communication, temporal ordering of events

## Basic Template
```mermaid
sequenceDiagram
    accTitle: Interaction Flow
    accDescr: How two systems communicate step by step

    participant User as User
    participant API as API Server
    participant DB as Database

    User->>API: Request action
    API->>DB: Query data
    DB-->>API: Return results
    API-->>User: Response
```

## With Conditional Logic
```mermaid
sequenceDiagram
    participant A as Client
    participant B as Server

    A->>B: Login request
    alt Valid credentials
        B-->>A: 200 OK + Token
        A->>B: API request with token
        B-->>A: Data response
    else Invalid credentials
        B-->>A: 401 Unauthorized
    end
```

## With Loops
```mermaid
sequenceDiagram
    participant Client
    participant Server

    Client->>Server: Fetch page
    loop Retry 3 times
        Server-->>Client: Response
        alt Success
            Client->>Server: Acknowledge
        end
    end
```

## Best Practices
- Actors across top, time flows down
- Use solid arrow for sync, open arrow for async
- Dashed arrows for return messages