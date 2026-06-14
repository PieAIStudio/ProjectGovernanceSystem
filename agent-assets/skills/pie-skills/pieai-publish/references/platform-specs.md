# 各平台适配规范

> 在生成或审查某个平台的最终稿时读这份文件。改写通用文案不需要。

## X (Twitter)

- 字符上限：280
- 少用 emoji
- hashtag 1-2 个
- 长内容走 thread

## YouTube Shorts

- 纯视频，≤60s
- 竖屏 9:16
- 需要封面
- 自动字幕

## TikTok

- 纯视频，≤10min（常规 3min 内表现最好）
- 前 2 秒必须有 hook
- 3-5 个 hashtag（英文）
- 配乐：选择很重要（**不自动化**，留给用户）
- 竖屏 9:16

## 抖音

- 纯视频，≤15min（常规 1min 内完播率最佳）
- 前 2 秒必须有 hook
- 3-5 个 hashtag（中文）
- 配乐：抖音原声/热门 BGM（**不自动化**，留给用户）
- 竖屏 9:16

## Instagram

- 方图或竖图
- 支持 carousel（多图）
- 视频走 Reels
- 5-10 个 hashtag

## 小红书

- 首图必须是封面图
- emoji 用得密
- 5-10 个 tag
- 语气要像"分享"而不是"宣传"

## Bilibili

- 需要封面
- 分区和标签要对
- 描述要详
- 视频画质要高

## Discord

- 看频道/server 风格
- 口气可以随意
- 支持 Markdown
- 可以写长

---

## main.md 决策逻辑（处理"AI 决定去哪些平台"时）

**检查 1：有没有视频？**
- 有视频文件：
  - 视频平台：YouTube / TikTok / Bilibili / 抖音 / 快手
  - 文本平台生成摘要：X / 微博 / Discord

**检查 2：文本长度**
- 短（< 100 字符）→ X / 微博 / Discord
- 中（100-500）→ 所有文本平台
- 长（> 500）→ 小红书 / Instagram / Discord

**检查 3：媒体丰富度**
- 多图 → Instagram / 小红书
- 单图 → 所有平台
- 无图 → X / 微博 / Discord

---

## overseas.md / domestic.md 分组处理

**overseas.md**：
1. 整体翻译成英文
2. 生成 5 个版本：X / YouTube / TikTok / Instagram / Discord
3. 每个按平台规范适配

**domestic.md**：
1. 保持中文
2. 生成 5 个版本：微博 / 小红书 / Bilibili / 抖音 / 快手
3. 每个按平台规范适配
