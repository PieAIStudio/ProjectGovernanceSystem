# Website

## Role

Canonical home for Founder Log. Best for the full Chinese record, durable URL, screenshots, and links to videos.

## Publishing

- Method: CMS-lite API.
- Endpoint: `https://pieaistudio.com/api/founder-log/publish`
- Body: safe Markdown.
- Images: CMS-lite media payload plus `{{asset:filename}}`.
- Videos: upload to YouTube first, then link from the entry.
- Normal daily logs do not require MDX, commit, push, or deploy.

## Proof

- Expect HTTP 201 with `mode: cms-lite`.
- Verify returned detail path and visible title/body/media.
- Record response and public URL.

## Tested

- 2026-06-09: same-slug runtime update succeeded with one PNG and revalidated homepage, log index, search, feed, sitemap, and detail page.
