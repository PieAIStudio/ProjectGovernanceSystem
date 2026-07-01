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
  - REF-PORTFOLIO-TECHNOLOGY-GOVERNANCE
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

## 0.5 Read-Only Boundary

When the owner asks for a "read-only project audit", read-only applies to the
target repository being audited. It does not forbid creating or updating the
PGS audit package under the PGS repository or another owner-approved audit
output directory.

Do not treat a clean target worktree as proof that the audit is complete. The
audit is complete only when the audit package exists, all required raw artifacts
are complete, and `pro-gov lens audit check` passes.

Beginner version: the target repository is the patient. The PGS audit package is
the medical chart. A read-only exam must not operate on the patient, but it
still has to write the chart.

## 0.6 Agent Coordination

For ProjectLens plus Ponytail audits, ProjectLens uses separate passes to
isolate viewpoints and preserve strong external judgment. Use real subagents
when the AI host exposes them and the user has authorized subagent or parallel
agent work. Their raw outputs stay separate so later readers can see which
judgment came from which method.

Recommended shape:

- The main agent owns intake, target state, the audit package, and final
  adjudication.
- An architecture lens subagent inspects project shape, module boundaries,
  maintainability, verification, and project/stage fit.
- A technology research subagent inspects dependency currency, framework support,
  upgrade timing, and stack composition when those questions are material.
- A Ponytail reviewer may inspect the same evidence and produce an independent
  simplicity, YAGNI, dependency, abstraction, and rewrite critique. It may
  challenge ProjectLens assumptions, reject overbuilt recommendations, propose a
  smaller path, or argue for keep-as-is.

If subagents are unavailable or not authorized by the host rules, do not fake
that they were used. Run the passes serially, preserve raw artifacts by producer,
and record the fallback reason in `manifest.md` under `Agent execution record:`.
Every audit package must also include `Subagent trace:` in `manifest.md`. Record
each pass role, whether it used a real subagent or serial fallback, final status,
and the raw artifact path it produced. If the host does not expose durable
subagent IDs, say that explicitly instead of inventing IDs.

Do not merge raw outputs into one blended evidence file. The main agent must
preserve raw artifacts by producer, then write a synthesis layer that adjudicates
conflicts, removes duplicate or low-evidence work from recommendations, and caps
high-priority findings at three by default.

## 0.7 Fresh vs Reuse

Keep this distinction simple:

- `fresh` means this session creates the raw ProjectLens/Ponytail passes.
- `reuse` means this session verifies and summarizes an existing audit package.

If the owner asks for a fresh audit, do not reuse an old audit package as if it
were new work. Record `Audit run mode: fresh`, `Current session id:`, and
`Fresh run evidence:` in `manifest.md`, then verify with:

```bash
pro-gov lens audit check --dir audits/<target>/<date> --mode fresh
```

If the target commit has not changed and an existing audit package is still
valid, a reuse pass is allowed, but call it a reuse verification. Record `Audit
run mode: reuse`, `Reuse source audit:`, `Reuse justification:`, and `No new
subagents were run:` in `manifest.md`, then verify with:

```bash
pro-gov lens audit check --dir audits/<target>/<date> --mode reuse
```

## 1. Local Context Scan

Read the target project's startup and truth files first:

- `AGENTS.md`, `CLAUDE.md`, or equivalent active AI entry/config files
- root `README.md`
- package/config files
- docs/governance or docs/policy, if present
- project or portfolio technology direction/shared rules, if present
- `docs/reference/portfolio-technology-governance.md` when the audit is run
  from PGS and stack, dependency, version, or refactor governance is material
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

- If the target links to a product-line technology direction, use it as the
  desired direction for that product group. Do not replace it with generic taste.
  The target's package files and runtime config still prove the current
  installed state. PGS owns the classification method: aligned,
  acceptable-exception, observe, scheduled-migration, urgent-drift, or
  bad-standard.
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

## 6. Audit Package Shape

For any owner request that explicitly names Project Lens, Ponytail, or
"Project Lens + Ponytail", create a raw-first audit package under
`audits/<target>/<date>/`. A chat-only final answer is not a complete
ProjectLens plus Ponytail audit.

For ad-hoc small audits that do not name Project Lens or Ponytail, a single
audit brief is acceptable. Do not use that exception for the combined workflow.

```bash
pro-gov lens audit init --target /path/to/project --out audits/<target>/<date>
```

The package contract is `audit.contract.json`. The required artifacts are:

1. `manifest.md`: target path, target state, owner goal, audit scope, and known
   limits.
2. `raw/project-lens/architecture-lens.md`: ProjectLens architecture findings.
3. `raw/project-lens/truth-surface-audit.md`: startup files, docs, current work,
   and AI/human maintainability evidence.
4. `raw/project-lens/technology-strategy.md`: stack, dependency, support, and
   upgrade posture evidence when material.
5. `raw/ponytail/ponytail-audit.md`: whole-repo Ponytail over-engineering audit.
6. `raw/ponytail/ponytail-debt.md`: Ponytail debt ledger, if comments or
   deliberate shortcuts exist.
7. `raw/ponytail/ponytail-gain.md`: Ponytail measured impact or deletion
   opportunity summary.
8. `raw/target/target-state.md`: git state, branch, commit, and worktree notes.
9. `raw/target/commands.md`: commands run and results.
10. `raw/target/sources.md`: local files, external sources, access dates, and
    freshness limits.
11. `synthesis/decision-index.md`: owner-facing decisions, conflicts, and which
    judgment won.
12. `synthesis/handoff-for-implementation-ai.md`: concrete follow-up task pack
    for a later implementation session.

Before presenting the audit as complete, run:

```bash
pro-gov lens audit check --dir audits/<target>/<date>
```

`audit check` fails when required artifacts are missing, still marked pending,
still contain the generated template body, or omit required method records. This
is a completion gate, not a style suggestion.

Required method records:

- `manifest.md`: `Agent execution record:` states whether separate subagents or
  one main agent produced the raw passes; `Subagent trace:` records each pass
  role, execution mode, final status, and raw artifact path.
- For fresh-run validation, `manifest.md` also records `Audit run mode: fresh`,
  `Current session id:`, and `Fresh run evidence:`.
- For reuse validation, `manifest.md` also records `Audit run mode: reuse`,
  `Reuse source audit:`, `Reuse justification:`, and
  `No new subagents were run:`.
- `raw/target/commands.md`: `Project Lens method source:` and
  `Ponytail method source:` name the skills, modes, commands, or manual method
  used.
- `synthesis/decision-index.md`: `Target repository final status:` and
  `Audit package final status:` record both final states for the owner.

Raw files are source-of-record. The synthesis files may quote, summarize, or
reject raw findings, but must not erase material disagreement between
ProjectLens and Ponytail.

The decision index should include:

1. Executive summary.
2. Target project model.
3. What is already working.
4. Top findings.
5. Keep-as-is recommendations.
6. Suggested task pack, if owner wants action.
7. Questions for the owner.
8. Conflict log: ProjectLens judgment, Ponytail judgment, final decision, and
   why.

The implementation handoff should include only:

1. Changes to consider now.
2. Changes to delay or reject.
3. Verification gates before and after implementation.
4. Owner decisions still needed.

The target/source artifacts should record:

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
