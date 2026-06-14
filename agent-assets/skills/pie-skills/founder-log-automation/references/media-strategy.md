# Media Strategy

Use this file when screenshots, recordings, videos, or embeds appear in a Founder Log workflow.

## Mental model

The website CMS-lite entry is the article. Media files are attached to the publish payload and referenced by the article.

For small redacted screenshots, the CMS-lite API uploads the image and returns a public media URL. For video produced by this workflow, use YouTube first. Git and website deploys are not a video platform.

## Recommended defaults

### Screenshots

Every Founder Log entry should try to include at least one candid screenshot unless there is truly no real work surface to capture. The goal is not a perfect product shot; the goal is "I was actually building this" energy.

Use CMS-lite media attachments when:

- the screenshot has been reviewed and redacted where needed
- the file is small
- it is part of the article's meaning

Suggested run-folder source path:

```text
/Users/yuanfei/PieAI/PieHQ/1 How/FounderLogs/YYYY-MM-DD/screenshots/screen-01.png
```

Suggested Markdown in the CMS-lite body:

```markdown
![Screenshot description]({{asset:screen-01.png}})
```

Keep raw or private screenshots in:

```text
/Users/yuanfei/PieAI/PieHQ/1 How/FounderLogs/YYYY-MM-DD/screenshots/
```

Default screenshot style:

- casual, slightly imperfect framing is fine
- include browser chrome, app chrome, tabs, sidebars, window frames, or terminal/editor context when it helps the scene feel real
- game/demo shots can include the browser frame instead of only the pristine canvas
- process/workflow shots can show an editor, folder, config file, local preview, terminal output, or run folder
- do not create a staged clean scene just for the screenshot

Redaction rule:

- Capture first, inspect second, redact third.
- Blur, mosaic, crop, or cover only the sensitive region.
- Redact passwords, bank/payment details, full API keys/tokens/cookies/auth codes, private messages, email inbox bodies, billing/KYC/account-setting pages, and private personal data.
- Normal dev clutter, rough UI, browser frames, local preview URLs, route names, partial paths, and terminal prompts can stay unless they reveal a real secret.

Avoid only when redaction cannot make the image safe enough:

- password managers
- payment/KYC/billing pages
- private message or email inbox content
- account settings that expose private account/security state
- a screenshot where sensitive material is too dense to redact naturally

If no screenshot is captured, the packet must state the blocker and a specific next attempt.

### Video and screen recordings

Use YouTube by default for all publishable/redacted videos produced by this automation.

Reasons:

- one upload can serve the official site and social variants
- YouTube provides playback, transcoding, thumbnails, discovery, comments, and durable URLs
- the website stays light and the Git repo does not become a video archive

Do not self-host videos from this workflow unless the user explicitly overrides the rule.

Video must show meaningful project or product activity.

Good video sources:

- a local or public app/demo being opened and used
- a game, tool, or website flow with visible clicks, scrolls, state changes, or output
- a software workflow such as an editor, terminal, local preview, or generated artifact when that workflow itself is the story
- a short browser recording of the target app viewport, including browser chrome when it helps the scene feel real

Bad video sources:

- the whole desktop when nothing relevant is happening
- a random social profile, inbox, homepage, or current browser state
- a system permission dialog or macOS privacy prompt
- a static screenshot stretched into a fake video
- a screen recording whose main content is Codex waiting, planning, or asking for permission

Prefer app-scoped recording over full-screen recording:

- For web apps, start the target project locally or open the public page and record that viewport with Playwright or equivalent browser recording.
- For native apps, record the app window or a bounded safe area only after verifying the content is relevant.
- If an OS screen-recording permission prompt appears, stop that route and switch to app-scoped recording or ask Yuanfei.
- If a recording accidentally captures unrelated accounts, private pages, or a permission dialog as the main scene, delete it from publishable media and mark it as unusable.

If a video is private, sensitive, or not suitable for YouTube after redaction/cropping, it should not enter the public Founder Log automation. Keep it in the PieHQ run folder as private evidence or discard it from the packet.

No-video runs are allowed, but they must not become website-only by habit. If no publishable video exists, skip the YouTube upload, keep website and X moving, and record what video test should happen next.

## YouTube flow

1. Export a publishable/redacted video.
2. Upload to YouTube manually or with an approved browser-assisted flow.
3. Save the YouTube URL in the run folder.
4. Reference the URL in the website log and social variants.
5. Optionally add an embed component later if the website supports it.

For automation-assisted uploads, add attribution in the YouTube description:

```text
整理与上传协助：AI伙伴 K
```

Initial Markdown can simply link:

```markdown
录屏放在 YouTube：<https://www.youtube.com/watch?v=VIDEO_ID>
```

If the site later adds a safe embed component, switch to:

```mdx
<YouTubeEmbed id="VIDEO_ID" title="Demo title" />
```

Do not add JSX embeds until the website supports and tests the component.
