# 沟通框架参考库 Communication Frameworks Reference

本文件是 comm-coach 的框架资源库。SKILL.md 只保留选择逻辑，具体框架细节在这里。

**如何使用**：Phase 2 推荐方法论时，先查下方"按问题类型选框架"索引 → 再读对应框架详情 → 搜索验证 → 引用详情写入报告。

---

## 按问题类型选框架

| 用户对话里的主问题 | 推荐框架 | 为什么 |
|---|---|---|
| 模糊表达（"改一下"/"优化一下"） | CO-STAR / RACE | 强制补齐要素，避免空泛 |
| 角色未设 | RACE | R 就是 Role，一步到位 |
| 上下文不足 | CO-STAR / 5W1H | Context/Situation 显式 |
| 约束未声明 | RACE (E) / TIDD-EC | Expectation/Constraints 显式 |
| 输出规范未说 | CO-STAR (R) / RTF | Response/Format 显式 |
| 复杂推理 / 调试 | Chain-of-Thought (CoT) | 让 AI 分步推理 |
| 说服 / 论证 | PREP | 观点-理由-例子-观点 |
| 汇报 / 呈现 | Pyramid Principle / SCQA | 结论先行 |
| 讲故事 / 面试 | STAR Method | 情境-任务-行动-结果 |
| 冲突 / 情绪沟通 | NVC (非暴力沟通) | 观察-感受-需求-请求 |
| 多角度探索 | Tree of Thoughts (ToT) | 分支展开再收敛 |
| 需要 AI 自主行动 | ReAct | 推理 + 行动交替 |

---

## AI 沟通框架详情

### CO-STAR（推荐度 ⭐⭐⭐）

**来源**：新加坡 GovTech 2025 官方推广的结构化 prompt 框架
**核心结构**：C-O-S-T-A-R

| 字母 | 含义 | 作用 |
|---|---|---|
| C | Context 上下文 | 提供背景 |
| O | Objective 目标 | 明确任务 |
| S | Style 风格 | 指定写作/回复风格 |
| T | Tone 语气 | 专业/友好/正式 |
| A | Audience 受众 | 目标读者 |
| R | Response 响应 | 输出格式 |

**模板**：
```
C: [背景信息]
O: [任务目标]
S: [风格要求]
T: [语气要求]
A: [目标受众]
R: [输出格式]
```

**验证来源搜索词**：`"CO-STAR framework GovTech Singapore prompt engineering"`

---

### RACE（推荐度 ⭐⭐⭐）

**来源**：McKinsey 验证的角色驱动结构
**核心结构**：R-A-C-E

| 字母 | 含义 | 作用 |
|---|---|---|
| R | Role 角色 | 你是一个[角色/专家] |
| A | Action 行动 | 请[具体任务] |
| C | Context 上下文 | 背景 + 约束 |
| E | Expectation 期望 | 输出格式 + 质量标准 |

**模板**：
```
R: 你是[角色]
A: 请[具体行动]
C: 背景 [___]，约束 [___]
E: 输出格式 [___]，质量标准 [___]
```

**验证来源搜索词**：`"RACE framework McKinsey prompt engineering"`

---

### TIDD-EC（技术任务专用）

**适用**：纯技术任务（写代码、数据处理、domain-specific）
**结构**：Task-Input-Data-Domain-Example-Constraints

**模板**：
```
T: 任务是[___]
I: 输入是[___]
D: 数据格式[___]
D: 领域背景[___]
E: 示例[___]
C: 约束[___]
```

---

### Chain-of-Thought (CoT)

**核心**：让 AI 分步推理
**关键提示词**：
- "让我们一步步思考"
- "Let's think step by step"
- "先分析再给答案"

**适用**：复杂推理、数学、代码调试、多步骤决策

**模板**：
```
请一步步分析这个问题：
1. 首先，[第一步]
2. 然后，[第二步]
3. 最后，[结论]
```

---

### Few-shot Prompting

**核心**：给 2-3 个示例，让 AI 模仿格式
**适用**：格式控制、风格迁移、分类任务

**模板**：
```
示例 1：[输入] → [期望输出]
示例 2：[输入] → [期望输出]
现在：[新输入] → ?
```

---

### Tree of Thoughts (ToT)

**核心**：多角度展开 → 评估 → 筛选
**适用**：复杂决策、方案对比、需要创造性探索

---

### ReAct

**核心**：Reasoning + Acting 交替
**适用**：AI Agent 任务（需要工具调用的复杂任务）

---

## 人际沟通框架详情

### Pyramid Principle（金字塔原理）

**来源**：Barbara Minto《金字塔原理》
**核心**：结论先行，分组论证（自上而下：观点 → 支持理由 → 细节）
**适用**：汇报、文档、演示
**验证来源搜索词**：`"Pyramid Principle Barbara Minto McKinsey"`

---

### SCQA

**来源**：McKinsey 顾问结构化表达法
**结构**：Situation-Complication-Question-Answer

**模板**：
```
S: [当前背景/事实]
C: [出现的问题/变化]
Q: [核心问题是什么]
A: [解决方案]
```

---

### PREP

**核心**：观点-理由-例子-观点（首尾呼应）
**适用**：说服、论证、短发言

**模板**：
```
P (Point): 我的观点是 [___]
R (Reason): 主要理由是 [___]
E (Example): 比如 [___]
P (Point): 所以 [___]
```

---

### STAR Method

**结构**：Situation-Task-Action-Result
**适用**：面试、讲故事、业绩描述

---

### NVC / OFNR（非暴力沟通）

**来源**：Marshall Rosenberg《非暴力沟通》
**结构**：观察-感受-需求-请求
**适用**：冲突解决、情绪沟通、表达不满

**模板**：
```
观察: 我看到 [事实，不加评判]
感受: 我感到 [情绪]
需求: 因为我需要 [底层需求]
请求: 我想请你 [具体可执行的请求]
```

---

### 5W1H

**结构**：Who-What-When-Where-Why-How
**适用**：信息收集、需求澄清、事件分析

---

## 框架关联图

```
AI 沟通          ↔         人际沟通
────────────────────────────────────
CO-STAR   ──结构化要素──   Pyramid Principle
RACE      ──完整信息──      5W1H
CoT       ──逐步展开──      STAR Method
ToT       ──发散收敛──      Design Thinking
```

---

## 框架卡片 JSON Schema（Phase 5 持久化用）

每个推荐的框架在 `frameworks/<framework-id>.json` 里按以下 schema 存：

```json
{
  "id": "comm-co-star",
  "frameworkName": "CO-STAR",
  "category": "ai_communication",
  "name": "CO-STAR 上下文-目标-风格-语气-受众-响应",
  "description": "GovTech Singapore 推广的结构化 prompt 框架",
  "template": "C: [背景]\nO: [目标]\nS: [风格]\nT: [语气]\nA: [受众]\nR: [格式]",
  "keyPoints": [
    {"key": "C", "label": "Context 上下文", "desc": "提供背景"},
    {"key": "O", "label": "Objective 目标", "desc": "明确任务"},
    {"key": "S", "label": "Style 风格", "desc": "指定风格"},
    {"key": "T", "label": "Tone 语气", "desc": "指定语气"},
    {"key": "A", "label": "Audience 受众", "desc": "目标读者"},
    {"key": "R", "label": "Response 响应", "desc": "输出格式"}
  ],
  "sourceUrls": ["https://..."],
  "difficulty": 3,
  "firstIntroduced": "YYYY-MM-DD",
  "timesRecommended": 1,
  "lastRecommended": "YYYY-MM-DD"
}
```

### 框架 ID 规范

| 框架 | ID | category | difficulty |
|---|---|---|---|
| CO-STAR | `comm-co-star` | ai_communication | 3 |
| RACE | `comm-race` | ai_communication | 2 |
| TIDD-EC | `comm-tidd-ec` | ai_communication | 4 |
| CoT | `comm-cot` | ai_communication | 2 |
| Few-shot | `comm-few-shot` | ai_communication | 2 |
| ToT | `comm-tot` | ai_communication | 4 |
| ReAct | `comm-react` | ai_communication | 4 |
| SCQA | `comm-scqa` | human_communication | 3 |
| PREP | `comm-prep` | human_communication | 2 |
| Pyramid | `comm-pyramid-principle` | human_communication | 3 |
| NVC | `comm-nvc-ofnr` | human_communication | 4 |
| STAR | `comm-star-method` | human_communication | 2 |
| 5W1H | `comm-5w1h` | human_communication | 1 |
