# Class Diagram Template

## When to Use
Object-oriented design, class hierarchies, inheritance relationships

## Basic Template
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
    
    class Cat {
        +String color
        +meow()
    }
    
    Animal <|-- Dog
    Animal <|-- Cat
```

## With Interfaces
```mermaid
classDiagram
    class IPlayer {
        <<interface>>
        +play()
        +pause()
    }
    
    class VideoPlayer {
        +String currentVideo
        +play()
        +pause()
        +stop()
    }
    
    IPlayer <|.. VideoPlayer
```

## Relationship Types
- `<|--` Inheritance
- `<|--` Extension
- `*--` Composition (strong ownership)
- `o--` Aggregation (weak ownership)
- `-->` Association
- `--` Link

## Best Practices
- Use `+` for public, `-` for private
- `<<interface>>` for interfaces
- Show methods with parentheses `()`