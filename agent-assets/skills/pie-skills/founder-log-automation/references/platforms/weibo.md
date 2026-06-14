# Weibo

## Best for

Chinese text/image progress updates, website links, and public conversation.

## Media

- Text plus one real screenshot is appropriate for a Founder Log distribution post.
- Keep the copy shorter than the website entry and include the canonical link.

## Edge targeting

- Owner page: `https://weibo.com/u/7993748388`
- Verify the visible `馅饼爱` owner profile and owner-only `发微博` surface before publishing.

## Publishing

- Browser-assisted posting is validated.
- Use the visible `图片` control to open the file chooser. Clicking a hidden `input[type=file]` is unreliable and can break the browser connection.
- Fill the text and attach the approved screenshots.
- Returning from the native file picker is not upload proof. Verify the expected image preview count appears inside the composer.
- Verify the exact text, image previews, and enabled unique `发送` control, then publish.
- If selected files do not produce image previews, stop and record `Weibo file selected but media preview missing`; do not publish a text-only downgrade.
- Official API publishing requires Weibo Open Platform app/token onboarding.

## Proof

The visible alert `发布成功` is authoritative status proof. Record the post URL when it is immediately available; otherwise record the success alert and fetch the URL in a later read-only pass.

## Tested

- 2026-06-09: verified `馅饼爱` owner page, posted Chinese text plus `screen-01.png`, and received `发布成功`.
