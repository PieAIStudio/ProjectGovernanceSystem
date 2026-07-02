---
id: REF-PORTFOLIO-TECHNOLOGY-GOVERNANCE
title: Portfolio Technology Governance
type: reference
status: active
canonical: true
owner: project
created: 2026-07-01
last_reviewed: 2026-07-02
domain: portfolio-governance
tags:
  - portfolio
  - technology-governance
  - project-lens
  - dependency-governance
pinned: true
related:
  - SPEC-0005
  - SPEC-PROJECT-AUDIT-PROTOCOL-V0-1
  - REF-DOWNSTREAM-PROJECT-REGISTRY
---

# Portfolio Technology Governance

This reference defines how Project Governance System handles technology-stack,
dependency, version, and refactor governance across a portfolio.

Beginner version: a strategy document can say which city the convoy should
drive toward. PGS is the mechanic and traffic inspector. Each target repository
is the actual vehicle, so its engine, fuel, and dashboard prove what is really
installed today.

## Boundary

PGS owns the execution protocol for technical governance:

- how to inspect target repositories;
- how to compare strategic technology direction with installed reality;
- how to classify dependency and version drift;
- how to decide whether an upgrade should happen now, later, or not at all;
- how to preserve audit evidence and implementation handoff material.

PGS does not own private product strategy:

- no public PGS package may require a private control-plane repository;
- no public PGS package may hardcode a private project list, local machine path,
  product roadmap, product positioning, or marketing canon;
- a private control plane may provide portfolio configuration and strategy
  sources through explicit config paths.

## Where Configuration Lives

Reusable technical governance belongs in PGS: profiles, audit protocols,
portfolio manifest schema, dependency/version classification, and validation
commands. A private control plane may discuss or propose those changes, but the
repeatable execution rule should land back in PGS before downstream projects
depend on it.

Instance-specific configuration belongs outside the public package:

| Need | Home |
| --- | --- |
| Generic inspection protocol, profiles, package commands, audit output contract | PGS |
| A user's private target list and per-target bundle choices | That user's portfolio manifest |
| Product direction, marketing direction, or roadmap strategy | The user's control plane, if one exists |
| Installed versions, scripts, runtime facts, CI behavior | The target repository |

Beginner version: PGS is the reusable machine and instruction manual. A control
plane can hand the machine a job ticket. The machine should not have one
customer's job ticket welded inside it.

## Truth Layers

Use these layers when facts conflict:

| Question | Truth layer |
| --- | --- |
| What does the product group want to converge toward? | Strategy or technology-direction canon in the control plane, if one exists. |
| What is actually installed and running today? | Target repository code, package manifests, lockfiles, runtime config, CI, and deployment evidence. |
| How should an AI inspect, classify, and recommend technical changes? | PGS protocols, Project Lens, asset checks, portfolio commands, and audit packages. |
| What should be changed next? | A PGS audit or target-repository plan that cites evidence and owner intent. |

Do not let a strategy canon replace runtime evidence. Do not let a lockfile
silently become product direction. They answer different questions.

## Technology Direction Versus Technical Execution

Technology direction may say:

- this product group is Web-first;
- content sites default to one profile and interactive products to another;
- a shared package is the preferred entry point for a capability;
- a framework is allowed, discouraged, or exceptional;
- portability exits must be preserved.

Technical execution governance decides:

- whether a target repository currently follows that direction;
- whether a version is current, supported, security-only, experimental, or
  end-of-life;
- whether a dependency upgrade has compatible peer dependencies;
- whether a migration helps the current product phase;
- which tests, screenshots, type checks, or manual gates prove the change;
- whether a recommendation should become now, later, observe, exception, or
  reject.

## Audit Classification

When Project Lens or another PGS audit reviews a technology stack, classify each
material difference as one of:

| Classification | Meaning |
| --- | --- |
| `aligned` | Current implementation matches the intended direction well enough. |
| `acceptable-exception` | Current implementation differs, but evidence justifies keeping it. |
| `observe` | Difference exists, but there is no product reason to act now. |
| `scheduled-migration` | Migration is useful, but belongs in a named future work slice. |
| `urgent-drift` | Difference creates safety, support, security, or delivery risk now. |
| `bad-standard` | The supposed standard is wrong or overbroad and should be challenged. |

Do not recommend a migration only because a dependency name or version looks
tidier. A good recommendation must explain user value, risk reduction, or
maintenance relief.

## Portfolio Control Plane Contract

If a portfolio has a private control plane, it may point PGS at technology
direction sources. PGS should treat those sources as input, not as hardcoded
dependencies.

A control-plane strategy source should stay short and directional. It should not
duplicate every target package version or every target implementation detail.

PGS audit output should flow back as evidence:

```text
control plane strategy -> PGS audit -> target repository plan/change
target repository evidence -> PGS audit package -> control plane status
```

`controlPlane` and `executionEngine` entries in a portfolio manifest are
metadata. They help humans and automation find the coordination repository and
the PGS runner, but they are not default downstream targets. Bulk upgrade,
asset planning, and target verification should operate on `targets` unless the
operator deliberately names another repository.

Beginner version: the control plane is the office, PGS is the inspection tool,
and `targets` are the buildings being inspected. Do not renovate the office just
because the inspection sheet lists it.

## Fleet Upgrade Flow

For a managed portfolio, use this order when the reusable PGS system changes:

1. Update PGS first.
2. Run PGS verification locally.
3. Publish the npm packages through the trusted release workflow.
4. Confirm the published registry versions.
5. Sync target repositories from the portfolio manifest.
6. Run target-local checks, including `pro-gov doctor --strict-hooks` for
   engineering-runtime targets.
7. Commit and push each target as its own clear checkpoint.
8. Run a final portfolio check from the control plane.

Do not sync targets against an unpublished local package version unless the task
is explicitly a local prerelease test. A target should be able to reinstall from
the public registry and recover the same governance behavior.

## Project Lens Rules

Project Lens must:

1. Read any target-linked technology direction or shared rule that is actually
   present.
2. Read the target repository's package manifests, lockfiles, scripts, runtime
   config, and verification commands.
3. Preserve the difference between "desired direction" and "installed reality".
4. Ask whether the current product phase benefits from a migration now.
5. Preserve Ponytail or other reviewer disagreements as raw artifacts before
   writing synthesis.

Project Lens must not:

- use generic framework taste to override an explicit product-group direction;
- use product-group direction to ignore current runtime facts;
- batch-upgrade a fleet merely because a central document changed;
- hide uncertainty behind confident migration language.

## Good Defaults

- Prefer current stable, supported versions for new work.
- Prefer target-local verification over portfolio-wide faith.
- Prefer small, reversible migration slices over fleet-wide churn.
- Prefer mature open-source tools over local reinvention when they solve the
  real problem without adding more system than the project needs.
- Keep exact installed versions in target repositories, not strategy prose.
