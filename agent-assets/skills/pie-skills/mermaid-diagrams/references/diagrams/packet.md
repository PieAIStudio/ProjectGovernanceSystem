# Packet Diagram

**Keyword:** `packet`
**Best for:** Binary protocol, data format

## Quick Template
```mermaid
packet
    0-15: Header (16 bits)
    16-31: Source (16 bits)
    32-63: Data (32 bits)
    64-79: CRC (16 bits)
```

## Syntax
- `start-end: Field name (size)`
- Shows data structure

## Tips
- Good for network protocols
- Shows bit/byte layout