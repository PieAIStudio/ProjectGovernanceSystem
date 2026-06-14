---
name: reader-experience-map
description: >-
  读者体验图谱 —— 模拟特定读者通读已写章节,逐章逐拍诊断读者的情绪起伏与认知变化,
  产出可视化诊断报告,指出哪一章 / 哪一拍情绪塌了、为什么、往哪改。当用户想知道
  "读者读我的小说会有什么感受""哪章情绪塌了 / 节奏拖了""爽点炸没炸""戏剧反讽起没起效",
  或想给一本中文小说的已写章节做"读者视角体检 / 诊断"时,使用本技能。即使用户没明说
  "读者图谱"四个字,只要任务涉及评估中文小说已写章节带给读者的情绪或追读体验,也应主动使用。
  本技能只诊断、不改稿。
---

# 读者体验图谱(reader-experience-map)

## 这个技能做什么

它是作者请来的**"第一个读者"**:模拟一个特定读者,从第 1 章顺序读到最新章,把读者在**每一拍(beat)**的情绪与认知如实记录下来,最后汇成一张诊断报告——哪里情绪塌了、哪个爽点没炸、节奏哪里拖了,以及大概为什么、往哪个方向改。

**它只诊断,不替作者改稿。**

## 当前能力(P1 阶段)

本技能分阶段构建。**当前 P1**:只模拟**一个读者**(核心目标读者),产出**双层情绪曲线**(情绪底色 5 维 + 追读牵引力 2 维,细到节拍内部的关键帧)+ 节拍级诊断。老书虫 / 路人读者、完整交互式仪表盘是后续阶段。

## 五条铁律(为什么这样设计 —— 执行时务必理解)

1. **读者认知 ≠ 角色认知。** 你算的是**读者**脑子里的东西,不是角色的。角色在台上痛哭,读者可能在解气、甚至在出戏——别把角色情绪当成读者情绪。

2. **防剧透(最重要)。** 读者的"第 3 章感受",必须是只读过第 1–3 章时的感受。分析者一旦知道结局,它对早期章节的判断就被污染了。所以本技能**按章号顺序**处理,每一章交给一个**全新的子 Agent**,只喂"这一章 + 此前的读者状态",它**看不到后面的章节**。这条是技能的命根子,任何改动都不能破坏它。

3. **颗粒度到关键帧。** 一章里情绪是起伏的,连一个节拍内部都在流动。所以:叙事按**节拍(beat)**切;情绪曲线再细到节拍内部的**关键帧**——情绪真正转折的那几个瞬间。绝不按整章取平均(那会把所有波动抹平)。

4. **可信度。** 模拟读者容易产出"听起来很对"却没根据的判断。每一个情绪分、每一个诊断,都必须附 `why` 并**引用正文**。

5. **情绪是连续的。** 读者的情绪跨章累积——上一章结尾的恐惧、好奇,会被读者带进下一章。子 Agent 虽只读一章,却必须从 `reader_state` 接住上一章交来的"情绪势能"(`emotion_now`:带着什么情绪、为什么、靠哪些活悬念吊着),让本章**第一个关键帧锚定它**、绝不从零起评。防剧透管"不许朝后偷看后文",连续性管"必须朝前接住前文情绪"——一体两面,共同保证子 Agent 正好活在"此刻"。

## 工作流程

技能被调用时(如"给 modern-freaks-v1 跑读者图谱"),按四步执行。默认你已经在 Anvil 仓库根目录中。

### ① 准备

运行:

```bash
pnpm anvil -- reader-map prepare --book <slug>
```

它会读取 Anvil 原生结构:

- `books/<slug>/book.json`
- `books/<slug>/memory/idea_seed.md`
- `books/<slug>/chapters/chNNNN/final.md` 或 `draft.md`

并写出:

- `books/<slug>/reports/reader-map/run-plan.json`
- `books/<slug>/reports/reader-map/reader-state.json`

读 `run-plan.json` 拿到待处理章节清单。若 `pending_chapters` 为空,说明都分析过了,直接跳到 ③。

### ② 逐章循环(严格按章号顺序,不可跳读)

对待处理清单里的**每一个**章节 N,依次做:

1. **备好输入包**(下列内容全部要 inline 塞进子 Agent 的指令,不给文件路径):
   - 第 N 章正文;
   - 当前 `reader-state.json` 的内容(尤其 `emotion_now`——上一章交来的"情绪接力棒",连续性靠它);
   - 核心读者人设(在 `run-plan.json` 里);
   - 第 N−1、N−2 章正文(若存在)——作为"短期记忆";
   - `references/subagent-instructions.md` 全文——分析指令;
   - `references/emotion-model.md` 全文——双层七维情绪模型(情绪底色 + 追读牵引力)+ 复合情绪查表。

2. 用 **Agent 工具**派一个**全新子 Agent**——**优先指定一个中高质量的模型**(情绪与认知分析是细活,弱模型会给出"听着对、没依据"的判断;具体型号由执行环境决定,**不要写死**)。把输入包**全部 inline** 写进它的 prompt。明确告诉它:**只许分析这一章,不许读取任何文件**(尤其不许去找后面的章节——这会破坏防剧透)。要求它把分析写到 `books/<slug>/reports/reader-map/analysis/chNNNN.analysis.json`(NNNN 为四位章号,如 `ch0007`),只向你返回一句话摘要。

3. 运行:

```bash
pnpm anvil -- reader-map validate --book <slug> --file books/<slug>/reports/reader-map/analysis/chNNNN.analysis.json
```

   - 通过 → 进第 4 步;
   - 失败 → 把校验报错连同输入包重新派子 Agent,最多重试 **3 次**;3 次仍失败 → 停下,告诉用户卡在第几章,**不要继续**。

4. 运行:

```bash
pnpm anvil -- reader-map roll-state --book <slug> --file books/<slug>/reports/reader-map/analysis/chNNNN.analysis.json
```

它把这一章的 `state_update` 滚进 `reader-state.json` 并更新 `last_chapter`。**这一步完成即是一个断点**——中断后重跑会自动从此续上。

### ③ 渲染

待处理章节全部跑完后,运行:

```bash
pnpm anvil -- reader-map render --book <slug>
```

它汇总所有 `chNNNN.analysis.json`,生成 HTML 报告——双层情绪曲线(情绪底色 + 追读牵引力)画到关键帧级、章与章之间连续。

### ④ 完成

把报告路径 `books/<slug>/reports/reader-map/report.html` 告诉用户。

## 边界

- 本技能只诊断,不改 `draft.md` / `final.md`。
- 本技能不运行 `gate run`,不运行 `memory update`,不盖 evidence 章。
- `reader-state.json` 是可重建的读者体验分析状态,不是 Anvil 的 `memory/story_graph.json` 真源。
- 本技能不调用 Python。旧 Python 脚本只保留作历史参考,日常执行使用 `pnpm anvil -- reader-map ...`。

## 参考文件

执行时按需读取:

- `references/emotion-model.md` —— 双层七维情绪模型(情绪底色 + 追读牵引力)+ 复合情绪查表。**②步打包时随输入包给子 Agent。**
- `references/subagent-instructions.md` —— 每章子 Agent 的完整分析指令。**②步打包时随输入包给子 Agent。**
- `references/data-schemas.md` —— `run-plan.json` / `reader-state.json` / `chNNNN.analysis.json` 的完整结构。校验、排错时查。
- `references/reader-personas.md` —— 读者人设说明(P1 只用核心读者)。

## 出问题时

- 子 Agent 写的 JSON 反复不合格 → 对照 `references/data-schemas.md`,把**具体差在哪**讲给子 Agent,而不是笼统重派。
- 跑到一半中断 → 直接重跑 `reader-map prepare`;它会按 `reader-state.json` 的 `last_chapter` 自动从断点续上。
- 章节缺号 / 乱序 → `reader-map prepare` 会在 `run-plan.json` 的 `warnings` 里报出;确认手稿完整再跑。
