# Browser Targeting

Use this file before browser work involving X, YouTube, Instagram, or other logged-in social accounts.

## Extension ID is not enough

The visible extension ID identifies the Codex extension package, not the social account or window.

If the same extension is installed in Chrome and Edge, both can expose the same extension ID. The browser tool may also label extension clients generically, so do not trust the displayed browser name alone.

Use extension ID as one clue only.

## Hard extension preflight

Complete this gate before opening, navigating, filling, uploading, or publishing on any social platform:

1. Load `chrome:control-chrome`.
2. Follow its Bootstrap exactly: use the Node REPL `js` tool, import `scripts/browser-client.mjs` from the active Chrome plugin root with an absolute path, run `setupBrowserRuntime`, bind the bootstrap browser, and read the complete browser documentation.
3. Call `agent.browsers.list()`. For every result whose type is `extension`, call `agent.browsers.get(instance.id)` and inspect that exact instance's `user.openTabs()` result.
4. Select the extension instance that can see the exact target URL. Do not use the default `agent.browsers.get("extension")` result as the final browser selection without checking every extension instance.
5. Record the preflight result in the run report:
   - `extension_claimable`: target tab is returned and can be claimed.
   - `extension_connected_target_missing`: runtime works, but the target tab is not returned.
   - `extension_claimed_page_unresponsive`: target tab can be claimed, but title/DOM/snapshot/account-signal verification is empty or times out after one bounded retry.
   - `human_visible_not_claimable`: Edge/Computer Use can see a window or extension icon, but the extension runtime cannot list or claim its tab.
   - `extension_runtime_unavailable`: the exact Bootstrap plus one reconnect/retry failed.

Generic tool discovery returning no browser tool is not proof of `extension_runtime_unavailable`. A visible Codex extension icon is also not proof of `extension_claimable`.

Do not enter normal Computer Use fallback until the exact Bootstrap and one reconnect/retry have failed.

Extension instances may share the same extension id and may both be reported as `Chrome`, even when one is the configured Edge workspace. Use the tabs each instance can actually see, not the displayed browser name, last-used profile, or default extension selection.

Minimal selection pattern:

```js
const instances = (await agent.browsers.list()).filter((item) => item.type === "extension");
for (const instance of instances) {
  const candidate = await agent.browsers.get(instance.id);
  const tabs = await candidate.user.openTabs();
  // Select candidate only when tabs contains the exact target URL.
}
```

## Claim-first, launch-second flow

The automation should not depend on the user already having the right tab open.

When the user has configured Edge as the social browser:

1. Complete the hard extension preflight and inspect tabs for every extension instance.
2. If an Edge instance can already see the intended target URL in Yuanfei's PieAI social workspace, reuse that exact tab.
3. If the target is not visible, launch Microsoft Edge with the intended target URL.
4. Wait briefly for the page and extension connection.
5. List browser/extension instances and tabs again. If Edge was just launched but no instance can see the target URL, wait and retry for 10-15 seconds before declaring failure.
6. If the native pipe closes during startup, reset/reconnect the browser runtime once and retry the lightweight tab listing.
7. Select the extension instance that can see the target URL. Do not use a Chrome Person 1 instance merely because it has the same extension ID.
8. Claim that exact tab.
9. Verify the account handle and owner-only signal before side effects. Claim success alone is not page-readiness proof.

Example target:

```text
open -a "Microsoft Edge" "https://x.com/PieAIStudio"
```

Launching the browser is allowed when the user has asked for automation involving that browser. Do not use shell or AppleScript to bypass the Codex extension for social actions.

## Preserve the prepared Edge workspace

The user's open PieAI social workspace is valuable working state.

- If `browser.user.openTabs()` returns the target tab, claim it before any `open -a`, navigation, or new-tab action.
- Do not open a new Edge window when a matching target tab is claimable.
- Do not quit or restart Microsoft Edge as automatic recovery.
- `执行`, `确认发布`, or `全自动发布` approves the configured publishing actions. It does not approve quitting Edge, discarding prepared tabs, resetting the browser profile, or changing workspace layout.
- If a full Edge restart appears necessary, stop and request explicit approval for that browser-reset action. Record which tabs/workspace state may be disrupted.

## Workspace-aware Edge use

Yuanfei often keeps Microsoft Edge open in a workspace named for PieAI social media, with logged-in tabs for X, YouTube, Instagram, Bilibili, Xiaohongshu, Douyin, Kuaishou, and Weibo.

Use that workspace as a convenience, not as a hard dependency.

- If Edge is open and the extension-backed browser runtime can see the existing target tab, reuse it.
- If Edge is open but the target tab is missing, open only the current platform's URL.
- If Edge is closed, launch Edge with only the current platform's URL.
- Do not restore or activate every social tab just because they exist in a workspace.
- Do not open a brand-new Edge window when an existing verified Edge tab is already claimable.
- A workspace name, tab group, or sidebar label is only a hint. The real lock is the exact URL plus account/owner verification.

This keeps the workflow automatic while avoiding unnecessary windows and CPU spikes.

## Social browser control rule

Social publishing MUST use Microsoft Edge through the Codex extension/browser-client as the primary control path.

Do not use Computer Use as the normal way to choose the browser, choose a window, choose a tab, infer the account, fill ordinary web forms, upload local files, download files, or click final social-post controls.

Normal path:

1. List every browser/extension instance and inspect each extension instance's tabs.
2. Select the instance by actual tabs and target URLs, not by extension ID, default `get("extension")`, last-used profile, or displayed browser name alone.
3. Claim the exact target tab when it already exists.
4. If the target tab does not exist, launch Microsoft Edge with only the current platform URL, then list and claim that tab.
5. Verify the expected account handle and owner-only signal inside the claimed tab.
6. Use page-level automation for snapshots, clicks, typing, upload file choosers, and downloads when available.
7. Record proof, then release/finalize unneeded automation control before moving to the next platform.

If the exact tab can be claimed but a bounded title/DOM/snapshot/account-signal read is empty or times out, record `extension_claimed_page_unresponsive`. Reconnect once and retry the lightweight verification. If it repeats, stop that platform without opening duplicate tabs or restarting Edge.

Computer Use is allowed only as a fallback when:

- the Edge extension/browser-client path is unavailable after one reconnect/retry
- the verified page exposes a necessary step only through native OS UI
- a native dialog cannot be handled through page-level upload/download APIs
- the task is OS/window maintenance, not social-page judgment

If Computer Use is used, record the fallback reason in the run report, for example `extension runtime unavailable`, `filechooser not exposed`, or `native dialog required`.

### Computer Use fallback boundaries

Computer Use can see the foreground Edge window and accessibility tree. It cannot prove that all workspace tabs are listed or claimable through the extension runtime.

- A Computer Use instruction that prefers a new tab for a new web task does not override this skill's verified workspace-reuse rule.
- When the current visible tab is already the verified target for the current platform, treat it as the same workflow and reuse it.
- Use one visible working tab. Do not create new windows, restore every workspace tab, or infer hidden-tab state.
- Do not quit or restart Edge.
- Do not call an extension visible merely because its toolbar icon appears.
- Before a final publish click, verify in the same visible surface: expected account/owner signal, exact text, expected media previews, enabled final control, and a post-click proof signal. If any signal is missing, record a blocker instead of publishing.

## Resource discipline

Social sites are heavy. Treat Edge and the Codex extension as a single-lane workbench, not a multi-tab crawler.

- Work on one platform at a time.
- Do not claim or snapshot several social tabs in parallel.
- After each platform, record the result, then release or finalize any agent-created tabs that are not needed as deliverables.
- Claimed user tabs may stay open, but do not keep active automation control over them after their step is done.
- If a page or extension call times out once, reset/reconnect once and retry a lightweight tab listing. If it times out again, record a platform blocker and move on.
- Prefer direct target URLs over restoring many sleeping workspace tabs at once.
- Avoid broad DOM dumps from several SPAs in one call; use one bounded snapshot/evaluate on the current target only.

This reduces CPU/memory pressure and prevents one platform's broken page from freezing the whole publishing run.

## Safer target lock

Before clicking, typing, or publishing:

1. List available extension/browser instances.
2. List open tabs for each instance.
3. Find the exact target URL, for example `https://x.com/PieAIStudio`.
4. Prefer the tab opened by this run. Use tab group/title only as hints.
5. Claim the exact tab returned by the current listing. Do not guess tab ids.
6. Verify visible account signals, such as `@PieAIStudio` and an owner-only control like "Edit profile" / "编辑个人资料".
7. Take a screenshot or DOM snapshot if the next step has external side effects.

## Run-report preflight record

Record this before the first social platform:

```text
Browser preflight:
- Control lane: extension browser-client | Computer Use fallback
- Extension bootstrap: passed | failed after reconnect
- Every extension instance inspected: yes | no
- Selected extension instance id:
- Existing workspace target found: yes | no
- Claimed target URL:
- Claimed page verification: passed | extension_claimed_page_unresponsive
- Fallback reason:
- Browser restart requested: no | separately approved
```

## Publishing gate

Filling a draft and publishing are different actions.

- Opening or reading a page: no extra confirmation if the user asked for it.
- Filling a draft: confirm if the text could expose private data.
- Clicking final website publish, video upload, or configured social post: allowed after Yuanfei sends an execution command in the same session, when the exact destination/account/content match the packet or draft.
- Clicking Reply/Like/Repost/Follow/Delete/profile edit: always needs separate approval for that relationship action.
- If content or destination changes after approval, stop and show the new exact action before clicking.

## Obstruction handling

The goal is to keep automation moving through routine UI friction without letting K sign legal/permission/account changes for Yuanfei.

### Can auto-handle after target verification

Allowed only after the exact platform tab, expected account handle, and owner-only signal are verified:

- "not now", "skip", "close", "dismiss", "got it", "OK"
- cookie or privacy banners when choosing a conservative option such as necessary cookies, reject nonessential cookies, close, or continue without changing settings
- informational platform notices that only acknowledge reading and do not request new permissions or settings changes
- configured preapproved acknowledgement buttons, such as X `明白了`, when the run is already approved to continue and the dialog does not ask for new authority

For each auto-handled obstruction:

1. capture a DOM snapshot or screenshot when possible
2. record visible button text
3. record why it was classified as low-risk or preapproved
4. continue the workflow

### Must stop and ask

Never auto-click when the dialog involves:

- OAuth authorization or connecting a third-party app
- granting new account permissions, camera/microphone/filesystem access, or data sharing
- accepting paid terms, subscriptions, invoices, ads, monetization, or billing
- changing privacy/security/profile/account settings
- deleting, blocking, muting, reporting, or irreversible moderation
- final Post, Upload, Save, or Publish action unless it matches a same-session execution command and unchanged packet content
- Reply, Like, Repost, Follow, Delete, or profile edit action unless that exact relationship action was separately approved in the current execution session
- ambiguous wording where K cannot tell whether it is merely informational

### X known notice

If X blocks an already approved `@PieAIStudio` publish flow with a service terms/privacy update dialog whose visible action is `明白了`, K may click it automatically when all are true:

- the current tab has been claimed through the extension-backed browser runtime
- visible account signals confirm `@PieAIStudio` and an owner-only control such as `编辑个人资料`
- the dialog does not request payment, permissions, app authorization, or account-setting changes
- the run report records the acknowledgement

If any condition fails, stop and ask Yuanfei. If the only failure is that Edge launched but the Codex extension runtime did not appear, record it as `Edge extension runtime not connected`, not as an X login/content failure.

## Stored config

A future automation may store target preferences, but never as a single brittle key.

Store layered rules:

```yaml
x:
  browser_app: "Microsoft Edge"
  target_url: "https://x.com/PieAIStudio"
  expected_handle: "@PieAIStudio"
  preferred_tab_group: "墙外" # optional hint only
  extension_id: "hehggadaopoacecdllhhajmbjkdcmajg"
  require_owner_signal: "编辑个人资料"
```

If any required signal fails, stop and ask.
