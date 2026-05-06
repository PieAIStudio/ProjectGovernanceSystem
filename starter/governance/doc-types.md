# The 7 Document Types

Allowed types:

| Type | Default path |
| --- | --- |
| `policy` | `docs/policy/` or `governance/` |
| `decision` | `docs/decisions/` |
| `spec` | `docs/specs/active/` or `docs/specs/completed/` |
| `plan` | `docs/plans/active/` or `docs/plans/completed/` |
| `canon` | `docs/canon/` |
| `reference` | `docs/reference/` |
| `archive` | `docs/archive/` |

Normal documents use:

```text
draft -> active -> completed -> stable -> superseded -> archived
```

Decision documents use:

```text
proposed -> accepted -> rejected | superseded
```
