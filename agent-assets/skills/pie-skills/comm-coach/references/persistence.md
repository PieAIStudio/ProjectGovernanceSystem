# Phase 5 数据持久化规范

comm-coach 每次分析后要把会话报告和框架数据写到 Obsidian vault。本文件规定**唯一正确的文件结构和 schema**，消除历史上多个版本的冲突。

---

## 目标目录

所有持久化文件写入：

```
/Users/yuanfei/Library/CloudStorage/OneDrive-Personal/Obsidian/PieVaultLocal/AI-Learning/LearningInTheProcess/comm-coach/
```

下文称 `COMM_COACH_DIR`。

---

## 文件结构（唯一规范）

```
COMM_COACH_DIR/
├── index.json                    # 主索引
├── comm-report-YYYY-MM-DD-HH-mm-<slug>-<sesShort>.md    # 每次会话报告（Markdown）
├── frameworks/
│   ├── comm-co-star.json
│   ├── comm-race.json
│   └── ...                       # 每个推荐过的框架一个 JSON
```

**没有** `data/sessions/` 子目录。**没有** `sessions/xxx.json`。会话报告直接作为扁平 Markdown 文件放在 `COMM_COACH_DIR/` 根下。

---

## 文件命名规则

### 会话报告 Markdown

格式：`comm-report-YYYY-MM-DD-HH-mm-<topicSlug>-<sessionShort>.md`

- `YYYY-MM-DD-HH-mm`: 当前时间戳（用户本地时区）
- `topicSlug`: 会话主题 kebab-case 简写（从用户对话首句提取 3-6 词）
- `sessionShort`: 8 字符随机 hex 前加 `ses_`（如 `ses_34c1`）

例：`comm-report-2026-03-04-02-40-react-performance-ses_34b0.md`

### 框架卡片 JSON

格式：`frameworks/<framework-id>.json`，其中 `framework-id` 见 [`frameworks.md`](frameworks.md) 的 ID 规范表。

---

## index.json Schema

```json
{
  "lastUpdated": "2026-03-01T15:33:16Z",
  "totalSessions": 3,
  "knownFrameworks": ["CO-STAR", "RACE", "SCQA"],
  "sessions": [
    {
      "id": "ses_34b0",
      "date": "2026-03-04",
      "timestamp": "2026-03-04T02:40:00Z",
      "file": "comm-report-2026-03-04-02-40-react-performance-ses_34b0.md",
      "topIssues": ["constraints", "role"],
      "recommendedFrameworks": ["RACE", "CoT"],
      "scoreSummary": {"vague": 4, "context": 5, "constraints": 5}
    }
  ],
  "frameworks": [
    {"id": "comm-co-star", "name": "CO-STAR", "file": "frameworks/comm-co-star.json", "timesRecommended": 2, "lastRecommended": "2026-03-04"},
    {"id": "comm-race", "name": "RACE", "file": "frameworks/comm-race.json", "timesRecommended": 3, "lastRecommended": "2026-03-04"}
  ]
}
```

**初始化**（如果 `index.json` 不存在）：
```json
{
  "lastUpdated": "",
  "totalSessions": 0,
  "knownFrameworks": [],
  "sessions": [],
  "frameworks": []
}
```

---

## 会话报告 Markdown 结构

```markdown
# Comm-Coach Report — YYYY-MM-DD HH:mm

Session ID: ses_xxxx
Messages Analyzed: N turns (范围: #m - #n)

---

## 📋 历史回顾（如有历史数据）

[引用 index.json 里的历史 session 数据]

---

## 🔍 对话分析

### 8 维度评分
[打分表]

### Top 3-5 问题
[引用真实消息 + 分析 + 改进建议]

---

## 📚 推荐方法论
[2-3 个框架]

---

## 🌐 扩展知识网络
[文本图]

---

## 🎯 真实场景应用
[AI 沟通 + 人际沟通示例]

---

## 🏋️ 下一步练习
[1-2 个针对性练习]

---

## 💾 数据持久化确认

- ✅ 本文件已保存
- ✅ 更新了 N 个框架卡片
- 📊 累计分析次数: X
```

---

## 框架卡片 JSON Schema

见 [`frameworks.md`](frameworks.md) 末尾的 "框架卡片 JSON Schema" 节。

---

## 写入流程（Claude 执行顺序）

1. **读取 `index.json`**
   - 不存在 → 用上面的初始化模板创建
   - 存在 → 记住 `totalSessions`、`knownFrameworks`、`sessions` 历史

2. **写会话 Markdown 报告**
   - 组装文件名：`comm-report-{timestamp}-{slug}-{ses}.md`
   - 写到 `COMM_COACH_DIR/` 下

3. **更新/创建框架卡片**
   - 对**本次推荐**的每个框架：
     - 若 `frameworks/<id>.json` 存在：只更新 `timesRecommended += 1` 和 `lastRecommended`
     - 若不存在：按 schema 创建完整卡片

4. **更新 `index.json`**
   - `lastUpdated` = 当前时间
   - `totalSessions += 1`
   - `sessions` 数组 push 新 session 记录
   - `frameworks` 数组：同步更新计数
   - `knownFrameworks` 合并去重

5. **输出持久化确认**（见上面报告模板末尾）

---

## 错误处理

| 情况 | 处理 |
|---|---|
| `COMM_COACH_DIR` 不存在 | 用 `mkdir -p` 创建 |
| `frameworks/` 子目录不存在 | 用 `mkdir -p` 创建 |
| `index.json` 损坏（JSON 解析失败） | 备份为 `index.json.bak` → 用初始模板新建 → 给用户警告 |
| 写入失败（权限/磁盘） | 在报告末尾标注 "⚠️ 持久化失败: [原因]"，不要假装成功 |
