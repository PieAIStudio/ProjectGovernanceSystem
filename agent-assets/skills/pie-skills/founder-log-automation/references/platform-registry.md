# Platform Registry

Use this file when planning or executing multi-platform distribution.

## Rule

The skill may know about many platforms, but one-command publishing should only run channels that are both:

1. enabled in config
2. validated for the current account, browser/API method, and media requirements

Supported but unvalidated platforms are onboarding tasks, not required publishing failures. Do not let an unvalidated platform stop website and X from shipping.

## Platform playbooks

Before using a platform, read its file under `references/platforms/`:

- `website.md`
- `x.md`
- `youtube.md`
- `instagram.md`
- `tiktok.md`
- `douyin.md`
- `kuaishou.md`
- `weibo.md`
- `xiaohongshu.md`
- `bilibili.md`
- `discord.md`

After a real run, update only durable facts: suitable content, media requirements, working entry URLs, account/owner signals, reliable steps, common obstructions, and proof method. Mark observations with the date tested. Do not store passwords, tokens, cookies, private account details, or one-off post text in playbooks.

Treat each playbook as a small operational memory:

- `Best for` says whether the current story belongs on the platform.
- `Media` says which real asset is required; never manufacture filler media just to satisfy a lane.
- `Targeting` says how to identify the correct account and posting surface.
- `Reliable steps` records only steps proven in a real run.
- `Obstructions` records reproducible blockers and the next recovery path.
- `Proof` defines what counts as success.

When a platform is known to freeze or break the extension connection, do not repeatedly retry it in the same run. Record the blocker, continue other lanes, and leave the affected platform as onboarding work.

## Default channels

| Platform | Default state | Role | Method |
| --- | --- | --- | --- |
| website | enabled, required | canonical Founder Log | CMS-lite API |
| X | enabled, required | fast movement signal | Edge browser-assisted unless API is configured |
| YouTube | enabled, conditional | video home for recordings | browser/API after channel validation |
| Instagram | enabled, validated | visual distribution | Edge browser-assisted |
| TikTok | supported, onboarding | short video distribution | browser/API after validation |
| Douyin | supported, onboarding | China short video | browser/API after validation |
| Kuaishou | supported, onboarding | China short video | browser/API after validation |
| Weibo | enabled, validated | China public feed | Edge browser-assisted |
| Xiaohongshu | enabled, validated | China note-style post | Edge browser-assisted |
| Bilibili | enabled, validated | China long video/community | Edge browser-assisted |
| Discord | disabled by default | community, not daily broadcast | use later for community ops |

## Platform notes

- TikTok Content Posting API requires OAuth scopes and app review/audit before reliable public direct posting. Browser-assisted publishing is the likely first validation path.
- YouTube Data API `videos.insert` can upload videos with OAuth; browser-assisted upload is acceptable until an API token path is configured.
- X can be browser-assisted today through the verified Edge account. API posting requires user-token/API setup and is optional.
- Douyin and Kuaishou official publishing APIs require platform permissions, user authorization, and sometimes async status checks.
- Bilibili dynamic image posts, Instagram screenshot feed posts, and Xiaohongshu screenshot image notes are validated through the Edge PieAI social workspace as of 2026-06-09.
- Weibo browser posting is validated for text plus one real screenshot. Use the visible `图片` control for upload and the visible `发送` control for final publish.
- TikTok, Douyin, and Kuaishou remain video-first onboarding lanes. Do not manufacture filler video for screenshot-only Founder Logs.

## Execution behavior

When Yuanfei says `执行`, `发布`, `批准全部`, `确认发布`, or `全自动发布`:

1. Publish website canonical first.
2. Before the first browser-assisted social platform, complete `browser-targeting.md` hard extension preflight: bootstrap browser-client, inspect tabs for every extension instance id, and select the instance that sees the exact target URL. Do not use the default extension instance as the final selection.
3. Publish X after the website URL exists.
4. Upload to YouTube only when there is a publishable/redacted video.
5. Publish any other `enabled: true` and validated platform variants.
6. Record supported-but-disabled platforms under `onboarding needed`.

Operate platforms one at a time. Social sites are heavy; do not claim/snapshot multiple social tabs in parallel. Finish the current platform, save proof/blocker, release or finalize the page, and only then continue.

Reuse a claimable existing Edge workspace tab before opening anything. Do not quit or restart Edge as automatic recovery. If Computer Use is required, record the fallback reason and do not let its generic new-tab preference override the verified workspace-reuse rule.

Do not claim a platform is solved until a real dry-run or real post has verified:

- the extension instance selected by exact target URL, or the recorded Computer Use fallback reason
- the logged-in account
- the owner signal
- the posting surface
- the media upload path
- the final URL/status proof

## Social feedback

Daily feedback reading may inspect public comments/replies/visible engagement for enabled accounts. It should draft suggestions, not auto-like, auto-reply, auto-follow, or auto-repost unless Yuanfei separately approves those relationship actions.
