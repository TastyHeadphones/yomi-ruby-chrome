# YomiRuby (Filipino, 🇵🇭)

![YomiRuby Promo](icons/promo_marquee_1400x560.png)

<div align="center">

[🇬🇧 English](README.en.md) · [🇨🇳 简体中文](README.zh-CN.md) · [🇮🇩 Bahasa Indonesia](README.id.md) · [🇰🇷 한국어](README.ko.md) · [🇹🇭 ไทย](README.th.md)<br>
[🇻🇳 Tiếng Việt](README.vi.md) · [🇲🇲 မြန်မာ](README.my.md) · [🇮🇳 हिन्दी](README.hi.md) · [🇳🇵 नेपाली](README.ne.md) · [🇵🇭 Filipino](README.fil.md)<br>
[🇲🇾 Bahasa Melayu](README.ms.md) · [🇱🇰 සිංහල](README.si.md) · [🇫🇷 Français](README.fr.md) · [🇧🇷 Português (Brasil)](README.pt-BR.md) · [🇯🇵 日本語](README.ja.md)

</div>

## Pangkalahatang-ideya

Ang YomiRuby ay isang production-ready Manifest V3 Chrome extension na nagdadagdag ng furigana sa Japanese kanji gamit ang semantic HTML ruby tags (`<ruby>`, `<rt>`, `<rp>`).

## Mga Tampok

- Annotation per sentence at paragraph.
- May progress UI, cancel, at restore.
- May throttle, retry, at backoff para sa Yahoo API quota.
- Puwedeng i-test ang API key sa Settings page.
- May demo mode kung wala pang API key.
- Conservative DOM updates para mabawasan ang layout breakage.

## Quick Start

1. I-clone ang repository na ito.
2. Buksan ang `chrome://extensions`.
3. I-enable ang **Developer mode**.
4. I-click ang **Load unpacked** at piliin ang folder na ito.
5. Sa **Settings**, ilagay ang API key, i-click ang **Test API Key** at **Save Settings**.
6. Buksan ang Japanese page at i-click ang **Run Annotation Now**.

## API Key Setup

- Developer portal: <https://developer.yahoo.co.jp/>
- API docs: <https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html>
- Endpoint: `https://jlp.yahooapis.jp/FuriganaService/V2/furigana`

## Architecture

| Component | Responsibilidad |
|---|---|
| `background.js` | API calls, pacing/retry, job status |
| `content.js` | DOM traversal, ruby injection, progress/cancel/restore |
| `popup.*` | user controls |
| `options.*` | API key input, validation, test, save |
| `utils/*` | text/DOM helper utilities |

## Permissions

| Permission | Bakit kailangan |
|---|---|
| `storage` | I-save ang API key, settings, at temporary status |
| `tabs` | Kontrolin ang active tab at magpadala ng command |
| `scripting` | Mag-inject ng content script kapag kailangan |
| `<all_urls>` | Mag-annotate sa general websites |
| `https://jlp.yahooapis.jp/*` | Tumawag sa Yahoo API |

## Privacy at Security

- Buong policy: [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- User ang nagbibigay ng API key; walang hardcoded key.
- Ipinapadala lang ang text sa Yahoo API kapag nag-run ng annotation.
- Walang sariling backend ang YomiRuby para mag-store ng user data.

## Limitations

- Best effort ang furigana alignment at naka-depende sa API tokenization.
- Maaaring partial lang ang support sa dynamic pages, shadow DOM, at canvas text.
- Mas mabagal ang malalaking page dahil sa conservative processing.

## License

Unlicense. Tingnan ang [LICENSE](LICENSE).
