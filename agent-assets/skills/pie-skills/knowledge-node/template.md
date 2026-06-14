# Learning Document Template

## Frontmatter

```yaml
---
type: concept        # concept | versus | workflow | gotcha | config | debug
tags: [react, hook]  # lowercase tech tags
up: "[[parent-concept]]"  # only if there's a clear parent — omit otherwise
---
```

Rules:
- `up` only when there's an obvious parent concept. Don't force hierarchy.
- No `children` field — child notes point back via their own `up`.
- Peer relationships are expressed via inline `[[双链]]` only.

---

## Document Structure

```markdown
# {prefix}-{kebab-case-filename} 中文标题

> 一句话副标题：点明这篇文档的核心价值

---

## 1. 日常生活类比

[把这个概念比作日常生活中的某个场景。
让初中生也能在3句话内理解它解决了什么问题。]

## 2. 在 {项目名} 里它是怎么用的

[先讲在这个项目里的具体角色，再讲通用原理。
引用真实代码片段，标注文件路径和行号。]

\`\`\`language
// 来自 src/path/to/file.ts:42
// 粘贴真实代码片段
\`\`\`

> 来源：`src/path/to/file.ts:42`

## 3. 核心原理图

\`\`\`mermaid
flowchart TD
    A[...] --> B[...]
\`\`\`

## 4. 要点总结（可选）

- 要点一
- 要点二

---

## 延伸阅读
- [[相关概念A]]
- [[相关概念B]]
```

---

## Mermaid Quick Rules

- `flowchart TD` — 流程 / 决策树
- `sequenceDiagram` — API 调用 / 服务间交互
- `stateDiagram-v2` — 状态机
- Chinese text in `flowchart`: use `subgraph ID["中文"]` syntax
- Chinese text in `quadrantChart`: all labels must be quoted

Test at: https://mermaid.live

---

## Filename Examples

```
concept-react-useeffect-lifecycle.md
versus-zustand-vs-context.md
workflow-game-round-lifecycle.md
gotcha-stale-closure-in-hooks.md
config-vite-env-variables.md
debug-supabase-realtime-not-firing.md
```
