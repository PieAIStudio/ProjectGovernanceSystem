# PROJECT_NAME AI Router

## PGS Router Block

<!-- PGS-ROUTER:BEGIN v0.9 -->

## Startup Reading

`README.md` is the human-facing project introduction. Do not use it as the default AI startup path unless the task is about project positioning, public explanation, or the README itself.

1. All Markdown files under `docs/policy/**/*.md`, including files in
   subdirectories and symlinked shared-rule files.
2. `docs/governance/boundary.md`
3. `docs/governance/ssot-v0.9.md`
4. `docs/governance/doc-agent-rules.md`
5. `docs/governance/doc-types.md`
6. The selected agents routing file:
   - `docs/governance/agents-routing/engineering-runtime-v0.9.md`, or
   - `docs/governance/agents-routing/doc-only-v0.9.md`
7. `docs/reference/execution/current-work.md`

## Governance

- Use doc-gov for governed Markdown.
- Governed Markdown lives under `docs/**` by default.
- Product artifacts outside `docs/**` are not governed docs unless this project explicitly opts them in.
- Before creating docs: `pnpm doc-gov find <topic>`.
- Before claiming doc work complete:
  - `pnpm doc-gov router-check`
  - `pnpm doc-gov check`
  - `pnpm doc-gov scan --check`
  - `pnpm doc-gov links`
  - `pnpm doc-gov audit`
  - `pnpm doc-gov doctor`

## Routing

- Name this project's adopted profile: `engineering-runtime` or `doc-only`.
- Point to the chosen agents-routing file from `docs/governance/agents-routing/`.
- Engineering projects may use Superpowers, Directed Development, GStack, or other external workflows only inside the selected lane; do not copy upstream integration guides into the target project by default.
- For engineering projects, Superpowers is the default engineering workflow. Compound Engineering is used by default only as the post-work Compound Gate through `ce-compound`; full CE workflows require an explicit user request.
- Doc-only projects should say that Superpowers TDD and Directed Development are not enabled by default.
- External workflow systems such as Superpowers or GStack run inside the lane selected by this router. They must not replace this project router.

<!-- PGS-ROUTER:END -->

## Upstream Rule

Do not locally invent doc-gov core changes such as new document statuses, frontmatter schema, lifecycle rules, shared agents-routing rules, or external shared-rule placement contracts. If such a change seems necessary, propose it upstream in the Project Governance System upstream repository first.
