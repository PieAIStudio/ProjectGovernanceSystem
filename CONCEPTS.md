# Concepts

Shared domain vocabulary for this project - entities, named processes, and
status concepts with project-specific meaning. Seeded with core domain
vocabulary, then accretes as ce-compound and ce-compound-refresh process
learnings; direct edits are fine. Glossary only, not a spec or catch-all.

## Portfolio Governance

### Project Governance System
The reusable public execution engine for documentation governance, agent routing,
asset distribution, portfolio checks, and workflow integration profiles.

### Portfolio Manifest
A user- or organization-owned dispatch sheet that lists target repositories PGS
may inspect, plan for, or verify.

The manifest may also name a control plane or execution engine, but those are
metadata unless explicitly selected as targets.

### Portfolio Doctor
The read-only fleet gate that compares a Portfolio Manifest with installed PGS
packages, target-local checks, managed assets, Git evidence, and optional host
tooling without updating any of them.

### Control Plane
A private coordination repository that may hold product strategy, portfolio
configuration, or status reporting outside the public PGS package.

### Target Repository
A repository listed under a portfolio manifest's `targets` array and therefore
eligible for default PGS inspection, planning, and synchronization.

## Workflow Gates

### Host Hook
A host-specific configuration entry that invokes PGS at a lifecycle event in an
AI coding environment.

### Compound Gate
The post-work decision point where an engineering agent either records reusable
learning with Compound Engineering or reports why there is nothing durable to
capture.

### Trusted Publishing
The npm release path where GitHub Actions publishes package versions through
short-lived identity instead of a long-lived local npm token.
