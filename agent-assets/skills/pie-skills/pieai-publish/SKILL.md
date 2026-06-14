---
name: pieai-publish
description: 'PieAI 多平台社交媒体发布主力技能，必须在以下场景使用：(1) 用户说"发布这个 post/发一下这条/把这篇发出去/一键发所有平台/发到海外平台/发到国内平台/翻译并发布"时；(2) 用户输入 /pieai-publish <folder> 命令时；(3) 需要把一个 post 文件夹里的 .md 内容分发到 X/微博/YouTube/小红书/Bilibili/TikTok/Instagram/抖音/快手/Discord 等平台时；(4) 需要为同一内容做中英翻译+平台特定改写时。即使没明说"发布"，只要看到 post 文件夹里有 `x.com.md`、`weibo.md`、`main.md`、`overseas.md`、`domestic.md` 这类平台文件名，都应触发。Triggers (EN): publish post folder, multi-platform publishing, translate and adapt, X Twitter YouTube TikTok Instagram Weibo Xiaohongshu Bilibili Douyin Discord.'
---

# 多平台社交媒体发布器（简化版）

## 为什么这个技能存在

写一篇内容，手动发 10 个平台 = 重复做 10 遍相似但不同的工作（翻译 + 字数裁剪 + hashtag 调整 + 首图筛选 + 视频转封面）。本技能把这件事压成：**放一个 post 文件夹**（里面的文件名本身就声明了目标平台），自动生成平台适配稿 → 预览 → 浏览器自动发布 → 报告。

**核心哲学**：文件名即路由，目录即状态机。不要再记一堆平台参数，把决策编码到文件名上。

---

## 用法

```
/pieai-publish <post-folder-path>
# 例：/pieai-publish Posts/20260205/1
```

---

## 输入：Post 文件夹结构

```
Posts/20260205/1/
  ├── x.com.md        # 文件名 = 目标平台
  ├── cover.png       # 媒体文件同目录
  ├── photo.jpg
  └── video.mp4       # 可选视频
```

### 文件名 → 平台映射表

| 文件名 | 目标平台 | 语言 | 类型 |
|---|---|---|---|
| `x.com.md` / `x.md` | X (Twitter) | 英 | 文+图 |
| `youtube.md` | YouTube Shorts | 英 | 视频 |
| `tiktok.md` | TikTok | 英 | 视频 |
| `instagram.md` | Instagram | 英 | 文+图 |
| `discord.md` | Discord | 英 | 文+图 |
| `weibo.md` | 微博 | 中 | 文+图 |
| `xiaohongshu.md` | 小红书 | 中 | 文+图 |
| `bilibili.md` | Bilibili | 中 | 视频 |
| `douyin.md` | 抖音 | 中 | 视频 |
| `kuaishou.md` | 快手 | 中 | 视频 |
| `main.md` | **AI 判断** | 自动 | 任意 |
| `overseas.md` | 所有海外 | 英 | 任意 |
| `domestic.md` | 所有国内 | 中 | 任意 |

**平台分组**：
- **海外**：X / YouTube Shorts / TikTok / Instagram / Discord
- **国内**：微博 / 小红书 / Bilibili / 抖音 / 快手

---

## 工作流

### Step 1：读 Post 文件夹

1. 扫 `*.md` 文件 → 按文件名确定目标平台
2. 扫媒体文件（图：`*.png/jpg/jpeg/gif/webp`；视频：`*.mp4/mov/avi`）
3. 判内容类型：有视频 → `video_post`；只有图文 → `text_post`

### Step 2：确定目标平台

- **单平台文件**（如 `x.com.md`）：只发该平台，需要时自动翻译
- **`main.md`**：AI 根据内容决定（决策逻辑见 [`references/platform-specs.md`](references/platform-specs.md#mainmd-决策逻辑)）
- **`overseas.md` / `domestic.md`**：分别对应海外/国内分组
- **多个平台文件共存**：每个各自发对应平台

### Step 3：生成平台特定版本

**先加载配置**（存在才读）：`config/platforms.yaml`、`prompts/translate.md`、`prompts/adapt-text-post.md`、`prompts/adapt-video-post.md`、`prompts/writing-style-examples.md`。

**生成策略**：

- **海外平台**（英文）：用 `translate.md` 翻译 → 用 adapt 模板 + 平台规格 + 风格样本改写
- **国内平台**（中文）：保留中文 → 用 adapt 模板改写
- **视频 post 分叉**：
  - 视频平台（YouTube/TikTok/Bilibili/抖音/快手）：完整视频描述 + 上传视频
  - 文本平台（X/微博/Discord）：文本摘要 + 附已发布视频链接（等视频平台先发出来回填 URL）

**改写前必读**：[`references/platform-specs.md`](references/platform-specs.md) 中对应平台段落，以及 `main.md` / `overseas.md` / `domestic.md` 的决策逻辑。

### Step 4：保存生成内容

```
Posts/20260205/1/
  ├── [原始文件]
  ├── generated/
  │   ├── x-final.md
  │   ├── weibo-final.md
  │   └── ...
  ├── metadata.json        # 发布元信息
  └── publish-report.md    # 发布后报告
```

**metadata.json** 最少字段：`created_at`、`post_folder`、`content_type`、`source_files`、`media_files`、`target_platforms`、`publish_status`（每平台一个状态：`pending` / `success` / `failed`）。发布后补 `urls`（每平台的结果链接）。

### Step 5：预览 + 确认

展示清单：

```
┌─────────────┬──────┬──────────────────────────────┐
│ Platform    │ Lang │ Preview                      │
├─────────────┼──────┼──────────────────────────────┤
│ X           │ EN   │ First 100 chars...           │
│ 微博        │ ZH   │ First 100 chars...           │
└─────────────┴──────┴──────────────────────────────┘

Total: 4 platforms | Media: cover.png, photo.jpg

Proceed? [Y/n]  (或 "skip x,weibo" 跳过指定平台)
```

### Step 6：浏览器自动发布

对每个平台跑标准流程：打开 URL → 检查登录（未登录暂停让用户登录）→ 进入编辑器 → 填文本/hashtag → 上传媒体 → 点发布 → 抓结果 URL 回写 `metadata.json`。

**跑自动化前必读** [`references/browser-automation.md`](references/browser-automation.md)：X.com 有空推文、脚本挂死、React state 不同步等坑，不读会反复踩。

### Step 7：生成报告

写 `publish-report.md`：

```markdown
# Publishing Report
**Date:** 2026-02-05 10:45:23
**Post:** Posts/20260205/1
**Type:** text_post

## Results
### Successful (3/4)
✅ X - https://x.com/...
✅ 微博 - https://...
✅ 小红书 - https://...

### Failed (1/4)
❌ Instagram - Error: 图太大

## Next Steps
- Instagram 压图后重试
```

同时更新 `metadata.json` 的最终状态。

---

## 错误处理

| 错误 | 处理 |
|---|---|
| 文件夹不存在 | 建议用绝对路径或项目根相对路径 |
| 无 `*.md` 文件 | 至少创建一个平台文件 |
| 无法识别的平台文件名 | 输出合法平台列表 |
| 翻译失败 | 跳过该海外平台并标 failed，**不要发中文到英文平台** |
| 超字符限制 | 截断 + "..."，建议拆分 |
| 文件超大 | 建议压缩或换格式 |
| 上传失败 | 重试 1 次，仍失败标记 failed 继续其他平台 |
| 需要登录 | 暂停，提示用户登录，用户确认后继续 |

---

## 最佳实践

1. **Pre-flight**：跑自动化前先检查文件夹存在、文件大小合规、视频时长合规
2. **降级**：全自动失败 → 降到半自动（剪贴板）。生成的内容**永远先保存**，即使发布失败
3. **用户控制**：发布前一律预览；允许平台级跳过；错误信息要明确
4. **内容组织**：原始文件和生成文件分开；元信息带时间戳；一切放 post 文件夹

---

## 依赖与约定

- 工作目录基线：用户的 PieAI Account 项目根（默认 `/Users/yuanfei/PieAI/PieAI-Account`，按实际环境调整）
- 必需：`config/platforms.yaml`、`prompts/translate.md`、`prompts/adapt-*.md`
- 推荐：`prompts/writing-style-examples.md`（有了风格更贴）

---

## 常见问题

| Q | A |
|---|---|
| 只发一个平台？ | 只建一个对应文件名（如 `x.com.md`） |
| 发全平台？ | 用 `main.md`（AI 决）或 `overseas.md` + `domestic.md` |
| 翻译风格不对？ | 加样本到 `prompts/writing-style-examples.md` |
| 内容超限？ | 看 `generated/` 手动编辑 |
| 视频上传慢？ | 大视频建议部分平台手动上传 |
| 某平台一直失败？ | 查登录/网络/平台特定要求 |

---

## 成功判定

✅ Post 文件夹读正确
✅ 平台文件识别正确
✅ 媒体文件发现到位
✅ 目标平台选对
✅ 翻译自然准确
✅ 平台适配符合规范
✅ 所有版本保存在 `generated/`
✅ 用户预览确认后才发
✅ 至少 80% 平台成功
✅ 报告落到 post 文件夹
