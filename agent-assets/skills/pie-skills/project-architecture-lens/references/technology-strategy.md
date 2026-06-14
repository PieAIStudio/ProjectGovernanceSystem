# Technology Strategy Research

Use this workflow whenever an audit judges framework currency, dependency
health, upgrade timing, or whether a technology combination fits the target.
Do not treat "latest" as a verdict.

## 1. Classify The Question Before Searching

Classify each audit question:

- **local-only**: the answer depends only on target-repository facts, such as
  whether simulation imports rendering code. Record why external research is
  unnecessary.
- **time-sensitive external**: the answer depends on current releases, support
  policy, security, ecosystem maturity, or known migration problems. Research
  before forming a verdict.
- **mixed**: combine current external evidence with target-specific evidence.

This preserves a research-first posture without adding generic web opinions to
facts that only the repository can answer.

## 2. Build A Currentness Matrix

For each material framework or dependency, record:

| Field | Evidence |
| --- | --- |
| declared version/range | package or build manifest |
| resolved version | lockfile or package-manager output |
| wanted/latest version | authoritative package registry |
| release channel | stable, previous, RC, beta, canary, or experimental |
| support status | current fixes, security-only, EOL, or unknown |
| compatibility chain | peers, runtime/engine requirements, plugins, adapters |
| migration delta | official migration guide and known limitations |
| target proof | tests, build, visual/runtime checks, rollback evidence |

Never compare only the first and third rows. A project can be on an older but
supported release, or on the latest release with an incompatible plugin chain.

## 3. Research Discipline

For every material current claim:

1. Query authoritative registry metadata.
2. Read official release notes, migration guides, and support policy.
3. Cross-check a second source for major recommendations. Prefer maintainer
   issue trackers, ecosystem compatibility matrices, or reputable benchmarks.
4. Record source URL, publication/update date when visible, and access date.
5. Separate stable features from experimental or pre-release features.
6. Stop when additional sources repeat the same evidence.

Search results are leads, not evidence. Read the underlying source before using
it in a finding.

## 4. Judge Upgrade Timing

An upgrade recommendation must answer:

- What target-specific bottleneck, risk, or capability does the upgrade change?
- Is the current version unsupported, security-only, or still supported?
- What breaks across the full compatibility chain?
- What tasks will be interrupted, and is this the right project phase?
- Can the upgrade be isolated from product behavior changes?
- What baseline, regression proof, and rollback path are required?

Choose one posture:

- **upgrade now**: current risk or blocked capability outweighs interruption cost
- **schedule**: justified, but should wait for a named maintenance window or gate
- **observe**: promising but experimental, newly stable, or lacking target value
- **keep as-is**: supported and fit-for-purpose; churn would cost more than it saves

## 5. Judge Stack Composition

Start from the runtime model, not popularity:

- screen-flow application with embedded 3D
- fixed-step simulation/game loop
- content/document pipeline
- server/API product
- library, CLI, or plugin

Then map each layer's ownership. Flag duplicated ownership, missing ownership,
and abstractions that add a coordination layer without removing target
complexity. A framework being capable of the job is not proof that the project
benefits from adopting it.

For every stack swap, include the expected benefit, migration cost, new failure
mode or lock-in, keep-as-is case, and portability exit.

## 6. Protect The Upgrade Boundary

Do not combine a framework upgrade with a product-policy migration, compatibility
retirement, or unrelated refactor unless they cannot be separated. Capture a
green baseline first, change one compatibility boundary at a time, and verify
the behavior that matters to users.

When certainty is limited, name the residual unknown and the cheapest proof that
would reduce it. Do not claim 100% confidence about a changing ecosystem.
