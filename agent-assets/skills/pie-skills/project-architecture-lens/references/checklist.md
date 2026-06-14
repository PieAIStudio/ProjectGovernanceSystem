# Architecture Lens — Review Axes

Use only the axes relevant to the target. Each prompt produces an *observation*
with evidence, not an instant verdict. These observations are inputs to one
synthesis: the **core structural tension** named in `SKILL.md`. Treat each axis as
evidence for or against a candidate tension, not as a box to fill. Convert
observations into findings using the canonical finding format in
`docs/reference/project-lens/project-audit-protocol-v0.1.md`.

## 1. Product & stage fit

- Does the implementation match the current product goal and stage, or a future
  fantasy of it?
- Is any secondary line (extra platform, premature scale work) stealing attention
  from the main line?
- Is the project building "capability we might need later" before validating
  "the problem worth solving now"?

## 2. Architecture fit

- Are module boundaries obvious to a newcomer, or implicit in the author's head?
- Are stable contracts small, named, and few?
- Are large files/folders genuinely overloaded (tangled responsibilities) or just
  large (one clear job)?
- Would the *next correct change* be easier after a proposed restructuring?
- Is there a single clear entrypoint/seam per concern, or several competing ones?

## 3. Framework & dependency fit

- Read `technology-strategy.md` before judging this axis.
- Record declared, resolved, wanted, and latest versions separately. Is the
  latest version stable, pre-release, or experimental?
- Is the current version still supported? What fixes are backported, and what
  has reached EOL?
- Does the complete compatibility chain support the proposed move: runtime,
  peers, plugins, adapters, build tools, and deployment environment?
- What official migration changes and known limitations affect this target?
- Would the upgrade remove a target-specific bottleneck or risk, or merely make
  the version number newer?
- Which current tasks would the upgrade interrupt? Should the posture be upgrade
  now, schedule, observe, or keep as-is?
- Is the project rebuilding mature third-party capability by hand? Quantify the
  custom surface (files, lines, tests) it costs to maintain.
- Would a mature library remove real complexity — or add lock-in, a new vendor,
  and a new failure mode? Name both sides.
- Is the stack over-dependent on one vendor / model / platform? Is there a
  fallback seam?
- Is a dependency stale, unmaintained, or mismatched to the project's stage?
- Is the *current* stack still a reasonable choice given today's ecosystem, or
  only by inertia? (Inertia can be the right answer — say so explicitly.)
- Does each framework own a clear layer, or do multiple frameworks compete for
  the same state, render loop, routing, data, or build responsibility?
- Does the stack match the runtime model, such as screen-flow app, fixed-step
  game simulation, server/API, library, or document pipeline?

## 4. AI/human maintainability

A project is AI/human-friendly when a capable new agent or human can:

- find the project purpose quickly;
- identify the current focus;
- understand stable boundaries;
- run the right checks;
- avoid touching unrelated surfaces;
- know which docs are canonical;
- tell product truth from old drafts.

Ask:

- Can a new agent find the right entrypoints without owner memory?
- Are instructions specific enough to *reject* a bad move, not just describe a
  good one?
- Are truth sources duplicated (same fact maintained in two places that can
  drift)?
- Are tests and commands discoverable from the entry files?
- Is the project friendly to future AI-assisted refactors (clear seams, real
  tests), or does every change require deep tribal context?

The goal is not prettier structure. The goal is **fewer wrong future changes.**

## 5. Verification & safety

- What checks actually prove the behavior that matters? Run them; record results.
- Is a green check proving what its *name* claims, or something narrower (e.g.
  an "e2e" suite that mocks the backend)? Name the gap.
- Are there missing safety nets that should exist *before* any recommended
  refactor?
- Are manual visual / user-flow checks needed that automation can't cover?
- Could each recommendation be rolled back cleanly?

## Stop / downgrade conditions

Stop or weaken the audit when:

- the target's current goal is unknowable from local truth (ask the owner);
- local evidence is too thin to support a verdict;
- external sources conflict and the choice is genuinely taste-dependent;
- the audit is generating more work than the project can absorb;
- a recommendation would steal focus from a higher-priority project.

When stopped, report the missing input instead of inventing confidence.
