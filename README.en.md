# YomiRuby (English, 🇦🇺/Global)

![YomiRuby Promo](icons/promo_marquee_1400x560.png)

<div align="center">

[🇬🇧 English](README.en.md) · [🇨🇳 简体中文](README.zh-CN.md) · [🇮🇩 Bahasa Indonesia](README.id.md) · [🇰🇷 한국어](README.ko.md) · [🇹🇭 ไทย](README.th.md)<br>
[🇻🇳 Tiếng Việt](README.vi.md) · [🇲🇲 မြန်မာ](README.my.md) · [🇮🇳 हिन्दी](README.hi.md) · [🇳🇵 नेपाली](README.ne.md) · [🇵🇭 Filipino](README.fil.md)<br>
[🇲🇾 Bahasa Melayu](README.ms.md) · [🇱🇰 සිංහල](README.si.md) · [🇫🇷 Français](README.fr.md) · [🇧🇷 Português (Brasil)](README.pt-BR.md) · [🇯🇵 日本語](README.ja.md)

</div>

## Overview

YomiRuby is a production-ready Manifest V3 Chrome extension that annotates Japanese text with furigana using semantic HTML ruby tags (`<ruby>`, `<rt>`, `<rp>`).

## Highlights

- Sentence and paragraph-based annotation flow.
- Progress overlay with live status updates.
- Cancel and restore actions for safe iteration.
- Quota-aware pacing and retry/backoff logic for Yahoo API.
- API key test flow in Settings page.
- Demo mode fallback when API key is missing.
- Conservative DOM updates to reduce layout breakage.

## Quick Start

1. Clone this repository.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select this folder.
5. Open extension **Settings**, set API key, click **Test API Key**, then **Save Settings**.
6. Visit a Japanese page and click **Run Annotation Now**.

## API Key Setup

- Developer portal: <https://developer.yahoo.co.jp/>
- API reference: <https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html>

YomiRuby sends requests to:

- `https://jlp.yahooapis.jp/FuriganaService/V2/furigana`

## Architecture

| Component | Responsibility |
|---|---|
| `background.js` | API communication, quota pacing, retries, and tab/job status |
| `content.js` | DOM traversal, safe ruby injection, progress overlay, cancel/restore |
| `popup.*` | User controls: enable, run, cancel, restore, open settings |
| `options.*` | API key input, validation, API test, save settings |
| `utils/*` | Constants, Japanese text helpers, DOM and ruby utilities |

## Permissions

| Permission | Why it is required |
|---|---|
| `storage` | Store API key/settings and temporary annotation status |
| `tabs` | Access active tab and send annotation commands |
| `scripting` | Ensure content scripts are available on target pages |
| `<all_urls>` | Annotate general websites |
| `https://jlp.yahooapis.jp/*` | Request furigana data from Yahoo API |

## Privacy and Security

- Full policy: [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- API key is provided by the user and is never hardcoded.
- Text is sent to Yahoo API only when annotation is requested.
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
