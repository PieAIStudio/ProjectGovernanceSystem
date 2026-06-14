# Patchright / 浏览器自动化（X.com 发布特定坑）

> **只在真正跑自动发布时读这份文件**。读 SKILL.md 本体不需要这些细节。

以下模式解决了 X.com 自动化里最常见的"空推文"错误和脚本挂死问题。

## Navigation Strategy

**问题**：X.com 后台持续 WebSocket 轮询，`waitUntil: 'networkidle'` 永远不返回。

```javascript
// ✅ 等 DOM 就绪，忽略后台轮询
await page.goto("https://x.com/home", { waitUntil: "domcontentloaded" });

// ❌ 永远挂死
await page.goto("https://x.com/home", { waitUntil: "networkidle" });
```

## Text Input（React 兼容）

**问题**：`page.fill()` / `execCommand` 绕过事件监听，React state 不同步，最终提交为空。

```javascript
// ✅ 模拟真实键入，触发 React state
await page.locator('[data-testid="tweetTextarea_0"]').click();
await page.keyboard.type("Hello World", { delay: 50 });

// ❌ 绕过事件，state 为空
await page.fill('[data-testid="tweetTextarea_0"]', "Hello World");
```

## Media Upload & State 保全

**问题**：上传媒体经常重置文本编辑器状态。

```javascript
// 上传媒体
await page.locator('input[type="file"]').setInputFiles(mediaFiles);
await page.waitForTimeout(3000); // 等处理

// 再校验文本（关键！）
const text = await page.locator('[data-testid="tweetTextarea_0"]').innerText();
if (!text.trim()) {
  await page.keyboard.type("Hello World"); // 丢了就重打
}
```

## Process Cleanup

启动前杀掉孤儿 Chromium 进程，避免资源锁死：

```bash
pkill -f "Chromium"
pkill -f "patchright"
# 或者：./tools/cleanup.sh
```

## Unbuffered Logging

关键日志用 `console.error` 保证实时输出（`console.log` 有 stdout buffer，看起来像卡住其实在跑）。
