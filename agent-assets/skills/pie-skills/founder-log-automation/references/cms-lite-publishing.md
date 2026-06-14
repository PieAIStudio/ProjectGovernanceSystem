# CMS-lite Website Publishing

Use this file when the workflow drafts or publishes the official PieAIStudio Founder Log.

## Default path

Founder Log website publishing now uses the PieAIStudio-Site CMS-lite runtime content lane. Do not add a new MDX file, commit, push, or redeploy the website just to publish a daily Founder Log entry.

Read the site reference when available:

```text
/Users/yuanfei/PieAI/PieAIStudio-Site/docs/reference/site/founder-log-cms-lite.md
```

## Endpoint

```http
POST https://pieaistudio.com/api/founder-log/publish
Authorization: Bearer <FOUNDER_LOG_PUBLISH_TOKEN>
Content-Type: application/json
```

Find the token in this order:

1. `FOUNDER_LOG_PUBLISH_TOKEN` from the environment.
2. The configured local env file, normally `/Users/yuanfei/PieAI/PieAIStudio-Site/.env.local`.

Never print the token, paste it into a packet, or commit the env file.

## Payload

```json
{
  "entry": {
    "title": "把 Show 的上线门槛收紧一点",
    "date": "2026-06-09",
    "project": "Show",
    "type": "build-note",
    "status": "published",
    "visibility": "public-safe",
    "slug": "show-launch-readiness-guardrails",
    "lang": "zh",
    "summary": "一句公开安全摘要。",
    "body": "正文 Markdown。![截图]({{asset:screen-01.png}})"
  },
  "media": [
    {
      "filename": "screen-01.png",
      "contentType": "image/png",
      "base64": "<base64 image bytes>"
    }
  ]
}
```

Rules:

- `visibility` must be `public-safe` because that is the site schema. This does not mean the screenshot must be sterile; it means the final public entry must not leak real secrets.
- Body is safe Markdown, not MDX or HTML.
- Attach redacted images through `media`; reference them as `{{asset:filename}}`.
- Video from this workflow goes to YouTube first. Put the YouTube URL in the Markdown body after upload.
- Do not include private local paths such as `/Users/...`, cloud-drive paths, token snippets, account pages, private messages, billing/KYC details, or private workspace markers in title, summary, project, or body.

## Verify

Expected success:

```json
{
  "ok": true,
  "mode": "cms-lite",
  "path": "/zh/log/<slug>",
  "media": ["https://..."],
  "revalidated": ["/zh", "/zh/log", "/zh/search", "/feed.xml", "/sitemap.xml", "/zh/log/<slug>"]
}
```

After publishing:

1. Save the response JSON in the run folder.
2. Verify `https://pieaistudio.com<path>` returns 200.
3. Check `/zh/log` and `/zh` when practical.
4. Record URLs, media URLs, checks, and any failures in `run-report.md`.

## Fallbacks

- `401`: token missing/wrong. Stop and report the auth issue.
- `503`: production store or publish token is not configured. Stop and report the site env issue.
- `400 public-safe validation failed`: redact or rewrite the specific leaked path/secret and retry once.
- Legacy MDX/commit/deploy is allowed only if Yuanfei explicitly asks for fallback mode or the CMS-lite lane is unavailable and he accepts the slower deploy path.
