# Instagram

## Best for

Strong visual proof, product screenshots, short demos, reels, and compact captions. Website links in normal captions are not a dependable click-through path; prioritize the image/video and concise story.

## Media

- A normal feed post can use a real screenshot.
- Reels require video.
- Prefer a clean-enough vertical or square crop, but keep the image authentic.

## Edge targeting

- Profile entry: `https://www.instagram.com/pieaistudio/`
- Verify the visible `pieaistudio` owner account before publishing.
- Do not depend on opening `https://www.instagram.com/create/select/` directly from a cold state. On 2026-06-09 that route was sometimes interpreted as a normal `/create/` profile page. Prefer the logged-in Instagram surface and click the left-nav `新帖子` entry.

## Reliable steps

- 2026-06-09 validated feed post flow in Edge:
  1. Open a logged-in Instagram page for `pieaistudio`.
  2. Click left-nav `新帖子`.
  3. In `创建新帖子`, click `从电脑中选择` and attach the real screenshot through the file chooser.
  4. Click `继续` on crop, then `继续` on filter/edit.
  5. Fill the caption in the textbox named `输入配文...`.
  6. Click `分享`.
  7. Success proof is the dialog `你的帖子已分享。`; click `完成` after proof is captured.

Keep the caption useful without relying on a clickable URL. Instagram captions can show the website address, but the image and text should stand alone.

## Common obstruction

- 2026-06-09: the direct create URL and profile sometimes rendered blank in Computer Use or timed out through the extension. Treat that as a route/tooling issue, not proof of logout. Make one bounded retry through the logged-in page and `新帖子`; if that fails, record the blocker and move on.
- Do not repeatedly open direct create URLs or restart Edge when the extension runtime cannot claim the Instagram tab. Restore the extension browser-client first or record the platform blocker.

## Publish gate

Before `分享`, verify the claimed tab shows:

- account `pieaistudio`
- the expected selected-media preview
- the exact approved caption
- the final share control

After `分享`, require the authoritative `你的帖子已分享。` dialog or a public post URL. A startup screen, profile shell, or blank accessibility tree is not success.

## Proof

Record post/reel URL when available. At minimum, save the `帖子已分享` success dialog screenshot.

## Status

Validated for screenshot feed posts in the Edge PieAI social workspace. Reels/video still require separate validation.
