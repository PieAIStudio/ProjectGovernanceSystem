# Bilibili

## Best for

Longer video demos, development recordings, and community updates. Dynamic/image posts can carry screenshot-based progress when the dynamic publishing surface is available.

## Media

- Video submission requires a real video.
- For screenshot-only Founder Log, prefer a Bilibili dynamic/image post rather than manufacturing a video.

## Edge targeting

- Creator/profile page observed: `https://space.bilibili.com/3546887678331847/upload/video`
- Dynamic publishing entry: `https://t.bilibili.com/`
- Visible owner/account signals: `PieAI`, email `pieai@hotmail.com`, `投稿`, and upload controls.

## Dynamic publishing

- Use a dynamic for screenshot-only Founder Logs.
- The dynamic editor supports an optional title and a rich-text body.
- Do not trust accessibility `set_value` alone for the rich-text body. Use literal keyboard/clipboard input or an extension page-level fill method, then verify the body remains visible after focus changes.
- The final `发布` control is visually present but may be exposed as generic text rather than a semantic button.
- First determine whether the current dynamic editor actually supports image posts. If a real upload entry exists, attach the screenshot before publishing. If no image upload support is available for the current account/surface, skip Bilibili for screenshot-only logs; do not publish text-only unless Yuanfei explicitly asks.
- The image icon does not expose a normal `input[type=file]` to browser automation, but it can trigger a real file chooser. Use the visible image icon in the dynamic editor and attach the screenshot through the file chooser.
- 2026-06-09: real image dynamic succeeded in Edge. Working flow: open `https://t.bilibili.com/`, verify `PieAI`, fill body, click the visible image icon, attach screenshot through the file chooser, click `发布`, then click `确认并发送` when the platform asks for final confirmation.
- Before publishing, verify the exact title, rendered body or body counter/preview, and expected image preview count. If the body cannot be proven present, stop instead of publishing title plus images.
- After publishing, verify the live dynamic contains the expected body as well as the title and images. If the body is missing, report `published_with_content_mismatch`; do not call it a complete success or silently delete/repost.
- If the Edge extension starts timing out on Bilibili, do not keep reconnecting. Preserve the draft/proof state, record the blocker, and continue the next platform.

## Proof

For video, record video URL/id and processing status. For dynamic, proof can be the post appearing in the feed as `PieAI` with `刚刚`, plus a screenshot. Capture a direct dynamic URL when the UI exposes one; do not block success on immediate URL availability.

## Tested

- 2026-06-09: Edge profile and PieAI owner surface verified. Screenshot image upload and dynamic publish are validated.
