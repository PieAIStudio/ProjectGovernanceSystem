# Configuration

Use this file before scanning projects, Codex sessions, or social accounts.

## Rule

Do not hardcode active projects into the skill. Projects change more often than the workflow.

The skill should describe how to scan. The configuration should describe what is allowed to scan today.

## Preferred config location

Use a PieHQ-local config file when available:

```text
/Users/yuanfei/PieAI/PieHQ/1 How/FounderLogs/config.yaml
```

If that file does not exist, use only:

- PieHQ
- projects explicitly named by the user in the current thread
- files or screenshots the user explicitly provides

Ask before scanning anything else.

## Suggested schema

```yaml
version: 1
canonical_site:
  repo: /Users/yuanfei/PieAI/PieAIStudio-Site
  publish_method: cms_lite_api
  publish_endpoint: https://pieaistudio.com/api/founder-log/publish
  publish_token_env: FOUNDER_LOG_PUBLISH_TOKEN
  publish_token_local_env_file: /Users/yuanfei/PieAI/PieAIStudio-Site/.env.local
  body_format: markdown
  media_placeholder: "{{asset:filename}}"
  legacy_mdx_dir: src/content/founder-log/zh
  legacy_asset_dir: public/founder-log

scan:
  default_date_range: today
  allow_codex_sessions: true
  codex_session_scope: allowlisted_projects_only
  allow_browser_history: false
  allow_email: false
  allow_private_messages: false
  ignore_paths:
    - 1 How/FounderLogs/_archive

projects:
  - id: piehq
    path: /Users/yuanfei/PieAI/PieHQ
    scan:
      - 0 What
      - 1 How
      - docs/reference/execution
      - docs/reference/public-surface-strategy
  - id: pieaistudio-site
    path: /Users/yuanfei/PieAI/PieAIStudio-Site
    scan:
      - src/content/founder-log
      - src/app
      - docs

social:
  browser_app: Microsoft Edge
  extension_id: hehggadaopoacecdllhhajmbjkdcmajg
  obstruction_policy:
    auto_handle_low_risk: true
    record_auto_handled_obstructions: true
    preapproved_acknowledgements:
      - platform: x
        button_text: 明白了
        context: verified_owned_account_informational_policy_notice
    never_auto_click:
      - oauth_authorization
      - payment_or_billing
      - new_permissions
      - privacy_or_account_setting_changes
      - deletion_or_moderation
      - final_publish_without_execution_command
  accounts:
    x:
      url: https://x.com/PieAIStudio
      expected_handle: "@PieAIStudio"
      owner_signal: "编辑个人资料"
    youtube:
      studio_url: https://studio.youtube.com
      channel_hint: PieAI

publishing:
  default_language: zh
  assistant_byline: AI伙伴 K
  default_mode: full_configured_channels
  approval_mode: one_command_after_packet
  execution_commands:
    - 执行
    - 发布
    - 批准全部
    - 确认发布
    - 全自动发布
  required_channels:
    - website
    - x
  youtube_policy: upload_when_publishable_video_exists
  require_candid_screenshot: true
  screenshot_style: candid_workspace
  screenshot_safety_mode: redact_after_capture
  voice_style: oral_emotional
  require_approval_packet: true
  require_final_click_confirmation: false
  ask_again_when:
    - destination_or_account_changed
    - content_changed_after_execution_command
    - oauth_or_new_permissions
    - payment_legal_privacy_account_setting
    - reply_like_follow_repost_profile_edit
  website_is_canonical: true
  videos_default_to_youtube: true

distribution:
  enabled_channels:
    - website
    - x
    - youtube_when_video
  platform_registry:
    website:
      enabled: true
      required: true
      method: cms_lite_api
    x:
      enabled: true
      required: true
      method: edge_browser
      account_url: https://x.com/PieAIStudio
      expected_handle: "@PieAIStudio"
      owner_signal: 编辑个人资料
    youtube:
      enabled: true
      required: false
      method: browser_or_api_after_validation
      condition: publishable_video_exists
      channel_hint: PieAI
    instagram:
      enabled: false
      requires_onboarding: true
      method: browser_or_api_after_validation
    tiktok:
      enabled: false
      requires_onboarding: true
      method: browser_or_api_after_validation
    douyin:
      enabled: false
      requires_onboarding: true
      method: browser_or_api_after_validation
    kuaishou:
      enabled: false
      requires_onboarding: true
      method: browser_or_api_after_validation
    weibo:
      enabled: false
      requires_onboarding: true
      method: browser_or_api_after_validation
    xiaohongshu:
      enabled: false
      requires_onboarding: true
      method: browser_after_validation
    bilibili:
      enabled: false
      requires_onboarding: true
      method: browser_or_api_after_validation
    discord:
      enabled: false
      reason: community_only_not_daily_broadcast

media:
  screenshots:
    style: candid_workspace
    include_browser_chrome: true
    prefer_real_work_surface: true
    redact_after_capture: true
    avoid_over_cleaning: true
    allow_normal_dev_clutter: true
    redact:
      - passwords
      - bank_or_payment_details
      - full_api_keys_tokens_cookies_auth_codes
      - private_messages_or_email_bodies
      - billing_kyc_account_security_pages
      - private_personal_data
```

## Codex sessions

Only scan Codex sessions when the session can be associated with an allowlisted project or current thread context.

Allowed signals:

- project path
- repo name
- final response summaries
- generated artifacts and screenshots in allowlisted directories
- user-provided session references

Avoid raw full-session dumps unless the user explicitly asks. A full session can contain private paths, unfinished thinking, credentials, or unrelated personal data.

## Missing config behavior

If no config exists, do not invent a broad scan. Produce a small packet saying config is missing and list the minimum questions or candidate projects needed.
