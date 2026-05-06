# Doc-Only Task Routing

Shared routing algorithm for non-runtime projects such as AI media, IP development, research, and asset governance workspaces.

This route does not use Superpowers TDD or Directed Development by default.

## Core Flow

```mermaid
flowchart TD
  A["Task arrives"] --> B["Read project router and current work"]
  B --> C{"What is being changed?"}
  C --> D["canon / durable truth"]
  C --> E["asset / provenance"]
  C --> F["reference / operating guide"]
  C --> G["archive / cleanup"]
  C --> H["review / synthesis"]
  D --> I["Update canonical doc"]
  E --> J["Preserve source and approval trail"]
  F --> K["Update reusable guide"]
  G --> L["Archive or delete stale material"]
  H --> M["Write summary and evidence"]
  I --> N["Run doc-gov checks"]
  J --> N
  K --> N
  L --> N
  M --> N
```

## Rules

- Do not ask whether the task needs TDD unless the project has actual runtime code.
- Do not trigger Directed Development unless the project explicitly opts in.
- Prefer SSOT, provenance, and approval clarity over engineering ceremonies.
- Use AI-in-the-Loop for evidence: inspect source, change one thing, verify the target document or asset path.

## Typical Lanes

- canon truth
- asset intake and promotion
- production/reference guide
- archive and cleanup
- research synthesis

The local project decides exact lane names.
