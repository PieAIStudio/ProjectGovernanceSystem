# YouTube

## Best for

Durable home for screen recordings, demos, explainers, and videos reused by the website and other platforms.

## Media

- Requires a real publishable video; do not turn a still screenshot into a meaningless video just to satisfy the channel.
- Prefer a project/app usage recording: launch the app or public page, click or scroll through a meaningful flow, and record that app/browser viewport rather than the whole desktop.
- Do not upload videos whose main content is an unrelated desktop, social profile, permission prompt, or Codex waiting state.
- Description should link the Founder Log and include `整理与上传协助：AI伙伴 K`.

## Edge targeting

- Entry: `https://studio.youtube.com`
- Verify the PieAI channel before upload.

## Publishing

- Browser-assisted upload is allowed after an execution command.
- API upload through YouTube Data API `videos.insert` is possible after OAuth is configured.
- For first-time or validation uploads, use `Unlisted` unless the approval packet or same-session command explicitly says the YouTube video should be public. The website and social posts can still use an unlisted YouTube URL.
- Prefer the extension-backed `filechooser` upload flow in YouTube Studio:
  1. open `https://studio.youtube.com`
  2. verify the PieAI channel
  3. click Create / Upload video
  4. wait for the file chooser
  5. call `setFiles(["/absolute/path/to/video.mp4"])`
- Do not use Finder/Computer Use for the file picker unless the extension-backed file chooser is unavailable, and record the fallback reason.
- After the file is selected, verify required fields by state, not by assumption:
  - title filled
  - description filled
  - audience set to `Not made for kids` / `不，内容不是面向儿童的`
  - age restriction remains `No` unless Yuanfei explicitly says otherwise
  - visibility set to `Unlisted` for validation uploads
- If a radio click appears to work, inspect `aria-checked` / checked state before continuing. YouTube may keep the step locked until the required radio is truly selected.

## Proof

Record video URL, visibility, processing status, and screenshot.

## Tested

- 2026-06-09: Edge tab exists and account profile is PieAI, but no video existed for the 2026-06-08 Show post, so upload was correctly skipped.
- 2026-06-09: Extension-backed YouTube Studio file chooser upload worked with a generated Show app-usage MP4. Required audience radio needed checked-state verification before the Continue button unlocked. Unlisted visibility saved successfully; proof stayed in the PieHQ run folder.
