# YomiRuby (සිංහල, 🇱🇰)

![YomiRuby Promo](icons/promo_marquee_1400x560.png)

<div align="center">

[🇬🇧 English](README.en.md) · [🇨🇳 简体中文](README.zh-CN.md) · [🇮🇩 Bahasa Indonesia](README.id.md) · [🇰🇷 한국어](README.ko.md) · [🇹🇭 ไทย](README.th.md)<br>
[🇻🇳 Tiếng Việt](README.vi.md) · [🇲🇲 မြန်မာ](README.my.md) · [🇮🇳 हिन्दी](README.hi.md) · [🇳🇵 नेपाली](README.ne.md) · [🇵🇭 Filipino](README.fil.md)<br>
[🇲🇾 Bahasa Melayu](README.ms.md) · [🇱🇰 සිංහල](README.si.md) · [🇫🇷 Français](README.fr.md) · [🇧🇷 Português (Brasil)](README.pt-BR.md) · [🇯🇵 日本語](README.ja.md)

</div>

## සාරාංශය

YomiRuby යනු production-ready Manifest V3 Chrome extension එකක් වන අතර, Japanese kanji සඳහා furigana එක් කිරීමට HTML ruby tags (`<ruby>`, `<rt>`, `<rp>`) භාවිතා කරයි.

## ප්‍රධාන විශේෂාංග

- වාක්‍ය සහ පරාඡේද පදනම් annotation.
- progress UI, cancel සහ restore පහසුකම්.
- Yahoo API quota සඳහා throttle, retry, backoff logic.
- Settings පිටුවෙන් API key test කිරීම.
- API key නොමැති විට demo mode.
- layout බිඳ වැටීම අඩු කිරීමට conservative DOM updates.

## Quick Start

1. මෙම repository එක clone කරන්න.
2. `chrome://extensions` විවෘත කරන්න.
3. **Developer mode** ON කරන්න.
4. **Load unpacked** තෝරා මෙම project folder එක select කරන්න.
5. **Settings** තුළ API key ඇතුල් කර **Test API Key** සහ **Save Settings** ක්ලික් කරන්න.
6. Japanese page එකක **Run Annotation Now** ක්ලික් කරන්න.

## API Key Setup

- Developer portal: <https://developer.yahoo.co.jp/>
- API docs: <https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html>
- Endpoint: `https://jlp.yahooapis.jp/FuriganaService/V2/furigana`

## Architecture

| Component | Responsibility |
|---|---|
| `background.js` | API calls, pacing/retry, job status |
| `content.js` | DOM traversal, ruby injection, progress/cancel/restore |
| `popup.*` | user controls |
| `options.*` | API key input, validation, test, save |
| `utils/*` | text/DOM helper utilities |

## Permissions

| Permission | භාවිතය |
|---|---|
| `storage` | API key, settings, temporary status save කිරීම |
| `tabs` | active tab සදහා command යැවීම |
| `scripting` | content script inject කිරීම |
| `<all_urls>` | සාමාන්‍ය websites annotate කිරීම |
| `https://jlp.yahooapis.jp/*` | Yahoo API call කිරීම |

## Privacy සහ Security

- සම්පූර්ණ policy: [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- API key user විසින්ම සපයයි; hardcoded නොවේ.
- annotation run කරන විට පමණක් text Yahoo API වෙත යවයි.
- YomiRuby user data store කරන backend භාවිතා නොකරයි.

## Limitations

- furigana alignment best effort වන අතර API tokenization මත රඳා පවතී.
- dynamic pages, shadow DOM, canvas text සඳහා partial support විය හැක.
- විශාල pages සඳහා වේගය අඩුවිය හැක.

## License

Unlicense. [LICENSE](LICENSE) බලන්න.
