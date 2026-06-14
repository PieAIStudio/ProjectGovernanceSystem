---
name: novel-chapter-orchestrator
description: '本工作区章节级正文操作的**唯一调度入口**。凡是涉及**本工作区章节正文**的任何改动，都必须先走本技能——包括但不限于：(1) 新写/续写章节（"写第 N 章/继续写下一章/补一章"）；(2) 重写或大改（"重写这一章/这章推倒重来"）；(3) 风格级修改（"改成更自然口语/加点人味/去 AI 味/重新润色本章"）；(4) 回修（"修一下被 publish-gate 拒的这一章/回修这一章"）；(5) 作者指纹注入（"跑一遍签名/加颗粒感"）。**本技能优先于 prose-lint / prose-signature / publish-gate**——这三者都是本技能的下游工具，由本技能在对应阶段调度，不应被主 agent 直接调用在章节正文上。它强制"主控只调度与判卷，Gemini 负责起草和回修，Claude 只在门禁通过后负责润色"的正文隔离协议，禁止当前主 agent 直接写正文。Triggers (EN): rewrite chapter, polish chapter, make dialogue more natural, fix rejected chapter, continue next chapter.'
---

# Novel Chapter Orchestrator

本技能是当前项目的**正文生产本地覆盖层**。

先读取官方 SOP 与项目规则，再用本技能接管正文变更。
官方仓库 `/_repo/novel-creator-skill` 仍然是门禁、检索、状态工具来源，但**不再是本项目的正文生成逻辑来源**。

## 为什么要角色隔离

当前会话主 agent（你）有一个**结构性倾向**：看到"这段写得不好"就想顺手改两句。这个倾向放在正文生产上是灾难，原因有三：

1. **主控一旦动笔，就无法客观判卷**——你自己写的东西，你看不出问题。门禁的判卷价值建立在"判卷者不是作者"之上。
2. **主控顺手补段落，会让正文在风格/节奏上碎片化**——每轮主控"就这一小段"的修补累积起来就是拼贴怪。
3. **风格一致性靠的是"同一模型写完整"**——Gemini 写的 Gemini 回修；Claude 润色时面对的是完整 Gemini 版。让主控插手等于打断这个闭环。

所以下面的铁律不是程序洁癖，是**保住判卷独立性 + 保住风格一致性**的结构性防线。你越觉得"这就一小段我顺手改了不影响"，越要抵抗——那正是这条规则要防的失败模式。

## 何时必须触发

出现以下任一意图时，必须使用本技能：

- `/继续写`
- `/修复本章`
- “重写这一章”
- “大改这一章”
- “改成更自然口语”
- “重新润色本章”
- “回修门禁失败章节”
- 任何会让正文内容发生变化的请求

只做这些事时，不用本技能：

- 纯门禁检查
- 纯检索
- 纯状态同步
- 纯分析，不改正文

## 铁律

1. 当前会话主 agent 是编排者，不是正文作者。主控可以读、判、调度、汇总、放行，但**不得直接改正文**。
2. 主控不得“顺手小修”，不得自己补段落，不得在门禁失败时自己把剧情、对白、章末钩子写回正文。
3. Gemini 负责首稿与所有正文回修。只要还在起草或门禁修复阶段，就不允许把正文交给当前主 agent 亲自改写。
4. Claude 只在门禁通过后进入润色阶段。没有 `gate pass`，就没有 Claude 润色。
5. 润色阶段也必须保持角色隔离：主控只提问题单，不重写句子；Claude 执行实际润色。
6. 官方执行器里任何“当前会话主模型直接写正文”或“最小补文”的旧路径，在本项目视为禁用入口。

## 默认模型映射

默认映射：

- `controller_role`: `current-session-agent`
- `draft_model`: `gemini`
- `repair_model`: `gemini`
- `polish_model`: `claude`

如果当前工具或环境不支持默认映射，可以覆盖 `model_map`，但必须保持角色边界不变：

- 起草角色与回修角色仍然负责正文生产
- 润色角色仍然只能在 gate pass 后进入
- 主控角色仍然不能直接改正文

Codex 项目的调用细节见 `references/codex-runbook.md`。
Claude 的默认润色路线见 `references/claude-round3-minimal.md`。

## 输入

每次运行都要先整理这组输入：

- 项目根目录
- 任务模式：`new` / `rewrite` / `major-revise` / `repair`
- 用户本章要求
- 当前 canon 文件集合
- 可选 `model_map`

最小 canon 集合：

- `00_memory/idea_seed.md`
- `00_memory/novel_state.md`
- `00_memory/next_chapter_task.md`
- `00_memory/outline_anchors.json`

如果是 `rewrite` / `major-revise` / `repair`，还要额外读取：

- 目标章节正文
- 对应 gate 产物或失败报告
- 必要的 style reference

## 状态锁优先

在真正进入 Loop A 之前，先检查项目状态文件。

如果任务是“继续写下一章”之类的生产请求，而 `next_chapter_task.md`、`novel_state.md`、`outline_anchors.json` 或其他 canon 明确说明：

- 当前不允许写下一章
- 当前阶段只允许复盘、总复读、集中修订
- 目标章节尚未解锁

那么本技能必须**停止正文生产**，输出一个 `blocked` run，而不是硬写正文。

blocked run 规则：

1. 主控要把阻断原因写进 `run_manifest.json`
2. 主控要在 `orchestration_report.md` 说明为什么这不是失败，而是遵守 canon
3. 主控仍然不能自己写正文补过去
4. 这类 run 可以没有 `outputs/chapter.md`
5. 这类 run 只允许给出下一步建议，例如“先完成阶段复盘”

状态锁的例外：

- 生产态正文必须尊重状态锁
- 但 skill 评测、历史章节重写、历史章节润色，不需要假装自己在写“当前下一章”
- 对《钢怪》V4 的首轮评测，默认直接使用已完成的历史章节样本，当前是第 1-3 章

## 输出

每次运行必须同时产出两类结果：

1. 纯正文，或明确的 blocked 结果
2. 编排工件

正文只能由被调度的写作/回修/润色模型输出。
如果是 `blocked` run，则本次不产生正文。

编排工件必须放在一次独立 run 目录里，目录契约见 `references/artifact-contract.md`。最低要求：

- `run_manifest.json`
- `draft_issue_sheet.md`
- `gate_issue_sheet.md`
- `polish_issue_sheet.md`
- `orchestration_report.md`
- 正文旁提示词总日志

这些工件属于评测对象，不属于小说正文。

如果是 `blocked` run，还必须在 `run_manifest.json` 里补：

- `block_reason`
- `next_action`

## Loop A：Gemini 草稿循环

1. 主控整理输入，生成本章 brief。
2. 主控把 brief 交给 `draft_model`，并把这次发给模型的完整提示词追加记录到正文旁提示词总日志。
3. `draft_model` 只输出纯正文。
4. 主控审稿时只能列问题单，写入 `draft_issue_sheet.md`。
5. 只要问题仍属于正文生产阶段，就继续交给 `repair_model` 回修，并把每一轮回修提示词继续追加记录到同一个提示词总日志。
6. 循环到“可送门禁”为止。

在 Loop A 中，主控禁止：

- 直接改字句
- 直接补对白
- 自己写章末钩子
- 自己把平段扩成正文

如果状态锁已触发，就不要进入 Loop A。

## Loop B：门禁回修循环

1. 主控调用现有门禁、检查链、状态工具。
2. 如果 gate 失败，主控只做一件事：把失败项翻译成明确修订单，写入 `gate_issue_sheet.md`。
3. 修订单交给 `repair_model` 回修正文，并把这轮回修提示词追加记录到正文旁提示词总日志。
4. 回修后重新跑门禁。
5. 直到 gate pass，或达到人工介入条件。

Loop B 中必须坚持：

- gate fail 时不允许主控自己修正文
- gate fail 时不允许跳过失败项直接进入润色
- 回修必须明确对应失败原因

## Loop C：Claude 润色循环

只有 `gate pass` 后才能进入 Loop C。

1. 主控读取 gate 通过版正文。
2. 默认采用 `references/claude-round3-minimal.md` 里的极简路线，把 gate 通过版正文和指定参考文档交给 `polish_model` 执行首轮润色，并把这轮发给 Claude 的完整提示词追加记录到正文旁提示词总日志。
3. 主控阅读 Claude 输出，列问题单写入 `polish_issue_sheet.md`——不自己改句子，只写问题。
4. 把问题单交回 `polish_model` 迭代润色，继续追加记录提示词到总日志。
5. 迭代直到润色版确实优于 gate 通过版，或判定“不如 gate 版”并拒收 Claude 结果。
6. 最后做一次本地复核，确认没有破坏 gate 通过版的剧情、节奏和状态约束。

问题单重点盯这几类副作用（Claude 最容易踩的坑）：

- 油、装、作者腔、多余的“机灵劲”
- 啰嗦、评语句过多、硬加一层解释（本可用动作/对白/停顿直接解决）
- 比喻傻、比喻无聊、乱加装饰物
- 口气跑偏、乱加章节标题

Loop C 的默认方法不是继续往提示词里叠很多限制，而是先让 Claude 在 round3 minimal 的边界里放飞，再由主控抓住“啰嗦”和“无聊比喻”这两类最常见副作用，回传给 Claude 收口。

如果用户明确不需要 Claude 润色，可以跳过 Loop C，但不能把跳过解释成“主控自己来润色”。

## 下游调度

本技能在流程中按阶段调度三个下游技能，**不要让它们被主 agent 直接调用在章节正文上**：

| 阶段 | 调度目标 | 何时触发 |
|---|---|---|
| Loop B 结束 | `publish-gate` | Gemini 草稿完成后、Claude 润色前；做硬伤门禁 |
| Loop C 首轮 | `prose-lint` | 门禁通过后；扫 20 条 AI 味规则 |
| Loop C 末轮 | `prose-signature` | prose-lint 之后；注入作者指纹（顺序不可颠倒） |

主 agent 绝不应跨过本技能直接调用 prose-lint / prose-signature / publish-gate 于章节正文。

## 禁用入口

在本项目里，以下做法都视为违规：

- 直接让当前会话主 agent 生成章节正文
- 使用官方旧正文执行链直接产出正文
- 调用任何“最小补文”逻辑把内容自动写回正文
- 未过 gate 就让 Claude 润色
- 绕过本技能直接对章节正文调用 prose-lint / prose-signature / publish-gate

## 运行记录

`run_manifest.json` 至少要记录：

- `task_mode`
- `final_status`
- `chapter_path`
- `controller_role`
- `draft_model`
- `repair_model`
- `polish_model`
- `loops`

`loops` 至少记录每轮的：

- `name`
- `writer`
- `status`

非 blocked run 还必须生成一个紧挨着正文的提示词总日志文件。命名规则：

- 如果正文是 `chapter.md`
- 那么提示词总日志必须是 `chapter-提示词log.md`
- 两者必须放在同一目录下

这个总日志要按时间顺序记录主控每次发给 Gemini 和 Claude 的提示词，包括：

- 轮次编号
- 所属 loop
- 目标模型
- 这轮提示词的目的
- 完整提示词正文

运行后用 `scripts/validate_orchestration_run.py` 校验 run 目录是否满足本技能的最小契约。

如果 `final_status = blocked`，则：

- `chapter_path` 允许为空
- `loops` 可以为空列表
- 但必须提供 `block_reason` 与 `next_action`

## 评测

本技能的首轮 `skill-creator` 评测只用《钢怪》V4，测试集定义在 `evals/evals.json`。

基线要求：

- `with_skill` 产出正文 + 编排工件
- 首轮默认评测样本是第 1 章、第 2 章、第 3 章的历史章节重写
- 历史章节评测不需要受“下一章未解锁”影响
- 如果任务本身真的是生产下一章，而项目状态锁住正文生产，则 `with_skill` 必须产出 blocked run，而不是偷写正文
- `without_skill` 不带本技能运行
- benchmark 里必须能区分“主控越位写文”和“角色隔离成立”

## 多工具说明

本技能是多工具通用协议，Codex 只是当前项目的优先落地环境。

- Codex：按 `references/codex-runbook.md` 执行
- Claude Code：保留同样的角色边界
- Gemini CLI：保留同样的角色边界

工具可以不同，协议不能变。
