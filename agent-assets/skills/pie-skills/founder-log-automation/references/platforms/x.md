# X

## Best for

Short movement signals, one concrete thought, candid image, website link, or YouTube link.

## Media

- Text plus image works well.
- Keep Chinese copy short and conversational.
- Include `整理：AI伙伴 K` when automation wrote or posted it.

## Edge targeting

- Entry: `https://x.com/PieAIStudio`
- Expected handle: `@PieAIStudio`
- Owner signal: `编辑个人资料`
- Use Edge claim-first: enumerate every extension instance, select the instance that sees this exact target URL, and claim the returned workspace tab before opening or navigating anything.

## Common obstruction

- Informational `明白了` notice may be dismissed after owner verification.
- Compose can expose multiple same-named dialogs; target the active inner compose dialog and enabled final post button.
- If the profile loads but `/compose/post`, `/home`, intent, or legacy compose routes render blank or stale, make one bounded extension-backed retry. Do not repeatedly navigate, open new tabs, disable extensions, or restart Edge through Computer Use.
- If the X workspace tab can be claimed but title/DOM/snapshot/account-signal verification is empty or times out, record `extension_claimed_page_unresponsive`; do not relabel it as missing Edge access or X logout.

## Publish gate

Before clicking the final post control, verify in the claimed extension-backed tab:

- expected account `@PieAIStudio`
- exact approved text and canonical link
- expected image preview count
- one enabled final post button

If only Computer Use is available and the compose surface is blank or stale, record a blocker. Do not treat the visible profile page or Codex toolbar icon as proof that the compose tab is controllable.

## Proof

Record status URL and screenshot of the published post.

## Tested

- 2026-06-08: image post published successfully through Edge.
