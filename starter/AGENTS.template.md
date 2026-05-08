# PROJECT_NAME AI Router

## Startup Reading

1. `README.md`
2. `AGENTS.md`
3. `governance/agent-rules.md`
4. `governance/doc-types.md`
5. `governance/best-practice-for-this-project.md`
6. `docs/README.md`
7. `docs/reference/execution/current-work.md` when present

## Governance

- Use doc-gov for governed Markdown.
- Before creating docs: `pnpm doc-gov find <topic>`.
- Before claiming doc work complete:
  - `pnpm doc-gov check`
  - `pnpm doc-gov scan --check`

## Routing

- Name this project's adopted profile: `engineering-runtime` or `doc-only`.
- Point to the chosen routing file from `project-governance-system/routing/`.
- Engineering projects should also point to `integrations/superpowers.md` and use Superpowers inside the selected lane.
- Doc-only projects should say that Superpowers TDD and Directed Development are not enabled by default.

## Upstream Rule

Do not locally invent doc-gov core changes such as new document statuses, frontmatter schema, lifecycle rules, shared routing rules, or shared AI rules. If such a change seems necessary, propose it upstream in `project-governance-system` first.
