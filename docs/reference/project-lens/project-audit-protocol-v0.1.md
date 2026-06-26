---
id: SPEC-PROJECT-AUDIT-PROTOCOL-V0-1
title: Project Audit Protocol v0.1
type: reference
status: stable
canonical: true
owner: project
created: 2026-06-09
last_reviewed: 2026-06-09
domain: audit
tags:
  - projectlens
  - audit
  - protocol
pinned: true
related:
  - GOV-AGENTS-ROUTING-DOC-ONLY-V0-9
---

# Project Audit Protocol v0.1

This reference was absorbed from ProjectLens as reusable audit protocol
material. It is not a Project Governance System active implementation spec.

This protocol turns a target repository into an owner-facing audit brief.

It is not ordinary code review. It studies whether the whole project shape fits
the current goal, the current AI-assisted development era, and available mature
tools.

## 0. Intake

Before inspecting deeply, establish:

- target project path
- owner goal for the project
- current phase
- target users and non-target users, if known
- what must not be changed
- what kind of output the owner wants: audit brief, decision packet, or task pack

If this information is missing and cannot be inferred from local project truth,
ask the owner before producing strong recommendations.

When the owner provides only a short request such as "audit this project", state
which assumptions were inferred from the target repository and which facts were
explicit owner input.

## 1. Local Context Scan

Read the target project's startup and truth files first:

- `AGENTS.md`, `CLAUDE.md`, or equivalent active AI entry/config files
- root `README.md`
- package/config files
- docs/governance or docs/policy, if present
- current plan, roadmap, issues, or status files
- test/build scripts
- core source entrypoints

Measure:

- top-level folder shape
- large files and overloaded folders
- dependency set
- test/build commands
- git churn and recent hotspots
- obvious generated or stale surfaces

## 2. Project Model

Summarize the target project in plain language:

- product role
- current phase goal
- stable contracts
- main technical stack
- main runtime or content pipeline
- likely future maintainers: human, AI agent, or both

Then identify the core tension. Examples:

- product ambition is larger than architecture clarity
- custom logic is replacing a mature framework
- docs hide current truth instead of exposing it
- AI agents need too much implicit owner memory to work safely
- tests do not protect the behavior that matters

## 3. Review Axes

Use only the axes relevant to the target project.

### Product And Phase Fit

- Does the implementation fit the current product goal?
- Is the project optimizing for the current phase or a future fantasy?
- Is any support line stealing attention from the main line?

### Architecture Fit

- Are boundaries obvious?
- Are stable contracts small and named?
- Are large files or folders actually overloaded, or merely large?
- Would the next correct change be easier after a proposed change?

### Framework And Dependency Fit

- Is the project rebuilding mature third-party capability?
- Would a mature library reduce real complexity, or add new lock-in?
- Does the current stack still fit modern best practice?
- Is the project overly dependent on one vendor, model, framework, or platform?
- Are material dependencies current, supported, security-only, EOL, or
  experimental?
- Does the complete compatibility chain support an upgrade?
- Would an upgrade solve a target-specific problem, and is this the right phase
  to interrupt current work?
- Does each framework own a clear layer, or does the combination create
  competing responsibility?

### AI/Human Maintainability

- Can a new capable agent find the right entrypoints?
- Are instructions specific enough to reject bad moves?
- Are truth sources duplicated?
- Are tests and commands discoverable?
- Is the project friendly to future AI-assisted refactors?

### Documentation Governance

- Is there one canonical source for durable facts?
- Are old docs competing with current truth?
- Are raw notes, product artifacts, and governed docs separated?
- Does the target project need a lighter or stronger governance layer?

### Verification And Safety

- What checks prove important behavior?
- Are there missing safety nets before refactor?
- Are manual visual or user-flow checks needed?
- Could the recommendation be rolled back?

## 4. External Research

Classify each audit question before forming a verdict:

- **local-only**: answer from target-repository evidence; record why external
  research is unnecessary
- **time-sensitive external**: current release, support, security, ecosystem, or
  best-practice claim; research before judging
- **mixed**: combine current external evidence with target-specific evidence

Use authoritative registry metadata plus official release notes, migration
guides, and support policy for material technology claims. Cross-check at least
one additional maintainer, ecosystem, benchmark, or issue source for major
recommendations when feasible. Record source URLs and access dates.

Search results are leads, not evidence. Read the underlying source before using
it. Do not force generic web research into local-only questions; doing so adds
noise without increasing confidence.

Do not recommend a tool only because it is popular. Name:

- what it replaces
- what complexity it removes
- what new dependency it creates
- what fallback exists if it fails

For upgrade findings, also name:

- declared, resolved, wanted, and latest versions
- stable/pre-release/experimental channel
- current support status
- full compatibility chain and known migration limitations
- interruption cost and safest named upgrade window
- posture: upgrade now, schedule, observe, or keep as-is

## 5. Finding Format

Each finding should use this structure:

```markdown
## Finding: short title

- priority: P0 | P1 | P2 | observe
- confidence: high | medium | low
- evidence:
- why it matters:
- recommended move:
- keep-as-is alternative:
- cost:
- risk:
- portability exit:
- owner decision needed:
```

High-priority findings are capped at three by default.

## 6. Final Report Shape

For small audits, a single audit brief is acceptable. For large audits or any
audit likely to create cognitive load, use a three-file bundle under
`audits/<target>/<date>/`:

1. `owner-brief.md`: one-page decision summary for the owner.
2. `audit-brief.md`: full findings, reasoning, and recommendations.
3. `evidence-log.md`: commands, files, external sources, and methods that
   materially influenced the audit.

The full audit brief should include:

1. Executive summary.
2. Target project model.
3. What is already working.
4. Top findings.
5. Keep-as-is recommendations.
6. Suggested task pack, if owner wants action.
7. Questions for the owner.
8. Appendix with raw observations.

The owner brief should include only:

1. Bottom-line judgment.
2. The top three decisions or actions.
3. What should stay unchanged.
4. Any blocker that prevents stronger confidence.

The evidence log should record:

- target commit or state inspected
- local files or folders that supplied key evidence
- verification commands and results
- research classification for material questions
- currentness and compatibility matrices for technology-strategy findings
- external sources used for current claims
- source access dates and known freshness limits
- skills, prompts, MCP tools, or methods that materially shaped judgment
- known limits of the evidence

## 7. Stop Conditions

Stop or downgrade the audit when:

- the target project's current goal is unknowable
- local evidence is too thin
- external sources contradict each other and the choice is taste-dependent
- the audit is producing more work than the project can absorb
- the recommendation would steal focus from a higher-priority project

When stopped, report the missing input instead of inventing confidence.
