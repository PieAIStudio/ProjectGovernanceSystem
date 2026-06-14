# Class Diagram

**Keyword:** `classDiagram`
**Best for:** Object-oriented design, class hierarchies

## Quick Template
```mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    
    class Dog {
        +String breed
        +bark()
    }
    
    Animal <|-- Dog
```

## With Interface
```mermaid
classDiagram
    class IPlayer {
        <<interface>>
        +play()
    }
    
    class VideoPlayer {
        +play()
    }
    
    IPlayer <|.. VideoPlayer
```

## Relationships
- `<|--` Inheritance
- `*--` Composition
- `o--` Aggregation
- `-->` Association
- `<|..` Realization

## Tips
- `+` public, `-` private
- `<<interface>>` for interfaces
- Show methods with `()`