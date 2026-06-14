# Xiaohongshu

## Best for

Chinese image notes, candid building stories, lessons, and personal reactions. It needs a note-shaped title/caption, not a copied X post.

## Media

- Real screenshot is suitable.
- Use a short useful title plus a personal caption.
- Links may not be clickable; make the post understandable without relying on the website URL.

## Edge targeting

- Profile observed: `馅饼爱`
- Profile URL observed: `https://www.xiaohongshu.com/user/profile/6802274f000000000e011f2b`
- Creator entry observed from the profile left navigation: `https://creator.xiaohongshu.com/publish/publish?source=official`
- Primary control path: Microsoft Edge through the Codex extension/browser-client.
- Prefer an existing logged-in Edge workspace tab. Claim `https://creator.xiaohongshu.com/publish/publish?source=official` when it is already open.
- If the creator tab is not open, launch Edge to the creator entry or profile URL, then claim the resulting tab through the extension.
- Verify `馅饼爱` plus a creator-page signal such as `发布笔记`, `上传图文`, or `上传视频` before side effects.
- Use extension-backed file chooser upload for images. Use Computer Use only as the recorded fallback described in `references/browser-targeting.md`.

## Reliable steps

- Validated image note flow in Edge:
  1. Use extension tab listing and claim an existing `https://creator.xiaohongshu.com/publish/publish?source=official` tab. If it is not open, open the logged-in profile, then click left-nav `发布` to enter the creator center.
  2. On the creator publish page, choose `上传图文` if the default surface is `上传视频`.
  3. Click `上传图片` and attach the real screenshot through the file chooser.
  4. Fill title in `填写标题会有更多赞哦`.
  5. Fill the rich-text body with a short personal caption. Avoid relying on links.
  6. Scroll the internal `.publish-page` container to the bottom if needed.
  7. Click the bottom red `发布` button. It may not appear as a semantic button in accessibility snapshots; a visual screenshot may be needed to locate it.
  8. Success proof is the page text `发布成功`.

For Founder Log image notes, keep the title short and human. The body should feel like a small daily note, not a copied website summary.

## Common obstruction

- If the creator page does not load through the extension, reconnect once and retry a lightweight tab listing/claim before recording a blocker.
- The creator page uses an internal scroll container, not the document body. If the publish button is missing from the DOM snapshot, inspect the visual screenshot before concluding it is blocked.

## Proof

Record note URL when available. At minimum, save the `发布成功` proof screenshot.

## Status

Validated for screenshot image notes in the Edge PieAI social workspace.
