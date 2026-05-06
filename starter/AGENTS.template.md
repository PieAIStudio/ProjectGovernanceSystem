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

## Upstream Rule

Do not locally invent doc-gov core changes such as new document statuses, frontmatter schema, lifecycle rules, shared routing rules, or shared AI rules. If such a change seems necessary, propose it upstream in `project-governance-system` first.
