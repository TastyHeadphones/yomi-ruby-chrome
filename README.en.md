# YomiRuby (English, 🇬🇧)

![YomiRuby Promo](icons/promo_marquee_1400x560.png)

<div align="center">

[🇬🇧 English](README.en.md) · [🇨🇳 简体中文](README.zh-CN.md) · [🇮🇩 Bahasa Indonesia](README.id.md) · [🇰🇷 한국어](README.ko.md) · [🇹🇭 ไทย](README.th.md)<br>
[🇻🇳 Tiếng Việt](README.vi.md) · [🇲🇲 မြန်မာ](README.my.md) · [🇮🇳 हिन्दी](README.hi.md) · [🇳🇵 नेपाली](README.ne.md) · [🇵🇭 Filipino](README.fil.md)<br>
[🇲🇾 Bahasa Melayu](README.ms.md) · [🇱🇰 සිංහල](README.si.md) · [🇫🇷 Français](README.fr.md) · [🇧🇷 Português (Brasil)](README.pt-BR.md) · [🇯🇵 日本語](README.ja.md)

</div>

## Chrome Web Store

Install from Chrome Web Store:

- <https://chromewebstore.google.com/detail/yomiruby/hbhhomegemogffhoeaoijibjeapciibk>

## Overview

YomiRuby is a production-ready Manifest V3 Chrome extension that annotates Japanese text with furigana using semantic HTML ruby tags (`<ruby>`, `<rt>`, `<rp>`).

## Highlights

- Sentence and paragraph-based annotation flow.
- Progress overlay with live status updates.
- Cancel and kana visibility actions for safe iteration.
- Quota-aware pacing and retry/backoff logic for Yahoo API.
- Client ID test flow in Settings page.
- Offline mode fallback with a local dictionary when Client ID is missing or offline mode is enabled.
- Conservative DOM updates to reduce layout breakage.
- UI localization for English, Japanese, Simplified Chinese, Korean, Thai, Vietnamese, and Indonesian.

## Quick Start

1. Install from Chrome Web Store (link above).
2. Open extension **Settings**, set a Client ID if you want Yahoo API usage, or enable offline mode for the local dictionary.
3. Click **Test Client ID** when using the Yahoo API, then **Save Settings**.
4. Visit a Japanese page and click **Run Annotation Now**.
5. For local development, open `chrome://extensions`, enable **Developer mode**, then **Load unpacked**.

## Client ID Setup

- Developer portal: <https://developer.yahoo.co.jp/>
- API reference: <https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html>

YomiRuby sends requests to:

- `https://jlp.yahooapis.jp/FuriganaService/V2/furigana`

If you prefer offline mode, YomiRuby uses a bundled local dictionary and does not send page text to Yahoo.

## Architecture

| Component | Responsibility |
|---|---|
| `background.js` | API communication, offline dictionary loading, quota pacing, retries, and tab/job status |
| `content.js` | DOM traversal, safe ruby injection, progress overlay, cancel/kana visibility |
| `popup.*` | User controls: enable, run, cancel, kana visibility, open settings |
| `options.*` | Client ID input, validation, API test, offline mode, save settings |
| `utils/*` | Constants, Japanese text helpers, DOM and ruby utilities |

## Permissions

| Permission | Why it is required |
|---|---|
| `storage` | Store Client ID/settings and temporary annotation status |
| `tabs` | Access active tab and send annotation commands |
| `scripting` | Ensure content scripts are available on target pages |
| `<all_urls>` | Annotate general websites |
| `https://jlp.yahooapis.jp/*` | Request furigana data from Yahoo API |

## Privacy and Security

- Full policy: [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- Client ID is provided by the user and is never hardcoded.
- Text is sent to Yahoo API only when annotation is requested and offline mode is disabled.
- No YomiRuby backend server is used.

## Limitations

- Furigana alignment is best effort and depends on API tokenization output.
- Dynamic pages (shadow DOM/canvas-heavy apps) may be only partially covered.
- Very large pages can still be slower due to conservative processing.

## Roadmap

- Better phrase-level alignment and user dictionary support.
- Optional site allow/deny lists.
- Incremental annotation for dynamic content.

## Contributing

Issues and pull requests are welcome:

- <https://github.com/TastyHeadphones/yomi-ruby-chrome/issues>

## License

Unlicense. See [LICENSE](LICENSE).
