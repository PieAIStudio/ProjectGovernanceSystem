# Codex Runbook

本文件只补当前项目在 Codex 里的落地细节，不改变技能协议本身。

## 前置规则

1. 先读官方 SOP：`_repo/novel-creator-skill/SKILL.md`
2. 再读项目本地入口与规则
3. 正文变更必须调用 `novel-chapter-orchestrator`

## 默认模型映射

- `draft_model = gemini`
- `repair_model = gemini`
- `polish_model = claude`
- `controller_role = current-session-agent`

## Gemini

在本项目里优先使用：

```bash
direnv exec /Users/yuanfei/PieAI/_NovelFrameworks/novel-creator-skill gemini -y
```

如果 TTY 不稳定，可以回退：

```bash
direnv exec /Users/yuanfei/PieAI/_NovelFrameworks/novel-creator-skill \
  gemini -p "你的提示词..." --allowed-mcp-server-names none
```

Gemini headless 的本地实测结论：

1. 优先把完整提示词直接放进 `-p` 参数，不要走 `stdin` 塞 prompt。
2. 短 prompt 的健康检查可以在十几秒内返回。
3. 全章级长 prompt 在本项目里是能跑通的，但 180 秒超时预算偏紧；`2026-04-01` 的 full prompt 实测返回时间是 `183.27s`。
4. 因此正文级 Gemini headless 调用不要再按 `180s` 判断“Gemini 挂了”；应给到至少 `300s`，保守可给 `600s`。
5. 如果必须在更短时间内验证链路，先用短 prompt 健康检查，再决定是否进入 full prompt。

## Claude

共享规则默认不允许随手把 Claude 当默认模型。

本项目的例外是：

- 只有当 `novel-chapter-orchestrator` 已经激活
- 且当前阶段是 `Loop C`
- 且 gate 已通过

这三个条件同时满足时，才允许把 Claude 当作默认润色模型。

## Claude 的默认润色路线

优先使用 `references/claude-round3-minimal.md`。

在《钢怪》V4 的历史章节重写或润色评测里，Claude 默认按 round3 minimal 路线执行：

- 直接给当前章节正文
- 直接给三份参考文档
- 不要先额外堆很多限制
- 先让 Claude 放飞改
- 再由主控读结果，抓“变啰嗦了”“比喻无聊”“评语句太多”“乱加标题”这些真实问题
- 把问题写进 `polish_issue_sheet.md`，继续回传给 Claude

主控可以判定 Claude 版本不如 gate 通过版，但不能自己下场收句子。

## 提示词日志

Codex 每次把提示词发给 Gemini 或 Claude 时，都必须同步维护一个正文旁的总日志文件。

命名规则：

- 正文如果是 `outputs/chapter.md`
- 那么日志必须是 `outputs/chapter-提示词log.md`

记录规则：

- 不要只保留零散 prompt 文件
- 要把本章所有 Gemini / Claude 轮次按顺序汇总进同一个日志文件
- 每一轮至少写清楚：
  - `round`
  - `loop`
  - `model`
  - `purpose`
  - 完整提示词正文

如果本轮里 Gemini 回修了两次、Claude 收口了三次，这五轮都必须记进去。

## 推荐的前三章评测样本

当前首轮默认评测样本不是“继续写下一章”，而是《钢怪》V4 已完成的前三章历史章节：

- `steel-monster-v4/03_manuscript/第1章-背锅测试.md`
- `steel-monster-v4/03_manuscript/第2章-车场阴影.md`
- `steel-monster-v4/03_manuscript/第3章-卖车风波.md`

这些场景是历史章节重写/润色评测，不受 `next_chapter_task` 的生产状态锁影响。

## 禁止

- 不要用当前 Codex 会话直接写正文
- 不要用官方旧正文执行链直接生成章节
- 不要用“最小补文”逻辑给正文偷偷加段落
