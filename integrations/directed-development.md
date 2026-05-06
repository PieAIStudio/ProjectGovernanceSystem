# Directed Development Integration

Directed Development is an optional workflow for mixed, cross-domain, interdependent product work.

It is not the default for every task.

## Boundary

Directed Development may define:

- ordered DD Blocks
- dependencies between Blocks
- BDD-style acceptance scenarios
- verification gates

Directed Development must not define:

- artifact locations
- project document paths
- project lane names
- runtime truth

Those remain owned by the project and doc-gov.

## Trigger

Use Directed Development only when all are true:

- the task is product work
- it crosses local lanes or shared contracts
- sequencing risk makes a flat plan unsafe

Doc-only projects do not use Directed Development unless explicitly opted in.
