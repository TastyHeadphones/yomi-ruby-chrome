# YomiRuby (हिन्दी, 🇮🇳)

![YomiRuby Promo](icons/promo_marquee_1400x560.png)

<div align="center">

[🇬🇧 English](README.en.md) · [🇨🇳 简体中文](README.zh-CN.md) · [🇮🇩 Bahasa Indonesia](README.id.md) · [🇰🇷 한국어](README.ko.md) · [🇹🇭 ไทย](README.th.md)<br>
[🇻🇳 Tiếng Việt](README.vi.md) · [🇲🇲 မြန်မာ](README.my.md) · [🇮🇳 हिन्दी](README.hi.md) · [🇳🇵 नेपाली](README.ne.md) · [🇵🇭 Filipino](README.fil.md)<br>
[🇲🇾 Bahasa Melayu](README.ms.md) · [🇱🇰 සිංහල](README.si.md) · [🇫🇷 Français](README.fr.md) · [🇧🇷 Português (Brasil)](README.pt-BR.md) · [🇯🇵 日本語](README.ja.md)

</div>

## परिचय

YomiRuby एक production-ready Manifest V3 Chrome extension है, जो जापानी kanji पर furigana जोड़ने के लिए HTML ruby tags (`<ruby>`, `<rt>`, `<rp>`) का उपयोग करता है।

## मुख्य विशेषताएँ

- वाक्य और पैराग्राफ आधारित annotation।
- प्रोग्रेस UI, cancel और restore सपोर्ट।
- Yahoo API quota के लिए throttle, retry और backoff।
- Settings पेज से API key test।
- API key न होने पर demo mode।
- लेआउट टूटने से बचाने के लिए conservative DOM updates।

## Quick Start

1. इस repository को clone करें।
2. `chrome://extensions` खोलें।
3. **Developer mode** चालू करें।
4. **Load unpacked** क्लिक करके यह folder चुनें।
5. **Settings** में API key डालें, **Test API Key** और **Save Settings** क्लिक करें।
6. जापानी पेज खोलें और **Run Annotation Now** दबाएँ।

## API Key Setup

- Developer portal: <https://developer.yahoo.co.jp/>
- API docs: <https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html>
- Endpoint: `https://jlp.yahooapis.jp/FuriganaService/V2/furigana`

## Architecture

| Component | Responsibility |
|---|---|
| `background.js` | API calls, pacing/retry, job state |
| `content.js` | DOM traversal, ruby injection, progress/cancel/restore |
| `popup.*` | user controls |
| `options.*` | API key input, validation, test, save |
| `utils/*` | text and DOM helper utilities |

## Permissions

| Permission | उपयोग |
|---|---|
| `storage` | API key, settings, temporary status store |
| `tabs` | active tab पर commands भेजना |
| `scripting` | content scripts inject करना |
| `<all_urls>` | सामान्य वेबसाइटों पर annotation |
| `https://jlp.yahooapis.jp/*` | Yahoo API request |

## Privacy और Security

- पूरी policy: [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- API key user प्रदान करता है; hardcoded नहीं है।
- Text केवल annotation run होने पर Yahoo API को भेजा जाता है।
- YomiRuby का कोई data-collection backend नहीं है।

## Limitations

- Furigana alignment best effort है और API tokenization पर निर्भर करता है।
- Dynamic pages, shadow DOM, canvas text पर partial coverage हो सकता है।
- बहुत बड़े पेज पर प्रोसेस धीमा हो सकता है।

## License

Unlicense. देखें [LICENSE](LICENSE)।
