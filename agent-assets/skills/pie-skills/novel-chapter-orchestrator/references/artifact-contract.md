# Artifact Contract

本技能每次运行都要在项目内生成一个独立 run 目录，建议路径：

`04_editing/orchestration_runs/<chapter-slug>/<run-id>/`

## 最小目录结构

```text
<run-dir>/
  run_manifest.json
  draft_issue_sheet.md
  gate_issue_sheet.md
  polish_issue_sheet.md
  orchestration_report.md
  outputs/
    chapter.md
    chapter-提示词log.md
```

如果是 `blocked` run，可以没有 `outputs/chapter.md`，但 `run_manifest.json` 必须额外写明阻断原因与下一步动作。

## 文件用途

- `run_manifest.json`
  记录模型映射、循环顺序、最终状态、正文文件路径
- `draft_issue_sheet.md`
  主控对首稿或回修稿提出的问题单
- `gate_issue_sheet.md`
  主控把 gate fail 翻译成的修订单
- `polish_issue_sheet.md`
  主控对 Claude 润色的约束与问题单
- `orchestration_report.md`
  本轮运行摘要、回退次数、放行原因、人工介入点
- `outputs/chapter.md`
  本轮最终纯正文拷贝，用于评测或审阅
- `outputs/chapter-提示词log.md`
  主控发给 Gemini / Claude 的提示词总日志。必须按轮次顺序汇总在一个文件里，而不是散落成多个匿名 prompt 文件。

## 提示词总日志格式

建议使用 Markdown，按每一轮一个 section 记录：

```md
# 提示词总日志

## Round 1
- loop: draft
- model: gemini
- purpose: 首稿重写

```text
<完整提示词正文>
```

## Round 2
- loop: polish
- model: claude
- purpose: round3 minimal 首轮润色

```text
<完整提示词正文>
```
```

最低要求：

1. 每次发给 Gemini 或 Claude 的提示词都要记录
2. 同一章所有轮次都汇总到这一个文件
3. 文件必须和最终正文放在同一目录下
4. 文件名必须与正文同名，只在后缀上加 `-提示词log`

## run_manifest.json 最小字段

```json
{
  "task_mode": "rewrite",
  "final_status": "passed",
  "chapter_path": "/abs/path/to/chapter.md",
  "controller_role": "current-session-agent",
  "draft_model": "gemini",
  "repair_model": "gemini",
  "polish_model": "claude",
  "loops": [
    {"name": "draft", "writer": "gemini", "status": "passed"},
    {"name": "gate", "writer": "gemini", "status": "passed"},
    {"name": "polish", "writer": "claude", "status": "passed"}
  ]
}
```

## 约束

1. `loops[].writer` 不允许等于 `controller_role`
2. 非 blocked run 的 `chapter_path` 必须存在
3. 非 blocked run 的 `outputs/chapter.md` 必须是纯正文，不得含 meta 标记
4. 非 blocked run 必须存在 `outputs/chapter-提示词log.md`
5. 提示词总日志必须至少覆盖所有实际发生过的 Gemini / Claude 轮次
6. `polish` 轮只有在 `final_status=passed` 的 gate 版本可进入
7. blocked run 必须提供 `block_reason` 与 `next_action`
