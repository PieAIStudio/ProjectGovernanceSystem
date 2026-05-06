# AI-in-the-Loop

Shared evidence loop for AI work.

## Core Loop

```mermaid
flowchart LR
  A["Observe"] --> B["Change one small thing"]
  B --> C["Run / refresh / rebuild"]
  C --> D["Collect evidence"]
  D --> E{"Expected?"}
  E -- "yes" --> F["Keep and continue"]
  E -- "no" --> G["Re-diagnose"]
  G --> C
```

## Rules

- Observe before editing.
- Prefer one small change per loop.
- Pick one primary verification lane per loop.
- Re-observe after navigation, reload, state changes, or generated output.
- Do not claim completion without fresh evidence.

## Boundary

This rule owns the evidence loop only. Task classification lives in routing files. Project truth lives in the project docs and runtime.
